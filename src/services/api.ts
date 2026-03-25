import axios, { AxiosError } from 'axios'

type ValidationErrors = Record<string, string[]>

export class ApiError extends Error {
  status: number | null
  details: ValidationErrors | null

  constructor(message: string, status: number | null = null, details: ValidationErrors | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/'

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
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

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
      detail?: string
      message?: string
      error?: string
      non_field_errors?: string[]
    }

    if (typedPayload.detail) return typedPayload.detail
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

const extractValidationDetails = (error: AxiosError): ValidationErrors | null => {
  if (error.response?.status !== 400) return null

  const payload = error.response.data
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null

  const details: ValidationErrors = {}

  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      details[key] = value
    } else if (typeof value === 'string') {
      details[key] = [value]
    }
  })

  return Object.keys(details).length ? details : null
}

type ApiRequestConfig = Parameters<typeof api.request>[0] & {
  _retry?: boolean
  skipAuth?: boolean
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

    const message = extractMessage(error)
    const details = extractValidationDetails(error)
    const normalizedError = new ApiError(message, status, details)
    return Promise.reject(normalizedError)
  },
)

export const getApiOrigin = (): string => {
  try {
    return new URL(API_BASE_URL).origin
  } catch {
    return ''
  }
}

export const getStoredAuthTokens = (): AuthTokens | null => readTokens()
export const setStoredAuthTokens = (tokens: AuthTokens | null): void => writeTokens(tokens)

export default api
