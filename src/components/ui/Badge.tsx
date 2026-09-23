import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'success' | 'success-soft' | 'danger' | 'primary' | 'neutral'

const tones: Record<Tone, string> = {
  success: 'bg-success text-on-success',
  'success-soft': 'bg-success-soft text-success-text',
  danger: 'bg-danger text-on-danger',
  primary: 'bg-primary-soft text-primary-text',
  neutral: 'bg-surface-muted text-fg-muted',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
