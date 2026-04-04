import type { DestinationStation, Station } from './types'

function dedupedLocality(parts: (string | undefined)[]): string {
  const cleaned = parts.map((p) => (p == null ? '' : String(p).trim())).filter(Boolean)
  const uniq: string[] = []
  for (const p of cleaned) {
    if (!uniq.some((u) => u.toLowerCase() === p.toLowerCase())) uniq.push(p)
  }
  return uniq.join(', ')
}

/** README §3.2.1 — city, province_or_state, country */
export function formatStationLocality(s: Station): string {
  const line = dedupedLocality([s.city, s.province_or_state, s.country])
  if (line) return line
  const loc = s.location
  if (typeof loc === 'string' && loc.trim()) return loc.trim()
  const addr = s.address
  if (typeof addr === 'string' && addr.trim()) return addr.trim()
  return ''
}

export function formatDestinationLocality(d: DestinationStation): string {
  return dedupedLocality([d.city, d.province_or_state, d.country])
}
