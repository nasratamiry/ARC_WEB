import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { TrainFront } from 'lucide-react'
import { formatTrackJourney } from '../reservation/displayHelpers'
import { fetchTrack } from '../reservation/reservationApi'
import type { TrackResponse } from '../reservation/types'
import { ApiError } from '../services/api'
import { useTrackingStore } from '../stores/trackingStore'
import Seo from '../shared/components/Seo'
import {
  ReservationGradientHeader,
  reservationColumnClass,
  reservationCardClass,
  reservationCardTitleClass,
  reservationPageStackClass,
  reservationTextSecondary,
  reservationTrackingBoxClass,
} from './reservation/ReservationChrome'
import TrackingMap from './TrackingMap'

const BASE_INTERVAL_MS = 12_000
const MAX_INTERVAL_MS = 120_000
const BACKGROUND_INTERVAL_MS = 60_000

function TrackingPage() {
  const { code } = useParams<{ code: string }>()
  const { t } = useTranslation()
  const trackingCode = code ? decodeURIComponent(code) : ''

  const setSnapshot = useTrackingStore((s) => s.setSnapshot)
  const setLastTs = useTrackingStore((s) => s.setLastPositionTimestamp)
  const lastTsRef = useRef<string | null>(null)

  const [data, setData] = useState<TrackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(BASE_INTERVAL_MS)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hiddenRef = useRef(false)

  useEffect(() => {
    const onVis = () => {
      hiddenRef.current = document.visibilityState === 'hidden'
    }
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (!trackingCode) return

    let cancelled = false

    const schedule = (delay: number) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        void tick()
      }, delay)
    }

    const tick = async () => {
      if (cancelled) return
      try {
        const next = await fetchTrack(trackingCode)
        if (cancelled) return
        setError(null)
        setData(next)
        setSnapshot(next)
        const pos = next.current_position
        const ts = pos && typeof pos === 'object' && pos.timestamp != null ? String(pos.timestamp) : null
        if (ts && ts !== lastTsRef.current) {
          lastTsRef.current = ts
          setLastTs(ts)
        }
        intervalRef.current = BASE_INTERVAL_MS
      } catch (e) {
        const status = e instanceof ApiError ? e.status : null
        if (status === 429 || (status != null && status >= 500)) {
          intervalRef.current = Math.min(intervalRef.current * 2, MAX_INTERVAL_MS)
        }
        const msg = e instanceof ApiError ? e.message : t('reservation.trackingLoadFailed')
        setError(msg)
      } finally {
        setLoading(false)
        if (!cancelled) {
          const useInterval = hiddenRef.current ? BACKGROUND_INTERVAL_MS : intervalRef.current
          schedule(useInterval)
        }
      }
    }

    void tick()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
      setSnapshot(null)
      setLastTs(null)
      lastTsRef.current = null
    }
  }, [setLastTs, setSnapshot, t, trackingCode])

  const movement = data?.movement
  const pos = data?.current_position
  const lat =
    pos && typeof pos === 'object' && typeof pos.latitude === 'number' ? pos.latitude : null
  const lng =
    pos && typeof pos === 'object' && typeof pos.longitude === 'number' ? pos.longitude : null
  const hasGps = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)

  const journey = data?.journey
  const journeyText = journey ? formatTrackJourney(journey) : null

  return (
    <>
      <Seo title={t('reservation.trackingTitle')} description={t('reservation.trackingDescription')} />
      <div className={`reservation-module-shell ${reservationColumnClass} pb-10 pt-2 sm:pb-12 sm:pt-3 lg:pb-14`}>
        <ReservationGradientHeader title={t('reservation.trackingTitle')} backTo="/reservation" />

        {loading && <div className="h-48 animate-pulse rounded-2xl bg-[#f0f0f0]" />}
        {error && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
            {error}
          </div>
        )}

        {data && (
          <div className={reservationPageStackClass}>
            <div className={reservationCardClass()}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${reservationTextSecondary}`}>
                {t('reservation.trackingCode')}
              </p>
              <div className={`${reservationTrackingBoxClass} mt-2 border-[#e5e7eb] bg-white`}>
                {data.tracking_code ?? trackingCode}
              </div>
            </div>

            {journeyText ? (
              <div className={reservationCardClass()}>
                <h2 className={`${reservationCardTitleClass} mb-2`}>{t('reservation.route')}</h2>
                <p className="text-sm font-medium leading-relaxed text-[#1a1a1a]">{journeyText}</p>
              </div>
            ) : null}

            {hasGps && lat != null && lng != null && (
              <>
                <TrackingMap latitude={lat} longitude={lng} />
                <div className={`${reservationCardClass()} text-sm`}>
                  {pos && typeof pos === 'object' && 'location_name' in pos && pos.location_name ? (
                    <p className="font-semibold text-[#1a1a1a]">{String(pos.location_name)}</p>
                  ) : null}
                  {'speed' in (pos ?? {}) && (pos as { speed?: number }).speed != null ? (
                    <p className={`mt-2 ${reservationTextSecondary}`}>
                      {t('reservation.speed')}: {String((pos as { speed?: number }).speed)} km/h
                    </p>
                  ) : null}
                  {'timestamp' in (pos ?? {}) && (pos as { timestamp?: string }).timestamp ? (
                    <p className={`mt-2 text-xs ${reservationTextSecondary}`}>
                      {String((pos as { timestamp?: string }).timestamp)}
                    </p>
                  ) : null}
                </div>
              </>
            )}

            {!hasGps && movement && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-bold text-[#1a1a1a]">{t('reservation.trackingLocationUnavailable')}</p>
                {typeof movement === 'object' &&
                movement !== null &&
                'identifier' in movement &&
                (movement as { identifier?: string }).identifier != null &&
                String((movement as { identifier?: string }).identifier).trim() !== '' ? (
                  <p className={`mt-2 text-sm ${reservationTextSecondary}`}>
                    {t('reservation.trainId')}: {String((movement as { identifier?: string }).identifier)}
                  </p>
                ) : null}
              </div>
            )}

            {!hasGps && !movement && (
              <div className="flex items-start gap-3 rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a2540] text-white shadow-md">
                  <TrainFront className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-bold text-[#1a1a1a]">{t('reservation.trackingWaitingMovement')}</p>
                  {data.message ? (
                    <p className={`mt-1 text-sm leading-relaxed ${reservationTextSecondary}`}>{data.message}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default TrackingPage
