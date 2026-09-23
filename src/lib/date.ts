/**
 * The API sends and expects `DD-MM-YYYY`. Inside the app dates are ISO
 * `YYYY-MM-DD` strings (what <DatePicker> works with); display formatting to
 * `DD.MM.YYYY` lives in lib/format.ts. Convert only at the mapper boundary.
 */

const API_DATE = /^(\d{2})-(\d{2})-(\d{4})$/
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/

/** API "15-09-2026" → "2026-09-15" ("" when missing or unparseable). */
export function parseApiDate(value?: string | null): string {
  if (!value) return ''
  const trimmed = value.trim()
  const api = API_DATE.exec(trimmed)
  if (api) return `${api[3]}-${api[2]}-${api[1]}`
  // Tolerate ISO in case the backend changes format.
  const iso = ISO_DATE.exec(trimmed)
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : ''
}

/** "2026-09-15" → API "15-09-2026" ("" when missing). */
export function formatApiDate(value?: string | null): string {
  if (!value) return ''
  const iso = ISO_DATE.exec(value.trim())
  if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`
  const api = API_DATE.exec(value.trim())
  return api ? value.trim() : ''
}

/** API date → Date (local midnight), or null. */
export function apiDateToDate(value?: string | null): Date | null {
  const iso = parseApiDate(value)
  if (!iso) return null
  const date = new Date(`${iso}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}
