import { ApiError } from '@/api/errors'
import type { ID, ImageInput, ListParams, Paginated } from './types'

/** Simulated network latency (300–600 ms by default). */
export function delay(min = 300, max = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))
}

export function clone<T>(value: T): T {
  return structuredClone(value)
}

export function paginate<T>(items: T[], { page = 1, limit = 10 }: ListParams): Paginated<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const current = Math.min(Math.max(1, page), totalPages)
  return {
    data: clone(items.slice((current - 1) * limit, current * limit)),
    meta: { page: current, limit, total, totalPages },
  }
}

const normalize = (s: string) => s.toLocaleLowerCase().replace(/\s+/g, '')

/** Case- and whitespace-insensitive "contains" across several fields. */
export function matches(search: string | undefined, ...fields: (string | null | undefined)[]): boolean {
  if (!search?.trim()) return true
  const query = normalize(search)
  return fields.some((field) => field != null && normalize(field).includes(query))
}

export function nextId(items: { id: ID }[]): ID {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export function findOr404<T extends { id: ID }>(items: T[], id: ID): T {
  const item = items.find((i) => i.id === id)
  if (!item) throw new ApiError(404, 'not_found')
  return item
}

/** "Uploads" an image: new files become data URLs so they outlive the object URL preview. */
export function uploadImage(image: ImageInput): Promise<string> {
  const { file } = image
  if (!file) return Promise.resolve(image.url)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new ApiError(400, 'upload_failed'))
    reader.readAsDataURL(file)
  })
}

export const newestFirst = <T extends { created_at: string }>(a: T, b: T) => b.created_at.localeCompare(a.created_at)
