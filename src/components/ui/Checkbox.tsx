import { Check, Minus } from 'lucide-react'
import { type InputHTMLAttributes, type Ref, useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { mergeRefs } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
  ref?: Ref<HTMLInputElement>
}

export function Checkbox({ indeterminate = false, className, ref, ...props }: CheckboxProps) {
  const innerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <span className={cn('relative inline-flex size-[18px] shrink-0', className)}>
      <input
        ref={mergeRefs(innerRef, ref)}
        type="checkbox"
        className="peer size-[18px] cursor-pointer appearance-none rounded-[5px] border border-border-strong bg-surface transition-colors checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary hover:border-primary-text disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <Check
        className="pointer-events-none absolute inset-0 m-auto size-3.5 text-on-primary opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
        strokeWidth={3}
        aria-hidden="true"
      />
      <Minus
        className="pointer-events-none absolute inset-0 m-auto size-3.5 text-on-primary opacity-0 peer-indeterminate:opacity-100"
        strokeWidth={3}
        aria-hidden="true"
      />
    </span>
  )
}
