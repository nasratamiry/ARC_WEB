import axios, { AxiosError } from 'axios'
import i18n from '../i18n'

type ValidationErrors = Record<string, string[]>
export type ApiErrorKind = 'network' | 'timeout' | 'server' | 'auth' | 'rate_limit' | 'not_found' | 'validation' | 'unknown'
export type AuthErrorReason = 'email_not_verified' | 'account_disabled' | null

export class ApiError extends Error {
  status: number | null
  details: ValidationErrors | null
  kind: ApiErrorKind
  endpoint: string
  canRetry: boolean
  authReason: AuthErrorReason
  /** Machine-readable code from JSON body when present. */
  serverCode: string | null

  constructor(
    message: string,
    status: number | null = null,
    details: ValidationErrors | null = null,
    kind: ApiErrorKind = 'unknown',
    endpoint = '',
    canRetry = false,
    authReason: AuthErrorReason = null,
    serverCode: string | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.kind = kind
    this.endpoint = endpoint
    this.canRetry = canRetry
    this.authReason = authReason
    this.serverCode = serverCode
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://167.86.71.135:8000/api/'

/** When VITE_API_BASE_URL is relative (/api/), HTTP goes through Vite proxy but WebSockets must target the real backend. */
const DEFAULT_BACKEND_ORIGIN_FOR_WS = 'http://167.86.71.135:8000'

type AuthTokens = {
  access: string
  refresh: string
}

const AUTH_STORAGE_KEY = 'arc-auth'

const readTokens = (): AuthTokens | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthTokens>
    if (!parsed.access || !parsed.refresh) return null
    return { access: parsed.access, refresh: parsed.refresh }
  } catch {
    return null
  }
}

const writeTokens = (tokens: AuthTokens | null): void => {
  try {
    if (!tokens) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens))
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

let onAuthFailure: (() => void) | null = null
export const setOnAuthFailure = (handler: (() => void) | null): void => {
  onAuthFailure = handler
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

const tr = (key: string, fallback: string): string => i18n.t(key, { defaultValue: fallback })

const extractMessage = (error: AxiosError): string => {
  const payload = error.response?.data

  if (typeof payload === 'string' && payload.trim()) {
    const trimmed = payload.trim()
    // Avoid leaking HTML error pages into the UI.
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.includes('<title>Not Found</title>')) {
      if (error.response?.status === 404) return 'Not found.'
      return 'Server error. Please try again.'
    }
    return payload
  }

  if (payload && typeof payload === 'object') {
    const typedPayload = payload as {
      detail?: string | string[] | Record<string, unknown>
      message?: string
      error?: string
      non_field_errors?: string[]
    }

    if (typeof typedPayload.detail === 'string' && typedPayload.detail) return typedPayload.detail
    if (Array.isArray(typedPayload.detail) && typedPayload.detail.length) {
      return typedPayload.detail.map(String).filter(Boolean).join(' ')
    }
    if (typedPayload.message) return typedPayload.message
    if (typedPayload.error) return typedPayload.error
    if (typedPayload.non_field_errors?.length) return typedPayload.non_field_errors[0]
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.'
  }

  if (!error.response) {
    return 'Network error. Please check your connection.'
  }

  return 'Something went wrong. Please try again.'
}

const getPayloadCode = (error: AxiosError): string | null => {
  const payload = error.response?.data
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const c = (payload as { code?: unknown }).code
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return null
}

const getRawPayloadMessage = (error: AxiosError): string => {
  const payload = error.response?.data
  if (typeof payload === 'string' && payload.trim()) return payload.trim()
  if (payload && typeof payload === 'object') {
    const typedPayload = payload as {
      detail?: string | string[] | Record<string, unknown>
      message?: string
      error?: string
      non_field_errors?: string[]
    }
    if (typeof typedPayload.detail === 'string' && typedPayload.detail) return typedPayload.detail
    if (Array.isArray(typedPayload.detail) && typedPayload.detail.length) {
      return typedPayload.detail.map(String).filter(Boolean).join(' ')
    }
    if (typedPayload.message) return typedPayload.message
    if (typedPayload.error) return typedPayload.error
    if (typedPayload.non_field_errors?.length) return typedPayload.non_field_errors[0]
  }
  return ''
}

const extractValidationDetails = (error: AxiosError): ValidationErrors | null => {
  const status = error.response?.status
  if (status !== 400 && status !== 422) return null

  const payload = error.response?.data
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null

  const details: ValidationErrors = {}

  const addEntry = (key: string, value: unknown) => {
    if (key === 'detail') {
      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        details.non_field_errors = [...(details.non_field_errors ?? []), ...value]
      } else if (typeof value === 'string') {
        details.non_field_errors = [...(details.non_field_errors ?? []), value]
      }
      return
    }
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      details[key] = value
    } else if (typeof value === 'string') {
      details[key] = [value]
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => addEntry(`${key}.${k}`, v))
    }
  }

  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => addEntry(key, value))

  return Object.keys(details).length ? details : null
}

type ApiRequestConfig = Parameters<typeof api.request>[0] & {
  _retry?: boolean
  skipAuth?: boolean
}

const resolveEndpoint = (error: AxiosError): string => error.config?.url ?? 'unknown-endpoint'

const classifyError = (error: AxiosError): { message: string; kind: ApiErrorKind; canRetry: boolean; authReason: AuthErrorReason } => {
  const status = error.response?.status ?? null
  const rawMessage = getRawPayloadMessage(error)
  const normalizedRaw = rawMessage.toLowerCase()

  if (error.code === 'ECONNABORTED') {
    return {
      message: tr('authErrors.timeout', 'Request timed out. Your internet may be slow.'),
      kind: 'timeout',
      canRetry: true,
      authReason: null,
    }
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return {
      message: tr('authErrors.network', 'Network error. Please check your internet connection.'),
      kind: 'network',
      canRetry: true,
      authReason: null,
    }
  }

  if (status === 401) {
    return { message: tr('authErrors.invalidCredentials', 'Invalid email or password.'), kind: 'auth', canRetry: false, authReason: null }
  }

  if (status === 403) {
    if (/verify|verification|email not verified|not verified/.test(normalizedRaw)) {
      return {
        message: tr('authErrors.emailNotVerified', 'Email not verified. Please verify your email.'),
        kind: 'auth',
        canRetry: false,
        authReason: 'email_not_verified',
      }
    }

    if (/disabled|inactive|suspended|deactivated/.test(normalizedRaw)) {
      return {
        message: tr('authErrors.accountDisabled', 'Your account is disabled. Please contact support.'),
        kind: 'auth',
        canRetry: false,
        authReason: 'account_disabled',
      }
    }

    return { message: rawMessage || 'Access denied.', kind: 'auth', canRetry: false, authReason: null }
  }

  if (status === 429) {
    return {
      message: rawMessage || tr('authErrors.tooManyRequests', 'Too many requests. Please try again later.'),
      kind: 'rate_limit',
      canRetry: true,
      authReason: null,
    }
  }

  if (status === 500) {
    const fallback = tr('authErrors.serverError', 'Server error. Please try again later.')
    const detail =
      rawMessage && !/^<!doctype/i.test(rawMessage) && !rawMessage.includes('<html') && rawMessage.length < 500
        ? rawMessage
        : ''
    return { message: detail || fallback, kind: 'server', canRetry: true, authReason: null }
  }

  if (status === 503) {
    return { message: tr('authErrors.serviceUnavailable', 'Service unavailable. Server may be down.'), kind: 'server', canRetry: true, authReason: null }
  }

  if (status === 404) {
    return { message: tr('authErrors.apiNotFound', 'API endpoint not found.'), kind: 'not_found', canRetry: false, authReason: null }
  }

  if (status === 400 || status === 422) {
    return {
      message: rawMessage || extractMessage(error),
      kind: 'validation',
      canRetry: false,
      authReason: null,
    }
  }

  return {
    message: extractMessage(error),
    kind: 'unknown',
    canRetry: status !== null && status >= 500,
    authReason: null,
  }
}

const logApiError = (error: AxiosError, kind: ApiErrorKind, endpoint: string, message: string): void => {
  const status = error.response?.status ?? 'no-response'
  const typeLabel =
    kind === 'network'
      ? 'NETWORK ERROR'
      : kind === 'timeout'
        ? 'TIMEOUT ERROR'
        : kind === 'auth'
          ? 'AUTH ERROR'
          : kind === 'server'
            ? 'SERVER ERROR'
            : kind === 'rate_limit'
              ? 'RATE LIMIT ERROR'
              : 'API ERROR'

  console.error(`[${typeLabel}]`, {
    endpoint,
    url: endpoint,
    status,
    message,
    code: error.code ?? 'unknown',
    responseData: error.response?.data,
  })
}

let refreshPromise: Promise<AuthTokens> | null = null

const refreshAccessToken = async (): Promise<AuthTokens> => {
  const tokens = readTokens()
  if (!tokens?.refresh) {
    throw new ApiError('Refresh token is required.', 400)
  }

  const response = await api.post<AuthTokens>(
    'auth/refresh/',
    { refresh: tokens.refresh },
    { skipAuth: true } as ApiRequestConfig,
  )

  // refresh token rotation is disabled on backend; still accept server refresh in response
  const nextTokens: AuthTokens = {
    access: response.data.access,
    refresh: response.data.refresh ?? tokens.refresh,
  }
  writeTokens(nextTokens)
  return nextTokens
}

api.interceptors.request.use((config) => {
  const typed = config as ApiRequestConfig
  if (typed.skipAuth) return config

  const tokens = readTokens()
  if (tokens?.access) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${tokens.access}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ApiRequestConfig | undefined
    const status = error.response?.status ?? null

    // On 401, try refresh once, then retry original request.
    if (status === 401 && originalRequest && !originalRequest._retry && !originalRequest.skipAuth) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const nextTokens = await refreshPromise

        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${nextTokens.access}`
        return api.request(originalRequest)
      } catch (refreshErr) {
        writeTokens(null)
        onAuthFailure?.()
        return Promise.reject(refreshErr)
      }
    }

    const endpoint = resolveEndpoint(error)
    const { message, kind, canRetry, authReason } = classifyError(error)
    logApiError(error, kind, endpoint, message)
    const details = extractValidationDetails(error)
    const serverCode = getPayloadCode(error)
    const normalizedError = new ApiError(message, status, details, kind, endpoint, canRetry, authReason, serverCode)
    return Promise.reject(normalizedError)
  },
)

export const getApiOrigin = (): string => {
  try {
    if (API_BASE_URL.startsWith('/')) {
      return window.location.origin
    }
    return new URL(API_BASE_URL).origin
  } catch {
    return ''
  }
}

/**
 * Base URL for Django Channels WebSockets (no path suffix).
 * Use env override when API is relative so WS does not hit the Vite dev server (404).
 */
export const getWebSocketBaseUrl = (): string => {
  const explicit = typeof import.meta.env.VITE_WS_BASE_URL === 'string' ? import.meta.env.VITE_WS_BASE_URL.trim() : ''
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  const base = API_BASE_URL.trim()
  if (base.startsWith('http://') || base.startsWith('https://')) {
    try {
      const { origin } = new URL(base)
      if (origin.startsWith('https://')) return origin.replace('https://', 'wss://')
      return origin.replace('http://', 'ws://')
    } catch {
      return ''
    }
  }

  const backendOrigin =
    typeof import.meta.env.VITE_BACKEND_ORIGIN === 'string' && import.meta.env.VITE_BACKEND_ORIGIN.trim()
      ? import.meta.env.VITE_BACKEND_ORIGIN.trim()
      : DEFAULT_BACKEND_ORIGIN_FOR_WS

  try {
    const u = new URL(backendOrigin)
    return u.protocol === 'https:' ? `wss://${u.host}` : `ws://${u.host}`
  } catch {
    return ''
  }
}

/**
 * Path inserted between ws host and `/ws/...` (Django often mounts Channels as `/api/ws/...`).
 * Set VITE_WS_PATH_PREFIX= (empty) in .env to force no prefix when REST is /api but WS is at /ws.
 */
export const getWebSocketPathPrefix = (): string => {
  if (Object.prototype.hasOwnProperty.call(import.meta.env, 'VITE_WS_PATH_PREFIX')) {
    const raw = import.meta.env.VITE_WS_PATH_PREFIX
    const p = typeof raw === 'string' ? raw.trim() : ''
    if (p === '') return ''
    const normalized = p.replace(/\/$/, '')
    return normalized.startsWith('/') ? normalized : `/${normalized}`
  }

  const base = API_BASE_URL.trim()
  if (base.startsWith('/')) {
    if (base.toLowerCase().startsWith('/api')) return '/api'
    return ''
  }
  try {
    const { pathname } = new URL(base)
    if (pathname.toLowerCase().startsWith('/api')) return '/api'
  } catch {
    // ignore
  }
  return ''
}

export const getStoredAuthTokens = (): AuthTokens | null => readTokens()
export const setStoredAuthTokens = (tokens: AuthTokens | null): void => writeTokens(tokens)

export default api
