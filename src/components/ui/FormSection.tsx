import { type ReactNode, useId } from 'react'
import { cn } from '@/lib/cn'

interface FormSectionProps {
  title: ReactNode
  description?: ReactNode
  required?: boolean
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function FormSection({ title, description, required, action, className, children }: FormSectionProps) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 id={headingId} className="text-xl font-semibold text-fg">
            {title}
            {required && (
              <span className="ml-1 text-danger-text" aria-hidden="true">
                *
              </span>
            )}
          </h2>
          {description && <p className="text-sm text-fg-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
