import { cn } from '@/lib/cn'
import { Image } from './Image'

interface MediaCellProps {
  src: string
  title: string
  subtitle?: string
  /** "square" for products, "wide" for banners. */
  shape?: 'square' | 'wide'
}

/** Thumbnail + text used in table cells. */
export function MediaCell({ src, title, subtitle, shape = 'square' }: MediaCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src={src}
        className={cn(
          'shrink-0 rounded-md border border-border bg-surface-muted object-cover',
          shape === 'wide' ? 'h-10 w-[4.25rem]' : 'size-10',
        )}
      />
      <div className="min-w-0">
        <p className="line-clamp-2 font-medium text-fg">{title || '—'}</p>
        {subtitle && <p className="truncate text-sm text-fg-muted">{subtitle}</p>}
      </div>
    </div>
  )
}
