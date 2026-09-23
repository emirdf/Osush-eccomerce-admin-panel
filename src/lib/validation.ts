/*
 * Shared zod building blocks. Messages are translation keys; <Field> renders
 * them through t(), so schemas stay language-agnostic.
 */
import { z } from 'zod'
import { PHONE_REGEX } from './phone'
import { parseAmount } from './utils'

export const imageSchema = z.object({
  id: z.string(),
  url: z.string(),
  file: z.instanceof(File).optional(),
})

export const requiredString = (max = 255) =>
  z.string().trim().min(1, 'validation.required').max(max, 'validation.tooLong')

export const localizedDraft = z.object({ tk: z.string(), ru: z.string() })

export const localizedRequired = z.object({
  tk: requiredString(120),
  ru: requiredString(120),
})

/** For repeatable bilingual rows: an entirely empty row is allowed (dropped on submit); a partial row is not. */
export function requireAllWhenAny(ctx: z.RefinementCtx, cells: { path: (string | number)[]; value: string }[]) {
  const filled = cells.filter((c) => c.value.trim())
  if (filled.length === 0 || filled.length === cells.length) return
  for (const cell of cells) {
    if (!cell.value.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: cell.path, message: 'validation.required' })
  }
}

/** Money / quantity typed as text ("20 100", "20.000", "19,99"). */
export function amountString({ required, integer, positive }: { required: boolean; integer?: boolean; positive?: boolean }) {
  return z.string().superRefine((raw, ctx) => {
    const add = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message })
    if (!raw.trim()) {
      if (required) add('validation.required')
      return
    }
    const value = parseAmount(raw)
    if (Number.isNaN(value)) return add('validation.number')
    if (integer && !Number.isInteger(value)) return add('validation.integer')
    if (positive && value <= 0) return add('validation.positive')
    if (value < 0) add('validation.nonNegative')
  })
}

export const phoneSchema = z.string().regex(PHONE_REGEX, 'validation.phone')

export const optionalPhoneSchema = z.string().refine((v) => !v || PHONE_REGEX.test(v), 'validation.phone')

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.includes('.')
  } catch {
    return false
  }
}

export const optionalHttpsUrl = z.string().trim().refine((v) => !v || isHttpsUrl(v), 'validation.httpsUrl')
