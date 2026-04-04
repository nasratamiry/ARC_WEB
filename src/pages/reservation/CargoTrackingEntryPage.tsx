import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { useLocalizedPath } from '../../hooks'
import Seo from '../../shared/components/Seo'
import {
  ReservationGradientHeader,
  reservationBtnPrimaryClass,
  reservationCardClass,
  reservationCardTitleClass,
  reservationFieldClass,
  reservationIconNeutralClass,
  reservationLabelClass,
  reservationPageStackClass,
  reservationTextSecondary,
} from './ReservationChrome'

function CargoTrackingEntryPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const navigate = useNavigate()
  const [trackCode, setTrackCode] = useState('')
  const trackInputId = 'res-cargo-tracking-code'

  const goTracking = () => {
    const code = trackCode.trim()
    if (!code) return
    navigate(withLang(`/tracking/${encodeURIComponent(code)}`))
  }

  return (
    <>
      <Seo title={t('reservation.trackingHeroTitle')} description={t('reservation.trackingHeroBody')} />
      <ReservationGradientHeader title={t('reservation.trackingHeroTitle')} backTo="/reservation" />
      <div className={reservationPageStackClass}>
        <section aria-labelledby="res-cargo-tracking-title">
          <div className={reservationCardClass()}>
            <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-5 sm:flex-row sm:items-start sm:gap-6">
              <div className={`${reservationIconNeutralClass} h-12 w-12 shrink-0 sm:h-14 sm:w-14`}>
                <Truck className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="res-cargo-tracking-title" className={reservationCardTitleClass}>
                  {t('reservation.trackingHeroTitle')}
                </h2>
                <p className="mt-1.5 text-sm font-semibold text-[#1a1a1a] sm:text-base">
                  {t('reservation.trackingHeroSubtitle')}
                </p>
                <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${reservationTextSecondary}`}>
                  {t('reservation.trackingHeroBody')}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 sm:mt-6">
              <div>
                <label className={reservationLabelClass} htmlFor={trackInputId}>
                  {t('reservation.trackingCode')}
                </label>
                <input
                  id={trackInputId}
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      goTracking()
                    }
                  }}
                  placeholder={t('reservation.trackingInputPlaceholder')}
                  autoComplete="off"
                  className={reservationFieldClass}
                  aria-label={t('reservation.trackingInputPlaceholder')}
                />
              </div>
              <button type="button" onClick={goTracking} className={`${reservationBtnPrimaryClass} w-full`}>
                {t('reservation.trackCta')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default CargoTrackingEntryPage
