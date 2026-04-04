import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Building2, GitBranch, MapPin, Plus, TrainFront } from 'lucide-react'
import { useLocalizedPath } from '../../hooks'
import { useLookupStore } from '../../stores/lookupStore'
import {
  destinationsFromStationDetail,
  hydrateStationWagonRowsForRoute,
  parseStationDetailWagonRows,
} from '../../reservation/coreApi'
import { formatDestinationLocality, formatStationLocality } from '../../reservation/locationDisplay'
import type { DestinationStation, JourneyWagonOption, Station } from '../../reservation/types'
import {
  getAfnPrice,
  getRouteWagonHeaderSummary,
  getUsdPrice,
  getWagonCountsForDisplay,
  getWagonTypeId,
  isWagonRowBookable,
  showNotAvailableLabel,
  sumAvailableAcrossRows,
  wagonSelectLabel,
} from '../../reservation/wagonHelpers'
import Seo from '../../shared/components/Seo'
import {
  ReservationGradientHeader,
  reservationBtnPrimaryClass,
  reservationCardClass,
  reservationFieldClass,
  reservationHeadingClass,
  reservationIconNeutralClass,
  reservationTextSecondary,
} from './ReservationChrome'

function stationTitle(s: Station) {
  return String(s.name ?? s.code ?? `#${s.id}`)
}

function stationLocation(s: Station) {
  return formatStationLocality(s)
}

function destTitle(d: DestinationStation) {
  return String(d.name ?? d.code ?? `#${d.id}`)
}

function destLocation(d: DestinationStation) {
  return formatDestinationLocality(d)
}

function StationDetailPage() {
  const { stationId } = useParams<{ stationId: string }>()
  const id = Number(stationId)
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const navigate = useNavigate()

  const loadStation = useLookupStore((s) => s.loadStation)
  const loadDestinations = useLookupStore((s) => s.loadDestinations)
  const loadJourneyAvailability = useLookupStore((s) => s.loadJourneyAvailability)
  const destinationsByStation = useLookupStore((s) => s.destinationsByStation)
  const journeyOptionsByKey = useLookupStore((s) => s.journeyOptionsByKey)
  const journeyLoading = useLookupStore((s) => s.journeyLoading)
  const journeyErrorByKey = useLookupStore((s) => s.journeyError)

  const [station, setStation] = useState<Station | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [destinationId, setDestinationId] = useState<number | ''>('')
  const [selectedWagonTypeId, setSelectedWagonTypeId] = useState<number | null>(null)
  const [pricedRows, setPricedRows] = useState<JourneyWagonOption[]>([])
  const [pricingBusy, setPricingBusy] = useState(false)
  const [pricingErr, setPricingErr] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setError('Invalid station')
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [s] = await Promise.all([
          loadStation(id, { force: true }),
          loadDestinations(id, { force: true }),
        ])
        if (cancelled) return
        if (s) setStation(s)
      } catch {
        if (!cancelled) setError(t('reservation.loadFailed'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, loadDestinations, loadStation, t])

  const embeddedDest = useMemo(() => destinationsFromStationDetail(station), [station])
  const destinations = embeddedDest.length > 0 ? embeddedDest : destinationsByStation[id] ?? []
  const baseWagonRows = useMemo(() => parseStationDetailWagonRows(station), [station])
  const useStationDetailWagons = baseWagonRows.length > 0

  const destinationIdsKey = useMemo(() => destinations.map((d) => d.id).join(','), [destinations])

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0 || !destinationIdsKey) return
    if (useStationDetailWagons) return
    const destIds = destinationIdsKey.split(',').map(Number).filter((n) => Number.isFinite(n))
    void Promise.all(destIds.map((destId) => loadJourneyAvailability(id, destId)))
  }, [id, destinationIdsKey, loadJourneyAvailability, useStationDetailWagons])

  const journeyKey = useMemo(() => (destinationId === '' ? '' : `${id}-${destinationId}`), [id, destinationId])
  const journeyOptions = journeyKey ? journeyOptionsByKey[journeyKey] : undefined
  const journeyBusy = journeyKey ? journeyLoading[journeyKey] : false
  const journeyErr = journeyKey ? journeyErrorByKey[journeyKey] : null

  useEffect(() => {
    if (!useStationDetailWagons || destinationId === '' || !Number.isFinite(id)) {
      setPricedRows([])
      setPricingErr(null)
      return
    }
    let cancelled = false
    setPricingBusy(true)
    setPricingErr(null)
    setPricedRows([])
    void hydrateStationWagonRowsForRoute(baseWagonRows, id, Number(destinationId))
      .then((rows) => {
        if (!cancelled) setPricedRows(rows)
      })
      .catch(() => {
        if (!cancelled) {
          setPricedRows([])
          setPricingErr(t('reservation.loadFailed'))
        }
      })
      .finally(() => {
        if (!cancelled) setPricingBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [baseWagonRows, destinationId, id, t, useStationDetailWagons])

  useEffect(() => {
    setSelectedWagonTypeId(null)
  }, [destinationId, useStationDetailWagons])

  /** بدون انتخاب دستی کارت، دکمهٔ رزرو غیرفعال می‌ماند؛ اولین نوع قابل‌رزرو (مثلاً با قیمت) را برمی‌گزینیم. */
  useEffect(() => {
    if (!useStationDetailWagons || destinationId === '' || pricingBusy) return
    if (selectedWagonTypeId != null) return
    const first = pricedRows.find((r) => isWagonRowBookable(r))
    const wid = first ? getWagonTypeId(first) : null
    if (wid != null) setSelectedWagonTypeId(wid)
  }, [destinationId, pricingBusy, pricedRows, selectedWagonTypeId, useStationDetailWagons])

  const selectedDest = destinations.find((d) => d.id === destinationId)

  const wagonRows = useStationDetailWagons ? pricedRows : journeyOptions ?? []
  const routeBusy = useStationDetailWagons ? pricingBusy : journeyBusy
  const routeErr = useStationDetailWagons ? pricingErr : journeyErr

  const routeSummary = useMemo(() => getRouteWagonHeaderSummary(wagonRows), [wagonRows])
  const headerWagonCount = routeSummary.count

  const canNavigateCreate = useMemo(() => {
    if (!station) return false
    if (destinationId === '') return false
    if (useStationDetailWagons) return selectedWagonTypeId != null
    return true
  }, [destinationId, selectedWagonTypeId, station, useStationDetailWagons])

  const onCreate = () => {
    if (!station || !canNavigateCreate) return
    navigate(withLang('/reservation/create'), {
      state: {
        originId: id,
        destinationId: destinationId === '' ? undefined : Number(destinationId),
        wagonTypeId: useStationDetailWagons ? selectedWagonTypeId ?? undefined : undefined,
        originLabel: stationTitle(station),
        destinationLabel: selectedDest ? destTitle(selectedDest) : '',
      },
    })
  }

  return (
    <>
      <Seo title={t('reservation.stationDetailTitle')} description={t('reservation.stationDetailDescription')} />
      <ReservationGradientHeader title={t('reservation.stationDetailTitle')} backTo="/reservation" />

      {loading && <div className="h-40 animate-pulse rounded-3xl bg-arc-muted" />}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {!loading && station && (
        <>
          <div className={`${reservationCardClass()} mb-4`}>
            <div className="flex gap-3">
              <div className={reservationIconNeutralClass}>
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={reservationHeadingClass}>{stationTitle(station)}</h2>
                  {station.code ? (
                    <span className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-xs font-bold text-[#1a1a1a] ring-1 ring-[#e5e7eb]">
                      {String(station.code)}
                    </span>
                  ) : null}
                </div>
                {stationLocation(station) ? (
                  <p className={`mt-1 text-sm ${reservationTextSecondary}`}>{stationLocation(station)}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-4">
            <div className={`${reservationCardClass()} order-2 border border-arc-border/70`}>
            <div className="mb-3 flex items-center gap-2">
              <TrainFront className="h-5 w-5 text-[#0a2540]" />
              <h3 className={`flex-1 ${reservationHeadingClass}`}>{t('reservation.wagonAvailability')}</h3>
              {headerWagonCount != null ? (
                <span className="flex min-h-8 min-w-8 items-center justify-center rounded-full bg-[#00e2ff] px-2 text-xs font-bold text-[#1a1a1a] shadow-sm">
                  {headerWagonCount}
                </span>
              ) : null}
            </div>
            <p className={`mb-2 text-sm ${reservationTextSecondary}`}>{t('reservation.selectDestinationHint')}</p>
            <div className="relative">
              <select
                value={destinationId === '' ? '' : String(destinationId)}
                onChange={(e) => setDestinationId(e.target.value ? Number(e.target.value) : '')}
                className={`${reservationFieldClass} appearance-none py-3 pl-4 pr-10`}
              >
                <option value="">{t('reservation.destinationStation')}</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {destTitle(d)}
                  </option>
                ))}
              </select>
              <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${reservationTextSecondary}`}>
                ▾
              </span>
            </div>

            {useStationDetailWagons && destinationId !== '' ? (
              <p className={`mt-2 text-xs ${reservationTextSecondary}`}>{t('reservation.stationDetailWagonTapHint')}</p>
            ) : null}

            {routeBusy && <div className="mt-3 h-16 animate-pulse rounded-xl bg-arc-muted" />}

            {routeErr && destinationId !== '' ? (
              <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{routeErr}</p>
            ) : null}

            {!routeBusy && destinationId !== '' && (
              <div className="mt-4 space-y-3 text-sm">
                {wagonRows.length > 0 && headerWagonCount != null ? (
                  <p className="font-bold text-[#1a1a1a]">
                    {routeSummary.labelMode === 'total'
                      ? `${t('reservation.totalWagons')}: ${headerWagonCount}`
                      : `${t('reservation.availableWagonsSumLabel')}: ${headerWagonCount}`}
                  </p>
                ) : null}
                {wagonRows.length === 0 ? (
                  <p className="font-bold text-[#1a1a1a]">{t('reservation.noWagonAvailability')}</p>
                ) : (
                  <ul className="space-y-3">
                    {wagonRows.map((row, idx) => {
                      const wid = getWagonTypeId(row)
                      const { total, available, reserved } = getWagonCountsForDisplay(row)
                      const usd = getUsdPrice(row)
                      const afn = getAfnPrice(row)
                      const notAvailLabel = showNotAvailableLabel(row)
                      const fmt = (n: number | null) => (n != null ? String(n) : '—')
                      const selected = useStationDetailWagons && wid != null && selectedWagonTypeId === wid
                      return (
                        <li key={`${wid ?? 'wt'}-${idx}`}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!useStationDetailWagons || wid == null) return
                              setSelectedWagonTypeId(wid)
                            }}
                            className={`w-full rounded-xl border p-3 text-left shadow-sm transition-all duration-200 ${
                              selected
                                ? 'border-[#00e2ff] bg-[#ecfeff] ring-2 ring-[#00e2ff]/35'
                                : 'border-[#e5e7eb] bg-[#fafafa] hover:border-[#00e2ff] hover:bg-[#ecfeff]/75 hover:shadow-[0_12px_40px_-14px_rgba(0,226,255,0.38)]'
                            } ${!useStationDetailWagons ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <span className="font-bold text-[#1a1a1a]">{wagonSelectLabel(row)}</span>
                              <div className="shrink-0 text-right">
                                {notAvailLabel ? (
                                  <span className="text-sm font-bold text-[#1a1a1a]">{t('reservation.notAvailableShort')}</span>
                                ) : (
                                  <>
                                    {usd != null ? (
                                      <p className="text-sm font-bold text-[#1a1a1a]">USD {usd}</p>
                                    ) : null}
                                    {afn != null ? (
                                      <p className="text-sm font-bold text-[#1a1a1a]">AFN {afn}</p>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-[#003366]">
                                {t('reservation.badgeTotal')}: {fmt(total)}
                              </span>
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
                                {t('reservation.badgeAvailable')}: {fmt(available)}
                              </span>
                              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-900">
                                {t('reservation.badgeReserved')}: {fmt(reserved)}
                              </span>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}
            </div>

            <div className={`${reservationCardClass()} order-1 border border-arc-border/70`}>
            <div className="mb-3 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-[#0a2540]" />
              <h3 className={`flex-1 ${reservationHeadingClass}`}>{t('reservation.allowedDestinations')}</h3>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00e2ff] text-xs font-bold text-[#1a1a1a] shadow-sm">
                {destinations.length}
              </span>
            </div>
            <div className="space-y-2">
              {destinations.map((d) => {
                const jKey = `${id}-${d.id}`
                const rows = journeyOptionsByKey[jKey] ?? []
                const jBusy = journeyLoading[jKey]
                const fromJourney = !useStationDetailWagons && rows.length ? sumAvailableAcrossRows(rows) : null
                const fromRow =
                  typeof d.available_wagons_at_route === 'number' ? d.available_wagons_at_route : undefined
                const availDisplay = fromRow ?? fromJourney
                return (
                  <div
                    key={d.id}
                    className="group flex items-start gap-3 rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-3 transition-all duration-200 hover:border-[#00e2ff]/65 hover:bg-[#ecfeff]/50 hover:shadow-[0_10px_34px_-12px_rgba(0,226,255,0.28)] active:border-[#00e2ff]/80 active:bg-[#ecfeff]/70"
                  >
                    <MapPinSmall />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#1a1a1a]">{destTitle(d)}</p>
                      {destLocation(d) ? <p className={`text-sm ${reservationTextSecondary}`}>{destLocation(d)}</p> : null}
                      {!useStationDetailWagons && jBusy ? (
                        <p className="mt-1 text-xs font-semibold text-emerald-800/80">
                          {t('reservation.availableWagons')}: …
                        </p>
                      ) : availDisplay != null ? (
                        <p className="mt-1 text-xs font-semibold text-emerald-900">
                          {t('reservation.availableWagons')}: {availDisplay}
                        </p>
                      ) : null}
                    </div>
                    {d.code ? (
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#1a1a1a] ring-1 ring-[#e5e7eb]">
                        {String(d.code)}
                      </span>
                    ) : null}
                  </div>
                )
              })}
              {!destinations.length ? (
                <p className={`text-sm ${reservationTextSecondary}`}>{t('reservation.noDestinations')}</p>
              ) : null}
            </div>
          </div>
          </div>

          <button
            type="button"
            disabled={loading || !station || !canNavigateCreate}
            onClick={onCreate}
            className={`${reservationBtnPrimaryClass} flex w-full items-center justify-center gap-2 py-4 shadow-lg disabled:cursor-not-allowed`}
          >
            <Plus className="h-5 w-5" />
            {t('reservation.createReservation')}
          </button>
        </>
      )}
    </>
  )
}

function MapPinSmall() {
  return (
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a2540] text-white shadow-md transition-colors duration-200 group-hover:bg-[#e6fbff] group-hover:text-[#0a2540] group-hover:ring-1 group-hover:ring-[#00e2ff]/60 group-active:bg-[#e6fbff] group-active:text-[#0a2540] group-active:ring-1 group-active:ring-[#00e2ff]/70">
      <MapPin className="h-4 w-4" aria-hidden />
    </span>
  )
}

export default StationDetailPage
