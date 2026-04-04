const DEFAULT_MOBILE_LINK_SCHEME = 'APRC_CONF:'
const DEFAULT_CONFERENCE_WEB_BASE_URL = 'https://aprc.aprcrail.com'

const trimTrailingSlashes = (value) => value.replace(/\/+$/, '')

const normalizeBaseUrl = (value) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimTrailingSlashes(trimmed)
}

const readConfiguredBaseUrl = () => {
  const explicit = normalizeBaseUrl(import.meta.env.VITE_CONFERENCE_WEB_BASE_URL)
  if (explicit) return explicit

  const siteUrl = normalizeBaseUrl(import.meta.env.SITE_URL)
  if (siteUrl && !siteUrl.includes('example.com')) return siteUrl

  const fallbackProduction = normalizeBaseUrl(DEFAULT_CONFERENCE_WEB_BASE_URL)
  if (fallbackProduction) return fallbackProduction

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlashes(window.location.origin)
  }

  return ''
}

export const buildConferenceJoinUrl = (conferenceId) => {
  if (!conferenceId) return ''
  const baseUrl = readConfiguredBaseUrl()
  if (!baseUrl) return ''

  return `${baseUrl}/conference/${conferenceId}/join`
}

const normalizeConferenceLabel = (conferenceTitle, conferenceId) => {
  if (typeof conferenceTitle === 'string') {
    const cleaned = conferenceTitle.trim().replace(/\|/g, '-')
    if (cleaned) return cleaned
  }
  if (typeof conferenceId === 'string' && conferenceId.trim()) return conferenceId.trim()
  return 'conference'
}

const readMobileSchemePrefix = () => {
  const configuredRaw =
    typeof import.meta.env.VITE_CONFERENCE_LINK_PREFIX === 'string' ? import.meta.env.VITE_CONFERENCE_LINK_PREFIX.trim() : ''
  if (!configuredRaw) return DEFAULT_MOBILE_LINK_SCHEME

  // Keeps old env compatibility, but enforces dynamic title before "|".
  const index = configuredRaw.indexOf(':')
  if (index >= 0) return `${configuredRaw.slice(0, index + 1)}`
  return configuredRaw.endsWith(':') ? configuredRaw : `${configuredRaw}:`
}

export const buildConferenceMobileLink = (conferenceId, conferenceTitle) => {
  const joinUrl = buildConferenceJoinUrl(conferenceId)
  if (!joinUrl) return ''
  const schemePrefix = readMobileSchemePrefix()
  const label = normalizeConferenceLabel(conferenceTitle, conferenceId)
  return `${schemePrefix}${label}|${joinUrl}`
}
