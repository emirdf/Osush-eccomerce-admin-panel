import { describe, expect, it } from 'vitest'
import { duplicateAttributeRows, attributesToRows, orderProductImages, rowsToAttributes } from './product'

const row = (keyTk: string, valueTk: string, keyRu: string, valueRu: string) => ({ keyTk, valueTk, keyRu, valueRu })

describe('attributesToRows', () => {
  it('returns no rows for empty attributes', () => {
    expect(attributesToRows(null)).toEqual([])
    expect(attributesToRows(undefined)).toEqual([])
    expect(attributesToRows({ tm: {}, ru: {} })).toEqual([])
  })

  it('zips the two languages by index', () => {
    expect(attributesToRows({ tm: { 'Reňki': 'Gara' }, ru: { Цвет: 'Чёрный' } })).toEqual([
      row('Reňki', 'Gara', 'Цвет', 'Чёрный'),
    ])
  })

  it('pads the shorter language and never drops an entry', () => {
    const rows = attributesToRows({ tm: { a: '1', b: '2', c: '3' }, ru: { x: '9' } })
    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual(row('a', '1', 'x', '9'))
    expect(rows[1]).toEqual(row('b', '2', '', ''))
    expect(rows[2]).toEqual(row('c', '3', '', ''))
  })

  it('handles tm-only and ru-only payloads', () => {
    expect(attributesToRows({ tm: { 'Ýady': '256 GB' } })).toEqual([row('Ýady', '256 GB', '', '')])
    expect(attributesToRows({ ru: { Память: '256 ГБ' } })).toEqual([row('', '', 'Память', '256 ГБ')])
  })

  it('keeps keys with spaces and Cyrillic intact', () => {
    const rows = attributesToRows({ tm: { 'Ekranyň ölçegi': '6.3 dýuým' }, ru: { 'Размер экрана': '6.3 дюйма' } })
    expect(rows[0]).toEqual(row('Ekranyň ölçegi', '6.3 dýuým', 'Размер экрана', '6.3 дюйма'))
  })

  it('treats a null value as an empty string', () => {
    expect(attributesToRows({ tm: { color: null } })).toEqual([row('color', '', '', '')])
  })
})

describe('rowsToAttributes', () => {
  it('builds one object per language', () => {
    expect(rowsToAttributes([row('Reňki', 'Gara', 'Цвет', 'Чёрный')])).toEqual({
      tm: { 'Reňki': 'Gara' },
      ru: { Цвет: 'Чёрный' },
    })
  })

  it('skips fully empty rows and trims keys and values', () => {
    expect(rowsToAttributes([row('  ', '  ', '', ''), row('  ram  ', '  8 GB  ', '', '')])).toEqual({
      tm: { ram: '8 GB' },
      ru: {},
    })
  })

  it('drops a value that has no key (it cannot be stored in an object map)', () => {
    expect(rowsToAttributes([row('', 'Gara', '', '')])).toEqual({ tm: {}, ru: {} })
  })

  it('lets the later duplicate key win', () => {
    expect(rowsToAttributes([row('ram', '8 GB', '', ''), row('ram', '16 GB', '', '')])).toEqual({
      tm: { ram: '16 GB' },
      ru: {},
    })
  })

  it('round-trips a full payload', () => {
    const attributes = { tm: { color: 'Gara', memory: '256 GB' }, ru: { Цвет: 'Чёрный', Память: '256 ГБ' } }
    expect(rowsToAttributes(attributesToRows(attributes))).toEqual(attributes)
  })

  it('round-trips a payload with mismatched lengths', () => {
    const attributes = { tm: { a: '1', b: '2' }, ru: { x: '9' } }
    expect(rowsToAttributes(attributesToRows(attributes))).toEqual(attributes)
  })
})

describe('duplicateAttributeRows', () => {
  it('reports the index of the later duplicate per language', () => {
    const rows = [row('ram', '8', 'озу', '8'), row('RAM', '16', 'память', '16')]
    expect(duplicateAttributeRows(rows)).toEqual({ tk: [1], ru: [] })
  })

  it('reports nothing when keys are unique or empty', () => {
    expect(duplicateAttributeRows([row('a', '1', '', ''), row('b', '2', '', '')])).toEqual({ tk: [], ru: [] })
    expect(duplicateAttributeRows([row('', '', '', ''), row('', '', '', '')])).toEqual({ tk: [], ru: [] })
  })
})

describe('orderProductImages', () => {
  const images = ['a.png', 'b.png', 'c.png']

  it('leaves the order alone when the cover is unknown', () => {
    expect(orderProductImages(images, null)).toEqual(images)
    expect(orderProductImages(images, undefined)).toEqual(images)
  })

  it('leaves the order alone when the cover is already first', () => {
    expect(orderProductImages(images, 'a.png')).toEqual(images)
  })

  it('moves the cover to the front and keeps the rest in order', () => {
    expect(orderProductImages(images, 'c.png')).toEqual(['c.png', 'a.png', 'b.png'])
  })

  it('adds a cover the detail response left out', () => {
    // GET /product/{id} can return fewer images than the list row knows about;
    // without this the edit form would demand a cover the product already has.
    expect(orderProductImages(images, 'cover.png')).toEqual(['cover.png', ...images])
    expect(orderProductImages([], 'a.png')).toEqual(['a.png'])
  })
})
