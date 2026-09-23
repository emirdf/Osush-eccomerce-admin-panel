import { type ReactNode, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { FieldContext } from './field-context'

interface FieldProps {
  label?: ReactNode
  /** Translation key (from zod schemas) or plain translated text. */
  error?: string
  hint?: ReactNode
  required?: boolean
  id?: string
  className?: string
  children: ReactNode
}

export function Field({ label, error, hint, required, id: idProp, className, children }: FieldProps) {
  const { t } = useTranslation()
  const autoId = useId()
  const id = idProp ?? autoId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error && errorId, hint && !error && hintId].filter(Boolean).join(' ') || undefined

  return (
    <FieldContext value={{ id, invalid: Boolean(error), describedBy }}>
      <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-fg">
            {label}
            {required && (
              <span className="ml-0.5 text-danger-text" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        {children}
        {hint && !error && (
          <p id={hintId} className="text-xs text-fg-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-medium text-danger-text">
            {t(error, { defaultValue: error })}
          </p>
        )}
      </div>
    </FieldContext>
  )
}
