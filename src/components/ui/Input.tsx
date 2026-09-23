import type { InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { useFieldContext } from './field-context'
import { controlClasses } from './styles'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  /** Short unit shown inside the right edge, e.g. "TMT". */
  suffix?: string
  ref?: Ref<HTMLInputElement>
  'data-autofocus'?: boolean
}

export function Input({ invalid, leftIcon, rightSlot, suffix, className, id, ref, ...props }: InputProps) {
  const field = useFieldContext()
  const isInvalid = invalid ?? field?.invalid

  return (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 text-fg-subtle">{leftIcon}</span>
      )}
      <input
        ref={ref}
        id={id ?? field?.id}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          controlClasses,
          'h-10 px-3',
          leftIcon ? 'pl-10' : undefined,
          rightSlot || suffix ? 'pr-12' : undefined,
          className,
        )}
        {...props}
      />
      {suffix && !rightSlot && (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-fg-subtle">
          {suffix}
        </span>
      )}
      {rightSlot && <span className="absolute top-1/2 right-1 flex -translate-y-1/2">{rightSlot}</span>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  ref?: Ref<HTMLTextAreaElement>
  'data-autofocus'?: boolean
}

export function Textarea({ invalid, className, id, rows = 5, ref, ...props }: TextareaProps) {
  const field = useFieldContext()
  const isInvalid = invalid ?? field?.invalid

  return (
    <textarea
      ref={ref}
      id={id ?? field?.id}
      rows={rows}
      aria-invalid={isInvalid || undefined}
      aria-describedby={field?.describedBy}
      className={cn(controlClasses, 'min-h-24 resize-y px-3 py-2.5', className)}
      {...props}
    />
  )
}
