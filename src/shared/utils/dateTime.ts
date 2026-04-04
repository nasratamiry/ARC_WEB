type DateInput = string | number | Date | null | undefined

const toDate = (value: DateInput): Date | null => {
  if (value == null) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatGregorianDateTime = (
  value: DateInput,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = toDate(value)
  if (!date) return '—'
  const formatOptions: Intl.DateTimeFormatOptions = {
    calendar: 'gregory',
    ...(options ?? {}),
  }
  return new Intl.DateTimeFormat(locale || undefined, formatOptions).format(date)
}

export const formatGregorianTime = (value: DateInput, locale?: string): string =>
  formatGregorianDateTime(value, locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatGregorianDate = (
  value: DateInput,
  locale?: string,
  month: 'short' | 'long' | 'numeric' = 'short',
): string =>
  formatGregorianDateTime(value, locale, {
    year: 'numeric',
    month,
    day: '2-digit',
  })
