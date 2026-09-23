import type { Ref } from 'react'
import { cn } from '@/lib/cn'
import { useFieldContext } from './field-context'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  disabled?: boolean
  'aria-label'?: string
  ref?: Ref<HTMLButtonElement>
}

export function Switch({ checked, onChange, id, disabled, ref, ...aria }: SwitchProps) {
  const field = useFieldContext()
  return (
    <button
      ref={ref}
      id={id ?? field?.id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={field?.describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-success' : 'bg-gray-300',
      )}
      {...aria}
    >
      <span
        className={cn(
          'size-5 rounded-full bg-white shadow-card transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
