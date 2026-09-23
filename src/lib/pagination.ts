/** The API works in limit/offset; the UI works in pages. Convert in one place. */

export const DEFAULT_LIMIT = 10

/** The API rejects anything larger: {"error":"limit must be less than or equal to 100"}. */
export const MAX_LIMIT = 100

export const clampLimit = (limit: number) => Math.min(Math.max(1, limit), MAX_LIMIT)

export const toOffset = (page: number, limit: number) => Math.max(0, (page - 1) * limit)

export const toTotalPages = (total: number, limit: number) => Math.max(1, Math.ceil(total / Math.max(1, limit)))

/**
 * Some endpoints (banners, clients) ignore limit/offset. If the server returned
 * more rows than we asked for, it paginates nothing — slice locally instead.
 * TODO(api): drop once every list endpoint supports limit/offset.
 */
export function ensurePageSlice<T>(items: T[], total: number, page: number, limit: number): { items: T[]; total: number } {
  if (items.length > limit) {
    const start = toOffset(page, limit)
    return { items: items.slice(start, start + limit), total: total || items.length }
  }
  return { items, total }
}
