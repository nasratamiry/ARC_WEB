import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Maximize2, Mic, Paperclip, Pause, Play, Reply, Send, Video, X, ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, LazyMotion, domAnimation, motion } from 'framer-motion'
import Seo from '../shared/components/Seo'
import { useLocalizedPath } from '../hooks'
import RequireAuth from '../auth/RequireAuth'
import { useAuth } from '../auth/AuthContext'
import { getStoredAuthTokens } from '../services/api'
import { Button, Card, SectionContainer } from '../shared/ui'
import { chatStore, useChatStore } from '../chat/chatStore'
import type { ChatMessage, ChatMessageType, Conversation } from '../chat/chatService'
import { formatGregorianTime } from '../shared/utils/dateTime'

const FILE_TYPE_MAP: Record<string, ChatMessageType> = {
  'image/': 'image',
  'video/': 'video',
  'audio/': 'audio',
}

function detectMessageType(file: File): ChatMessageType {
  if (file.type.startsWith('image/')) return FILE_TYPE_MAP['image/']
  if (file.type.startsWith('video/')) return FILE_TYPE_MAP['video/']
  if (file.type.startsWith('audio/')) return FILE_TYPE_MAP['audio/']
  const ext = file.name.toLowerCase().split('.').pop() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'audio'
  return 'file'
}

const conversationTitle = (conversation: Conversation, currentUserId: number | null): string => {
  if (conversation.chat_group?.name) return conversation.chat_group.name
  const peers = conversation.participants.filter((participant) => participant.id !== currentUserId)
  if (peers.length === 0) return `Conversation #${conversation.id}`
  return peers.map((participant) => participant.full_name || participant.email).join(', ')
}

const participantDisplayName = (participant: { id: number; full_name: string; email: string }) =>
  participant.full_name?.trim() || `User ${participant.id}`

const messageSeen = (message: ChatMessage): boolean =>
  Boolean(message.read_at || message.seen_at || message.is_seen || (Array.isArray(message.seen_by) && message.seen_by.length > 0))

const resolveReplyMessage = (message: ChatMessage, messages: ChatMessage[]): ChatMessage | null => {
  if (message.reply_to) return message.reply_to
  if (!message.replied_to_message_id) return null
  return messages.find((item) => item.id === message.replied_to_message_id) ?? null
}

const formatMessageTime = (value: string, locale?: string) => formatGregorianTime(value, locale)

const guessFilename = (url: string, fallback: string) => {
  try {
    const parsed = new URL(url)
    const last = parsed.pathname.split('/').filter(Boolean).pop()
    return last || fallback
  } catch {
    return fallback
  }
}

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const URL_TOKEN_REGEX = /((?:web)?https?:\/\/[^\s]+)/g
const CONFERENCE_DEEP_LINK_REGEX = /APRC_CONF:[^|]+\|((?:web)?https?:\/\/[^\s]+)/gi

const normalizeMessageUrl = (raw: string): string => raw.trim().replace(/^webhttps:\/\//i, 'https://')

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** power
  return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}

const getBackendOrigin = () => {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (configured && /^https?:\/\//i.test(configured)) {
    try {
      return new URL(configured).origin
    } catch {
      // ignore invalid env URL
    }
  }
  return 'http://167.86.71.135:8000'
}

const resolveMediaUrl = (value: string) => {
  if (!value) return value
  if (/^(blob:|data:|https?:\/\/)/i.test(value)) return value
  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${getBackendOrigin()}${normalized}`
}

const toLocalProxyMediaUrl = (url: string) => {
  if (!/^https?:\/\//i.test(url)) return url
  try {
    const parsed = new URL(url)
    if (!parsed.pathname.startsWith('/media/')) return url
    if (/^localhost$|^127\.0\.0\.1$/.test(window.location.hostname)) {
      return `${window.location.origin}${parsed.pathname}`
    }
    return url
  } catch {
    return url
  }
}

type ImageBubbleProps = {
  src: string
  onOpen: (src: string) => void
  onDownload: (src: string) => void
  downloadLabel: string
  viewLabel: string
  failedLabel: string
  mine: boolean
  eager?: boolean
}

const ImageBubble = memo(function ImageBubble({ src, onOpen, onDownload, downloadLabel, viewLabel, failedLabel, mine, eager = false }: ImageBubbleProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className="space-y-2">
      <button type="button" onClick={() => onOpen(src)} className="group relative block max-w-[290px] overflow-hidden rounded-xl">
        {!loaded && !failed ? <div className="h-44 w-[290px] animate-pulse rounded-xl bg-slate-200/80" /> : null}
        {!failed ? (
          <img
            src={src}
            alt="chat media"
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`max-h-[300px] w-[290px] rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}
        {failed ? <div className="flex h-44 w-[290px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500">{failedLabel}</div> : null}
        {!failed ? (
          <>
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-90" />
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
              <Maximize2 className="h-3 w-3" aria-hidden />
              {viewLabel}
            </span>
          </>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => onDownload(src)}
        className={`inline-flex items-center gap-1 text-xs font-medium underline ${mine ? 'text-slate-100' : 'text-[#00a8bf]'}`}
      >
        <Download className="h-3 w-3" aria-hidden />
        {downloadLabel}
      </button>
    </div>
  )
})

type AudioBubbleProps = {
  src: string
  mine: boolean
  onStart: (audio: HTMLAudioElement) => void
  failedLabel: string
}

const AudioBubble = memo(function AudioBubble({ src, mine, onStart, failedLabel }: AudioBubbleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [failed, setFailed] = useState(false)
  const bars = [0, 1, 2, 3, 4, 5, 6]

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      onStart(audio)
      void audio.play()
    } else {
      audio.pause()
    }
  }

  return (
    <div className={`rounded-xl border px-3 py-2.5 shadow-sm ${mine ? 'border-white/30 bg-white/15' : 'border-slate-200 bg-[#eef2f7]'}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onCanPlay={() => setIsReady(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          setCurrent(0)
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime || 0)}
        onError={() => setFailed(true)}
      />
      {failed ? <div className="flex items-center gap-2 text-xs text-red-500">{failedLabel}</div> : (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                mine ? 'bg-white/25 text-white hover:bg-white/35' : 'bg-[#00bcd4] text-white hover:bg-[#00a7be]'
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5 pl-0.5" aria-hidden />}
            </button>
            {!isReady ? (
              <div className="h-2 w-16 animate-pulse rounded-full bg-slate-300/80" />
            ) : (
              <div className="flex items-end gap-0.5 rounded-full bg-black/5 px-1 py-1">
                {bars.map((bar) => {
                  const progress = duration > 0 ? current / duration : 0
                  const phase = (progress * 12 + bar) % 6
                  const activeHeight = 3 + Math.round(Math.abs(Math.sin(phase)) * 7)
                  return (
                    <span
                      key={bar}
                      className={`inline-block w-0.5 rounded-full transition-all duration-150 ${
                        mine ? 'bg-white/90' : 'bg-[#00a8c0]'
                      } ${isPlaying ? '' : 'opacity-60'}`}
                      style={{ height: `${isPlaying ? activeHeight : 4}px` }}
                    />
                  )
                })}
              </div>
            )}
            <input
              type="range"
              min={0}
              max={duration || 1}
              value={Math.min(current, duration || 1)}
              onChange={(e) => {
                const audio = audioRef.current
                if (!audio) return
                audio.currentTime = Number(e.target.value)
                setCurrent(Number(e.target.value))
              }}
              className="h-1.5 w-40 cursor-pointer rounded-full"
              style={{ accentColor: mine ? '#ffffff' : '#00a8c0' }}
            />
            <span className={`text-[11px] font-medium ${mine ? 'text-white/85' : 'text-slate-600'}`}>
              {formatDuration(current)} / {formatDuration(duration)}
            </span>
          </div>
        </>
      )}
    </div>
  )
})

type VideoBubbleProps = {
  src: string
  mine: boolean
  onDownload: (src: string) => void
  downloadLabel: string
  failedLabel: string
}

const VideoBubble = memo(function VideoBubble({ src, mine, onDownload, downloadLabel, failedLabel }: VideoBubbleProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="space-y-2">
      {!failed ? (
        <div className="relative w-[290px] overflow-hidden rounded-xl">
          {!loaded ? <div className="h-40 w-[290px] animate-pulse bg-slate-200/80" /> : null}
          <video
            controls
            preload="metadata"
            onCanPlay={() => setLoaded(true)}
            onError={() => setFailed(true)}
          className={`max-h-[260px] w-[290px] rounded-xl border border-slate-300 bg-black object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={src} />
          </video>
        </div>
      ) : <div className="flex h-40 w-[290px] items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500"><Video className="h-4 w-4" aria-hidden />{failedLabel}</div>}
      <button
        type="button"
        onClick={() => onDownload(src)}
        className={`inline-flex items-center gap-1 text-xs font-medium underline ${mine ? 'text-slate-100' : 'text-[#00a8bf]'}`}
      >
        <Download className="h-3 w-3" aria-hidden />
        {downloadLabel}
      </button>
    </div>
  )
})

const getInitials = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

const pickAvatarSource = (entity: unknown): string => {
  if (!entity || typeof entity !== 'object') return ''
  const record = entity as Record<string, unknown>
  const candidates = ['profile_picture', 'profile_image', 'avatar', 'photo', 'image']
  for (const key of candidates) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

const resolveAvatarUrl = (entity: unknown): string => {
  const raw = pickAvatarSource(entity)
  if (!raw) return ''
  return resolveMediaUrl(raw)
}

type ChatAvatarProps = {
  label: string
  avatarUrl?: string
  sizeClass?: string
  textClass?: string
}

const ChatAvatar = ({ label, avatarUrl = '', sizeClass = 'h-10 w-10', textClass = 'text-xs' }: ChatAvatarProps) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#00d4ef] to-[#00b6cd] font-bold text-white shadow-sm ring-2 ring-[#00d8f2]/45 ring-offset-2 ring-offset-white ${sizeClass} ${textClass}`}
  >
    {avatarUrl ? <img src={avatarUrl} alt={label} className="h-full w-full object-cover" /> : getInitials(label || 'U') || 'U'}
  </span>
)

const buildConversationStatus = (conversation: Conversation, locale: string, t: (key: string) => string): string => {
  const lastMessageAt = conversation.last_message?.created_at
  if (!lastMessageAt) return t('chat.offline')
  return `${t('chat.lastSeen')} ${formatGregorianTime(lastMessageAt, locale)}`
}

function ChatPageInner() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { withLang } = useLocalizedPath()
  const { conversationId } = useParams<{ conversationId: string }>()
  const auth = useAuth()
  const {
    conversationsById,
    conversationOrder,
    messagesByConversation,
    groups,
    loadingConversations,
    loadingMessages,
    sending,
    conversationsError,
    messagesError,
    sendingError,
    activeConversationId,
    replyToMessage,
    hasMoreByConversation,
  } = useChatStore()

  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordingBars, setRecordingBars] = useState<number[]>(Array.from({ length: 24 }, () => 12))
  const [micError, setMicError] = useState<string | null>(null)
  const [showSidebarMobile, setShowSidebarMobile] = useState(true)
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [downloadState, setDownloadState] = useState<{
    fileName: string
    progress: number
    receivedBytes: number
    totalBytes: number
    status: 'preparing' | 'downloading' | 'saving' | 'done' | 'error'
  } | null>(null)
  const messageBoxRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLFormElement | null>(null)
  const previousMessageCountRef = useRef(0)
  const pendingTopAnchorRef = useRef<{ previousTop: number; previousHeight: number } | null>(null)
  const composingHeightRef = useRef(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const recordingTimerRef = useRef<number | null>(null)
  const sendOnStopRef = useRef(false)
  const discardOnStopRef = useRef(false)
  const forceScrollToBottomRef = useRef(false)
  const activeConversationIdRef = useRef<number | null>(null)
  const currentSenderRef = useRef<{ id: number; email: string; full_name: string }>({ id: 0, email: '', full_name: '' })
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null)
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null)
  const silenceChatPlayback = useCallback((clearPreview = false) => {
    activeAudioElementRef.current?.pause()
    activeAudioElementRef.current = null
    const preview = audioPreviewRef.current
    if (preview) {
      preview.pause()
      if (clearPreview) {
        preview.removeAttribute('src')
        preview.load()
      }
    }
  }, [])
  const clearDownloadUiTimerRef = useRef<number | null>(null)
  const isRtl = i18n.dir() === 'rtl'
  const currentUserId = auth.me?.id ?? auth.user?.id ?? null
  const visibleConversationIds = conversationOrder
  const mappedGroupIdsInConversations = useMemo(
    () =>
      new Set(
        visibleConversationIds
          .map((id) => conversationsById[id]?.chat_group?.id)
          .filter((value): value is number => typeof value === 'number'),
      ),
    [conversationsById, visibleConversationIds],
  )
  const standaloneGroups = useMemo(
    () => groups.filter((group) => !mappedGroupIdsInConversations.has(group.id)),
    [groups, mappedGroupIdsInConversations],
  )

  useEffect(() => {
    if (conversationOrder.length === 0) {
      void chatStore.loadConversations()
    }
    return () => chatStore.disconnect()
  }, [conversationOrder.length])

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
      if (selectedImagePreviewUrl) URL.revokeObjectURL(selectedImagePreviewUrl)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current)
      if (clearDownloadUiTimerRef.current) window.clearTimeout(clearDownloadUiTimerRef.current)
    }
  }, [audioPreviewUrl, selectedImagePreviewUrl])

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImagePreviewUrl(null)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  useEffect(() => {
    const authError = conversationsError ?? messagesError ?? sendingError
    if (authError?.status === 401) {
      navigate(withLang('/login'), { replace: true })
    }
  }, [conversationsError, messagesError, sendingError, navigate, withLang])

  useEffect(() => {
    const parsedId = conversationId ? Number(conversationId) : null
    if (parsedId && Number.isFinite(parsedId)) {
      void (async () => {
        const accessible = await chatStore.ensureConversationAccessible(parsedId)
        if (!accessible) {
          if (visibleConversationIds.length > 0) {
            navigate(withLang(`/chat/${visibleConversationIds[0]}`), { replace: true })
          } else {
            navigate(withLang('/chat'), { replace: true })
          }
          return
        }
        if (activeConversationId !== parsedId) {
          chatStore.setActiveConversation(parsedId)
          const cachedMessages = messagesByConversation[parsedId] ?? []
          if (cachedMessages.length === 0) {
            await chatStore.loadMessages(parsedId, true)
          }
        } else if ((messagesByConversation[parsedId] ?? []).length === 0) {
          await chatStore.loadMessages(parsedId, true)
        }
        await chatStore.markRead(parsedId)
      })()
      return
    }
    if (!conversationId && visibleConversationIds.length > 0) {
      navigate(withLang(`/chat/${visibleConversationIds[0]}`), { replace: true })
    }
  }, [conversationId, navigate, visibleConversationIds, withLang, activeConversationId, messagesByConversation])

  const activeMessages = useMemo(
    () => (activeConversationId ? messagesByConversation[activeConversationId] ?? [] : []),
    [activeConversationId, messagesByConversation],
  )
  const activeConversation = activeConversationId ? conversationsById[activeConversationId] : null
  const resolveConferenceHrefForWeb = (value: string): string => {
    const normalized = normalizeMessageUrl(value)
    try {
      const parsed = new URL(normalized)
      const match = parsed.pathname.match(/\/conference\/([^/]+)\/join\/?$/i)
      if (!match?.[1]) return normalized
      const conferenceId = decodeURIComponent(match[1])
      return withLang(`/conference/${conferenceId}/join`)
    } catch {
      return normalized
    }
  }

  const extractConferenceIdFromText = (value: string): string => {
    if (!value) return ''
    const normalizedText = value.replace(CONFERENCE_DEEP_LINK_REGEX, '$1')
    const match = normalizedText.match(/https?:\/\/[^\s]*\/conference\/([^/\s]+)\/join\/?/i)
    return match?.[1] ? decodeURIComponent(match[1]) : ''
  }

  const renderTextWithUrls = (value: string) => {
    const normalizedText = value.replace(CONFERENCE_DEEP_LINK_REGEX, '$1')
    const parts = normalizedText.split(URL_TOKEN_REGEX)
    return parts.map((part, index) => {
      if (!part) return null
      if (/^(?:web)?https?:\/\//i.test(part.trim())) {
        const href = resolveConferenceHrefForWeb(part)
        return (
          <a
            key={`msg-url-${index}`}
            href={href}
            className="break-all underline underline-offset-2"
          >
            {part}
          </a>
        )
      }
      return <span key={`msg-text-${index}`}>{part}</span>
    })
  }

  const activeConversationName = activeConversation ? conversationTitle(activeConversation, currentUserId) : ''
  const activeConversationPeer = activeConversation?.participants.find((participant) => participant.id !== currentUserId) ?? activeConversation?.participants[0]
  const activeAvatarEntity = activeConversation?.conversation_type === 'group' ? activeConversation.chat_group : activeConversationPeer
  const activeConversationAvatarUrl = resolveAvatarUrl(activeAvatarEntity)
  const activeConversationStatus = activeConversation
    ? activeConversation.conversation_type === 'group'
      ? t('chat.membersCount', { count: activeConversation.participants.length })
      : buildConversationStatus(activeConversation, i18n.language, t)
    : t('chat.selectConversation')
  const groupParticipants = useMemo(
    () =>
      activeConversation?.conversation_type === 'group'
        ? activeConversation.participants.filter((participant) => participant.id !== currentUserId)
        : [],
    [activeConversation, currentUserId],
  )

  const isGroupChat = activeConversation?.conversation_type === 'group'
  const handleBack = () => navigate(withLang('/profile'))

  const [highlightMessageId, setHighlightMessageId] = useState<number | null>(null)

  const scrollToMessage = useCallback(
    (messageId: number) => {
      if (!messageId || messageId <= 0) return
      const tryScroll = () => {
        const el = document.getElementById(`chat-message-${messageId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setHighlightMessageId(messageId)
          window.setTimeout(() => setHighlightMessageId(null), 2000)
          return true
        }
        return false
      }
      if (tryScroll()) return
      const convId = activeConversationId
      if (convId && hasMoreByConversation[convId]) {
        void chatStore.loadMessages(convId).then(() => {
          window.setTimeout(() => {
            tryScroll()
          }, 150)
        })
      }
    },
    [activeConversationId, hasMoreByConversation],
  )

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  useEffect(() => {
    currentSenderRef.current = {
      id: auth.me?.id ?? auth.user?.id ?? 0,
      email: auth.me?.email ?? auth.user?.email ?? '',
      full_name: auth.me?.full_name ?? auth.user?.full_name ?? '',
    }
  }, [auth.me?.id, auth.me?.email, auth.me?.full_name, auth.user?.id, auth.user?.email, auth.user?.full_name])

  useEffect(() => {
    previousMessageCountRef.current = 0
    pendingTopAnchorRef.current = null
  }, [activeConversationId])

  useEffect(() => {
    silenceChatPlayback()
  }, [activeConversationId, silenceChatPlayback])

  useEffect(() => {
    if (activeConversationId) queueMicrotask(() => setShowSidebarMobile(false))
  }, [activeConversationId])

  useEffect(() => {
    const box = messageBoxRef.current
    if (!box) return

    const previousCount = previousMessageCountRef.current
    const nextCount = activeMessages.length
    const anchor = pendingTopAnchorRef.current

    // Keep viewport stable when older messages are prepended.
    if (anchor) {
      const heightDelta = box.scrollHeight - anchor.previousHeight
      box.scrollTo({ top: anchor.previousTop + heightDelta, behavior: 'instant' })
      pendingTopAnchorRef.current = null
      previousMessageCountRef.current = nextCount
      return
    }

    const isFirstPaint = previousCount === 0 && nextCount > 0
    const hasNewTailMessage = nextCount > previousCount
    const distanceFromBottom = box.scrollHeight - box.scrollTop - box.clientHeight
    const nearBottom = distanceFromBottom < 96

    if (forceScrollToBottomRef.current || isFirstPaint || (hasNewTailMessage && nearBottom)) {
      const top = box.scrollHeight
      box.scrollTo({ top, behavior: 'instant' })
      forceScrollToBottomRef.current = false
    }

    previousMessageCountRef.current = nextCount
  }, [activeMessages])

  useEffect(() => {
    const box = messageBoxRef.current
    const composer = composerRef.current
    if (!box || !composer) return
    const currentHeight = composer.offsetHeight
    if (composingHeightRef.current === 0) {
      composingHeightRef.current = currentHeight
      return
    }
    const delta = currentHeight - composingHeightRef.current
    if (delta !== 0) {
      const distanceFromBottom = box.scrollHeight - box.scrollTop - box.clientHeight
      if (distanceFromBottom < 120) {
        box.scrollTo({ top: box.scrollHeight, behavior: 'instant' })
      } else {
        box.scrollTop += delta
      }
    }
    composingHeightRef.current = currentHeight
  }, [replyToMessage, file, audioPreviewUrl, selectedImagePreviewUrl, isRecording])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!activeConversationId) return
    if (!conversationsById[activeConversationId]) {
      return
    }

    if (file) {
      const messageType = detectMessageType(file)
      forceScrollToBottomRef.current = true
      const sent = await chatStore.sendMessage({
        conversationId: activeConversationId,
        messageType,
        file,
        sender: { id: auth.me?.id ?? auth.user?.id ?? 0, email: auth.me?.email ?? auth.user?.email ?? '', full_name: auth.me?.full_name ?? auth.user?.full_name ?? '' },
      })
      if (sent) {
        silenceChatPlayback(true)
        if (audioPreviewUrl) {
          URL.revokeObjectURL(audioPreviewUrl)
          setAudioPreviewUrl(null)
        }
        if (selectedImagePreviewUrl) {
          URL.revokeObjectURL(selectedImagePreviewUrl)
          setSelectedImagePreviewUrl(null)
        }
        setFile(null)
      }
      return
    }

    if (!text.trim()) return
    forceScrollToBottomRef.current = true
      const sendingText = text.trim()
      setText('')
      const sent = await chatStore.sendMessage({
      conversationId: activeConversationId,
      messageType: 'text',
        text: sendingText,
      sender: { id: auth.me?.id ?? auth.user?.id ?? 0, email: auth.me?.email ?? auth.user?.email ?? '', full_name: auth.me?.full_name ?? auth.user?.full_name ?? '' },
    })
      const hasSendError = Boolean(chatStore.getSnapshot().sendingError)
      if (!sent && hasSendError) setText(sendingText)
  }

  const inboxErrorMessage =
    conversationsError?.status === 403
      ? t('chat.accessDenied')
      : conversationsError?.status === 404
        ? t('chat.notFound')
        : conversationsError?.message
  const messagesErrorMessage =
    messagesError?.status === 403
      ? t('chat.accessDenied')
      : messagesError?.status === 404
        ? t('chat.notFound')
        : messagesError?.message
  const sendErrorMessage =
    sendingError?.status === 403
      ? t('chat.accessDenied')
      : sendingError?.status === 404
        ? t('chat.notFound')
        : sendingError?.message

  const downloadToDevice = async (url: string, suggestedName: string) => {
    if (clearDownloadUiTimerRef.current) {
      window.clearTimeout(clearDownloadUiTimerRef.current)
      clearDownloadUiTimerRef.current = null
    }
    const sourceUrl = toLocalProxyMediaUrl(url)
    const tokens = getStoredAuthTokens()
    let blob: Blob | null = null
    let finalName = suggestedName
    let receivedBytes = 0
    let totalBytes = 0

    setDownloadState({
      fileName: suggestedName,
      progress: 0,
      receivedBytes: 0,
      totalBytes: 0,
      status: 'preparing',
    })

    try {
      const response = await fetch(sourceUrl, {
        headers: tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : undefined,
      })
      if (!response.ok) throw new Error('download failed')
      totalBytes = Number(response.headers.get('content-length') || 0)

      if (response.body) {
        const reader = response.body.getReader()
        const chunks: ArrayBuffer[] = []
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) {
            const chunk = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer
            chunks.push(chunk)
            receivedBytes += value.length
            const nextProgress = totalBytes > 0 ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : 0
            setDownloadState((prev) => ({
              fileName: prev?.fileName ?? suggestedName,
              progress: nextProgress,
              receivedBytes,
              totalBytes,
              status: 'downloading',
            }))
          }
        }
        blob = new Blob(chunks, { type: response.headers.get('content-type') || 'application/octet-stream' })
      } else {
        blob = await response.blob()
        receivedBytes = blob.size
      }

      const extFromType = blob.type.includes('/') ? blob.type.split('/')[1]?.split(';')[0] : ''
      const hasExt = /\.[a-z0-9]{2,6}$/i.test(suggestedName)
      finalName = hasExt || !extFromType ? suggestedName : `${suggestedName}.${extFromType}`
      setDownloadState({
        fileName: finalName,
        progress: 100,
        receivedBytes: receivedBytes || blob.size,
        totalBytes: totalBytes || blob.size,
        status: 'saving',
      })
    } catch {
      setDownloadState((prev) => ({
        fileName: prev?.fileName ?? suggestedName,
        progress: prev?.progress ?? 0,
        receivedBytes: prev?.receivedBytes ?? 0,
        totalBytes: prev?.totalBytes ?? 0,
        status: 'error',
      }))
      clearDownloadUiTimerRef.current = window.setTimeout(() => {
        setDownloadState(null)
      }, 3200)
      // fallback to direct browser download
      const a = document.createElement('a')
      a.href = sourceUrl
      a.download = suggestedName
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    }

    const pickerApi = window as Window & {
      showSaveFilePicker?: (options: {
        suggestedName: string
        types?: Array<{ description: string; accept: Record<string, string[]> }>
      }) => Promise<{
        createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }>
      }>
    }

    if (blob && typeof pickerApi.showSaveFilePicker === 'function') {
      const handle = await pickerApi.showSaveFilePicker({
        suggestedName: finalName,
        types: [{ description: 'Media', accept: { [blob.type || 'application/octet-stream']: ['.' + finalName.split('.').pop()] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      setDownloadState((prev) => ({
        fileName: prev?.fileName ?? finalName,
        progress: 100,
        receivedBytes: prev?.receivedBytes ?? blob.size,
        totalBytes: prev?.totalBytes || blob.size,
        status: 'done',
      }))
      clearDownloadUiTimerRef.current = window.setTimeout(() => {
        setDownloadState(null)
      }, 2200)
      return
    }

    if (!blob) return
    const localUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = localUrl
    a.download = finalName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(localUrl)
    setDownloadState((prev) => ({
      fileName: prev?.fileName ?? finalName,
      progress: 100,
      receivedBytes: prev?.receivedBytes ?? blob.size,
      totalBytes: prev?.totalBytes || blob.size,
      status: 'done',
    }))
    clearDownloadUiTimerRef.current = window.setTimeout(() => {
      setDownloadState(null)
    }, 2200)
  }

  const handleAudioStart = (audio: HTMLAudioElement) => {
    if (activeAudioElementRef.current && activeAudioElementRef.current !== audio) {
      activeAudioElementRef.current.pause()
    }
    activeAudioElementRef.current = audio
  }

  const clearRecordingTimer = () => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (recorder.state !== 'inactive') recorder.stop()
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    clearRecordingTimer()
    setIsRecording(false)
  }

  const startRecording = async () => {
    if (isRecording) return
    try {
      setMicError(null)
      setRecordingSeconds(0)
      sendOnStopRef.current = false
      discardOnStopRef.current = false
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const drawWaveform = () => {
        const currentAnalyser = analyserRef.current
        if (!currentAnalyser) return
        const dataArray = new Uint8Array(currentAnalyser.frequencyBinCount)
        currentAnalyser.getByteFrequencyData(dataArray)
        const chunk = Math.floor(dataArray.length / 24)
        const nextBars = Array.from({ length: 24 }, (_, idx) => {
          const start = idx * chunk
          const end = start + chunk
          let sum = 0
          for (let i = start; i < end; i += 1) sum += dataArray[i] ?? 0
          const avg = chunk > 0 ? sum / chunk : 0
          return Math.max(8, Math.min(30, Math.round((avg / 255) * 30)))
        })
        setRecordingBars(nextBars)
        animationFrameRef.current = requestAnimationFrame(drawWaveform)
      }
      drawWaveform()

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recordingStreamRef.current = stream
      recordingChunksRef.current = []

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) recordingChunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const extension = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'm4a' : 'webm'
        const blob = new Blob(recordingChunksRef.current, { type: mimeType })
        if (blob.size > 0 && !discardOnStopRef.current) {
          const voiceFile = new File([blob], `voice-${Date.now()}.${extension}`, { type: mimeType })
          if (sendOnStopRef.current) {
            const conversationId = activeConversationIdRef.current
            if (conversationId) {
              void (async () => {
                const sent = await chatStore.sendMessage({
                  conversationId,
                  messageType: 'audio',
                  file: voiceFile,
                  sender: currentSenderRef.current,
                })
                if (sent) {
                  silenceChatPlayback(true)
                  forceScrollToBottomRef.current = true
                  setFile(null)
                }
              })()
            }
          } else {
            if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
            setAudioPreviewUrl(URL.createObjectURL(blob))
            setFile(voiceFile)
          }
        }
        stream.getTracks().forEach((track) => track.stop())
        void audioContext.close()
        analyserRef.current = null
        recordingStreamRef.current = null
        mediaRecorderRef.current = null
        recordingChunksRef.current = []
        sendOnStopRef.current = false
        discardOnStopRef.current = false
        setRecordingBars(Array.from({ length: 24 }, () => 12))
        setRecordingSeconds(0)
      }

      recorder.start()
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1
          // Auto stop after 5 minutes for safety.
          if (next >= 300) {
            queueMicrotask(() => stopRecording())
          }
          return next
        })
      }, 1000)
      setIsRecording(true)
    } catch {
      setMicError(t('chat.micRequired'))
      setIsRecording(false)
    }
  }

  const cancelRecording = () => {
    sendOnStopRef.current = false
    discardOnStopRef.current = true
    stopRecording()
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl)
      setAudioPreviewUrl(null)
    }
    setFile(null)
    setRecordingSeconds(0)
    setRecordingBars(Array.from({ length: 24 }, () => 12))
  }

  const stopAndSendRecording = () => {
    sendOnStopRef.current = true
    stopRecording()
  }

  return (
    <LazyMotion features={domAnimation}>
      <SectionContainer className="max-w-none px-0 py-1 sm:px-0 sm:py-1 lg:px-0">
      <Seo title={t('chat.title')} description="Real-time chat inbox and messages." />
      <div className="mb-3 mt-2 flex w-full px-3 md:px-4 lg:px-5">
        <Button variant="secondary" size="sm" onClick={handleBack}>
          <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} aria-hidden />
          {t('conference.back')}
        </Button>
      </div>
      <div className="grid w-full gap-5 px-3 md:px-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-5">
        <Card
          className={`h-[calc(100dvh-8.8rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.25)] ${
            showSidebarMobile ? 'flex' : 'hidden'
          } flex-col lg:flex`}
        >
          <div className="border-b border-slate-200 bg-white px-4 py-3.5">
            <h1 className="text-lg font-semibold text-slate-900">{t('chat.inbox')}</h1>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 [scrollbar-width:thin] [scrollbar-color:#a5f3fc_transparent]">
            {loadingConversations ? (
              <p className="p-4 text-sm text-arc-subtext">{t('chat.loading')}</p>
            ) : inboxErrorMessage ? (
              <div className="p-4">
                <p className="text-sm text-red-600">{inboxErrorMessage}</p>
              </div>
            ) : visibleConversationIds.length === 0 ? (
              <div className="p-4">
                <p className="text-sm text-arc-subtext">{t('chat.noConversations')}</p>
              </div>
            ) : (
              <>
                <ul className="space-y-1.5">
                  {visibleConversationIds.map((id) => {
                    const conversation = conversationsById[id]
                    if (!conversation) return null
                    const active = id === activeConversationId
                    const title = conversationTitle(conversation, currentUserId)
                    const peer = conversation.participants.find((participant) => participant.id !== currentUserId) ?? conversation.participants[0]
                    const avatarEntity = conversation.conversation_type === 'group' ? conversation.chat_group : peer
                    const avatarUrl = resolveAvatarUrl(avatarEntity)
                    return (
                      <li key={id} className="px-1">
                        <Link
                          to={withLang(`/chat/${id}`)}
                          className={`block rounded-2xl px-3 py-3.5 transition-all duration-200 ${
                            active
                              ? 'border border-[#00e2ff]/30 bg-[#eaf9fc] shadow-sm ring-1 ring-[#00e2ff]/15'
                              : 'border border-transparent hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <ChatAvatar label={title} avatarUrl={avatarUrl} sizeClass="h-10 w-10" textClass="text-xs" />
                              <div>
                                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <p className="text-[15px] font-semibold text-slate-900">{title}</p>
                                  <span className="rounded-full border border-[#00e2ff]/35 bg-[#00e2ff]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                                    {conversation.conversation_type === 'group' ? t('chat.group') : t('chat.direct')}
                                  </span>
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                  {conversation.last_message?.text ?? conversation.last_message?.message_type ?? t('chat.noMessages')}
                                </p>
                              </div>
                            </div>
                            {conversation.unread_count > 0 ? (
                              <span className="min-w-6 rounded-full bg-[#00e2ff] px-2 py-0.5 text-center text-xs font-semibold text-slate-900">
                                {conversation.unread_count}
                              </span>
                            ) : null}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                {standaloneGroups.length > 0 ? (
                  <div className="border-t border-arc-border/70 px-3 py-2">
                    <p className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-arc-subtext">{t('chat.groups')}</p>
                    <ul className="space-y-1">
                      {standaloneGroups.map((group) => (
                        <li key={`group-${group.id}`}>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left text-sm text-arc-text transition hover:bg-arc-muted/70"
                            onClick={async () => {
                              const conversationId = await chatStore.openGroupConversation(group.id)
                              if (!conversationId) return
                              await chatStore.loadConversations()
                              navigate(withLang(`/chat/${conversationId}`))
                            }}
                          >
                            {group.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </Card>

        <Card
          className={`chat-shell flex h-[calc(100dvh-8.8rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] p-0 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.25)] ${
            showSidebarMobile ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => setShowSidebarMobile(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-arc-border bg-white text-arc-subtext transition hover:border-[#00e2ff] hover:text-[#00b7d1] lg:hidden"
                aria-label={t('chat.inbox')}
              >
                <ChevronLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:scale-[1.02]"
                onClick={() => {
                  if (activeConversation?.conversation_type === 'group') setIsMembersOpen(true)
                }}
                aria-label={activeConversation?.conversation_type === 'group' ? 'show group members' : 'conversation avatar'}
              >
                <ChatAvatar
                  label={activeConversationName || t('chat.conversation')}
                  avatarUrl={activeConversationAvatarUrl}
                  sizeClass="h-11 w-11"
                  textClass="text-sm"
                />
              </button>
              <button
                type="button"
                className="text-left"
                onClick={() => {
                  if (activeConversation?.conversation_type === 'group') setIsMembersOpen(true)
                }}
              >
                <h2 className="text-base font-bold text-slate-900">{activeConversationName || t('chat.conversation')}</h2>
                <p className="text-xs text-slate-500">{activeConversationStatus}</p>
                {groupParticipants.length > 0 ? (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                    {groupParticipants.map((participant) => participantDisplayName(participant)).join(', ')}
                  </p>
                ) : null}
              </button>
            </div>
          </div>

          <div
            ref={messageBoxRef}
            className="chat-scroll-smooth flex-1 space-y-3.5 overflow-y-auto bg-[#f8fafc] p-4 sm:p-5 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
          >
            {activeConversationId && hasMoreByConversation[activeConversationId] ? (
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const box = messageBoxRef.current
                    if (box) {
                      pendingTopAnchorRef.current = { previousTop: box.scrollTop, previousHeight: box.scrollHeight }
                    }
                    void chatStore.loadMessages(activeConversationId)
                  }}
                  disabled={loadingMessages}
                  className="border-[#00e2ff]/50 hover:bg-[#00e2ff]/10"
                >
                  {loadingMessages ? t('chat.loading') : t('chat.loadOlder')}
                </Button>
              </div>
            ) : null}

            {messagesErrorMessage ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-red-600">{messagesErrorMessage}</p>
              </div>
            ) : !activeConversationId ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-arc-subtext">{t('chat.selectConversation')}</p>
              </div>
            ) : activeMessages.length === 0 ? (
              <p className="pt-8 text-center text-sm text-arc-subtext">{t('chat.noMessages')}</p>
            ) : null}

            {activeMessages.map((message) => {
              const mine = message.sender.id === currentUserId
              const senderDisplayName = mine ? t('chat.you') : participantDisplayName(message.sender)
              const senderAvatarUrl = resolveAvatarUrl(message.sender)
              const replyMessage = resolveReplyMessage(message, activeMessages)
              const mediaUrl = message.file ? resolveMediaUrl(message.file) : null
              const isRecent = Math.abs(activeMessages.length - activeMessages.findIndex((m) => m.id === message.id)) < 8
              const replyLabelName =
                isGroupChat && replyMessage
                  ? replyMessage.sender.id === currentUserId
                    ? t('chat.you')
                    : participantDisplayName(replyMessage.sender)
                  : null
              return (
                <motion.div
                  key={message.id}
                  id={`chat-message-${message.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex flex-col ${mine ? (isRtl ? 'items-start' : 'items-end') : isRtl ? 'items-end' : 'items-start'}`}
                >
                  {isGroupChat ? (
                    <div
                      className={`mb-1 flex w-full max-w-[78%] items-start gap-2 sm:max-w-[72%] ${
                        mine ? (isRtl ? 'flex-row' : 'flex-row-reverse') : isRtl ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <ChatAvatar label={senderDisplayName} avatarUrl={senderAvatarUrl} sizeClass="mt-5 h-8 w-8" textClass="text-[10px]" />
                      <span
                        className={`mb-1 px-1 text-[11px] font-semibold ${
                          mine ? 'text-[#008ba1]' : 'text-slate-600'
                        }`}
                      >
                        {senderDisplayName}
                      </span>
                    </div>
                  ) : null}
                  <div
                    className={`group max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm sm:max-w-[66%] ${
                      mine
                        ? 'rounded-br-md border border-[#00b8cf] bg-gradient-to-r from-[#00e2ff] to-[#00bcd4] text-white'
                        : 'rounded-bl-md border border-slate-200 bg-[#f5f7fa] text-[#1f2937]'
                    } ${highlightMessageId === message.id ? 'ring-2 ring-[#00e2ff] ring-offset-2' : ''}`}
                  >
                    {replyMessage ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (replyMessage.id > 0) scrollToMessage(replyMessage.id)
                        }}
                        className={`mb-2 w-full rounded-lg border-l-4 px-2 py-1 text-left text-xs transition hover:opacity-90 ${
                          mine
                            ? 'border-[#9ef5ff] bg-white/15 text-white/95'
                            : 'border-[#00e2ff]/55 bg-slate-50 text-arc-subtext'
                        }`}
                      >
                        {replyLabelName
                          ? `${t('chat.replyingTo')} ${replyLabelName}: ${replyMessage.text ?? replyMessage.message_type}`
                          : `${t('chat.replyingTo')}: ${replyMessage.text ?? replyMessage.message_type}`}
                      </button>
                    ) : null}
                    {message.text ? (
                      (() => {
                        const conferenceId = extractConferenceIdFromText(message.text)
                        if (!conferenceId) {
                          return (
                            <p className={mine ? 'text-white font-normal' : 'text-[#1f2937] font-normal'}>
                              {renderTextWithUrls(message.text)}
                            </p>
                          )
                        }
                        return (
                          <button
                            type="button"
                            onClick={() => navigate(withLang(`/conference/${conferenceId}/join`))}
                            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-soft transition hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-primary-light"
                          >
                            {t('chat.joinConferenceButton')}
                          </button>
                        )
                      })()
                    ) : null}
                    {mediaUrl ? (
                      message.message_type === 'image' ? (
                        <ImageBubble
                          src={mediaUrl}
                          onOpen={setImagePreviewUrl}
                          onDownload={(src) => {
                            void downloadToDevice(src, guessFilename(src, `image-${message.id}`))
                          }}
                          downloadLabel={t('chat.savePhoto')}
                          viewLabel={t('chat.view')}
                          failedLabel={t('chat.failedToLoad')}
                          mine={mine}
                          eager={isRecent}
                        />
                      ) : message.message_type === 'audio' ? (
                        <AudioBubble
                          src={mediaUrl}
                          mine={mine}
                          onStart={handleAudioStart}
                          failedLabel={t('chat.failedToLoad')}
                        />
                      ) : message.message_type === 'video' ? (
                        <VideoBubble
                          src={mediaUrl}
                          mine={mine}
                          onDownload={(src) => {
                            void downloadToDevice(src, guessFilename(src, `video-${message.id}.mp4`))
                          }}
                          downloadLabel={t('chat.download')}
                          failedLabel={t('chat.failedToLoad')}
                        />
                      ) : (
                        <div
                          className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                            mine ? 'border-white/35 bg-white/10' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <FileText className={`h-4 w-4 ${mine ? 'text-white' : 'text-[#00a8bf]'}`} aria-hidden />
                            <div>
                              <p className={`max-w-[180px] truncate text-xs font-medium ${mine ? 'text-white' : 'text-arc-text'}`}>
                                {guessFilename(mediaUrl, `file-${message.id}`)}
                              </p>
                              <p className={`text-[10px] ${mine ? 'text-white/80' : 'text-arc-subtext'}`}>{t('chat.unknownSize')}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              void downloadToDevice(mediaUrl, guessFilename(mediaUrl, `file-${message.id}`))
                            }}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition ${
                              mine ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-[#00e2ff]/15 text-[#008ba1] hover:bg-[#00e2ff]/25'
                            }`}
                          >
                            <Download className="h-3 w-3" aria-hidden />
                            {t('chat.download')}
                          </button>
                        </div>
                      )
                    ) : null}
                    <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${mine ? 'text-white/85' : 'text-slate-500'}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatMessageTime(message.created_at, i18n.language)}</span>
                        {mine ? (
                          <span className="text-[10px]">
                            {message.local_status === 'failed'
                              ? t('chat.failed')
                              : message.local_status === 'sending'
                                ? t('chat.sending')
                                : messageSeen(message)
                                  ? '✓✓'
                                  : '✓'}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => chatStore.setReplyToMessage(message)} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 opacity-60 transition hover:bg-black/5 hover:opacity-100">
                          <Reply className="h-3 w-3" aria-hidden />
                          {t('chat.reply')}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <form ref={composerRef} onSubmit={submit} className="space-y-2 border-t border-slate-200 bg-white p-3">
            {replyToMessage ? (
              <div className={`flex items-center justify-between gap-2 rounded-xl border border-[#00e2ff]/35 bg-[#00e2ff]/8 px-3 py-2 text-xs ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  className="line-clamp-2 min-w-0 flex-1 text-left text-arc-text"
                  onClick={() => {
                    if (replyToMessage.id > 0) scrollToMessage(replyToMessage.id)
                  }}
                >
                  {t('chat.replyingTo')}: {replyToMessage.text ?? replyToMessage.message_type}
                </button>
                <button type="button" onClick={() => chatStore.setReplyToMessage(null)} aria-label={t('chat.removeReply')} className="shrink-0">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}

            {file && !file.type.startsWith('audio/') ? (
              <div className={`flex items-center justify-between rounded-xl border border-[#00e2ff]/35 bg-[#00e2ff]/8 px-3 py-2 text-xs ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <FileText className="h-4 w-4 text-[#00a8bf]" aria-hidden />
                  <p className="line-clamp-1 font-medium">{t('chat.fileSelected')}: {file.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (audioPreviewUrl) {
                      URL.revokeObjectURL(audioPreviewUrl)
                      setAudioPreviewUrl(null)
                    }
                    if (selectedImagePreviewUrl) {
                      URL.revokeObjectURL(selectedImagePreviewUrl)
                      setSelectedImagePreviewUrl(null)
                    }
                    setFile(null)
                  }}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}
            {selectedImagePreviewUrl ? (
              <div className={`flex items-center justify-between gap-3 rounded-xl border border-[#00e2ff]/35 bg-[#00e2ff]/8 px-3 py-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <img src={selectedImagePreviewUrl} alt="selected preview" className="h-16 w-24 rounded-lg bg-white object-contain" />
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-arc-border bg-white text-arc-subtext hover:text-arc-text"
                  onClick={() => {
                    URL.revokeObjectURL(selectedImagePreviewUrl)
                    setSelectedImagePreviewUrl(null)
                    setFile(null)
                  }}
                  aria-label={t('chat.removeReply')}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}
            {audioPreviewUrl ? (
              <div className={`flex items-center justify-between gap-3 rounded-xl border border-[#00e2ff]/35 bg-[#00e2ff]/8 px-3 py-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <audio
                  ref={audioPreviewRef}
                  controls
                  preload="metadata"
                  src={audioPreviewUrl}
                  className="h-9 w-full max-w-[320px]"
                />
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-arc-border bg-white text-arc-subtext hover:text-arc-text"
                  onClick={() => {
                    URL.revokeObjectURL(audioPreviewUrl)
                    setAudioPreviewUrl(null)
                    setFile(null)
                  }}
                  aria-label={t('chat.removeReply')}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}
            {isRecording ? (
              <div className={`flex items-center justify-between gap-2 rounded-full border border-red-200 bg-white p-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                  aria-label={t('chat.cancelRecording')}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
                <div className="flex flex-1 items-center gap-2 px-2">
                  <div className="flex h-8 w-full items-end gap-[2px] rounded-md bg-white px-1 py-1">
                    {recordingBars.map((h, idx) => (
                      <span
                        key={idx}
                        className="inline-block w-[3px] rounded-full bg-[#00cfe8] transition-all duration-100"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                  <div className="shrink-0 text-sm font-medium text-arc-subtext">
                    {formatDuration(recordingSeconds)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopAndSendRecording}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#00e2ff]/60 bg-[#00e2ff] text-slate-900 transition hover:bg-[#00d1ea]"
                  aria-label={t('chat.sendRecording')}
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : (
            <div className={`flex items-end gap-2 rounded-full border border-slate-200 bg-white p-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <label className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-arc-border bg-white text-arc-subtext transition-all duration-200 hover:border-[#00e2ff] hover:text-[#00b7d1]">
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const selected = event.target.files?.[0] ?? null
                    if (selectedImagePreviewUrl) {
                      URL.revokeObjectURL(selectedImagePreviewUrl)
                      setSelectedImagePreviewUrl(null)
                    }
                    if (audioPreviewUrl) {
                      URL.revokeObjectURL(audioPreviewUrl)
                      setAudioPreviewUrl(null)
                    }
                    setFile(selected)
                    if (selected?.type.startsWith('image/')) {
                      setSelectedImagePreviewUrl(URL.createObjectURL(selected))
                    }
                  }}
                />
                <Paperclip className="h-4 w-4" aria-hidden />
              </label>
              <button
                type="button"
                onClick={() => {
                  void startRecording()
                }}
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                  'border-arc-border bg-white text-arc-subtext hover:border-[#00e2ff] hover:text-[#00b7d1]'
                }`}
                aria-label={t('chat.voice')}
              >
                <Mic className="h-4 w-4" aria-hidden />
              </button>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={1}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    const form = event.currentTarget.form
                    if (!form) return
                    form.requestSubmit()
                  }
                }}
                className="min-h-11 max-h-36 flex-1 resize-y rounded-full border border-arc-border px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#00e2ff] focus:ring-2 focus:ring-[#00e2ff]/25"
                placeholder={t('chat.typePlaceholder')}
              />
              <Button
                type="submit"
                disabled={sending || (!text.trim() && !file)}
                className="h-11 rounded-full bg-[#00e2ff] px-4 text-slate-900 shadow-sm hover:bg-[#00c7e2] disabled:bg-slate-200"
              >
                <Send className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{t('chat.send')}</span>
              </Button>
            </div>
            )}
            {micError ? <p className="text-xs text-red-600">{micError}</p> : null}
            {sendErrorMessage ? <p className="text-xs text-red-600">{sendErrorMessage}</p> : null}
          </form>
        </Card>
      </div>
      <AnimatePresence>
        {isMembersOpen && activeConversation?.conversation_type === 'group' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[125] flex items-center justify-center bg-black/45 p-4"
            onClick={() => setIsMembersOpen(false)}
          >
            <motion.div
              initial={{ y: 8, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 8, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{activeConversationName}</h3>
                <button type="button" onClick={() => setIsMembersOpen(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="mb-3 text-xs text-slate-500">{t('chat.membersCount', { count: activeConversation.participants.length })}</p>
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {activeConversation.participants.map((participant) => (
                  <li key={participant.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#00e2ff]/20 text-xs font-bold text-slate-800 ring-1 ring-[#00d4ef]/35 ring-offset-1 ring-offset-slate-50">
                      {getInitials(participantDisplayName(participant)) || 'U'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{participantDisplayName(participant)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        ) : null}
        {downloadState ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed bottom-5 z-[130] w-[min(430px,calc(100vw-2rem))] rounded-2xl border bg-white/95 p-4 shadow-[0_24px_60px_-30px_rgba(2,6,23,0.55)] backdrop-blur-sm ${
              isRtl ? 'left-4' : 'right-4'
            }`}
          >
            <div className={`flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{downloadState.fileName}</p>
                <p className="text-[12px] text-slate-500">
                  {downloadState.status === 'preparing'
                    ? t('chat.downloadPreparing')
                    : downloadState.status === 'downloading'
                      ? t('chat.downloading')
                      : downloadState.status === 'saving'
                        ? t('chat.downloadSaving')
                        : downloadState.status === 'done'
                          ? t('chat.downloadCompleted')
                          : t('chat.downloadFailed')}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-slate-600">
                {downloadState.status === 'done' ? '100%' : `${downloadState.progress}%`}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  downloadState.status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-[#00e2ff] to-[#00b8d2]'
                }`}
                style={{ width: `${downloadState.status === 'done' ? 100 : Math.max(6, downloadState.progress)}%` }}
              />
            </div>
            <div className={`mt-2 flex items-center justify-between text-[11px] text-slate-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span>
                {formatBytes(downloadState.receivedBytes)} / {downloadState.totalBytes > 0 ? formatBytes(downloadState.totalBytes) : t('chat.unknownSize')}
              </span>
              {downloadState.status === 'error' ? (
                <button
                  type="button"
                  onClick={() => setDownloadState(null)}
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  {t('chat.removeReply')}
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
        {imagePreviewUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setImagePreviewUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setImagePreviewUrl(null)}
                className="absolute right-2 top-2 z-[2] inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
                aria-label={t('chat.closeImagePreview')}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
              <img src={imagePreviewUrl} alt="preview" className="max-h-[82vh] w-full rounded-2xl bg-black object-contain" />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    void downloadToDevice(imagePreviewUrl, guessFilename(imagePreviewUrl, `image-${Date.now()}`))
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {t('chat.savePhoto')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </SectionContainer>
    </LazyMotion>
  )
}

function ChatPage() {
  return (
    <RequireAuth>
      <ChatPageInner />
    </RequireAuth>
  )
}

export default ChatPage

