import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, Ref } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Spinner } from './Spinner'
import { type ButtonSize, type ButtonVariant, buttonClasses } from './styles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: LucideIcon
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant,
  size,
  loading = false,
  icon: Icon,
  className,
  children,
  disabled,
  type = 'button',
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {loading ? <Spinner /> : Icon ? <Icon className="size-[18px]" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
}

export function ButtonLink({ variant, size, icon: Icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className: className as string | undefined })} {...rest}>
      {Icon && <Icon className="size-[18px]" aria-hidden="true" />}
      {children}
    </Link>
  )
}
