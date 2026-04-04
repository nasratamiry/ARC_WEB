import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { GitBranch } from 'lucide-react'
import { useLocalizedPath } from '../../hooks'
import { formatReservationDateTime, nonEmptyString, routeFromNames } from '../../reservation/displayHelpers'
import { useReservationStore } from '../../stores/reservationStore'
import Seo from '../../shared/components/Seo'
import {
  ReservationGradientHeader,
  reservationCardClass,
  reservationCardInteractiveClass,
  reservationCardTitleClass,
  reservationDividerClass,
  reservationIconBrandSoftClass,
  reservationLabelClass,
  reservationStatusBadgeClass,
  reservationTextSecondary,
  reservationTrackingBoxClass,
  reservationPriceHighlightClass,
  reservationFieldClass,
  reservationPageStackClass,
} from './ReservationChrome'

function MyReservationsPage() {
  const { t, i18n } = useTranslation()
  const { withLang } = useLocalizedPath()
  const list = useReservationStore((s) => s.list)
  const listLoading = useReservationStore((s) => s.listLoading)
  const listError = useReservationStore((s) => s.listError)
  const loadList = useReservationStore((s) => s.loadList)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    void loadList()
  }, [loadList])

  const statusOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of list) {
      const v = r.status
      if (v == null || String(v).trim() === '') continue
      const key = String(v)
      if (!map.has(key)) {
        map.set(key, String(r.status_display ?? r.status))
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [list])

  const displayedList = useMemo(() => {
    if (!filter) return list
    return list.filter((r) => String(r.status ?? '') === filter)
  }, [list, filter])

  return (
    <>
      <Seo title={t('reservation.myListTitle')} description={t('reservation.myListDescription')} />
      <ReservationGradientHeader title={t('reservation.myReservations')} backTo="/reservation" />

      <div className={reservationPageStackClass}>
        <div>
          <label className={reservationLabelClass} htmlFor="res-filter-status">
            {t('reservation.statusFilter')}
          </label>
          <select
            id="res-filter-status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={reservationFieldClass}
          >
            <option value="">{t('reservation.allStatuses')}</option>
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

      {listLoading && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-[#f0f0f0]" />
          ))}
        </div>
      )}

      {listError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
          {listError}
        </div>
      )}

      {!listLoading &&
        displayedList.map((r) => {
          const routeLabel = routeFromNames(r.origin_station_name, r.destination_station_name)
          const statusText = r.status_display ?? r.status
          const wagonTypeLine = nonEmptyString(r.wagon_type_name)
          return (
            <Link
              key={r.id}
              to={withLang(`/reservation/${r.id}`)}
              className={`${reservationCardClass()} ${reservationCardInteractiveClass} block`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 gap-3">
                  <span className={reservationIconBrandSoftClass}>
                    <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`mb-0.5 text-xs font-semibold uppercase tracking-wide ${reservationTextSecondary}`}>
                      {t('reservation.route')}
                    </p>
                    <p className={`${reservationCardTitleClass} leading-snug`}>
                      {routeLabel ?? t('reservation.reservationPendingTitle')}
                    </p>
                  </div>
                </div>
                {statusText ? (
                  <span className={reservationStatusBadgeClass(r.status)}>{statusText}</span>
                ) : null}
              </div>
              {routeLabel ? <div className={reservationDividerClass} /> : null}
              {wagonTypeLine ? (
                <p className={`mb-2 text-sm ${reservationTextSecondary}`}>
                  <span className="font-medium text-[#1a1a1a]">{t('reservation.wagonType')}:</span> {wagonTypeLine}
                </p>
              ) : null}
              {typeof r.financially_settled === 'boolean' ? (
                <p className={`mb-2 text-sm ${reservationTextSecondary}`}>
                  <span className="font-medium text-[#1a1a1a]">{t('reservation.financiallySettled')}:</span>{' '}
                  {r.financially_settled ? t('reservation.yes') : t('reservation.no')}
                </p>
              ) : null}
              {typeof r.number_of_wagons === 'number' ||
              r.calculated_price_usd != null ||
              r.calculated_price_afn != null ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {typeof r.number_of_wagons === 'number' ? (
                    <span className={`text-sm ${reservationTextSecondary}`}>
                      <span className="font-semibold text-[#1a1a1a]">{t('reservation.wagons')}:</span> {r.number_of_wagons}
                    </span>
                  ) : null}
                  {r.calculated_price_usd != null || r.calculated_price_afn != null ? (
                    <div className="text-right">
                      <p className={`mb-0.5 text-xs font-semibold uppercase tracking-wide ${reservationTextSecondary}`}>
                        {t('reservation.totalPrice')}
                      </p>
                      <span className={`flex flex-wrap justify-end gap-2 ${reservationPriceHighlightClass}`}>
                        {r.calculated_price_usd != null ? <span>USD {String(r.calculated_price_usd)}</span> : null}
                        {r.calculated_price_afn != null ? <span>AFN {String(r.calculated_price_afn)}</span> : null}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {r.estimated_delivery_time ? (
                <p className={`mt-3 text-sm ${reservationTextSecondary}`}>
                  <span className="font-medium text-[#1a1a1a]">{t('reservation.estimatedDelivery')}:</span>{' '}
                  {formatReservationDateTime(String(r.estimated_delivery_time), i18n.language)}
                </p>
              ) : null}
              {r.approved_at ? (
                <p className={`mt-1 text-sm ${reservationTextSecondary}`}>
                  <span className="font-medium text-[#1a1a1a]">{t('reservation.approvedAt')}:</span>{' '}
                  {formatReservationDateTime(String(r.approved_at), i18n.language)}
                </p>
              ) : null}
              {r.total_paid_usd != null || r.total_paid_afn != null ? (
                <p className="mt-2 text-sm font-semibold text-[#1a1a1a]">
                  {r.total_paid_usd != null ? (
                    <span>
                      {t('reservation.totalPaidUsd')}: {String(r.total_paid_usd)}
                    </span>
                  ) : null}
                  {r.total_paid_usd != null && r.total_paid_afn != null ? <span> · </span> : null}
                  {r.total_paid_afn != null ? (
                    <span>
                      {t('reservation.totalPaidAfn')}: {String(r.total_paid_afn)}
                    </span>
                  ) : null}
                </p>
              ) : null}
              {r.tracking_code ? (
                <div className="mt-4">
                  <p className={`mb-1 text-xs font-semibold uppercase tracking-wide ${reservationTextSecondary}`}>
                    {t('reservation.trackingCode')}
                  </p>
                  <div className={reservationTrackingBoxClass}>{r.tracking_code}</div>
                </div>
              ) : null}
              {r.created_at ? (
                <p className={`mt-3 text-xs ${reservationTextSecondary}`}>
                  {t('reservation.submittedAt')}: {formatReservationDateTime(String(r.created_at), i18n.language)}
                </p>
              ) : null}
            </Link>
          )
        })}

      {!listLoading && !list.length && !listError ? (
        <p className={`py-8 text-center text-sm ${reservationTextSecondary}`}>{t('reservation.noReservations')}</p>
      ) : null}
      {!listLoading && list.length > 0 && !displayedList.length && !listError ? (
        <p className={`py-8 text-center text-sm ${reservationTextSecondary}`}>{t('reservation.noMatchingFilter')}</p>
      ) : null}
      </div>
    </>
  )
}

export default MyReservationsPage
