import { cn } from '@/lib/cn'
import { Image } from './Image'

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-xl',
  xl: 'size-20 text-2xl',
}

interface AvatarProps {
  src?: string | null
  name: string
  size?: keyof typeof sizes
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary-text',
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {src ? <Image src={src} className="size-full object-cover" /> : initials}
    </span>
  )
}
