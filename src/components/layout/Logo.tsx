import { useTranslation } from 'react-i18next'
import logoUrl from '@/assets/logo.png'
import { cn } from '@/lib/cn'

export function Logo({ className }: { className?: string }) {
  const { t } = useTranslation()
  return <img src={logoUrl} alt={t('common.appName')} width={471} height={100} className={cn('logo-img h-8 w-auto', className)} />
}

/** Compact mark (bars + dots) for the collapsed sidebar. */
export function LogoMark({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label={t('common.appName')} className={cn('size-9', className)}>
      <circle cx="4.5" cy="4.5" r="2.6" className="fill-orange" />
      <circle cx="11.5" cy="4.5" r="2.6" className="fill-orange" />
      <circle cx="4.5" cy="26" r="3.2" className="fill-primary-text" />
      <rect x="10.25" y="15" width="6.5" height="14.2" rx="3.25" className="fill-primary-text" />
      <rect x="20.5" y="8" width="6.5" height="21.2" rx="3.25" className="fill-primary-text" />
    </svg>
  )
}
