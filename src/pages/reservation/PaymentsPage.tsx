import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePaymentStore } from '../../stores/paymentStore'
import Seo from '../../shared/components/Seo'
import { formatReservationDateTime } from '../../reservation/displayHelpers'
import {
  ReservationGradientHeader,
  reservationCardClass,
  reservationCardTitleClass,
  reservationNestedRowHoverClass,
  reservationPageStackClass,
  reservationTextSecondary,
} from './ReservationChrome'

function PaymentsPage() {
  const { t, i18n } = useTranslation()
  const merchantPayments = usePaymentStore((s) => s.merchantPayments)
  const myPaymentRequests = usePaymentStore((s) => s.myPaymentRequests)
  const loading = usePaymentStore((s) => s.loading)
  const error = usePaymentStore((s) => s.error)
  const loadAll = usePaymentStore((s) => s.loadAll)

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  return (
    <>
      <Seo title={t('reservation.paymentsTitle')} description={t('reservation.paymentsDescription')} />
      <ReservationGradientHeader title={t('reservation.paymentsTitle')} backTo="/reservation/my" />

      <div className={reservationPageStackClass}>
      {loading && <div className="h-32 animate-pulse rounded-2xl bg-[#f0f0f0] md:rounded-3xl" />}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 md:rounded-3xl">
          {error}
        </div>
      )}

      <div className={reservationCardClass()}>
        <h2 className={`${reservationCardTitleClass} mb-3`}>{t('reservation.merchantPayments')}</h2>
        {!merchantPayments.length && !loading ? (
          <p className={`text-sm ${reservationTextSecondary}`}>{t('reservation.noPayments')}</p>
        ) : (
          <ul className="space-y-2">
            {merchantPayments.map((p, i) => (
              <li
                key={p.id ?? i}
                className={`rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-sm text-[#1a1a1a] ${reservationNestedRowHoverClass}`}
              >
                {p.amount != null || p.currency ? (
                  <span className="font-semibold">
                    {p.amount != null ? String(p.amount) : ''}
                    {p.amount != null && p.currency ? ' ' : ''}
                    {p.currency ?? ''}
                  </span>
                ) : null}
                {p.status_display || p.status ? (
                  <span className={`ml-2 ${reservationTextSecondary}`}>{String(p.status_display ?? p.status)}</span>
                ) : null}
                {p.installment_number != null ? (
                  <span className={`ml-2 text-xs ${reservationTextSecondary}`}>#{String(p.installment_number)}</span>
                ) : null}
                {p.created_at ? (
                  <div className={`text-xs ${reservationTextSecondary}`}>{formatReservationDateTime(String(p.created_at), i18n.language)}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={reservationCardClass()}>
        <h2 className={`${reservationCardTitleClass} mb-3`}>{t('reservation.myPaymentRequests')}</h2>
        {!myPaymentRequests.length && !loading ? (
          <p className={`text-sm ${reservationTextSecondary}`}>{t('reservation.noPaymentRequests')}</p>
        ) : (
          <ul className="space-y-2">
            {myPaymentRequests.map((r, i) => (
              <li
                key={r.id ?? i}
                className={`rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-sm text-[#1a1a1a] ${reservationNestedRowHoverClass}`}
              >
                {r.status_display ?? r.status ? (
                  <span className="font-semibold">{String(r.status_display ?? r.status)}</span>
                ) : null}
                {r.admin_response ? (
                  <p className={`mt-1 text-xs ${reservationTextSecondary}`}>{r.admin_response}</p>
                ) : null}
                {r.responded_at ? (
                  <p className={`text-xs ${reservationTextSecondary}`}>{formatReservationDateTime(String(r.responded_at), i18n.language)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </>
  )
}

export default PaymentsPage
