import { getStoredAuthTokens, getWebSocketBaseUrl, getWebSocketPathPrefix } from '../services/api'
import type { ChatMessage } from './chatService'

export type ChatSocketEvent =
  | { type: 'connection_established' }
  | { type: 'new_message'; message: ChatMessage }

type ChatSocketHandlers = {
  onOpen?: () => void
  onClose?: () => void
  onError?: () => void
  onEvent?: (event: ChatSocketEvent) => void
}

const toWebSocketBase = (): string => getWebSocketBaseUrl()

export class ChatSocket {
  private socket: WebSocket | null = null

  connect(conversationId: number, handlers: ChatSocketHandlers): void {
    this.disconnect()
    const token = getStoredAuthTokens()?.access
    const wsBase = toWebSocketBase()
    if (!token || !wsBase) {
      queueMicrotask(() => {
        handlers.onError?.()
        handlers.onClose?.()
      })
      return
    }

    const pathPrefix = getWebSocketPathPrefix()
    this.socket = new WebSocket(`${wsBase}${pathPrefix}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`)

    this.socket.onopen = () => handlers.onOpen?.()
    this.socket.onclose = () => handlers.onClose?.()
    this.socket.onerror = () => handlers.onError?.()
    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as Record<string, unknown>

        if (parsed.type === 'connection_established') {
          handlers.onEvent?.({ type: 'connection_established' })
          return
        }
        if (parsed.type === 'new_message' && isChatMessage(parsed.message)) {
          handlers.onEvent?.({ type: 'new_message', message: parsed.message })
        }
      } catch {
        // ignore malformed events
      }
    }
  }

  disconnect(): void {
    if (!this.socket) return
    this.socket.close()
    this.socket = null
  }
}

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ChatMessage>
  return typeof candidate.id === 'number' && typeof candidate.conversation_id === 'number' && typeof candidate.created_at === 'string'
}

