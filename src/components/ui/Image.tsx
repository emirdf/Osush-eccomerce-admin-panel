import type { ImgHTMLAttributes } from 'react'
import { IMAGE_PLACEHOLDER, resolveMediaUrl } from '@/lib/media'

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
}

/** Every remote image goes through here: host rewriting + placeholder fallback. */
export function Image({ src, alt = '', onError, ...rest }: ImageProps) {
  return (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      loading="lazy"
      onError={(event) => {
        const img = event.currentTarget
        if (img.src !== IMAGE_PLACEHOLDER) img.src = IMAGE_PLACEHOLDER
        onError?.(event)
      }}
      {...rest}
    />
  )
}
