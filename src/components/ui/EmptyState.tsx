import { Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({ title, description, icon: Icon = Inbox, action, compact, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-2 py-8' : 'gap-3 py-14', className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-fg-subtle">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-md font-semibold text-fg">{title}</p>
        {description && <p className="max-w-sm text-base text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
