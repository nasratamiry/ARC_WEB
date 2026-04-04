import { useSyncExternalStore } from 'react'
import type { ApiError } from '../services/api'
import {
  createConversation,
  getChatGroups,
  getConversationById,
  getConversationMessages,
  getConversations,
  markConversationRead,
  sendFileMessage,
  sendTextMessage,
  type ChatGroupSummary,
  type ChatMessage,
  type Conversation,
  type ChatMessageType,
} from './chatService'
import { ChatSocket } from './chatSocket'

type WsConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

type ChatState = {
  conversationsById: Record<number, Conversation>
  conversationOrder: number[]
  messagesByConversation: Record<number, ChatMessage[]>
  groups: ChatGroupSummary[]
  messageTotalsByConversation: Record<number, number>
  hasMoreByConversation: Record<number, boolean>
  loadingConversations: boolean
  loadingMessages: boolean
  sending: boolean
  conversationsError: ApiError | null
  messagesError: ApiError | null
  sendingError: ApiError | null
  wsConnectionStatus: WsConnectionStatus
  activeConversationId: number | null
  replyToMessage: ChatMessage | null
}

const PAGE_SIZE = 50
const ws = new ChatSocket()
const inFlightMessagesRequests = new Set<string>()

let state: ChatState = {
  conversationsById: {},
  conversationOrder: [],
  messagesByConversation: {},
  groups: [],
  messageTotalsByConversation: {},
  hasMoreByConversation: {},
  loadingConversations: false,
  loadingMessages: false,
  sending: false,
  conversationsError: null,
  messagesError: null,
  sendingError: null,
  wsConnectionStatus: 'idle',
  activeConversationId: null,
  replyToMessage: null,
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const setState = (patch: Partial<ChatState>) => {
  state = { ...state, ...patch }
  emit()
}

const sortConversations = (conversations: Conversation[]): number[] =>
  [...conversations]
    .sort((a, b) => {
      const aDate = a.last_message?.created_at ?? ''
      const bDate = b.last_message?.created_at ?? ''
      return bDate.localeCompare(aDate)
    })
    .map((item) => item.id)

const updateConversationInState = (conversation: Conversation): void => {
  const updated = { ...state.conversationsById, [conversation.id]: conversation }
  setState({
    conversationsById: updated,
    conversationOrder: sortConversations(Object.values(updated)),
  })
}

const upsertMessage = (conversationId: number, message: ChatMessage): void => {
  const current = state.messagesByConversation[conversationId] ?? []
  const exists = current.some((item) => item.id === message.id)
  const next = exists ? current.map((item) => (item.id === message.id ? message : item)) : [...current, message]
  next.sort((a, b) => a.created_at.localeCompare(b.created_at))

  setState({
    messagesByConversation: {
      ...state.messagesByConversation,
      [conversationId]: next,
    },
  })
}

const patchMessageById = (
  conversationId: number,
  messageId: number,
  patch: Partial<ChatMessage>,
): void => {
  const current = state.messagesByConversation[conversationId] ?? []
  const next = current.map((item) => (item.id === messageId ? { ...item, ...patch } : item))
  setState({
    messagesByConversation: {
      ...state.messagesByConversation,
      [conversationId]: next,
    },
  })
}

const withApiError = (error: unknown): ApiError | null => {
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ApiError') {
    return error as ApiError
  }
  return null
}

const pickConversationId = (): number | null => {
  if (state.conversationOrder.length === 0) return null
  const privateConversationId = state.conversationOrder.find((id) => state.conversationsById[id]?.conversation_type === 'private')
  return privateConversationId ?? state.conversationOrder[0] ?? null
}

export const chatStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot() {
    return state
  },
  async loadConversations() {
    setState({ loadingConversations: true, conversationsError: null })
    try {
      const conversations = await getConversations()
      const conversationsById: Record<number, Conversation> = {}
      conversations.forEach((item) => {
        conversationsById[item.id] = item
      })
      setState({
        loadingConversations: false,
        conversationsById,
        conversationOrder: sortConversations(conversations),
        conversationsError: null,
      })
      void getChatGroups()
        .then((groups) => setState({ groups }))
        .catch(() => {
          setState({ groups: [] })
        })
    } catch (error) {
      setState({ loadingConversations: false, conversationsError: withApiError(error) })
    }
  },
  async ensurePrivateConversation() {
    const existingId = pickConversationId()
    if (existingId) return existingId
    try {
      const created = await createConversation({ conversation_type: 'private' })
      updateConversationInState(created)
      return created.id
    } catch (error) {
      // Backend may reject duplicate private conversation creation.
      // In that case we refetch and pick the existing private conversation.
      try {
        const conversations = await getConversations()
        const conversationsById: Record<number, Conversation> = {}
        conversations.forEach((item) => {
          conversationsById[item.id] = item
        })
        const conversationOrder = sortConversations(conversations)
        setState({ conversationsById, conversationOrder, conversationsError: null })
        const fallbackId =
          conversationOrder.find((id) => conversationsById[id]?.conversation_type === 'private') ??
          conversationOrder[0] ??
          null
        return fallbackId
      } catch {
        setState({ conversationsError: withApiError(error) })
      }
      return null
    }
  },
  async openGroupConversation(groupId: number) {
    const existing = Object.values(state.conversationsById).find(
      (conversation) => conversation.conversation_type === 'group' && conversation.chat_group?.id === groupId,
    )
    if (existing) return existing.id

    try {
      const created = await createConversation({ conversation_type: 'group', chat_group_id: groupId })
      // Some backends may return a non-conversation payload id for group create.
      // Validate returned id against conversation detail and fallback to lookup by chat_group id.
      try {
        const verified = await getConversationById(created.id)
        updateConversationInState(verified)
        if (verified.conversation_type === 'group' && verified.chat_group?.id === groupId) {
          return verified.id
        }
      } catch {
        // ignore and fallback to list lookup below
      }

      const conversations = await getConversations()
      const conversationsById: Record<number, Conversation> = {}
      conversations.forEach((item) => {
        conversationsById[item.id] = item
      })
      setState({
        conversationsById,
        conversationOrder: sortConversations(conversations),
        conversationsError: null,
      })
      const fallback = conversations.find(
        (conversation) => conversation.conversation_type === 'group' && conversation.chat_group?.id === groupId,
      )
      return fallback?.id ?? null
    } catch (error) {
      // fallback: refetch and check if it already exists
      try {
        const conversations = await getConversations()
        const conversationsById: Record<number, Conversation> = {}
        conversations.forEach((item) => {
          conversationsById[item.id] = item
        })
        setState({
          conversationsById,
          conversationOrder: sortConversations(conversations),
          conversationsError: null,
        })
        const fallback = conversations.find(
          (conversation) => conversation.conversation_type === 'group' && conversation.chat_group?.id === groupId,
        )
        return fallback?.id ?? null
      } catch {
        setState({ conversationsError: withApiError(error) })
      }
      return null
    }
  },
  async ensureConversationAccessible(conversationId: number) {
    const existing = state.conversationsById[conversationId]
    if (existing) return true
    try {
      const conversation = await getConversationById(conversationId)
      updateConversationInState(conversation)
      return true
    } catch (error) {
      setState({ conversationsError: withApiError(error) })
      return false
    }
  },
  setActiveConversation(conversationId: number | null) {
    setState({ activeConversationId: conversationId, replyToMessage: null })
    if (conversationId === null) {
      ws.disconnect()
      setState({ wsConnectionStatus: 'idle' })
      return
    }
    setState({ wsConnectionStatus: 'connecting' })
    ws.connect(conversationId, {
      onOpen: () => setState({ wsConnectionStatus: 'connected' }),
      onClose: () => setState({ wsConnectionStatus: 'disconnected' }),
      onError: () => setState({ wsConnectionStatus: 'error' }),
      onEvent: (event) => {
        if (event.type !== 'new_message') return
        upsertMessage(conversationId, event.message)
        const existingConversation = state.conversationsById[conversationId]
        if (existingConversation) {
          updateConversationInState({
            ...existingConversation,
            last_message: event.message,
          })
        }
      },
    })
  },
  async loadMessages(conversationId: number, reset = false) {
    const current = state.messagesByConversation[conversationId] ?? []
    const offset = reset ? 0 : current.length
    const requestKey = `${conversationId}:${offset}:${PAGE_SIZE}`
    if (inFlightMessagesRequests.has(requestKey)) return
    inFlightMessagesRequests.add(requestKey)
    setState({ loadingMessages: true, messagesError: null })
    try {
      const response = await getConversationMessages(conversationId, { offset, limit: PAGE_SIZE })
      const merged = reset ? response.messages : [...response.messages, ...current]
      const uniqueById = new Map<number, ChatMessage>()
      merged.forEach((item) => uniqueById.set(item.id, item))
      const next = Array.from(uniqueById.values()).sort((a, b) => a.created_at.localeCompare(b.created_at))

      setState({
        loadingMessages: false,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: next,
        },
        messageTotalsByConversation: {
          ...state.messageTotalsByConversation,
          [conversationId]: response.total,
        },
        hasMoreByConversation: {
          ...state.hasMoreByConversation,
          [conversationId]: offset + response.count < response.total,
        },
        messagesError: null,
      })
    } catch (error) {
      setState({ loadingMessages: false, messagesError: withApiError(error) })
    } finally {
      inFlightMessagesRequests.delete(requestKey)
    }
  },
  setReplyToMessage(message: ChatMessage | null) {
    setState({ replyToMessage: message })
  },
  async sendMessage(params: {
    conversationId: number
    messageType: ChatMessageType
    text?: string
    file?: File | null
    sender?: { id: number; email: string; full_name: string }
  }) {
    const sendStartedAt = Date.now()
    setState({ sending: true, sendingError: null })
    const rawReplyId = state.replyToMessage?.id
    const replyToId = rawReplyId != null && rawReplyId > 0 ? rawReplyId : null
    const temporaryMessageId = -Date.now()
    const optimisticMessage: ChatMessage = {
      id: temporaryMessageId,
      sender: params.sender ?? { id: 0, email: '', full_name: '' },
      message_type: params.messageType,
      text: params.messageType === 'text' ? params.text ?? '' : null,
      file: params.messageType === 'text' ? null : params.file ? URL.createObjectURL(params.file) : null,
      replied_to_message_id: replyToId,
      reply_to: state.replyToMessage,
      local_status: 'sending',
      created_at: new Date().toISOString(),
      conversation_id: params.conversationId,
    }
    upsertMessage(params.conversationId, optimisticMessage)
    try {
      let sent: ChatMessage
      if (params.messageType === 'text') {
        sent = await sendTextMessage(params.conversationId, {
          conversation_id: params.conversationId,
          message_type: 'text',
          text: params.text ?? '',
          reply_to_id: replyToId,
        })
      } else {
        if (!params.file) throw new Error('File is required for non-text messages.')
        sent = await sendFileMessage(params.conversationId, {
          conversation_id: params.conversationId,
          message_type: params.messageType,
          file: params.file,
          reply_to_id: replyToId,
        })
      }
      setState({
        messagesByConversation: {
          ...state.messagesByConversation,
          [params.conversationId]: (state.messagesByConversation[params.conversationId] ?? []).filter(
            (message) => message.id !== temporaryMessageId,
          ),
        },
      })
      upsertMessage(params.conversationId, { ...sent, local_status: 'sent' })
      const conversation = state.conversationsById[params.conversationId]
      if (conversation) {
        updateConversationInState({
          ...conversation,
          last_message: sent,
        })
      }
      setState({ sending: false, sendingError: null, replyToMessage: null })
      return sent
    } catch (error) {
      const apiErr = withApiError(error)
      const tryRecoverFromServerError = apiErr?.status != null && apiErr.status >= 500 && apiErr.status < 600

      if (tryRecoverFromServerError) {
        try {
          const head = await getConversationMessages(params.conversationId, { offset: 0, limit: PAGE_SIZE })
          let messages = head.messages
          if (head.total > PAGE_SIZE) {
            const tailOffset = Math.max(0, head.total - PAGE_SIZE)
            const tail = await getConversationMessages(params.conversationId, { offset: tailOffset, limit: PAGE_SIZE })
            messages = tail.messages
          }
          const snap = chatStore.getSnapshot()
          const current = snap.messagesByConversation[params.conversationId] ?? []
          const existingIds = new Set(current.map((m) => m.id))
          const uid = params.sender?.id ?? 0
          const candidates = messages.filter(
            (m) =>
              m.id > 0 &&
              !existingIds.has(m.id) &&
              m.sender.id === uid &&
              m.message_type === params.messageType &&
              new Date(m.created_at).getTime() >= sendStartedAt - 25_000,
          )
          const fresh = candidates.sort((a, b) => a.created_at.localeCompare(b.created_at)).at(-1)
          if (fresh) {
            const merged = [...current.filter((m) => m.id !== temporaryMessageId), { ...fresh, local_status: 'sent' as const }].sort(
              (a, b) => a.created_at.localeCompare(b.created_at),
            )
            setState({
              messagesByConversation: {
                ...snap.messagesByConversation,
                [params.conversationId]: merged,
              },
              sending: false,
              sendingError: null,
              replyToMessage: null,
            })
            const conversation = snap.conversationsById[params.conversationId]
            if (conversation) {
              updateConversationInState({ ...conversation, last_message: fresh })
            }
            return null
          }
        } catch {
          // fall through to real failure UI
        }
      }

      patchMessageById(params.conversationId, temporaryMessageId, { local_status: 'failed' })
      setState({ sending: false, sendingError: apiErr })
      return null
    }
  },
  async markRead(conversationId: number) {
    try {
      await markConversationRead(conversationId)
      const conversation = state.conversationsById[conversationId]
      if (!conversation) return
      updateConversationInState({ ...conversation, unread_count: 0 })
    } catch (error) {
      // Read receipts are best-effort; don't surface noisy global connection errors.
      console.warn('markRead failed', withApiError(error))
    }
  },
  removeMessageLocally(conversationId: number, messageId: number) {
    const current = state.messagesByConversation[conversationId] ?? []
    const next = current.filter((item) => item.id !== messageId)
    const last = next.length > 0 ? next[next.length - 1] : null
    const conversation = state.conversationsById[conversationId]
    setState({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: next,
      },
      conversationsById: conversation
        ? {
            ...state.conversationsById,
            [conversationId]: {
              ...conversation,
              last_message: last,
            },
          }
        : state.conversationsById,
    })
  },
  disconnect() {
    ws.disconnect()
    setState({ wsConnectionStatus: 'disconnected' })
  },
}

export const useChatStore = (): ChatState => useSyncExternalStore(chatStore.subscribe, chatStore.getSnapshot, chatStore.getSnapshot)

