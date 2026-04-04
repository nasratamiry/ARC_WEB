import type { AssignedWagon, TrackJourney } from './types'
import { formatGregorianDateTime } from '../shared/utils/dateTime'

/** Accepts string or `{ code: "..." }` from API. */
export function trackingCodeFromUnknown(raw: unknown): string | null {
  if (raw == null) return null
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  if (typeof raw === 'object' && raw !== null && 'code' in raw) {
    const c = (raw as { code?: unknown }).code
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return null
}

/** Formats ISO timestamps for reservation UI (locale-aware). */
export function formatReservationDateTime(iso: string | undefined, locale?: string): string {
  if (!iso || !String(iso).trim()) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  try {
    return formatGregorianDateTime(d, locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return d.toLocaleString()
  }
}

export function nonEmptyString(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

/** فقط نام ایستگاه‌هایی که بک‌اند فرستاده؛ بدون placeholder */
export function routeFromNames(origin?: unknown, dest?: unknown): string | null {
  const o = nonEmptyString(origin)
  const d = nonEmptyString(dest)
  if (o && d) return `${o} → ${d}`
  if (o) return o
  if (d) return d
  return null
}

const WAGON_LABEL_KEYS = ['identifier', 'number', 'wagon_number', 'code', 'label'] as const

export function assignedWagonLabel(w: AssignedWagon): string | null {
  for (const k of WAGON_LABEL_KEYS) {
    const v = w[k]
    if (typeof v === 'string' && v.trim()) return v
    if (typeof v === 'number' && !Number.isNaN(v)) return String(v)
  }
  if (w.id != null && String(w.id).trim()) return String(w.id)
  return null
}

/** مسیر رهگیری فقط از فیلدهای پر شدهٔ journey */
export function formatTrackJourney(j: TrackJourney): string | null {
  const fromN = nonEmptyString(j.from)
  const fromC = nonEmptyString(j.from_code)
  const toN = nonEmptyString(j.to)
  const toC = nonEmptyString(j.to_code)

  const left =
    fromN && fromC ? `${fromN} (${fromC})` : fromN ?? (fromC ? `(${fromC})` : null)
  const right = toN && toC ? `${toN} (${toC})` : toN ?? (toC ? `(${toC})` : null)

  if (left && right) return `${left} → ${right}`
  if (left) return left
  if (right) return right
  return null
}
