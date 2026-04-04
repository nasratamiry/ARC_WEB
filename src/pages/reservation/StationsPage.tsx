import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, MapPin, Radar, Search, TrainFront } from 'lucide-react'
import { useLocalizedPath } from '../../hooks'
import { useLookupStore } from '../../stores/lookupStore'
import { pickFirstNumberFromRecord } from '../../reservation/apiHelpers'
import { formatStationLocality } from '../../reservation/locationDisplay'
import type { Station } from '../../reservation/types'
import Seo from '../../shared/components/Seo'
import {
  reservationBtnPrimaryClass,
  reservationBtnSecondaryClass,
  reservationCardClass,
  reservationCardInteractiveClass,
  reservationCardTitleClass,
  reservationFieldClass,
  reservationFieldLeadingIconPadClass,
  reservationIconNeutralClass,
  reservationPageStackClass,
  reservationTextSecondary,
} from './ReservationChrome'

function stationTitle(s: Station) {
  return String(s.name ?? s.code ?? `#${s.id}`)
}

function stationLocation(s: Station) {
  return formatStationLocality(s)
}

function StationsPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const stations = useLookupStore((s) => s.stations)
  const stationsLoading = useLookupStore((s) => s.stationsLoading)
  const stationsError = useLookupStore((s) => s.stationsError)
  const loadStations = useLookupStore((s) => s.loadStations)

  useEffect(() => {
    void loadStations()
  }, [loadStations])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return stations
    return stations.filter((s) => {
      const hay = [stationTitle(s), stationLocation(s), String(s.code ?? '')].join(' ').toLowerCase()
      return hay.includes(term)
    })
  }, [stations, q])

  const searchActive = q.trim().length > 0
  const stationCountDisplayed = searchActive ? filtered.length : stations.length

  const openTrackingPage = () => {
    navigate(withLang('/reservation/tracking'))
  }

  return (
    <>
      <Seo title={t('reservation.stationsTitle')} description={t('reservation.stationsDescription')} />
      <div className={reservationPageStackClass}>
        <div
          className="relative overflow-hidden rounded-2xl border border-[#00e2ff]/35 bg-gradient-to-br from-white/90 via-[#ecfeff]/50 to-white/80 p-4 shadow-[0_12px_40px_-18px_rgba(0,226,255,0.35)] backdrop-blur-md transition-all duration-300 hover:border-[#00e2ff] hover:shadow-[0_16px_48px_-16px_rgba(0,226,255,0.42)] hover:ring-1 hover:ring-[#00e2ff]/30 sm:rounded-3xl sm:p-5 md:p-6"
          role="region"
          aria-label={t('reservation.trackingHeroTitle')}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00e2ff]/15 blur-2xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div className={`${reservationIconNeutralClass} h-12 w-12 shrink-0 sm:h-14 sm:w-14`}>
                <Radar className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#006c7a] sm:text-xs">
                  {t('reservation.trackingEnterpriseEyebrow')}
                </p>
                <h2 className="mt-1 text-lg font-bold leading-tight text-[#0a2540] sm:text-xl">
                  {t('reservation.tracking')}
                </h2>
                <p className={`mt-2 max-w-xl text-sm leading-relaxed ${reservationTextSecondary}`}>
                  {t('reservation.trackingEnterpriseHint')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openTrackingPage}
              className={`${reservationBtnPrimaryClass} inline-flex w-full shrink-0 items-center justify-center gap-2 shadow-[0_8px_28px_-8px_rgba(0,226,255,0.65)] lg:w-auto lg:min-w-[180px]`}
            >
              {t('reservation.tracking')}
              <ChevronRight className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
            </button>
          </div>
        </div>

        {/* ایستگاه‌ها */}
        <section aria-labelledby="res-stations-section-title">
          <div className={reservationCardClass()}>
            <div className="mb-5 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <h2 id="res-stations-section-title" className={reservationCardTitleClass}>
                  {t('reservation.stationsHeading')}
                </h2>
                <p className={`mt-1.5 text-sm ${reservationTextSecondary}`}>
                  {searchActive
                    ? t('reservation.stationsCountFiltered', {
                        count: filtered.length,
                        total: stations.length,
                      })
                    : t('reservation.stationsCount', { count: stations.length })}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
                <span
                  className="inline-flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center rounded-full bg-[#f0f0f0] px-3 text-sm font-bold text-[#1a1a1a] ring-1 ring-[#e5e7eb]"
                  title={
                    searchActive
                      ? t('reservation.stationsCountFiltered', {
                          count: filtered.length,
                          total: stations.length,
                        })
                      : undefined
                  }
                >
                  {stationCountDisplayed}
                </span>
                <Link
                  to={withLang('/reservation/my')}
                  className={`${reservationBtnSecondaryClass} inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm sm:px-5`}
                >
                  <TrainFront className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                  {t('reservation.myReservations')}
                </Link>
              </div>
            </div>
            <label className="relative block" htmlFor="res-stations-search">
              <span className="sr-only">{t('reservation.searchStations')}</span>
              <Search
                className={`pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${reservationTextSecondary}`}
                aria-hidden
              />
              <input
                id="res-stations-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('reservation.searchStations')}
                className={`${reservationFieldClass} ${reservationFieldLeadingIconPadClass}`}
              />
            </label>
          </div>

          {stationsLoading && (
            <div className="mt-4 space-y-4 md:mt-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#f0f0f0] md:h-36 md:rounded-3xl" />
              ))}
            </div>
          )}

          {stationsError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 md:rounded-3xl">
              {stationsError}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4 md:mt-6 md:gap-5">
            {!stationsLoading &&
              filtered.map((s) => (
                <Link
                  key={s.id}
                  to={withLang(`/reservation/station/${s.id}`)}
                  className={`${reservationCardClass()} ${reservationCardInteractiveClass} group flex flex-row items-stretch gap-4 sm:gap-5`}
                >
                  <div className={`${reservationIconNeutralClass} h-[3.5rem] w-[3.5rem] shrink-0 transition-colors duration-200 group-hover:bg-[#e6fbff] group-hover:text-[#0a2540] group-hover:ring-1 group-hover:ring-[#00e2ff]/60 group-active:bg-[#e6fbff] group-active:text-[#0a2540] group-active:ring-1 group-active:ring-[#00e2ff]/70 sm:h-16 sm:w-16`}>
                    <MapPin className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-lg font-bold text-[#1a1a1a] sm:text-xl">{stationTitle(s)}</p>
                      {s.code ? (
                        <span className="shrink-0 rounded-full bg-[#f0f0f0] px-2.5 py-1 text-xs font-bold text-[#1a1a1a] ring-1 ring-[#e5e7eb]">
                          {String(s.code)}
                        </span>
                      ) : null}
                    </div>
                    {stationLocation(s) ? (
                      <p className={`mt-1.5 text-sm sm:text-base ${reservationTextSecondary}`}>{stationLocation(s)}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {typeof s.allowed_destinations_count === 'number' ? (
                        <span className="rounded-full bg-[#e6fbff] px-3 py-1 text-xs font-bold text-[#0a2540] ring-1 ring-[#00e2ff]/50 sm:text-sm">
                          {t('reservation.allowedDestinations')}: {s.allowed_destinations_count}
                        </span>
                      ) : null}
                      {(() => {
                        const fromList = pickFirstNumberFromRecord(s as Record<string, unknown>, [
                          'total_available_wagons',
                          'available_wagons_count',
                          'available_wagons',
                        ])
                        return fromList != null ? (
                          <span
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 sm:text-sm"
                            title={t('reservation.stationsListStatsFromApiHint')}
                          >
                            {t('reservation.availableWagons')}: {fromList}
                          </span>
                        ) : null
                      })()}
                    </div>
                  </div>
                  <span
                    className="hidden self-center text-2xl font-light text-[#006c7a] sm:inline"
                    aria-hidden
                  >
                    ›
                  </span>
                </Link>
              ))}
          </div>

          {!stationsLoading && !filtered.length && !stationsError ? (
            <p className={`mt-8 text-center text-base ${reservationTextSecondary}`}>{t('reservation.noStations')}</p>
          ) : null}
        </section>
      </div>
    </>
  )
}

export default StationsPage
