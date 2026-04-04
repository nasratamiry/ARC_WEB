/** Pull common list shapes from DRF / custom APIs */
export function normalizeList<T>(data: unknown): T[] {
  if (data == null) return []
  if (Array.isArray(data)) return data as T[]
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>
    const keys = ['results', 'data', 'items', 'records', 'destinations', 'stations', 'rows']
    for (const k of keys) {
      const v = o[k]
      if (Array.isArray(v)) return v as T[]
    }
  }
  return []
}

export function pickNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (!Number.isNaN(n)) return n
  }
  return fallback
}

export function pickOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (!Number.isNaN(n)) return n
  }
  return undefined
}

export function pickFirstNumberFromRecord(r: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = pickOptionalNumber(r[k])
    if (v !== undefined) return v
  }
  return undefined
}
