import { describe, expect, it } from 'vitest'
import { apiDateToDate, formatApiDate, parseApiDate } from './date'

describe('parseApiDate', () => {
  it('converts the API format to ISO', () => {
    expect(parseApiDate('15-09-2026')).toBe('2026-09-15')
    expect(parseApiDate('03-09-2026')).toBe('2026-09-03')
  })

  it('tolerates ISO input and timestamps', () => {
    expect(parseApiDate('2026-09-15')).toBe('2026-09-15')
    expect(parseApiDate('2026-09-15T10:00:00Z')).toBe('2026-09-15')
  })

  it('returns an empty string for missing or invalid values', () => {
    expect(parseApiDate(null)).toBe('')
    expect(parseApiDate(undefined)).toBe('')
    expect(parseApiDate('')).toBe('')
    expect(parseApiDate('nonsense')).toBe('')
  })
})

describe('formatApiDate', () => {
  it('converts ISO to the API format', () => {
    expect(formatApiDate('2026-09-15')).toBe('15-09-2026')
  })

  it('passes through a value already in the API format', () => {
    expect(formatApiDate('15-09-2026')).toBe('15-09-2026')
  })

  it('returns an empty string for missing values', () => {
    expect(formatApiDate(null)).toBe('')
    expect(formatApiDate('')).toBe('')
  })

  it('round-trips', () => {
    expect(parseApiDate(formatApiDate('2026-01-02'))).toBe('2026-01-02')
  })
})

describe('apiDateToDate', () => {
  it('builds a local date', () => {
    const date = apiDateToDate('15-09-2026')!
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(8)
    expect(date.getDate()).toBe(15)
  })

  it('returns null when there is no date', () => {
    expect(apiDateToDate(null)).toBeNull()
  })
})
