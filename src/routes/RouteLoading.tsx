import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/Spinner'

/** Shown while the first lazy route chunk loads. */
export function RouteLoading() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg text-primary-text" role="status" aria-label={t('common.loading')}>
      <Spinner className="size-6" />
    </div>
  )
}
