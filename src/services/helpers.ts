import { getApiOrigin } from './api'

const API_ORIGIN = getApiOrigin()

export const normalizeAssetUrl = (value: string): string => {
  if (!value) return value
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (!API_ORIGIN) return value

  if (value.startsWith('/')) {
    return `${API_ORIGIN}${value}`
  }

  return `${API_ORIGIN}/${value}`
}
