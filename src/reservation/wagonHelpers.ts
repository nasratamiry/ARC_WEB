import type { JourneyWagonOption } from './types'

export function getWagonTypeId(row: JourneyWagonOption): number | null {
  const wt = row.wagon_type
  if (typeof wt === 'number' && !Number.isNaN(wt)) return wt
  if (typeof wt === 'string' && /^\d+$/.test(wt)) return Number(wt)
  if (wt && typeof wt === 'object' && 'id' in (wt as object)) {
    const id = (wt as { id: unknown }).id
    if (typeof id === 'number' && !Number.isNaN(id)) return id
    if (typeof id === 'string' && /^\d+$/.test(id)) return Number(id)
  }
  const v = row.wagon_type_id ?? row.id
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v)
  return null
}

export function getWagonLabel(row: JourneyWagonOption): string {
  const wt = row.wagon_type
  let nestedName = ''
  let nestedCode = ''
  if (wt && typeof wt === 'object' && wt !== null) {
    const w = wt as { name?: unknown; code?: unknown }
    nestedName = String(w.name ?? '')
    nestedCode = typeof w.code === 'string' ? w.code.trim() : ''
  }
  const typeName = row.type_name
  const label =
    row.wagon_type_name ??
    (typeof typeName === 'string' && typeName.trim() ? typeName : undefined) ??
    row.name ??
    (nestedName.trim() ? nestedName : undefined)
  if (label != null && String(label).trim() !== '') return String(label)
  if (nestedCode) return nestedCode
  return ''
}

/** برچسب انتخاب واگن فقط از دادهٔ API (نام یا شناسهٔ نوع / ردیف). */
export function wagonSelectLabel(row: JourneyWagonOption): string {
  const label = getWagonLabel(row)
  if (label) return label
  const wt = getWagonTypeId(row)
  if (wt != null) return String(wt)
  if (row.id != null && !Number.isNaN(Number(row.id))) return String(row.id)
  return ''
}

function coerceNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw)
    return Number.isNaN(n) ? null : n
  }
  return null
}

function firstDefinedNumber(row: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const n = coerceNumber(row[k])
    if (n != null) return n
  }
  return null
}

function pricingAmount(row: Record<string, unknown>, usd: boolean): unknown {
  const pr = row.pricing
  if (pr && typeof pr === 'object' && !Array.isArray(pr)) {
    const p = pr as Record<string, unknown>
    if (usd) return p.total_price_usd ?? p.base_price_usd
    return p.total_price_afn ?? p.base_price_afn
  }
  return undefined
}

export function getUsdPrice(row: JourneyWagonOption): string | null {
  const r = row as Record<string, unknown>
  const v =
    row.calculated_price_usd ??
    row.price_usd ??
    pricingAmount(r, true) ??
    r.usd_price ??
    r.priceUSD ??
    r.cost_usd ??
    r.rate_usd
  if (v == null) return null
  return String(v)
}

export function getAfnPrice(row: JourneyWagonOption): string | null {
  const r = row as Record<string, unknown>
  const v =
    row.calculated_price_afn ??
    row.price_afn ??
    pricingAmount(r, false) ??
    r.afn_price ??
    r.priceAFN ??
    r.cost_afn ??
    r.rate_afn
  if (v == null) return null
  return String(v)
}

export function getTotal(row: JourneyWagonOption): number | null {
  const r = row as Record<string, unknown>
  const fromKeys = firstDefinedNumber(r, [
    'total',
    'total_count',
    'total_wagons',
    'wagon_count',
    'wagons_count',
    'inventory_total',
    'wagons_total',
    'fleet_total',
    'fleet_size',
    'pool_size',
    'stock_total',
    'capacity_total',
    'count',
  ])
  if (fromKeys != null) return fromKeys
  const raw: unknown =
    row.total ??
    row.total_count ??
    row.total_wagons ??
    row.wagon_count ??
    r.fleet_total ??
    r.pool_size ??
    r.count
  if (typeof raw === 'number') return Number.isNaN(raw) ? null : raw
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw)
    return Number.isNaN(n) ? null : n
  }
  return null
}

export function getReserved(row: JourneyWagonOption): number | null {
  const r = row as Record<string, unknown>
  const fromKeys = firstDefinedNumber(r, [
    'reserved',
    'reserved_count',
    'booked_count',
    'booked_wagons',
    'reserved_wagons',
    'allocated',
    'in_use',
    'taken',
    'bookings_count',
  ])
  if (fromKeys != null) return fromKeys
  const raw: unknown =
    row.reserved ?? row.reserved_count ?? row.booked_count ?? row.allocated ?? r.in_use ?? r.taken
  if (typeof raw === 'number') return Number.isNaN(raw) ? null : raw
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw)
    return Number.isNaN(n) ? null : n
  }
  return null
}

export function getAvailable(row: JourneyWagonOption): number | null {
  const r = row as Record<string, unknown>
  const t = getTotal(row)
  const res = getReserved(row)
  /** `capacity` عمداً حذف — اغلب ظرفیت کل است نه «آزاد». */
  const explicitAvail = firstDefinedNumber(r, [
    'remaining_wagons',
    'remaining',
    'qty_available',
    'spare_count',
    'open_slots',
    'vacancies',
    'free_wagons',
    'available_count',
    'available_wagons',
    'available',
    'free_count',
  ])
  if (explicitAvail != null) {
    /**
     * بعضی سریالایزرها `available: 0` می‌فرستند در حالی که `total` معتبر است و رزروشده نیامده؛
     * در آن حالت از total−reserved استنتاج می‌کنیم. اگر رزروشده صریحاً >۰ باشد، همان ۰ را نگه می‌داریم.
     */
    if (explicitAvail === 0 && t != null && t > 0 && (res == null || res === 0)) {
      return Math.max(0, t - (res ?? 0))
    }
    return explicitAvail
  }
  if (t != null && res != null) return Math.max(0, t - res)
  if (t != null && res == null) return t
  return null
}

/**
 * جمع «کل واگن» هر نوع برای هدر و خط «Total wagons» (مثل اپ موبایل).
 * اگر فقط available+reserved باشد، همان را جمع می‌کند.
 */
export function sumTotalsAcrossRows(rows: JourneyWagonOption[]): number | null {
  let sum = 0
  let any = false
  for (const row of rows) {
    const t = getTotal(row)
    if (t != null) {
      sum += t
      any = true
      continue
    }
    const a = getAvailable(row)
    const r = getReserved(row)
    if (a != null && r != null) {
      sum += a + r
      any = true
    }
  }
  return any ? sum : null
}

/**
 * هدر مسیر: اگر API جمع «کل واگن» بدهد از آن؛ وگرنه برای journey_availability که فقط `available_count` دارد جمع موجودی.
 */
export function getRouteWagonHeaderSummary(rows: JourneyWagonOption[]): {
  count: number | null
  labelMode: 'total' | 'availableSum'
} {
  const totalSum = sumTotalsAcrossRows(rows)
  if (totalSum != null) return { count: totalSum, labelMode: 'total' }
  const availSum = sumAvailableAcrossRows(rows)
  if (availSum != null) return { count: availSum, labelMode: 'availableSum' }
  return { count: null, labelMode: 'availableSum' }
}

/** برای UI: total / available / reserved با تکمیل reserved از total−available در صورت نیاز */
export function getWagonCountsForDisplay(row: JourneyWagonOption): {
  total: number | null
  available: number | null
  reserved: number | null
} {
  const total = getTotal(row)
  const avail = getAvailable(row)
  let resv = getReserved(row)
  if (resv == null && total != null && avail != null) {
    resv = Math.max(0, total - avail)
  }
  return { total, available: avail, reserved: resv }
}

/** جمع واگن‌های آزاد روی همهٔ ردیف‌های یک journey (از پاسخ API). */
export function sumAvailableAcrossRows(rows: JourneyWagonOption[]): number | null {
  let sum = 0
  let any = false
  for (const row of rows) {
    const a = getAvailable(row)
    if (a != null) {
      sum += a
      any = true
    }
  }
  return any ? sum : null
}

/**
 * ردیف قابل انتخاب برای POST است اگر نوع واگن معلوم باشد.
 * اگر ظرفیت آزاد صریحاً ۰ است رد می‌شود؛ اگر API ظرفیت نفرستاد، اجازهٔ تلاش روی بک‌اند می‌دهیم.
 */
export function isWagonRowBookable(row: JourneyWagonOption): boolean {
  if (getWagonTypeId(row) == null) return false
  const a = getAvailable(row)
  if (a === 0) return false
  return a == null || a > 0
}

/** برای نمایش برچسب «موجود نیست» در کنار قیمت (مثل ماک‌آپ) */
export function showNotAvailableLabel(row: JourneyWagonOption): boolean {
  const usd = getUsdPrice(row)
  const afn = getAfnPrice(row)
  const noPrice = usd == null && afn == null
  if (row.not_available === true || row.is_available === false) return true
  return noPrice
}
