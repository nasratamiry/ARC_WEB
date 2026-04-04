import api from '../services/api'

export type ChatUser = {
  id: number
  email: string
  full_name: string
  is_admin?: boolean
  is_staff?: boolean
  is_superuser?: boolean
}

export type ChatMessageType = 'text' | 'image' | 'video' | 'audio' | 'file'

export type ChatMessage = {
  id: number
  sender: ChatUser
  message_type: ChatMessageType
  text: string | null
  file: string | null
  replied_to_message_id: number | null
  reply_to: ChatMessage | null
  local_status?: 'sending' | 'sent' | 'failed'
  read_at?: string | null
  seen_at?: string | null
  is_seen?: boolean
  seen_by?: Array<{ id: number }>
  created_at: string
  conversation_id: number
}

export type ChatGroup = {
  id: number
  name: string
}

export type ChatGroupSummary = {
  id: number
  name: string
}

export type ConversationType = 'private' | 'group'

export type Conversation = {
  id: number
  conversation_type: ConversationType
  participants: ChatUser[]
  chat_group: ChatGroup | null
  last_message: ChatMessage | null
  unread_count: number
}

export type ConversationMessagesResponse = {
  conversation_id: number
  messages: ChatMessage[]
  count: number
  total: number
  offset: number
  limit: number
}

type SendTextPayload = {
  conversation_id: number
  message_type: 'text'
  text: string
  reply_to_id?: number | null
}

type SendFilePayload = {
  conversation_id: number
  message_type: 'image' | 'video' | 'audio' | 'file'
  file: File
  reply_to_id?: number | null
}

const FALLBACK_UPLOAD_MIME = 'application/zip'
const FALLBACK_TEXT_UPLOAD_MIME = 'text/plain'
const BACKEND_ALLOWED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
])

const normalizeGenericFileForUpload = (payload: SendFilePayload): File => {
  if (payload.message_type !== 'file') return payload.file
  if (BACKEND_ALLOWED_FILE_MIME_TYPES.has(payload.file.type)) return payload.file
  const fallbackMime = payload.file.type.startsWith('text/') ? FALLBACK_TEXT_UPLOAD_MIME : FALLBACK_UPLOAD_MIME
  // Some backends reject unknown MIME values for generic file messages.
  // Keep filename/content intact and retry using an allowed MIME.
  return new File([payload.file], payload.file.name, {
    type: fallbackMime,
    lastModified: payload.file.lastModified,
  })
}

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get<Conversation[]>('chat/conversations/')
  return response.data
}

export const createConversation = async (
  payload: { conversation_type: 'private' } | { conversation_type: 'group'; chat_group_id: number },
): Promise<Conversation> => {
  const response = await api.post<Conversation>('chat/conversations/', payload)
  return response.data
}

export const getChatGroups = async (): Promise<ChatGroupSummary[]> => {
  const response = await api.get<ChatGroupSummary[]>('chat/groups/')
  return response.data
}

export const getConversationById = async (id: number): Promise<Conversation> => {
  const response = await api.get<Conversation>(`chat/conversations/${id}/`)
  return response.data
}

export const getConversationMessages = async (
  conversationId: number,
  params: { offset: number; limit: number },
): Promise<ConversationMessagesResponse> => {
  const response = await api.get<ConversationMessagesResponse>(
    `chat/conversations/${conversationId}/messages/?offset=${params.offset}&limit=${params.limit}`,
  )
  return response.data
}

export const markConversationRead = async (conversationId: number): Promise<{ success: boolean }> => {
  const response = await api.post<{ success: boolean }>(`chat/conversations/${conversationId}/mark-read/`)
  return response.data
}

export const sendTextMessage = async (conversationId: number, payload: SendTextPayload): Promise<ChatMessage> => {
  const body: Record<string, unknown> = {
    conversation_id: payload.conversation_id,
    message_type: 'text',
    text: payload.text,
  }
  const rid = payload.reply_to_id
  if (rid != null && rid > 0) {
    body.reply_to_id = rid
  }
  const response = await api.post<ChatMessage>(`chat/${conversationId}/send/`, body)
  return response.data
}

export const sendFileMessage = async (conversationId: number, payload: SendFilePayload): Promise<ChatMessage> => {
  const uploadFile = normalizeGenericFileForUpload(payload)
  const body = new FormData()
  body.append('conversation_id', String(payload.conversation_id))
  body.append('message_type', payload.message_type)
  body.append('file', uploadFile)
  if (payload.reply_to_id != null && payload.reply_to_id > 0) {
    const rid = String(payload.reply_to_id)
    body.append('reply_to_id', rid)
    // Some Django serializers expect the model field name on multipart.
    body.append('replied_to_message_id', rid)
  }

  // Use postForm so axios does not merge JSON Content-Type with FormData (breaks uploads).
  const response = await api.postForm<ChatMessage>(`chat/${conversationId}/send/`, body)
  return response.data
}

