/**
 * Turkmenistan mobile numbers.
 * Stored / sent to the API as "+993XXXXXXXX" (8 local digits),
 * displayed as "+993 6X XX XX XX".
 */
export const PHONE_PREFIX = '+993'
export const PHONE_REGEX = /^\+993[67]\d{7}$/

/** Extracts up to 8 local digits from anything the user typed or pasted. */
export function localDigits(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('993')) digits = digits.slice(3)
  return digits.slice(0, 8)
}

/** Raw input → stored value ("" when nothing typed). */
export function normalizePhone(input: string): string {
  const digits = localDigits(input)
  return digits ? `${PHONE_PREFIX}${digits}` : ''
}

/** Stored value (possibly partial) → "+993 64 75 68 67" */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return ''
  const d = localDigits(value)
  const groups = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean)
  return [PHONE_PREFIX, ...groups].join(' ')
}
