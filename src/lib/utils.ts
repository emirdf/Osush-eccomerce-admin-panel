import type { Ref, RefCallback } from 'react'

let counter = 0
/** Unique client-side id (works outside secure contexts, unlike crypto.randomUUID). */
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }
}

/** Page list with truncation: 1 2 3 4 5 … 24 */
export function getPageItems(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages]
  if (page >= totalPages - 3) {
    return [1, 'ellipsis', ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)]
  }
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages]
}

/** 0 = empty, 1 = weak, 2 = medium, 3 = strong */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return 1
  if (score <= 3) return 2
  return 3
}

/** "20 100,5" → 20100.5, invalid → NaN */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/[\s.](?=\d{3}(\D|$))/g, '').replace(',', '.').trim()
  return cleaned === '' ? Number.NaN : Number(cleaned)
}
