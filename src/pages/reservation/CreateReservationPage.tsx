import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calculator, FileText, GitBranch, MapPin, Package, Pencil, Scale, TrainFront } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalizedPath } from '../../hooks'
import {
  destinationsFromStationDetail,
  hydrateStationWagonRowsForRoute,
  parseStationDetailWagonRows,
} from '../../reservation/coreApi'
import { formatStationLocality } from '../../reservation/locationDisplay'
import type { CreateReservationPayload, DestinationStation, JourneyWagonOption } from '../../reservation/types'
import { formatReservationApiValidation } from '../../reservation/validationErrors'
import { useAuth } from '../../auth/AuthContext'
import { chatStore } from '../../chat/chatStore'
import { useLookupStore } from '../../stores/lookupStore'
import { useReservationStore } from '../../stores/reservationStore'
import {
  getAfnPrice,
  getAvailable,
  getUsdPrice,
  getWagonTypeId,
  wagonSelectLabel,
  isWagonRowBookable,
} from '../../reservation/wagonHelpers'
import { ApiError } from '../../services/api'
import Seo from '../../shared/components/Seo'
import {
  ReservationGradientHeader,
  reservationBtnPrimaryClass,
  reservationCardClass,
  reservationCardTitleClass,
  reservationFieldClass,
  reservationFieldDisabledClass,
  reservationFieldLeadingIconPadClass,
  reservationHeadingClass,
  reservationIconBrandSoftClass,
  reservationLabelClass,
  reservationLinkClass,
  reservationPageStackClass,
  reservationTextSecondary,
} from './ReservationChrome'

type CreateState = {
  originId: number
  destinationId?: number
  /** از جزئیات استیشن (WEB_API_GUIDE) */
  wagonTypeId?: number
  originLabel?: string
  destinationLabel?: string
}

function destTitle(d: DestinationStation) {
  return String(d.name ?? d.code ?? `#${d.id}`)
}

function CreateReservationPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const state = location.state as CreateState | null | undefined

  const loadJourneyAvailability = useLookupStore((s) => s.loadJourneyAvailability)
  const loadDestinations = useLookupStore((s) => s.loadDestinations)
  const loadStation = useLookupStore((s) => s.loadStation)
  const journeyOptionsByKey = useLookupStore((s) => s.journeyOptionsByKey)
  const journeyLoading = useLookupStore((s) => s.journeyLoading)
  const journeyErrorByKey = useLookupStore((s) => s.journeyError)
  const destinationsByStation = useLookupStore((s) => s.destinationsByStation)
  const stationById = useLookupStore((s) => s.stationById)

  const submitCreate = useReservationStore((s) => s.submitCreate)
  const createSubmitting = useReservationStore((s) => s.createSubmitting)
  const loadList = useReservationStore((s) => s.loadList)

  const originId = state?.originId
  const [destinationIdLocal, setDestinationIdLocal] = useState<number | null>(state?.destinationId ?? null)

  const originStation = originId != null ? stationById[originId] : undefined
  const embeddedDest = useMemo(() => destinationsFromStationDetail(originStation ?? null), [originStation])
  const destinations =
    originId != null ? (embeddedDest.length > 0 ? embeddedDest : destinationsByStation[originId] ?? []) : []

  const baseWagonRows = useMemo(() => parseStationDetailWagonRows(originStation ?? null), [originStation])
  const useStationDetailWagons = baseWagonRows.length > 0

  const [pricedRows, setPricedRows] = useState<JourneyWagonOption[]>([])
  const [routePricingBusy, setRoutePricingBusy] = useState(false)
  const [routePricingErr, setRoutePricingErr] = useState<string | null>(null)

  const journeyKey =
    originId != null && destinationIdLocal != null ? `${originId}-${destinationIdLocal}` : ''
  const options = journeyKey ? journeyOptionsByKey[journeyKey] : undefined
  const journeyBusy = journeyKey ? journeyLoading[journeyKey] : false
  const journeyErr = journeyKey ? journeyErrorByKey[journeyKey] : null

  const routeBusy = useStationDetailWagons ? routePricingBusy : journeyBusy
  const routeErr = useStationDetailWagons ? routePricingErr : journeyErr

  const [wagonRows, setWagonRows] = useState<JourneyWagonOption[]>([])
  const [selectedWagonIndex, setSelectedWagonIndex] = useState(0)
  const [numberOfWagons, setNumberOfWagons] = useState(1)
  const [cargoDescription, setCargoDescription] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')

  useEffect(() => {
    if (originId == null) return
    void loadStation(originId, { force: true })
    void loadDestinations(originId, { force: true })
  }, [originId, loadDestinations, loadStation])

  useEffect(() => {
    if (originId == null || destinationIdLocal == null) return
    if (useStationDetailWagons) return
    void loadJourneyAvailability(originId, destinationIdLocal)
  }, [originId, destinationIdLocal, loadJourneyAvailability, useStationDetailWagons])

  useEffect(() => {
    if (!useStationDetailWagons || originId == null || destinationIdLocal == null) {
      setPricedRows([])
      setRoutePricingErr(null)
      return
    }
    let cancelled = false
    setRoutePricingBusy(true)
    setRoutePricingErr(null)
    setPricedRows([])
    void hydrateStationWagonRowsForRoute(baseWagonRows, originId, destinationIdLocal)
      .then((rows) => {
        if (!cancelled) setPricedRows(rows)
      })
      .catch(() => {
        if (!cancelled) {
          setPricedRows([])
          setRoutePricingErr(t('reservation.loadFailed'))
        }
      })
      .finally(() => {
        if (!cancelled) setRoutePricingBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [baseWagonRows, destinationIdLocal, originId, t, useStationDetailWagons])

  useEffect(() => {
    if (!journeyKey) {
      setWagonRows([])
      setSelectedWagonIndex(0)
      setNumberOfWagons(1)
      return
    }
    if (useStationDetailWagons) {
      setWagonRows(pricedRows)
      setSelectedWagonIndex(0)
      setNumberOfWagons(1)
      return
    }
    if (options === undefined) {
      setWagonRows([])
      setSelectedWagonIndex(0)
      return
    }
    setWagonRows(options)
    setSelectedWagonIndex(0)
    setNumberOfWagons(1)
  }, [journeyKey, options, pricedRows, useStationDetailWagons])

  const bookableWagonRows = useMemo(() => wagonRows.filter((r) => isWagonRowBookable(r)), [wagonRows])

  useEffect(() => {
    if (!bookableWagonRows.length || state?.wagonTypeId == null) return
    const ix = bookableWagonRows.findIndex((r) => getWagonTypeId(r) === state.wagonTypeId)
    if (ix >= 0) setSelectedWagonIndex(ix)
  }, [state?.wagonTypeId, bookableWagonRows])

  const safeWagonIndex =
    bookableWagonRows.length === 0
      ? 0
      : Math.min(selectedWagonIndex, bookableWagonRows.length - 1)

  const selectedRow = useMemo(() => {
    if (!bookableWagonRows.length) return null
    return bookableWagonRows[safeWagonIndex]
  }, [bookableWagonRows, safeWagonIndex])

  const usdUnit = selectedRow ? getUsdPrice(selectedRow) : null
  const afnUnit = selectedRow ? getAfnPrice(selectedRow) : null
  const usdNum = usdUnit != null ? Number(usdUnit) : NaN
  const afnNum = afnUnit != null ? Number(afnUnit) : NaN
  const usdDisplay =
    usdUnit != null && !Number.isNaN(usdNum) ? (usdNum * numberOfWagons).toFixed(2) : usdUnit
  const afnDisplay =
    afnUnit != null && !Number.isNaN(afnNum) ? (afnNum * numberOfWagons).toFixed(2) : afnUnit
  const maxAvail = selectedRow ? getAvailable(selectedRow) : null

  const wagonDropdownLabel = (row: JourneyWagonOption) => {
    const base = wagonSelectLabel(row)
    const n = getAvailable(row)
    if (n != null) return t('reservation.wagonTypeOptionWithCount', { label: base, count: n })
    return base
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (originId == null) return
    if (destinationIdLocal == null) {
      toast.error(t('reservation.fieldRequiredNamed', { field: t('reservation.fieldDestinationStation') }))
      return
    }
    const wagonTypeId = selectedRow ? getWagonTypeId(selectedRow) : null
    if (wagonTypeId == null) {
      toast.error(t('reservation.pickWagon'))
      return
    }
    if (selectedRow && !isWagonRowBookable(selectedRow)) {
      toast.error(t('reservation.wagonNotBookable'))
      return
    }
    if (cargoWeight.trim()) {
      const w = Number(cargoWeight.trim().replace(',', '.'))
      if (!Number.isFinite(w)) {
        toast.error(t('reservation.invalidCargoWeight'))
        return
      }
    }
    if (maxAvail != null && numberOfWagons > maxAvail) {
      toast.error(t('reservation.exceedsAvailability'))
      return
    }
    try {
      const payload: CreateReservationPayload = {
        origin_station: Math.floor(Number(originId)),
        destination_station: Math.floor(Number(destinationIdLocal)),
        wagon_type: Math.floor(Number(wagonTypeId)),
        number_of_wagons: Math.max(1, Math.floor(Number(numberOfWagons))),
      }
      const cd = cargoDescription.trim()
      if (cd) payload.cargo_description = cd
      const cw = cargoWeight.trim()
      if (cw) {
        const n = Number(cw.replace(',', '.'))
        if (Number.isFinite(n)) payload.cargo_weight = n
      }
      if (specialRequirements.trim()) payload.special_requirements = specialRequirements.trim()

      const detail = await submitCreate(payload)
      toast.success(t('reservation.createSuccess'))

      const destStation = destinations.find((d) => d.id === destinationIdLocal)
      const destLabelText = destStation ? destTitle(destStation) : state?.destinationLabel ?? ''
      const originLabelText =
        state?.originLabel ?? (originStation ? String(originStation.name ?? originStation.code ?? '') : String(originId))
      const wagonLabel = selectedRow ? wagonSelectLabel(selectedRow) : ''
      try {
        const convId = await chatStore.ensurePrivateConversation()
        if (convId) {
          const text = t('reservation.adminChatMessage', {
            id: detail.id,
            origin: originLabelText,
            destination: destLabelText,
            wagon: wagonLabel,
            count: numberOfWagons,
          })
          await chatStore.sendMessage({
            conversationId: convId,
            messageType: 'text',
            text,
            sender: user
              ? { id: user.id, email: user.email, full_name: user.full_name }
              : { id: 0, email: '', full_name: '' },
          })
        }
      } catch {
        toast.error(t('reservation.adminChatNotifyFailed'))
      }

      void loadList()
      navigate(withLang('/reservation/my'), { replace: true })
    } catch (e) {
      let msg = t('reservation.createFailed')
      if (e instanceof ApiError) {
        if (e.details && Object.keys(e.details).length) {
          msg = formatReservationApiValidation(e.details, t)
        } else {
          msg = e.message || msg
        }
      }
      toast.error(msg)
    }
  }

  if (originId == null) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm font-medium text-amber-950">
        <p className="mb-3">{t('reservation.createMissingContext')}</p>
        <Link to={withLang('/reservation')} className={reservationLinkClass}>
          {t('reservation.backToStations')}
        </Link>
      </div>
    )
  }

  const originLocality = originStation ? formatStationLocality(originStation) : ''

  return (
    <>
      <Seo title={t('reservation.createTitle')} description={t('reservation.createDescription')} />
      <ReservationGradientHeader title={t('reservation.createTitle')} backTo={`/reservation/station/${originId}`} />

      <form onSubmit={onSubmit} className={reservationPageStackClass}>
        <div className={`${reservationCardClass()} bg-[#fafafa]`}>
          <div className="flex items-start gap-3">
            <span className={reservationIconBrandSoftClass}>
              <TrainFront className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`${reservationHeadingClass} text-lg`}>
                {state?.originLabel ?? (originStation ? String(originStation.name ?? originStation.code ?? '') : `#${originId}`)}
              </p>
              {originLocality ? <p className={`mt-1 text-sm ${reservationTextSecondary}`}>{originLocality}</p> : null}
            </div>
            <span className="shrink-0 rounded-full bg-[#e6fbff] px-3 py-1.5 text-xs font-bold text-[#0a2540] ring-1 ring-[#00e2ff]">
              {t('reservation.origin')}
            </span>
          </div>
        </div>

        <div className={reservationCardClass()}>
          <div className="mb-4 flex items-center gap-2">
            <span className={reservationIconBrandSoftClass}>
              <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <h2 className={reservationCardTitleClass}>{t('reservation.routeAndWagon')}</h2>
          </div>

          <label className="relative mb-4 block">
            <MapPin className={`pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${reservationTextSecondary}`} />
            <select
              value={destinationIdLocal ?? ''}
              onChange={(e) => setDestinationIdLocal(e.target.value ? Number(e.target.value) : null)}
              className={`${reservationFieldClass} ${reservationFieldLeadingIconPadClass} appearance-none py-3 pr-10`}
            >
              <option value="">{t('reservation.destinationStation')}</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {destTitle(d)}
                </option>
              ))}
            </select>
            <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${reservationTextSecondary}`}>▾</span>
          </label>

          {routeBusy && <div className="h-24 animate-pulse rounded-2xl bg-[#f0f0f0]" />}

          {!routeBusy && destinationIdLocal != null && routeErr ? (
            <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{routeErr}</p>
          ) : null}

          {!routeBusy && destinationIdLocal != null && !routeErr && (
            <>
              <label className={reservationLabelClass}>{t('reservation.wagonType')}</label>
              <div className="relative mb-4">
                <TrainFront
                  className={`pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${reservationTextSecondary}`}
                />
                {bookableWagonRows.length > 0 ? (
                  <select
                    value={safeWagonIndex}
                    onChange={(e) => setSelectedWagonIndex(Number(e.target.value))}
                    className={`${reservationFieldClass} ${reservationFieldLeadingIconPadClass} appearance-none py-3 pr-10`}
                    required
                    aria-label={t('reservation.wagonType')}
                  >
                    {bookableWagonRows.map((row, idx) => (
                      <option key={`wt-${getWagonTypeId(row) ?? idx}-${idx}`} value={idx}>
                        {wagonDropdownLabel(row)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    disabled
                    value=""
                    className={`${reservationFieldClass} ${reservationFieldLeadingIconPadClass} ${reservationFieldDisabledClass} appearance-none py-3 pr-10`}
                    aria-label={t('reservation.wagonTypeEmpty')}
                  >
                    <option value="">{/* بدون گزینهٔ قابل رزرو — نمای خالی */}</option>
                  </select>
                )}
                <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${reservationTextSecondary}`}>▾</span>
              </div>
            </>
          )}

          {!routeBusy && destinationIdLocal != null && bookableWagonRows.length > 0 && (
            <>
              {selectedRow && maxAvail != null ? (
                <p className="mb-3 text-xs font-medium text-emerald-900">
                  {t('reservation.maxWagonsForThisType', { count: maxAvail })}
                </p>
              ) : selectedRow && maxAvail == null ? (
                <p className={`mb-3 text-xs ${reservationTextSecondary}`}>{t('reservation.availabilityCountNotReported')}</p>
              ) : null}

              <label className={reservationLabelClass}>{t('reservation.numberOfWagons')}</label>
              <div className="relative mb-4 rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2 shadow-sm transition-[box-shadow,border-color,background-color] duration-200 hover:border-[#00e2ff]/45 hover:bg-[#fcfeff] focus-within:border-[#00e2ff] focus-within:ring-2 focus-within:ring-[#00e2ff]/30">
                <span
                  className={`absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-wide ${reservationTextSecondary}`}
                >
                  {t('reservation.numberOfWagons')}
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`text-lg font-bold ${reservationTextSecondary}`}>#</span>
                  <input
                    type="number"
                    min={1}
                    max={maxAvail ?? undefined}
                    value={numberOfWagons}
                    onChange={(e) => setNumberOfWagons(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full border-none bg-transparent text-lg font-bold text-[#1a1a1a] outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#b9f0ff] bg-[#ecfeff] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[#0a2540]" />
                  <span className="flex-1 font-bold text-[#1a1a1a]">{t('reservation.totalPrice')}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#1a1a1a] ring-1 ring-[#00e2ff]/40">
                    {numberOfWagons} × {t('reservation.wagon')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 text-center shadow-sm transition-all duration-200 hover:border-[#00e2ff]/55 hover:bg-[#fcfeff] hover:shadow-[0_10px_32px_-12px_rgba(0,226,255,0.32)]">
                    <p className={`text-xs font-semibold ${reservationTextSecondary}`}>USD</p>
                    <p className="min-h-[1.75rem] text-lg font-bold text-[#1a1a1a]">
                      {usdDisplay != null && String(usdDisplay).trim() !== '' ? String(usdDisplay) : null}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 text-center shadow-sm transition-all duration-200 hover:border-[#00e2ff]/55 hover:bg-[#fcfeff] hover:shadow-[0_10px_32px_-12px_rgba(0,226,255,0.32)]">
                    <p className={`text-xs font-semibold ${reservationTextSecondary}`}>AFN</p>
                    <p className="min-h-[1.75rem] text-lg font-bold text-[#1a1a1a]">
                      {afnDisplay != null && String(afnDisplay).trim() !== '' ? String(afnDisplay) : null}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {!routeBusy && destinationIdLocal != null && !routeErr && wagonRows.length === 0 ? (
            <p className={`mt-1 text-sm ${reservationTextSecondary}`}>{t('reservation.noWagonAvailability')}</p>
          ) : null}
        </div>

        <div className={reservationCardClass()}>
          <div className="mb-4 flex items-center gap-2">
            <span className={reservationIconBrandSoftClass}>
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <h2 className={reservationCardTitleClass}>{t('reservation.cargo')}</h2>
          </div>
          <label className="relative mb-4 block">
            <FileText
              className={`pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${reservationTextSecondary}`}
            />
            <input
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              placeholder={t('reservation.cargoDescriptionOptional')}
              className={`${reservationFieldClass} ${reservationFieldLeadingIconPadClass} py-3 pr-4`}
            />
          </label>
          <label className="relative mb-4 block">
            <Scale
              className={`pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${reservationTextSecondary}`}
            />
            <input
              value={cargoWeight}
              onChange={(e) => setCargoWeight(e.target.value)}
              placeholder={t('reservation.cargoWeightOptional')}
              className={`${reservationFieldClass} ${reservationFieldLeadingIconPadClass} py-3 pr-4`}
              inputMode="decimal"
            />
          </label>
          <label className="relative mb-4 block">
            <Pencil
              className={`pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${reservationTextSecondary}`}
            />
            <input
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder={t('reservation.specialRequirements')}
              className={`${reservationFieldClass} ${reservationFieldLeadingIconPadClass} py-3 pr-4`}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={
            createSubmitting ||
            routeBusy ||
            destinationIdLocal == null ||
            !bookableWagonRows.length ||
            !selectedRow
          }
          className={`${reservationBtnPrimaryClass} w-full py-4 text-base shadow-lg`}
        >
          {createSubmitting ? t('reservation.submitting') : t('reservation.submitReservation')}
        </button>
      </form>
    </>
  )
}

export default CreateReservationPage
