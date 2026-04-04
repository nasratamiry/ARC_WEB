import api from '../services/api'
import { normalizeList, pickFirstNumberFromRecord } from './apiHelpers'
import { getWagonLabel, getWagonTypeId } from './wagonHelpers'
import type { DestinationStation, JourneyWagonOption, Station, WagonType } from './types'

const DEST_NEST_KEYS = [
  'destinations',
  'allowed_destinations',
  'destination_stations',
  'reachable_stations',
  'reachable_destinations',
  'items',
  'data',
  'results',
] as const

/** Any array of destination-like objects inside a JSON root */
export function coalesceDestinationList(data: unknown): unknown[] {
  const fromNorm = normalizeList<unknown>(data)
  if (fromNorm.length) return fromNorm
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    for (const k of DEST_NEST_KEYS) {
      const v = o[k]
      if (Array.isArray(v)) return v
    }
  }
  return []
}

function parsePositiveInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.trunc(v)
  if (typeof v === 'string' && /^\d+$/.test(v)) {
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  return null
}

export function normalizeDestinationItem(raw: unknown): DestinationStation | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  const nested = (r.destination_station ?? r.destination ?? r.station) as Record<string, unknown> | undefined

  const nestedStationId =
    nested && typeof nested === 'object' ? parsePositiveInt(nested.id ?? nested.pk) : null
  const flatStationId = parsePositiveInt(
    r.destination_station_id ?? r.station_id ?? r.to_station_id ?? r.target_station_id,
  )
  const relationId = parsePositiveInt(r.id ?? r.pk)

  /** برای journey_availability و رزرو باید id همان ایستگاه مقصد باشد، نه pk ردیف رابطه. */
  const idNum = nestedStationId ?? flatStationId ?? relationId
  if (idNum == null) return null

  let name: unknown = r.name
  let code: unknown = r.code
  let city: unknown = r.city
  let country: unknown = r.country

  if (nested && typeof nested === 'object') {
    name = name ?? nested.name
    code = code ?? nested.code
    city = city ?? nested.city
    country = country ?? nested.country
  }

  const prov = r.province_or_state ?? (nested && typeof nested === 'object' ? nested.province_or_state : undefined)
  const dest: DestinationStation = {
    id: idNum,
    name: typeof name === 'string' ? name : undefined,
    code: typeof code === 'string' ? code : undefined,
    city: typeof city === 'string' ? city : undefined,
    country: typeof country === 'string' ? country : undefined,
    province_or_state: typeof prov === 'string' && prov.trim() ? prov.trim() : undefined,
  }
  if (relationId != null && relationId !== idNum) dest.relation_id = relationId

  const destAvail = pickFirstNumberFromRecord(r, [
    'available_wagons',
    'available_wagon_count',
    'wagons_available',
    'free_wagons',
  ])
  if (destAvail != null) dest.available_wagons_at_route = destAvail

  return dest
}

/** README: ترتیب آرایهٔ `destinations` حفظ شود؛ فقط id تکراری حذف */
function dedupeDestinations(list: DestinationStation[]): DestinationStation[] {
  const seen = new Set<number>()
  const out: DestinationStation[] = []
  for (const d of list) {
    if (seen.has(d.id)) continue
    seen.add(d.id)
    out.push(d)
  }
  return out
}

export function normalizeStationFromApi(raw: unknown): Station | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  const idNum = parsePositiveInt(r.id ?? r.pk)
  if (idNum == null) return null

  let allowed = pickFirstNumberFromRecord(r, [
    'allowed_destinations_count',
    'destinations_count',
    'destination_count',
    'reachable_destinations_count',
    'num_destinations',
  ])
  if (allowed == null && Array.isArray(r.allowed_destinations)) {
    allowed = r.allowed_destinations.length
  }
  const avail = pickFirstNumberFromRecord(r, [
    'available_wagons',
    'available_wagons_count',
    'free_wagons',
    'wagons_available',
    'total_available_wagons',
    'vacant_wagons',
  ])

  const base = { ...r } as Station
  base.id = idNum
  if (allowed != null) base.allowed_destinations_count = allowed
  if (avail != null) base.available_wagons = avail
  return base
}

function mapDestinationsFromPayload(data: unknown): DestinationStation[] {
  const rawList = coalesceDestinationList(data)
  return dedupeDestinations(
    rawList.map(normalizeDestinationItem).filter((x): x is DestinationStation => x != null),
  )
}

/** WEB_API_GUIDE §6: مقاصد از `allowed_destinations` روی پاسخ GET `stations/{id}/` (مثل اپ موبایل). */
export function destinationsFromStationDetail(station: Station | null): DestinationStation[] {
  if (!station) return []
  const r = station as Record<string, unknown>
  if (Array.isArray(r.allowed_destinations))
    return mapDestinationsFromPayload({ allowed_destinations: r.allowed_destinations })
  return []
}

/**
 * README `GET .../destinations/` → `{ station, destinations: [...] }` — حتی `[]` معتبر است.
 * قبلاً فقط وقتی `mapped.length > 0` برمی‌گشتیم؛ آرایهٔ خالی اشتباهی به embed ایستگاه می‌رفت و دادهٔ غیردقیق می‌شد.
 */
function payloadHasExplicitDestinationList(data: unknown): boolean {
  if (Array.isArray(data)) return true
  if (data == null || typeof data !== 'object') return false
  const o = data as Record<string, unknown>
  return Array.isArray(o.destinations) || Array.isArray(o.allowed_destinations)
}

async function getWithFallback<T>(corePath: string, cargoPath: string): Promise<T> {
  try {
    const { data } = await api.get<T>(corePath)
    return data
  } catch {
    const { data } = await api.get<T>(cargoPath)
    return data
  }
}

export async function fetchStations(): Promise<Station[]> {
  try {
    const { data } = await api.get<unknown>('core/stations/')
    return normalizeList<unknown>(data)
      .map((raw) => normalizeStationFromApi(raw))
      .filter((s): s is Station => s != null && s.id > 0)
  } catch {
    const { data } = await api.get<unknown>('cargo/stations/')
    return normalizeList<unknown>(data)
      .map((raw) => normalizeStationFromApi(raw))
      .filter((s): s is Station => s != null && s.id > 0)
  }
}

export async function fetchStation(id: number): Promise<Station> {
  const data = await getWithFallback<unknown>(`core/stations/${id}/`, `cargo/stations/${id}/`)
  const s = normalizeStationFromApi(data)
  if (!s || s.id <= 0) throw new Error('Invalid station payload')
  return s
}

export async function fetchDestinations(stationId: number): Promise<DestinationStation[]> {
  const paths: [string, string][] = [
    [`core/stations/${stationId}/destinations/`, `cargo/stations/${stationId}/destinations/`],
  ]

  for (const [coreP, cargoP] of paths) {
    try {
      const data = await getWithFallback<unknown>(coreP, cargoP)
      const mapped = mapDestinationsFromPayload(data)
      if (mapped.length > 0) return mapped
      if (payloadHasExplicitDestinationList(data)) return mapped
    } catch {
      /* try station embed */
    }
  }

  try {
    const detail = await getWithFallback<unknown>(`core/stations/${stationId}/`, `cargo/stations/${stationId}/`)
    const mapped = mapDestinationsFromPayload(detail)
    if (mapped.length > 0) return mapped
  } catch {
    // ignore
  }

  return []
}

export async function fetchJourneyAvailability(originId: number, destinationId: number): Promise<unknown> {
  const params = { origin: originId, destination: destinationId }
  try {
    const { data } = await api.get<unknown>('core/stations/journey_availability/', { params })
    /** هر ۲۰۰ روی core معتبر است — از جمله `wagon_types: []`؛ قبلاً به cargo می‌افتادیم و پاسخ core نادیده گرفته می‌شد. */
    return data
  } catch {
    /* core خطا → cargo */
  }
  try {
    const { data } = await api.get<unknown>('cargo/stations/journey_availability/', { params })
    return data
  } catch {
    throw new Error('journey_availability failed')
  }
}

/** نام نمایشی نوع واگن از هر شکل رایج سریالایزر (هم‌تراز با موبایل) */
export function extractWagonTypeDisplayName(data: unknown): string | undefined {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return undefined
  const o = data as Record<string, unknown>
  const keys = [
    'wagon_type_name',
    'type_name',
    'wagon_name',
    'name',
    'display_name',
    'title',
    'label',
  ] as const
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  const nested = o.wagon_type ?? o.wagon ?? o.type
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return extractWagonTypeDisplayName(nested)
  }
  const code = o.code
  if (typeof code === 'string' && code.trim()) return code.trim()
  return undefined
}

const WT_COUNT_KEYS = [
  'available_count',
  'available',
  'available_wagons',
  'remaining',
  'remaining_wagons',
  'free_wagons',
  'total_count',
  'total',
  'total_wagons',
  'reserved_count',
  'reserved',
  'booked_count',
  'price_usd',
  'price_afn',
  'calculated_price_usd',
  'calculated_price_afn',
] as const

function flattenPricingOntoRow(row: Record<string, unknown>, pricing: unknown): void {
  if (pricing == null || typeof pricing !== 'object' || Array.isArray(pricing)) return
  const p = pricing as Record<string, unknown>
  if (row.price_usd == null) {
    const u = p.total_price_usd ?? p.base_price_usd
    if (u != null) row.price_usd = u
  }
  if (row.price_afn == null) {
    const a = p.total_price_afn ?? p.base_price_afn
    if (a != null) row.price_afn = a
  }
}

/** Flatten one API row (nested wagon_type / availability → README 3.2.1) */
export function normalizeJourneyRow(item: Record<string, unknown>): JourneyWagonOption {
  const row: Record<string, unknown> = { ...item }

  /** README GET /wagon-types/: type_name روی همان آبجکت */
  if (typeof item.type_name === 'string' && item.type_name.trim()) {
    row.wagon_type_name = (row.wagon_type_name as string | undefined) ?? item.type_name.trim()
  }

  flattenPricingOntoRow(row, item.pricing)

  /** شناسهٔ نوع واگن وقتی API فقط عدد می‌فرستد (README journey: wagon_type_id) */
  const wtRaw = item.wagon_type ?? item.wagon ?? item.wagon_type_id
  if (typeof wtRaw === 'number' && Number.isFinite(wtRaw)) {
    row.wagon_type_id = (row.wagon_type_id as number | undefined) ?? wtRaw
    row.wagon_type = wtRaw
  } else if (typeof wtRaw === 'string' && /^\d+$/.test(wtRaw)) {
    const n = Number(wtRaw)
    row.wagon_type_id = (row.wagon_type_id as number | undefined) ?? n
    row.wagon_type = n
  }

  if (typeof item.wagon_type_name === 'string' && item.wagon_type_name.trim()) {
    row.wagon_type_name = item.wagon_type_name.trim()
  }

  const wt = item.wagon_type
  if (wt && typeof wt === 'object' && !Array.isArray(wt)) {
    const w = wt as Record<string, unknown>
    if (typeof w.id === 'number') row.wagon_type_id = (row.wagon_type_id as number | undefined) ?? w.id
    if (typeof w.id === 'string' && /^\d+$/.test(w.id))
      row.wagon_type_id = (row.wagon_type_id as number | undefined) ?? Number(w.id)
    const wn = extractWagonTypeDisplayName(w) ?? (typeof w.name === 'string' ? w.name : undefined)
    if (typeof wn === 'string' && wn.trim())
      row.wagon_type_name = (row.wagon_type_name as string | undefined) ?? wn.trim()
    if (typeof w.code === 'string' && !row.name) row.name = w.code
    for (const k of WT_COUNT_KEYS) {
      if (row[k] == null && w[k] != null) row[k] = w[k]
    }
  }

  const av = item.availability
  if (av && typeof av === 'object' && !Array.isArray(av)) {
    const a = av as Record<string, unknown>
    for (const k of WT_COUNT_KEYS) {
      if (row[k] == null && a[k] != null) row[k] = a[k]
    }
  }

  if (typeof item.wagon_type_id === 'number' && row.wagon_type_id == null) {
    row.wagon_type_id = item.wagon_type_id
  }
  if (typeof item.wagon_type_id === 'string' && /^\d+$/.test(item.wagon_type_id) && row.wagon_type_id == null) {
    row.wagon_type_id = Number(item.wagon_type_id)
  }

  /** README journey: available_count → برای getAvailable */
  if (row.available == null && item.available_count != null) {
    const ac = item.available_count
    if (typeof ac === 'number' && !Number.isNaN(ac)) row.available = ac
    else if (typeof ac === 'string' && ac.trim() !== '' && !Number.isNaN(Number(ac))) row.available = Number(ac)
  }

  flattenPricingOntoRow(row, row.pricing)

  return row as JourneyWagonOption
}

/** Parse journey_availability into selectable wagon rows (several backend shapes). */
export function parseJourneyWagonOptions(raw: unknown): JourneyWagonOption[] {
  if (raw == null) return []

  const collectArrays = (o: Record<string, unknown>): unknown[] => {
    const wa = o.wagon_availability
    if (wa && typeof wa === 'object' && !Array.isArray(wa)) {
      const wao = wa as Record<string, unknown>
      const byType = wao.wagon_availability_by_type
      if (Array.isArray(byType)) return byType
      const wt = wao.wagon_types
      if (Array.isArray(wt)) return wt
    }
    const keys = [
      'wagon_types',
      'wagon_types_availability',
      'options',
      'results',
      'availability',
      'journeys',
      'items',
      'data',
      'wagons',
      'rows',
    ]
    for (const k of keys) {
      const v = o[k]
      if (Array.isArray(v)) return v
    }
    for (const v of Object.values(o)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null && !Array.isArray(v[0])) {
        return v
      }
    }
    return []
  }

  let list: unknown[] = []
  if (Array.isArray(raw)) {
    list = raw
  } else if (typeof raw === 'object' && raw !== null) {
    list = collectArrays(raw as Record<string, unknown>)
  }

  const NEST_WAGON_KEYS = ['wagon_types', 'types', 'options', 'wagons', 'lines'] as const

  const expanded: unknown[] = []
  for (const item of list) {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) continue
    const o = item as Record<string, unknown>
    let nested: unknown[] | null = null
    for (const k of NEST_WAGON_KEYS) {
      const v = o[k]
      if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] !== null && !Array.isArray(v[0])) {
        nested = v
        break
      }
    }
    if (nested) {
      for (const w of nested) {
        if (w && typeof w === 'object' && !Array.isArray(w))
          expanded.push({ ...o, ...(w as Record<string, unknown>) })
      }
    } else {
      expanded.push(item)
    }
  }

  return expanded
    .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object' && !Array.isArray(x))
    .map((item) => normalizeJourneyRow(item))
}

/**
 * WEB_API_GUIDE §1: `wagon_availability.wagon_availability_by_type` روی GET `stations/{id}/`.
 * قیمت برای مسیر با `hydrateStationWagonRowsForRoute` + `wagon-types/{id}/?...` پر می‌شود.
 */
export function parseStationDetailWagonRows(station: unknown): JourneyWagonOption[] {
  if (station == null || typeof station !== 'object' || Array.isArray(station)) return []
  const s = station as Record<string, unknown>
  const wa = s.wagon_availability
  if (wa == null || typeof wa !== 'object' || Array.isArray(wa)) return []
  const w = wa as Record<string, unknown>
  const byType = w.wagon_availability_by_type
  if (!Array.isArray(byType) || byType.length === 0) return []
  return parseJourneyWagonOptions({ wagon_availability: { wagon_availability_by_type: byType } })
}

/** WEB_API_GUIDE §6: قیمت نوع واگن برای مبدا/مقصد (همان فلوی موبایل). */
export async function hydrateStationWagonRowsForRoute(
  rows: JourneyWagonOption[],
  origin_station: number,
  destination_station: number,
): Promise<JourneyWagonOption[]> {
  return enrichJourneyRowsWithWagonTypeDetail(rows, origin_station, destination_station)
}

/** README: optional `?origin_station=&destination_station=` برای pricing روی هر آیتم */
export async function fetchWagonTypes(opts?: {
  origin_station?: number
  destination_station?: number
}): Promise<WagonType[]> {
  const params =
    opts?.origin_station != null && opts?.destination_station != null
      ? { origin_station: opts.origin_station, destination_station: opts.destination_station }
      : undefined
  try {
    const { data } = await api.get<unknown>('core/wagon-types/', { params })
    return normalizeList<WagonType>(data)
  } catch {
    const { data } = await api.get<unknown>('cargo/wagon-types/', { params })
    return normalizeList<WagonType>(data)
  }
}

/**
 * README: جزئیات نوع واگن + دسترسی برای مسیر مشخص با query.
 * `GET /core/wagon-types/{id}/?origin_station=&destination_station=`
 */
export async function fetchWagonTypeForJourney(
  wagonTypeId: number,
  origin_station: number,
  destination_station: number,
): Promise<unknown> {
  const params = { origin_station, destination_station }
  try {
    const { data } = await api.get<unknown>(`core/wagon-types/${wagonTypeId}/`, { params })
    return data
  } catch {
    const { data } = await api.get<unknown>(`cargo/wagon-types/${wagonTypeId}/`, { params })
    return data
  }
}

/**
 * فیلدهای معن‌دار از journey (مسیر) روی patch جزئیات/کاتالوگ می‌نشینند تا
 * نام و تعداد مخصوص همان مسیر از بک‌اند — نه لیست سراسری نوع واگن — حفظ شود.
 */
function pickMeaningfulJourneyFields(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    if (v === undefined || v === null) continue
    if (typeof v === 'string' && !v.trim()) continue
    if (typeof v === 'number' && Number.isNaN(v)) continue
    out[k] = v
  }
  return out
}

/** patch = غنی‌سازی (قیمت، فیلدهای خالی)؛ ردیف journey هر جا مقدار دارد برنده است */
function mergeEnrichmentPreferringJourney(
  patch: Record<string, unknown>,
  row: Record<string, unknown>,
  wagonTypeId: number,
): Record<string, unknown> {
  return {
    ...patch,
    ...pickMeaningfulJourneyFields(row),
    wagon_type_id: wagonTypeId,
  }
}

/**
 * برای فرم ایجاد رزرو: بعد از journey_availability، همان نوع واگن را با
 * `GET /core/wagon-types/{id}/?origin_station=&destination_station=` می‌گیریم و ردیف را ادغام می‌کنیم
 * تا قیمت/موجودی با سریالایزر رسمی بک‌اند هم‌خوان باشد.
 */
export async function enrichJourneyRowsWithWagonTypeDetail(
  rows: JourneyWagonOption[],
  origin_station: number,
  destination_station: number,
): Promise<JourneyWagonOption[]> {
  if (!rows.length) return rows
  const ids = [
    ...new Set(
      rows.map((r) => getWagonTypeId(r)).filter((x): x is number => x != null && !Number.isNaN(x)),
    ),
  ]
  if (!ids.length) return rows

  let catalog: WagonType[] = []
  try {
    catalog = await fetchWagonTypes({ origin_station, destination_station })
  } catch {
    catalog = []
  }
  const catalogById = new Map(catalog.map((w) => [w.id, w]))

  const catalogLabel = (w: WagonType | undefined): string | undefined => {
    if (!w) return undefined
    const c = w as Record<string, unknown>
    return (
      (typeof w.name === 'string' && w.name.trim() ? w.name.trim() : undefined) ??
      (typeof c.type_name === 'string' && c.type_name.toString().trim() ? c.type_name.toString().trim() : undefined) ??
      (typeof w.code === 'string' && w.code.trim() ? w.code.trim() : undefined)
    )
  }

  const patches = await Promise.all(
    ids.map(async (wid) => {
      try {
        const data = await fetchWagonTypeForJourney(wid, origin_station, destination_station)
        const fromDetail = extractWagonTypeDisplayName(data)
        const fromCatalog = catalogById.get(wid)
        const catalogName = catalogLabel(fromCatalog)
        const resolvedName = fromDetail ?? catalogName

        let patch = wagonTypeDetailToJourneyOptions(data, {
          id: wid,
          name: resolvedName ?? '',
        } as WagonType)[0] as JourneyWagonOption | undefined

        if (patch && resolvedName && !getWagonLabel(patch).trim()) {
          patch = {
            ...patch,
            wagon_type_name: resolvedName,
            name: resolvedName,
          }
        }
        if (!patch && resolvedName) {
          patch = normalizeJourneyRow({
            wagon_type_id: wid,
            wagon_type_name: resolvedName,
            name: resolvedName,
            wagon_type: fromCatalog ?? (typeof data === 'object' && data ? data : { id: wid, name: resolvedName }),
          } as Record<string, unknown>)
        }
        if (patch && resolvedName && !patch.wagon_type_name) {
          patch = { ...patch, wagon_type_name: resolvedName }
        }
        if (!patch) {
          const meta = catalogById.get(wid)
          if (meta) {
            patch = normalizeJourneyRow({
              wagon_type_id: wid,
              wagon_type_name: catalogName ?? undefined,
              wagon_type: meta,
              name: catalogName,
            } as Record<string, unknown>)
          }
        }
        return [wid, patch ?? null] as const
      } catch {
        const meta = catalogById.get(wid)
        if (meta) {
          const nm = catalogLabel(meta)
          if (nm) {
            return [
              wid,
              normalizeJourneyRow({
                wagon_type_id: wid,
                wagon_type_name: nm,
                name: nm,
                wagon_type: meta,
              } as Record<string, unknown>),
            ] as const
          }
        }
        return [wid, null] as const
      }
    }),
  )
  const byId = new Map<number, JourneyWagonOption | null>(patches)

  return rows.map((row) => {
    const id = getWagonTypeId(row)
    if (id == null) return row
    const patch = byId.get(id)
    if (!patch) return row
    return normalizeJourneyRow(
      mergeEnrichmentPreferringJourney(patch as Record<string, unknown>, row as Record<string, unknown>, id),
    ) as JourneyWagonOption
  })
}

export async function parseAndEnrichJourney(
  raw: unknown,
  origin_station: number,
  destination_station: number,
): Promise<JourneyWagonOption[]> {
  let options = parseJourneyWagonOptions(raw)
  if (options.length > 0) {
    try {
      options = await enrichJourneyRowsWithWagonTypeDetail(options, origin_station, destination_station)
    } catch {
      /* journey خام */
    }
  }
  return options
}

/** اگر پاسخ شبیه journey_availability نبود، یک ردیف Journey از آبجکت تکی بساز. */
export function wagonTypeDetailToJourneyOptions(data: unknown, wt: WagonType): JourneyWagonOption[] {
  const parsed = parseJourneyWagonOptions(data)
  if (parsed.length) return parsed
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const o = data as Record<string, unknown>
    const wtr = wt as Record<string, unknown>
    const nm =
      extractWagonTypeDisplayName(o) ??
      (typeof wt.name === 'string' && wt.name ? wt.name : undefined) ??
      (typeof wtr.type_name === 'string' && wtr.type_name.trim() ? wtr.type_name.trim() : undefined) ??
      (typeof wt.code === 'string' ? wt.code : undefined)
    return [
      normalizeJourneyRow({
        ...o,
        wagon_type_id: typeof o.id === 'number' ? o.id : wt.id,
        wagon_type_name: nm,
        name: nm,
        wagon_type: o,
      }),
    ]
  }
  return []
}

export async function fetchWagonTypeAvailability(wagonTypeId: number): Promise<unknown> {
  const { data } = await api.get<unknown>(`core/wagon-types/${wagonTypeId}/availability/`)
  return data
}
