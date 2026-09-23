/**
 * Image URLs come back from several hosts depending on the environment
 * (MinIO on localhost:9000 in dev, a public host in prod). Every <img> in the
 * app goes through resolveMediaUrl — see components/ui/Image.tsx.
 */

/** Neutral grey placeholder used for missing or broken images. */
export const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#E7E9EE"/><path d="M14 44l12-14 9 10 6-6 9 10z" fill="#B9BEC8"/><circle cx="24" cy="22" r="5" fill="#B9BEC8"/></svg>',
  )

const mediaBase = () => (import.meta.env.VITE_MEDIA_BASE_URL ?? '').replace(/\/$/, '')

/** Origins the backend may return that are not reachable from the browser. */
const REWRITABLE_ORIGINS = ['http://localhost:9000', 'http://127.0.0.1:9000']

export function resolveMediaUrl(url?: string | null): string {
  if (!url || !url.trim()) return IMAGE_PLACEHOLDER
  if (url.startsWith('data:') || url.startsWith('blob:')) return url
  const base = mediaBase()
  if (!base) return url
  const origin = REWRITABLE_ORIGINS.find((o) => url.startsWith(o))
  return origin ? `${base}${url.slice(origin.length)}` : url
}

/** Last path segment of a URL, usable as a file name. */
function filenameFromUrl(url: string): string {
  try {
    const name = new URL(url).pathname.split('/').pop()
    return name ? decodeURIComponent(name) : 'image'
  } catch {
    return 'image'
  }
}

/**
 * Reads an image that is already stored on the server back into a File, so it
 * can be re-uploaded. The media host allows cross-origin GETs; if it ever stops
 * doing so — or the object is gone — this returns null and the caller decides.
 */
export async function fileFromUrl(url: string | null | undefined): Promise<File | null> {
  if (!url || url.startsWith('data:')) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    if (!blob.size) return null
    return new File([blob], filenameFromUrl(url), { type: blob.type || 'application/octet-stream' })
  } catch {
    return null
  }
}
