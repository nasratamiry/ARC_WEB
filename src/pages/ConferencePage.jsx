import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Copy,
  Link2,
  ListVideo,
  PlusCircle,
  RefreshCcw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useConference from '../hooks/useConference'
import Button from '../shared/ui/Button'
import { useLocalizedPath } from '../hooks'
import ZegoRoom from '../components/ZegoRoom'
import { buildConferenceJoinUrl, buildConferenceMobileLink } from '../services/conferenceLink'

const pageBgClass = 'min-h-[calc(100dvh-4rem)] bg-[#F8FAFC]'
const panelClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200'
const hoverCardClass =
  'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:border-[#00E2FF] hover:shadow-md'
const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#00E2FF] focus:outline-none focus:ring-2 focus:ring-[#00E2FF]/30'
const actionPrimaryClass =
  '!rounded-xl !bg-[#00E2FF] !text-white !shadow-none hover:!bg-[#00C8E0] !transition-all !duration-200 disabled:!cursor-not-allowed disabled:!opacity-50'
const actionDangerClass =
  '!rounded-xl !border-0 !bg-red-500 !text-white !shadow-none hover:!bg-red-600 !transition-all !duration-200 disabled:!cursor-not-allowed disabled:!opacity-50'
const actionSecondaryClass =
  '!rounded-xl !border-0 !bg-gray-100 !text-gray-700 !shadow-none hover:!bg-gray-200 !transition-all !duration-200 disabled:!cursor-not-allowed disabled:!opacity-50'

import { formatGregorianDateTime } from '../shared/utils/dateTime'

const formatDateTime = (value, locale) => {
  if (!value) return '—'
  const stamp = Date.parse(value)
  if (Number.isNaN(stamp)) return '—'
  return formatGregorianDateTime(new Date(stamp), locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'border-green-200 bg-green-50 text-green-600'
    case 'closed':
      return 'border-gray-200 bg-gray-100 text-gray-500'
    default:
      return 'border-yellow-200 bg-yellow-50 text-yellow-600'
  }
}

const getStatusLabel = (status, t) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return t('conference.statusActive')
    case 'closed':
      return t('conference.statusClosed')
    case 'created':
      return t('conference.statusCreated')
    default:
      return t('conference.statusUnknown')
  }
}

function ConferencePage() {
  const { t, i18n } = useTranslation()
  const activeLang = (i18n.resolvedLanguage || i18n.language || '').toLowerCase()
  const isRtl = i18n.dir() === 'rtl' || activeLang.startsWith('fa') || activeLang.startsWith('ps')
  const navigate = useNavigate()
  const location = useLocation()
  const { withLang } = useLocalizedPath()
  const { conferenceId: routeConferenceId } = useParams()
  const [title, setTitle] = useState('')
  const [roomError, setRoomError] = useState('')
  const [copyState, setCopyState] = useState('')
  const autoJoinTriggeredRef = useRef(false)
  const inputRef = useRef(null)

  const {
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
    createConference,
    startConference,
    joinConference,
    closeConference,
    leaveConference,
  } = useConference()

  const effectiveConferenceId = useMemo(() => {
    if (conference?.id) return conference.id
    if (routeConferenceId) return routeConferenceId
    return ''
  }, [conference?.id, routeConferenceId])

  const shareJoinUrl = useMemo(() => {
    if (!effectiveConferenceId) return ''
    return buildConferenceJoinUrl(effectiveConferenceId)
  }, [effectiveConferenceId])

  const isJoinLinkPath = location.pathname.endsWith('/join')
  const isDetailPage = Boolean(routeConferenceId) && !isJoinLinkPath

  const currentCards = useMemo(() => {
    if (!conferenceList.length) return []
    return [...conferenceList].sort((a, b) => Date.parse(b?.created_at || '') - Date.parse(a?.created_at || ''))
  }, [conferenceList])

  const effectiveConferenceTitle = useMemo(() => {
    if (!effectiveConferenceId) return ''
    if (typeof conference?.title === 'string' && conference.title.trim()) return conference.title.trim()
    const fromList = conferenceList.find((item) => item?.id === effectiveConferenceId)
    if (typeof fromList?.title === 'string' && fromList.title.trim()) return fromList.title.trim()
    return ''
  }, [conference?.title, conferenceList, effectiveConferenceId])

  const shareJoinLink = useMemo(() => {
    if (!effectiveConferenceId) return ''
    return buildConferenceMobileLink(effectiveConferenceId, effectiveConferenceTitle)
  }, [effectiveConferenceId, effectiveConferenceTitle])
  const effectiveConferenceStatus = useMemo(() => {
    const fromCurrent = (conference?.status || '').toLowerCase()
    if (fromCurrent) return fromCurrent
    const fromList = conferenceList.find((item) => item?.id === effectiveConferenceId)
    return (fromList?.status || '').toLowerCase()
  }, [conference?.status, conferenceList, effectiveConferenceId])

  const handleCreate = async () => {
    const safeTitle = title.trim()
    if (!safeTitle) return

    try {
      setRoomError('')
      const created = await createConference(safeTitle)
      setTitle('')
      if (created?.id) {
        navigate(withLang(`/conference/${created.id}`))
      }
    } catch {
      // Error is already normalized inside hook state.
    }
  }

  const handleStart = async () => {
    if (!effectiveConferenceId) return
    try {
      setRoomError('')
      await startConference(effectiveConferenceId)
    } catch {
      // Error is already normalized inside hook state.
    }
  }

  const handleJoin = async () => {
    if (!effectiveConferenceId) return
    try {
      setRoomError('')
      await joinConference(effectiveConferenceId)
    } catch {
      // Error is already normalized inside hook state.
    }
  }

  const handleEnd = async (conferenceId = effectiveConferenceId, options = {}) => {
    const { forceExitOnError = false } = options
    if (!conferenceId) return
    try {
      setRoomError('')
      await closeConference(conferenceId)
      leaveConference()
      await loadConferenceList()
      navigate(withLang('/conference'))
    } catch {
      if (forceExitOnError) {
        leaveConference()
        navigate(withLang('/conference'))
      }
    }
  }

  const handleCopyLink = async () => {
    if (!shareJoinLink) return
    try {
      await navigator.clipboard.writeText(shareJoinLink)
      setCopyState(t('conference.copySuccess'))
    } catch {
      setCopyState(t('conference.copyFailed'))
    }
  }

  const buildConferenceJoinLink = (conferenceId) => {
    if (!conferenceId) return ''
    const cardConference = conferenceList.find((entry) => entry?.id === conferenceId)
    return buildConferenceMobileLink(conferenceId, cardConference?.title)
  }

  const handleCopyCardLink = async (conferenceId) => {
    const link = buildConferenceJoinLink(conferenceId)
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopyState(t('conference.copySuccessFor', { id: conferenceId }))
    } catch {
      setCopyState(t('conference.copyFailed'))
    }
  }

  const handleStartFromList = async (conferenceId) => {
    if (!conferenceId) return
    try {
      await startConference(conferenceId)
      await loadConferenceList()
    } catch {
      // Error handled by hook state.
    }
  }

  const handleJoinFromList = async (conferenceId) => {
    if (!conferenceId) return
    navigate(withLang(`/conference/${conferenceId}/join`))
  }

  const handleBack = () => {
    if (isJoinLinkPath && effectiveConferenceId) {
      leaveConference()
      navigate(withLang(`/conference/${effectiveConferenceId}`))
      return
    }
    if (routeConferenceId) {
      navigate(withLang('/conference'))
      return
    }
    navigate(withLang('/profile'))
  }

  useEffect(() => {
    if (!isJoinLinkPath || !effectiveConferenceId || autoJoinTriggeredRef.current) return
    autoJoinTriggeredRef.current = true
    void handleJoin()
  }, [effectiveConferenceId, isJoinLinkPath])

  useEffect(() => {
    if (!isJoined) {
      autoJoinTriggeredRef.current = false
    }
  }, [isJoined])

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className={`w-full ${pageBgClass}`}>
      {!isJoined && isJoinLinkPath ? (
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-none items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#00E2FF]" />
            <p className="mt-3 text-sm text-[#64748B]">{t('conference.preparingRoom')}</p>
          </div>
        </div>
      ) : null}

      {!isJoined && !isJoinLinkPath ? (
        <div className="mx-auto flex w-full max-w-none flex-col gap-5 px-4 py-8 sm:px-6 md:py-10 lg:px-8">
          <div className={`${panelClass} ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={`mb-4 flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
              <Button variant="secondary" size="sm" onClick={handleBack} className={actionSecondaryClass}>
                <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} aria-hidden />
                {t('conference.back')}
              </Button>
            </div>
            <h1 className={`text-2xl font-bold text-[#0F172A] ${isRtl ? 'text-right' : 'text-left'}`}>{t('conference.title')}</h1>
            <p className={`mt-2 text-sm text-[#64748B] ${isRtl ? 'text-right' : 'text-left'}`}>{t('conference.description')}</p>

            {!routeConferenceId ? (
              <div className="mt-6 flex flex-col gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t('conference.conferenceTitlePlaceholder')}
                  className={inputClass}
                />
                <Button onClick={handleCreate} disabled={loading || !title.trim()} className={actionPrimaryClass}>
                  {loading ? t('conference.creating') : t('conference.createConference')}
                </Button>
              </div>
            ) : null}

            {isDetailPage ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {effectiveConferenceStatus !== 'active' && effectiveConferenceStatus !== 'closed' ? (
                  <Button onClick={handleStart} disabled={loading} className={actionPrimaryClass}>
                    {loading ? t('conference.starting') : t('conference.startConference')}
                  </Button>
                ) : null}
                {effectiveConferenceStatus !== 'closed' ? (
                  <Button variant="secondary" onClick={handleJoin} disabled={loading} className={actionPrimaryClass}>
                    {loading ? t('conference.joining') : t('conference.joinConference')}
                  </Button>
                ) : null}
                {effectiveConferenceStatus === 'active' ? (
                  <Button variant="secondary" onClick={handleEnd} disabled={loading} className={actionDangerClass}>
                    {loading ? t('conference.ending') : t('conference.endConference')}
                  </Button>
                ) : null}
              </div>
            ) : null}

            {effectiveConferenceId && isDetailPage ? (
              <div className={`mt-4 space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-[#64748B]">
                  {t('conference.conferenceId')}:{' '}
                  <span className="font-mono text-[#0F172A]">{effectiveConferenceId}</span>
                </p>
                <p className="text-xs text-[#64748B]">
                  {t('conference.joinLink')}:{' '}
                  <span className={`inline-flex max-w-full items-center gap-1 font-mono text-[#0F172A] ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Link2 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    <span className="truncate" dir="ltr">{shareJoinLink}</span>
                  </span>
                </p>
                <p className="text-xs text-[#64748B]">
                  {t('conference.webUrl')}:{' '}
                  <span className={`inline-flex max-w-full items-center gap-1 font-mono text-[#0F172A] ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Link2 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    <span className="truncate" dir="ltr">{shareJoinUrl}</span>
                  </span>
                </p>
                <div className={`flex items-center gap-2 ${isRtl ? 'justify-end' : ''}`}>
                  <Button variant="secondary" size="sm" onClick={handleCopyLink} disabled={!shareJoinLink} className={actionSecondaryClass}>
                    <Copy className="h-4 w-4" aria-hidden />
                    {t('conference.copyJoinLink')}
                  </Button>
                  {copyState ? <span className="text-xs text-[#64748B]">{copyState}</span> : null}
                </div>
              </div>
            ) : null}

            {error ? (
              <div className={`mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            ) : null}
            {roomError ? (
              <div className={`mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{roomError}</span>
              </div>
            ) : null}
          </div>

          {(loading || isRefreshing) && (
            <div className="flex items-center justify-center gap-3 text-sm text-[#64748B]">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-arc-muted border-t-primary" />
              <span>{isRefreshing ? t('conference.refreshingToken') : t('conference.pleaseWait')}</span>
            </div>
          )}

          {!routeConferenceId ? (
            <div className={`${panelClass} ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
              <div className={`flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-lg font-semibold text-[#0F172A]">{t('conference.yourConferences')}</h2>
                <Button variant="secondary" size="sm" onClick={() => void loadConferenceList()} disabled={listLoading} className={actionSecondaryClass}>
                  <RefreshCcw className={`h-4 w-4 ${listLoading ? 'animate-spin' : ''}`} aria-hidden />
                  {listLoading ? t('conference.refreshing') : t('conference.refresh')}
                </Button>
              </div>

              {listError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className={`flex items-start gap-2 text-sm text-red-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <div className={isRtl ? 'text-right' : ''}>
                      <p className="font-medium">{t('conference.listLoadFailed')}</p>
                      <p className="mt-1">{listError}</p>
                    </div>
                  </div>
                  <div className={`mt-3 ${isRtl ? 'text-right' : ''}`}>
                    <Button variant="secondary" size="sm" onClick={() => void loadConferenceList()} className={actionSecondaryClass}>
                      {t('conference.retry')}
                    </Button>
                  </div>
                </div>
              ) : null}

              {listLoading ? (
                <div className="mt-4 grid gap-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={`conference-skeleton-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="animate-pulse">
                        <div className="h-4 w-48 rounded bg-slate-200" />
                        <div className="mt-3 h-3 w-40 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-36 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
                        <div className="mt-4 h-3 w-full rounded bg-slate-200" />
                        <div className="mt-4 flex gap-2">
                          <div className="h-9 w-24 rounded-xl bg-slate-200" />
                          <div className="h-9 w-24 rounded-xl bg-slate-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!listLoading && !listError && currentCards.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <ListVideo className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
                  <h3 className="mt-3 text-base font-semibold text-[#0F172A]">{t('conference.emptyTitle')}</h3>
                  <p className="mt-1 text-sm text-[#64748B]">{t('conference.emptyDescription')}</p>
                  <Button
                    size="sm"
                    className={`mt-4 ${actionPrimaryClass}`}
                    onClick={() => {
                      inputRef.current?.focus()
                    }}
                  >
                    <PlusCircle className="h-4 w-4" aria-hidden />
                    {t('conference.createConference')}
                  </Button>
                </div>
              ) : null}

              {!listLoading && !listError ? (
                <div className="mt-4 grid gap-3">
                  {currentCards.map((item) => {
                  const conferenceId = item?.id ?? ''
                  const status = item?.status ?? 'created'
                  const joinLink = buildConferenceJoinLink(conferenceId)
                  return (
                    <article key={conferenceId} className={`${hoverCardClass} ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className={isRtl ? 'text-right' : ''}>
                          <h3 className="text-base font-semibold text-[#0F172A]">{item?.title || t('conference.untitledConference')}</h3>
                          <p className={`mt-1 inline-flex items-center gap-1 text-xs text-[#64748B] ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                            {t('conference.createdAt')}:{' '}
                            {formatDateTime(item?.created_at, i18n.language)}
                          </p>
                          <p className="mt-1 text-xs text-[#64748B]">
                            {t('conference.startedAt')}:{' '}
                            {formatDateTime(item?.started_at, i18n.language)}
                          </p>
                          <p className="mt-1 text-xs text-[#64748B]">
                            {t('conference.closedAt')}:{' '}
                            {formatDateTime(item?.closed_at, i18n.language)}
                          </p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(status)}`}>
                          {getStatusLabel(status, t)}
                        </span>
                      </div>

                      <p className={`mt-3 text-xs text-[#64748B] ${isRtl ? 'text-right' : 'text-left'}`}>
                        {t('conference.joinLink')}: <span dir="ltr">{joinLink}</span>
                      </p>

                      <div className={`mt-3 flex flex-wrap gap-2 ${isRtl ? 'justify-end' : ''}`}>
                        {status === 'created' ? (
                          <Button size="sm" onClick={() => void handleStartFromList(conferenceId)} disabled={loading} className={actionPrimaryClass}>
                            {loading ? t('conference.starting') : t('conference.start')}
                          </Button>
                        ) : null}
                        {status === 'active' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void handleEnd(conferenceId)}
                            className={actionDangerClass}
                          >
                            {loading ? t('conference.ending') : t('conference.endConference')}
                          </Button>
                        ) : null}
                        {status !== 'closed' ? (
                          <Button variant="secondary" size="sm" onClick={() => handleJoinFromList(conferenceId)} className={actionPrimaryClass}>
                            {t('conference.join')}
                          </Button>
                        ) : null}
                        {status !== 'closed' ? (
                          <Button variant="secondary" size="sm" onClick={() => void handleCopyCardLink(conferenceId)} className={actionSecondaryClass}>
                            <Copy className="h-4 w-4" aria-hidden />
                            {t('conference.copyLink')}
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {isJoined ? (
        <div className="fixed inset-0 z-[4000] bg-black" dir="ltr">
          <ZegoRoom
            zegoConfig={zegoConfig}
            sharedLinkUrl={shareJoinUrl}
            onError={(roomError) => {
              const message = roomError instanceof Error ? roomError.message : 'Failed to initialize video room.'
              console.error('[conference] zego init error', roomError)
              setRoomError(message)
              leaveConference()
            }}
          />
        </div>
      ) : null}
    </section>
  )
}

export default ConferencePage

