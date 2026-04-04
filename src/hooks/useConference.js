import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../services/api'
import { closeConference, createConference, joinConference, listConferences, startConference } from '../services/conferenceApi'

const isInvalidTokenError = (error) => {
  if (!(error instanceof ApiError)) return false
  return error.status === 401 || error.status === 403 || error.kind === 'auth'
}

export const useConference = () => {
  const [conference, setConference] = useState(null)
  const [conferenceList, setConferenceList] = useState([])
  const [zegoConfig, setZegoConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [isRefreshing] = useState(false)

  const joinInFlightRef = useRef(false)
  const joinPromiseRef = useRef(null)
  const startInFlightRef = useRef(false)
  const closeInFlightRef = useRef(false)
  const createInFlightRef = useRef(false)
  const mountedRef = useRef(true)
  const joinRetryUsedRef = useRef(false)
  const hasJoinedRef = useRef(false)

  const applyConference = useCallback((nextConference) => {
    if (!mountedRef.current) return
    setConference(nextConference)

    const incomingConfig = nextConference?.zego_config ?? null
    if (!incomingConfig) {
      setZegoConfig(null)
      return
    }

    const safeConfig = {
      ...incomingConfig,
      user_id: String(incomingConfig.user_id),
      room_id: incomingConfig.room_id,
      zego_token: incomingConfig.zego_token,
    }

    console.log('[conference] token received', safeConfig.zego_token)
    console.log('[conference] token expiry time', safeConfig.token_expires_at)
    console.log('TOKEN SET')
    setZegoConfig(safeConfig)
  }, [])

  const loadConferenceList = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const items = await listConferences()
      if (!mountedRef.current) return
      setConferenceList(items)
    } catch (err) {
      if (!mountedRef.current) return
      const message = err instanceof Error ? err.message : 'Failed to load conferences.'
      setListError(message)
    } finally {
      if (mountedRef.current) setListLoading(false)
    }
  }, [])

  const create = useCallback(async (title) => {
    if (createInFlightRef.current) return conference

    createInFlightRef.current = true
    setLoading(true)
    setError('')
    try {
      const nextConference = await createConference(title)
      applyConference(nextConference)
      void loadConferenceList()
      return nextConference
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create conference.'
      setError(message)
      throw err
    } finally {
      createInFlightRef.current = false
      if (mountedRef.current) setLoading(false)
    }
  }, [applyConference, conference, loadConferenceList])

  const start = useCallback(async (conferenceId) => {
    if (!conferenceId || startInFlightRef.current) return conference

    startInFlightRef.current = true
    setLoading(true)
    setError('')
    try {
      const nextConference = await startConference(conferenceId)
      applyConference(nextConference)
      void loadConferenceList()
      return nextConference
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start conference.'
      setError(message)
      throw err
    } finally {
      startInFlightRef.current = false
      if (mountedRef.current) setLoading(false)
    }
  }, [applyConference, conference, loadConferenceList])

  const join = useCallback(
    async (conferenceId, options = {}) => {
      const { silent = false } = options
      if (!conferenceId) return conference
      if (hasJoinedRef.current) {
        console.log('DUPLICATE BLOCKED')
        return conference
      }
      if (joinInFlightRef.current && joinPromiseRef.current) {
        console.log('DUPLICATE BLOCKED')
        return joinPromiseRef.current
      }

      console.log('JOIN CALLED')
      hasJoinedRef.current = true
      joinInFlightRef.current = true
      if (!silent) {
        setLoading(true)
        setError('')
      }

      const runJoin = async () => {
        let attempt = 0
        while (attempt < 2) {
          try {
            const nextConference = await joinConference(conferenceId)
            if (!nextConference?.zego_config?.zego_token) {
              throw new Error('Conference token is missing from the server response.')
            }

            applyConference(nextConference)
            setIsJoined(true)
            joinRetryUsedRef.current = false
            console.log('[conference] join success', conferenceId)
            return nextConference
          } catch (err) {
            const canRetry = !joinRetryUsedRef.current && isInvalidTokenError(err)
            if (canRetry) {
              joinRetryUsedRef.current = true
              attempt += 1
              continue
            }

            const message = err instanceof Error ? err.message : 'Failed to join conference.'
            setError(message)
            hasJoinedRef.current = false
            throw err
          }
        }
        return null
      }

      joinPromiseRef.current = runJoin()
      try {
        return await joinPromiseRef.current
      } finally {
        joinInFlightRef.current = false
        joinPromiseRef.current = null
        if (mountedRef.current && !silent) setLoading(false)
      }
    },
    [applyConference, conference],
  )

  const close = useCallback(async (conferenceId) => {
    if (!conferenceId || closeInFlightRef.current) return conference

    closeInFlightRef.current = true
    setLoading(true)
    setError('')
    try {
      const nextConference = await closeConference(conferenceId)
      applyConference(nextConference)
      void loadConferenceList()
      return nextConference
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close conference.'
      setError(message)
      throw err
    } finally {
      closeInFlightRef.current = false
      if (mountedRef.current) setLoading(false)
    }
  }, [applyConference, conference, loadConferenceList])

  const leave = useCallback(() => {
    setIsJoined(false)
    setZegoConfig(null)
    hasJoinedRef.current = false
  }, [])

  useEffect(() => {
    mountedRef.current = true
    void loadConferenceList()
    return () => {
      mountedRef.current = false
    }
  }, [loadConferenceList])

  return {
    conference,
    conferenceList,
    zegoConfig,
    loading,
    listLoading,
    error,
    listError,
    isJoined,
    isRefreshing,
    loadConferenceList,
    createConference: create,
    startConference: start,
    joinConference: join,
    closeConference: close,
    leaveConference: leave,
  }
}

export default useConference

