import { describe, expect, it } from 'vitest'
import { ensurePageSlice, toOffset, toTotalPages } from './pagination'

describe('page ⇄ offset', () => {
  it('converts pages to offsets', () => {
    expect(toOffset(1, 10)).toBe(0)
    expect(toOffset(2, 10)).toBe(10)
    expect(toOffset(3, 25)).toBe(50)
    expect(toOffset(0, 10)).toBe(0)
  })

  it('derives the page count from the total', () => {
    expect(toTotalPages(0, 10)).toBe(1)
    expect(toTotalPages(9, 10)).toBe(1)
    expect(toTotalPages(10, 10)).toBe(1)
    expect(toTotalPages(11, 10)).toBe(2)
    expect(toTotalPages(238, 10)).toBe(24)
  })
})

describe('ensurePageSlice', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1)

  it('slices locally when the server ignored limit/offset', () => {
    expect(ensurePageSlice(items, 25, 2, 10)).toEqual({ items: items.slice(10, 20), total: 25 })
  })

  it('leaves a properly paginated response alone', () => {
    const page = items.slice(0, 10)
    expect(ensurePageSlice(page, 25, 1, 10)).toEqual({ items: page, total: 25 })
  })

  it('falls back to the item count when total is missing', () => {
    expect(ensurePageSlice(items, 0, 1, 10).total).toBe(25)
  })
})
