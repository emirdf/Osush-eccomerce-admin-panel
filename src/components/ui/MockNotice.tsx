import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Marks a screen or action that runs on mock data because the endpoint is missing. */
export function MockNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2 rounded-control border border-border bg-surface-muted px-3 py-2 text-sm text-fg-muted',
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary-text" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
