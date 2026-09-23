import type { z } from 'zod'

/**
 * i18next uses `tk` for Turkmen; this API uses `tm`. Both keys live here and
 * are converted in the mappers — `tm` never reaches a component.
 */
export const API_LANG = { tk: 'tm', ru: 'ru' } as const

/**
 * Validates a response at the service-layer boundary. The backend is still
 * changing, so a mismatch warns in dev but never crashes the page.
 */
export function parseDto<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  if (import.meta.env.DEV) {
    console.warn(`[api] ${label}: response did not match the expected schema`, result.error.issues, data)
  }
  return data as T
}
