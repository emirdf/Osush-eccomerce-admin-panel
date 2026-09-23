import { parseApiDate } from '@/lib/date'
import { resolveMediaUrl } from '@/lib/media'
import type { AttributesDto, ProductDetailDto, ProductListItemDto } from '../types/product.dto'
import type { AttributeRow, Product, ProductListItem, ProductPayload } from '../types/models'
import { fromLocalized, toLocalized } from './localized'

/* ─── attributes ⇄ rows ─────────────────────────────────────────────────────
 * API:  { tm: { "<key>": "<value>" }, ru: { "<key>": "<value>" } }
 * UI:   [{ keyTk, valueTk, keyRu, valueRu }]
 * The two languages can hold a different number of entries and their keys are
 * unrelated strings, so index order is the only available pairing.
 * ------------------------------------------------------------------------- */

const entriesOf = (map: Record<string, string | null | undefined> | null | undefined): [string, string][] =>
  Object.entries(map ?? {}).map(([key, value]) => [key, value ?? ''])

/** API → editable rows. Pads the shorter language; never drops an entry. */
export function attributesToRows(attributes: AttributesDto | null | undefined): AttributeRow[] {
  const tm = entriesOf(attributes?.tm)
  const ru = entriesOf(attributes?.ru)
  const length = Math.max(tm.length, ru.length)
  return Array.from({ length }, (_, i) => ({
    keyTk: tm[i]?.[0] ?? '',
    valueTk: tm[i]?.[1] ?? '',
    keyRu: ru[i]?.[0] ?? '',
    valueRu: ru[i]?.[1] ?? '',
  }))
}

/** Rows → API. Empty rows are dropped, keys trimmed; a later duplicate key wins. */
export function rowsToAttributes(rows: AttributeRow[]): { tm: Record<string, string>; ru: Record<string, string> } {
  const tm: Record<string, string> = {}
  const ru: Record<string, string> = {}
  for (const row of rows) {
    const keyTk = row.keyTk.trim()
    const keyRu = row.keyRu.trim()
    if (keyTk) tm[keyTk] = row.valueTk.trim()
    if (keyRu) ru[keyRu] = row.valueRu.trim()
  }
  return { tm, ru }
}

/** Row indexes whose key repeats an earlier row — the form warns instead of losing data. */
export function duplicateAttributeRows(rows: AttributeRow[]): { tk: number[]; ru: number[] } {
  const seen = { tk: new Set<string>(), ru: new Set<string>() }
  const duplicates = { tk: [] as number[], ru: [] as number[] }
  rows.forEach((row, index) => {
    const keyTk = row.keyTk.trim().toLocaleLowerCase()
    const keyRu = row.keyRu.trim().toLocaleLowerCase()
    if (keyTk && seen.tk.has(keyTk)) duplicates.tk.push(index)
    if (keyRu && seen.ru.has(keyRu)) duplicates.ru.push(index)
    if (keyTk) seen.tk.add(keyTk)
    if (keyRu) seen.ru.add(keyRu)
  })
  return duplicates
}

/** True when a row holds nothing at all (dropped on save). */
export const isEmptyAttributeRow = (row: AttributeRow) =>
  !row.keyTk.trim() && !row.valueTk.trim() && !row.keyRu.trim() && !row.valueRu.trim()

/* ─── entity mappers ────────────────────────────────────────────────────── */

export function toProductListItem(dto: ProductListItemDto): ProductListItem {
  return {
    id: dto.id,
    name: dto.name ?? '',
    price: dto.price ?? 0,
    discountPrice: dto.discount_price ?? null,
    image: resolveMediaUrl(dto.image),
    isPaused: dto.is_paused ?? false,
    orderCount: dto.order_count ?? 0,
    createdAt: parseApiDate(dto.created_at),
  }
}

export function toProduct(dto: ProductDetailDto): Product {
  return {
    id: dto.id,
    name: dto.name ?? '',
    description: toLocalized(dto.description),
    price: dto.price ?? 0,
    discountPrice: dto.discount_price ?? null,
    attributes: attributesToRows(dto.attributes),
    isPaused: dto.is_paused ?? false,
    images: (dto.images ?? []).map(resolveMediaUrl),
    subcategoryId: dto.subcategory_id ?? null,
    categoryId: dto.category_id ?? null,
  }
}

/** The JSON that goes into the multipart `data` field. */
export function toProductDataDto(payload: ProductPayload) {
  return {
    name: payload.name.trim(),
    subcategory_id: payload.subcategoryId,
    description: fromLocalized(payload.description),
    price: payload.price,
    discount_price: payload.discountPrice,
    attributes: rowsToAttributes(payload.attributes.filter((row) => !isEmptyAttributeRow(row))),
    is_paused: payload.isPaused,
  }
}

/**
 * `GET /product/{id}` returns one unlabelled `images` array; only the list
 * endpoint names the cover (`image`). Given that cover, put it first so the
 * form never promotes an additional image by accident — and add it when the
 * detail response left it out altogether, which would otherwise leave the
 * edit form demanding a cover the product already has.
 */
export function orderProductImages(images: string[], mainImage: string | null | undefined): string[] {
  if (!mainImage) return images
  const index = images.indexOf(mainImage)
  if (index === 0) return images
  if (index < 0) return [mainImage, ...images]
  return [images[index], ...images.filter((_, i) => i !== index)]
}
