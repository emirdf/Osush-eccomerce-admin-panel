import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  title?: ReactNode
  description?: ReactNode
  /** Left side content, e.g. a search input. */
  children?: ReactNode
  actions?: ReactNode
  className?: string
}

/** Toolbar row at the top of a page card: title or search on the left, actions on the right. */
export function PageHeader({ title, description, children, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <h2 className="text-lg font-semibold text-fg">{title}</h2>}
        {description && <p className="text-base text-fg-muted">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
