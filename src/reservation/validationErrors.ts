import type { TFunction } from 'i18next'

/** Map API / serializer keys to friendly reservation labels (i18n keys under reservation.*). */
const FIELD_I18N_KEY: Record<string, string> = {
  origin_station: 'fieldOriginStation',
  destination_station: 'fieldDestinationStation',
  wagon_type: 'fieldWagonType',
  number_of_wagons: 'fieldNumberOfWagons',
  cargo_description: 'fieldCargoDescription',
  cargo_weight: 'fieldCargoWeight',
  special_requirements: 'fieldSpecialRequirements',
  notes: 'fieldNotes',
}

function baseFieldKey(rawKey: string): string {
  const i = rawKey.indexOf('.')
  return i >= 0 ? rawKey.slice(0, i) : rawKey
}

/** Build a single user-visible string from DRF-style field errors. */
export function formatReservationApiValidation(details: Record<string, string[]>, t: TFunction): string {
  const parts: string[] = []

  for (const [rawKey, msgs] of Object.entries(details)) {
    if (!msgs?.length) continue
    const bk = baseFieldKey(rawKey)
    if (bk === 'non_field_errors' || rawKey === 'non_field_errors') {
      for (const m of msgs) {
        if (typeof m === 'string' && m.trim()) parts.push(m.trim())
      }
      continue
    }
    const i18nLeaf = FIELD_I18N_KEY[bk] ?? FIELD_I18N_KEY[rawKey]
    const label = i18nLeaf ? String(t(`reservation.${i18nLeaf}`)) : bk.replace(/_/g, ' ')
    const msg = String(msgs[0] ?? '').trim()
    const lower = msg.toLowerCase()
    if (!msg || lower === 'this field is required.' || (lower.includes('required') && lower.includes('field'))) {
      parts.push(String(t('reservation.fieldRequiredNamed', { field: label })))
    } else {
      parts.push(`${label}: ${msg}`)
    }
  }

  return parts.length ? parts.join(' · ') : String(t('reservation.createFailed'))
}
