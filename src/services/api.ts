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
    return payload
  }

  if (payload && typeof payload === 'object') {
    const typedPayload = payload as {
      detail?: string
      message?: string
      non_field_errors?: string[]
    }

    if (typedPayload.detail) return typedPayload.detail
    if (typedPayload.message) return typedPayload.message
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

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = extractMessage(error)
    const details = extractValidationDetails(error)
    const normalizedError = new ApiError(message, error.response?.status ?? null, details)
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

export default api
