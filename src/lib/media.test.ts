import { afterEach, describe, expect, it, vi } from 'vitest'
import { fileFromUrl, IMAGE_PLACEHOLDER, resolveMediaUrl } from './media'

afterEach(() => vi.unstubAllEnvs())

describe('resolveMediaUrl', () => {
  it('falls back to the placeholder for empty values', () => {
    expect(resolveMediaUrl(null)).toBe(IMAGE_PLACEHOLDER)
    expect(resolveMediaUrl(undefined)).toBe(IMAGE_PLACEHOLDER)
    expect(resolveMediaUrl('   ')).toBe(IMAGE_PLACEHOLDER)
  })

  it('returns remote URLs untouched when no override is set', () => {
    const url = 'https://minio-production-aa63.up.railway.app/osush/img.png'
    expect(resolveMediaUrl(url)).toBe(url)
  })

  it('rewrites the local MinIO origin when an override is set', () => {
    vi.stubEnv('VITE_MEDIA_BASE_URL', 'https://media.example.com')
    expect(resolveMediaUrl('http://localhost:9000/osush/img.png')).toBe('https://media.example.com/osush/img.png')
    expect(resolveMediaUrl('http://127.0.0.1:9000/osush/img.png')).toBe('https://media.example.com/osush/img.png')
  })

  it('leaves other hosts alone even with an override', () => {
    vi.stubEnv('VITE_MEDIA_BASE_URL', 'https://media.example.com')
    expect(resolveMediaUrl('https://cdn.example.org/a.png')).toBe('https://cdn.example.org/a.png')
  })

  it('passes through data: and blob: previews', () => {
    expect(resolveMediaUrl('blob:http://localhost/abc')).toBe('blob:http://localhost/abc')
    expect(resolveMediaUrl('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA')
  })
})

describe('fileFromUrl', () => {
  const stubFetch = (impl: typeof fetch) => vi.stubGlobal('fetch', impl)
  afterEach(() => vi.unstubAllGlobals())

  it('ignores values that cannot be re-uploaded', async () => {
    expect(await fileFromUrl(null)).toBeNull()
    expect(await fileFromUrl('')).toBeNull()
    expect(await fileFromUrl(IMAGE_PLACEHOLDER)).toBeNull()
  })

  it('names the file after the last path segment', async () => {
    stubFetch(async () => new Response(new Blob(['x'], { type: 'image/png' }), { status: 200 }))
    const file = await fileFromUrl('https://media.example/osush/main_img_product_1_phone.png')
    expect(file?.name).toBe('main_img_product_1_phone.png')
    expect(file?.type).toBe('image/png')
  })

  it('returns null for a missing object instead of an empty file', async () => {
    stubFetch(async () => new Response('', { status: 404 }))
    expect(await fileFromUrl('https://media.example/osush/gone.png')).toBeNull()
  })

  it('returns null when the media host refuses the request', async () => {
    stubFetch(async () => { throw new TypeError('Failed to fetch') })
    expect(await fileFromUrl('https://media.example/osush/blocked.png')).toBeNull()
  })
})
