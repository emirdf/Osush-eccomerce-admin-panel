import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { dismissToast, useToasts } from '@/store/toast'

const icons = {
  success: { Icon: CircleCheck, className: 'text-success-text' },
  error: { Icon: CircleAlert, className: 'text-danger-text' },
  info: { Icon: Info, className: 'text-primary-text' },
}

export function Toaster() {
  const { t } = useTranslation()
  const toasts = useToasts()

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map(({ id, variant, message }) => {
        const { Icon, className } = icons[variant]
        return (
          <div
            key={id}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-card border border-border bg-surface py-3 pr-2 pl-3 shadow-card"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', className)} aria-hidden="true" />
            <p className="flex-1 text-base text-fg">{message}</p>
            <button
              type="button"
              onClick={() => dismissToast(id)}
              aria-label={t('common.close')}
              className="rounded-md p-1 text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
