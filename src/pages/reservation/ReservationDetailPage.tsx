import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import Seo from '../../shared/components/Seo'
import { useReservationStore } from '../../stores/reservationStore'
import {
  assignedWagonLabel,
  nonEmptyString,
  routeFromNames,
  trackingCodeFromUnknown,
} from '../../reservation/displayHelpers'
import type { PaymentRecord } from '../../reservation/types'
import {
  ReservationGradientHeader,
  reservationBtnPrimaryClass,
  reservationBtnSecondaryClass,
  reservationCardClass,
  reservationCardTitleClass,
  reservationNestedRowHoverClass,
  reservationPageStackClass,
  reservationStatusBadgeClass,
  reservationTextSecondary,
  reservationTrackingBoxClass,
} from './ReservationChrome'

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb]/90 py-2.5 last:border-b-0">
      <span className={`shrink-0 text-sm font-medium ${reservationTextSecondary}`}>{label}</span>
      <div className="min-w-0 max-w-[65%] text-right text-sm font-semibold text-[#1a1a1a]">{children}</div>
    </div>
  )
}

function paymentDisplayAmount(p: PaymentRecord): string | null {
  const raw = p as Record<string, unknown>
  const paid = raw.amount_paid ?? raw.amount ?? p.amount
  const cur = (raw.paid_currency ?? raw.currency ?? p.currency) as string | undefined
  if (paid == null || String(paid).trim() === '') return null
  return cur ? `${String(paid)} ${cur}` : String(paid)
}

function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const numericId = id && /^\d+$/.test(id) ? Number(id) : NaN

  const detail = useReservationStore((s) => s.detail)
  const detailLoading = useReservationStore((s) => s.detailLoading)
  const detailError = useReservationStore((s) => s.detailError)
  const loadDetail = useReservationStore((s) => s.loadDetail)
  const clearDetail = useReservationStore((s) => s.clearDetail)

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(numericId)) return
    void loadDetail(numericId)
    return () => {
      clearDetail()
    }
  }, [numericId, loadDetail, clearDetail])

  const copyTracking = (code: string) => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      toast.success(t('reservation.copyTrackingSuccess'))
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!Number.isFinite(numericId)) {
    return <p className="py-8 text-center text-sm text-red-700">{t('reservation.invalidId')}</p>
  }

  const routeLabel = detail ? routeFromNames(detail.origin_station_name, detail.destination_station_name) : null
  const wagonTypeLabel = detail ? nonEmptyString(detail.wagon_type_name) : null
  const trackingStr = detail ? trackingCodeFromUnknown(detail.tracking_code as unknown) : null
  const statusText = detail ? detail.status_display ?? detail.status : null

  return (
    <>
      <Seo title={t('reservation.detailTitle')} description={t('reservation.detailDescription')} />
      <ReservationGradientHeader title={t('reservation.detailTitle')} backTo="/reservation/my" />

      {detailLoading && <div className="h-40 animate-pulse rounded-xl bg-[#f0f0f0]" />}
      {detailError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">{detailError}</p>
          <button
            type="button"
            className={`mt-3 ${reservationBtnSecondaryClass} w-full sm:w-auto`}
            onClick={() => void loadDetail(numericId)}
          >
            {t('reservation.retryLoad')}
          </button>
        </div>
      )}

      {!detailLoading && !detail && !detailError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm font-medium text-amber-950">
          <p>{t('reservation.detailEmpty')}</p>
          <button
            type="button"
            className={`mt-3 ${reservationBtnPrimaryClass} w-full sm:w-auto`}
            onClick={() => void loadDetail(numericId)}
          >
            {t('reservation.retryLoad')}
          </button>
        </div>
      ) : null}

      {detail && !detailLoading && (
        <div className={reservationPageStackClass}>
          {/* Summary — no reservation / DB id in UI */}
          <section
            className={`${reservationCardClass()} border-[#00e2ff]/20 bg-gradient-to-br from-white to-[#f8feff]`}
          >
            <h2 className={`${reservationCardTitleClass} mb-1`}>{t('reservation.summarySection')}</h2>
            <div className="mt-3">
              {statusText ? (
                <DetailRow label={t('reservation.status')}>
                  <span className={reservationStatusBadgeClass(detail.status)}>{statusText}</span>
                </DetailRow>
              ) : null}
              {routeLabel ? <DetailRow label={t('reservation.route')}>{routeLabel}</DetailRow> : null}
              {wagonTypeLabel ? (
                <DetailRow label={t('reservation.wagonType')}>{wagonTypeLabel}</DetailRow>
              ) : null}
              {typeof detail.number_of_wagons === 'number' ? (
                <DetailRow label={t('reservation.numberOfWagons')}>{detail.number_of_wagons}</DetailRow>
              ) : null}
              {trackingStr ? (
                <div className="flex items-start justify-between gap-3 border-b border-[#e5e7eb]/90 py-2.5 last:border-0">
                  <span className={`shrink-0 text-sm font-medium ${reservationTextSecondary}`}>
                    {t('reservation.trackingCode')}
                  </span>
                  <div className="flex min-w-0 max-w-[70%] items-center justify-end gap-2">
                    <div className={`${reservationTrackingBoxClass} min-w-0 flex-1 truncate border-[#e5e7eb] bg-white`}>
                      {trackingStr}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyTracking(trackingStr)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#0a2540] shadow-sm transition-colors hover:border-[#00e2ff] hover:bg-[#ecfeff]"
                      aria-label={t('reservation.copyTracking')}
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            {typeof detail.financially_settled === 'boolean' ? (
              <div className="mt-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    detail.financially_settled
                      ? 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200'
                      : 'bg-amber-100 text-amber-950 ring-1 ring-amber-200'
                  }`}
                >
                  {t('reservation.settledBadge')}: {detail.financially_settled ? t('reservation.yes') : t('reservation.no')}
                </span>
              </div>
            ) : null}
          </section>

          {/* Pricing */}
          {detail.calculated_price_usd != null ||
          detail.calculated_price_afn != null ||
          detail.total_paid_usd != null ||
          detail.total_paid_afn != null ? (
            <section className={reservationCardClass()}>
              <h2 className={`${reservationCardTitleClass} mb-3`}>{t('reservation.pricingSection')}</h2>
              {detail.calculated_price_usd != null ? (
                <DetailRow label={t('reservation.priceUsd')}>{String(detail.calculated_price_usd)}</DetailRow>
              ) : null}
              {detail.calculated_price_afn != null ? (
                <DetailRow label={t('reservation.priceAfn')}>{String(detail.calculated_price_afn)}</DetailRow>
              ) : null}
              {(detail.total_paid_usd != null || detail.total_paid_afn != null) &&
              (detail.calculated_price_usd != null || detail.calculated_price_afn != null) ? (
                <div className="my-3 border-t border-[#e5e7eb]" />
              ) : null}
              {detail.total_paid_usd != null ? (
                <DetailRow label={t('reservation.totalPaidUsd')}>{String(detail.total_paid_usd)}</DetailRow>
              ) : null}
              {detail.total_paid_afn != null ? (
                <DetailRow label={t('reservation.totalPaidAfn')}>{String(detail.total_paid_afn)}</DetailRow>
              ) : null}
            </section>
          ) : null}

          {/* Cargo */}
          {detail.cargo_description ||
          detail.cargo_weight != null ||
          nonEmptyString(detail.special_requirements) ||
          nonEmptyString(detail.notes) ? (
            <section className={reservationCardClass()}>
              <h2 className={`${reservationCardTitleClass} mb-3`}>{t('reservation.cargo')}</h2>
              {detail.cargo_description ? (
                <p className="text-sm leading-relaxed text-[#1a1a1a]">{detail.cargo_description}</p>
              ) : null}
              {detail.cargo_weight != null && String(detail.cargo_weight).trim() !== '' ? (
                <p className={`mt-2 text-sm ${reservationTextSecondary}`}>
                  <span className="font-medium text-[#1a1a1a]">{t('reservation.cargoWeight')}:</span>{' '}
                  {String(detail.cargo_weight)}
                </p>
              ) : null}
              {nonEmptyString(detail.special_requirements) ? (
                <p className={`mt-2 text-sm ${reservationTextSecondary}`}>
                  <span className="font-medium text-[#1a1a1a]">{t('reservation.specialRequirements')}:</span>{' '}
                  {nonEmptyString(detail.special_requirements)}
                </p>
              ) : null}
              {nonEmptyString(detail.notes) ? (
                <p className={`mt-2 text-sm ${reservationTextSecondary}`}>
                  <span className="font-medium text-[#1a1a1a]">{t('reservation.notesOptional')}:</span>{' '}
                  {nonEmptyString(detail.notes)}
                </p>
              ) : null}
            </section>
          ) : null}

          {/* Payments */}
          {Array.isArray(detail.payments) && detail.payments.length > 0 ? (
            <section className={reservationCardClass()}>
              <h2 className={`${reservationCardTitleClass} mb-3`}>{t('reservation.payments')}</h2>
              <ul className="space-y-3">
                {detail.payments.map((p, idx) => {
                  const pr = p as PaymentRecord
                  const inst = pr.installment_number
                  const title =
                    typeof inst === 'number'
                      ? t('reservation.paymentInstallment', { n: inst })
                      : t('reservation.paymentPart', { n: idx + 1 })
                  const amountLine = paymentDisplayAmount(pr)
                  const st = pr.status_display ?? pr.status
                  return (
                    <li
                      key={`${inst ?? idx}-${idx}`}
                      className={`rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-3 shadow-sm ${reservationNestedRowHoverClass}`}
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#1a1a1a]">{title}</span>
                        {st ? (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-800">
                            {st}
                          </span>
                        ) : null}
                      </div>
                      {pr.payment_method != null && String(pr.payment_method).trim() !== '' ? (
                        <DetailRow label={t('reservation.paymentMethod')}>{String(pr.payment_method)}</DetailRow>
                      ) : null}
                      {amountLine ? <DetailRow label={t('reservation.paidAmount')}>{amountLine}</DetailRow> : null}
                      {pr.amount_usd != null ? (
                        <DetailRow label={t('reservation.expectedUsd')}>{String(pr.amount_usd)}</DetailRow>
                      ) : null}
                      {pr.amount_afn != null ? (
                        <DetailRow label={t('reservation.expectedAfn')}>{String(pr.amount_afn)}</DetailRow>
                      ) : null}
                      {pr.remaining_amount != null ? (
                        <DetailRow label={t('reservation.remainingAmount')}>{String(pr.remaining_amount)}</DetailRow>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}

          {/* Assigned wagons */}
          {Array.isArray(detail.assigned_wagons) && detail.assigned_wagons.some((w) => assignedWagonLabel(w)) ? (
            <section className={reservationCardClass()}>
              <h2 className={`${reservationCardTitleClass} mb-3`}>{t('reservation.assignedWagons')}</h2>
              <div className="flex flex-wrap gap-2">
                {detail.assigned_wagons.map((w, i) => {
                  const lab = assignedWagonLabel(w)
                  if (!lab) return null
                  return (
                    <span
                      key={`${lab}-${i}`}
                      className="inline-flex rounded-full border border-[#00e2ff]/50 bg-[#ecfeff] px-3 py-1.5 text-sm font-semibold text-[#0a2540]"
                    >
                      {lab}
                    </span>
                  )
                })}
              </div>
            </section>
          ) : null}

          {nonEmptyString(detail.message) ? (
            <div className={`${reservationCardClass()} border-[#b9f0ff] bg-[#e6fbff]`}>
              <p className="text-sm font-medium leading-relaxed text-[#1a1a1a]">{nonEmptyString(detail.message)}</p>
            </div>
          ) : null}
        </div>
      )}
    </>
  )
}

export default ReservationDetailPage
