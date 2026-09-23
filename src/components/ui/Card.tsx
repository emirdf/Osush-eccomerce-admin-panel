import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  // min-w-0 lets cards shrink inside grid/flex tracks so wide tables scroll inside the card, not the page.
  return <div className={cn('min-w-0 rounded-card border border-border bg-surface shadow-card', className)} {...props} />
}

interface CardHeaderProps {
  title: ReactNode
  action?: ReactNode
  className?: string
  as?: 'h2' | 'h3'
}

export function CardHeader({ title, action, className, as: Heading = 'h2' }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2', className)}>
      <Heading className="text-lg font-semibold text-fg">{title}</Heading>
      {action}
    </div>
  )
}
