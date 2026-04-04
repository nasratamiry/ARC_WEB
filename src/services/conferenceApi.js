import api, { ApiError } from './api'

const buildConferencePath = (conferenceId, action, collectionName = 'conferences') =>
  `${collectionName}/${conferenceId}/${action}/`
const LIST_ENDPOINTS = ['conferences/', 'conferences/list/', 'conference/']
const ACTION_COLLECTIONS = ['conferences', 'conference']

const normalizeZegoConfig = (rawConfig) => {
  if (!rawConfig || typeof rawConfig !== 'object') return null

  const appId = Number(rawConfig.app_id)
  const roomId = typeof rawConfig.room_id === 'string' ? rawConfig.room_id : ''
  const zegoToken = typeof rawConfig.zego_token === 'string' ? rawConfig.zego_token : ''
  const userId = rawConfig.user_id == null ? '' : String(rawConfig.user_id)
  const userName = typeof rawConfig.user_name === 'string' ? rawConfig.user_name : ''
  const tokenExpiresAt = typeof rawConfig.token_expires_at === 'string' ? rawConfig.token_expires_at : ''

  if (!Number.isFinite(appId) || !roomId || !zegoToken || !userId || !tokenExpiresAt) {
    return null
  }

  return {
    app_id: appId,
    room_id: roomId,
    zego_token: zegoToken,
    user_id: userId,
    user_name: userName,
    token_expires_at: tokenExpiresAt,
  }
}

const normalizeConferencePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null

  const conference = payload.conference && typeof payload.conference === 'object' ? payload.conference : payload
  if (!conference || typeof conference !== 'object') return null

  const zegoConfig = normalizeZegoConfig(conference.zego_config)

  return {
    ...conference,
    zego_config: zegoConfig,
  }
}

const parseConferenceResponse = (data) => {
  const normalized = normalizeConferencePayload(data)
  if (!normalized) {
    throw new ApiError('Invalid conference payload from server.', 500)
  }
  return normalized
}

const coalesceConferenceArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  const record = payload
  const candidates = [record.results, record.conferences, record.items, record.data]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

const postConferenceAction = async (conferenceId, action) => {
  let lastError = null
  for (const collection of ACTION_COLLECTIONS) {
    try {
      const response = await api.post(buildConferencePath(conferenceId, action, collection), {})
      return parseConferenceResponse(response.data)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        lastError = error
        continue
      }
      throw error
    }
  }

  throw lastError ?? new ApiError(`Failed to ${action} conference.`, 500)
}

export const listConferences = async () => {
  let lastError = null

  for (const endpoint of LIST_ENDPOINTS) {
    try {
      const response = await api.get(endpoint)
      return coalesceConferenceArray(response.data)
        .map((entry) => normalizeConferencePayload(entry))
        .filter(Boolean)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        lastError = error
        continue
      }
      throw error
    }
  }

  throw lastError ?? new ApiError('Failed to load conferences.', 500)
}

export const createConference = async (title) => {
  const response = await api.post('conferences/create/', { title })
  return parseConferenceResponse(response.data)
}

export const startConference = async (conferenceId) => {
  return postConferenceAction(conferenceId, 'start')
}

export const joinConference = async (conferenceId) => {
  return postConferenceAction(conferenceId, 'join')
}

export const closeConference = async (conferenceId) => {
  return postConferenceAction(conferenceId, 'close')
}

