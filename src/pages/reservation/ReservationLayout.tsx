import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { reservationColumnClass } from './ReservationChrome'

/** اسکلت کوتاه هنگام lazy-load صفحات فرعی رزرو */
export function ReservationRouteFallback() {
  return (
    <div className="space-y-4">
      <div className="h-12 animate-pulse rounded-2xl bg-arc-muted" />
      <div className="h-36 animate-pulse rounded-2xl bg-arc-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-arc-muted" />
    </div>
  )
}

/** Shell for reservation module — wider readable column; content scrolls; Navbar + Footer remain */
function ReservationLayout() {
  return (
    <div className={`reservation-module-shell ${reservationColumnClass} pb-10 pt-2 sm:pb-12 sm:pt-3 lg:pb-14`}>
      <Suspense fallback={<ReservationRouteFallback />}>
        <Outlet />
      </Suspense>
    </div>
  )
}

export default ReservationLayout
