import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/cn'
import { Button } from './Button'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: keyof typeof sizes
  /** When false, Esc / backdrop / ✕ do nothing (e.g. while a request is pending). */
  dismissible?: boolean
  hideClose?: boolean
}

export function Modal(props: ModalProps) {
  if (!props.open) return null
  return createPortal(<ModalPanel {...props} />, document.body)
}

function ModalPanel({ onClose, title, children, footer, size = 'md', dismissible = true, hideClose }: ModalProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useFocusTrap(panelRef, true, () => dismissible && onClose())

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center overflow-y-auto bg-overlay p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && dismissible) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative w-full animate-pop-in rounded-card border border-border bg-surface shadow-card outline-none',
          sizes[size],
        )}
      >
        <div className="flex items-center justify-center px-12 pt-5 pb-2">
          <h2 id={titleId} className="text-center text-lg font-semibold text-fg">
            {title}
          </h2>
          {!hideClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4"
              onClick={onClose}
              disabled={!dismissible}
              aria-label={t('common.close')}
            >
              <X className="size-5" />
            </Button>
          )}
        </div>
        <div className="px-4 py-3 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 px-4 pt-2 pb-5 sm:px-6">{footer}</div>}
      </div>
    </div>
  )
}
