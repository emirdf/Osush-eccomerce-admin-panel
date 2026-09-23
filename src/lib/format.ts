/** 25000 → "25.000", 1234.5 → "1.234,50" */
export function formatNumber(value: number): string {
  const rounded = Math.round(Math.abs(value) * 100) / 100
  const [int, dec] = String(rounded).split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${value < 0 ? '-' : ''}${grouped}${dec ? `,${dec.padEnd(2, '0')}` : ''}`
}

/** 25000 → "25.000 TMT" */
export function formatMoney(value: number): string {
  return `${formatNumber(value)} TMT`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Parses "YYYY-MM-DD" or a full ISO timestamp into a local Date. */
export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Display format used in both locales: DD.MM.YYYY */
export function formatDate(value: string | Date | null | undefined): string {
  const date = parseDate(value)
  if (!date) return '—'
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

/** Date → "YYYY-MM-DD" (API date format) */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** "Amantajowa Nuraana" — surname first, as in the reference design. */
export function fullName(person: { first_name: string; last_name: string }): string {
  return `${person.last_name} ${person.first_name}`.trim()
}
