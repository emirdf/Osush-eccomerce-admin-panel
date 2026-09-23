import { cn } from '@/lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'outline'
  | 'outline-primary'
  | 'secondary'
  | 'ghost'
  | 'ghost-danger'

export type ButtonSize = 'sm' | 'md' | 'icon' | 'icon-sm'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  success: 'bg-success text-on-success hover:bg-success-hover',
  danger: 'bg-danger text-on-danger hover:bg-danger-hover',
  outline: 'border border-border-strong bg-surface text-fg hover:bg-surface-hover',
  'outline-primary': 'border border-primary-text/40 bg-surface text-primary-text hover:bg-primary-soft',
  secondary: 'bg-surface-muted text-fg hover:bg-gray-200',
  ghost: 'text-fg-muted hover:bg-surface-muted hover:text-fg',
  'ghost-danger': 'text-danger-text hover:bg-danger-soft',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-base',
  icon: 'size-10',
  'icon-sm': 'size-8',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center rounded-control font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-55',
    buttonVariants[variant],
    buttonSizes[size],
    className,
  )
}

/** Shared look for inputs, selects, date pickers. */
export const controlClasses =
  'w-full rounded-control border border-border bg-surface-muted text-base text-fg transition-colors placeholder:text-fg-subtle hover:border-border-strong focus:border-primary focus:bg-surface focus:outline-none focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus:ring-danger/15'
