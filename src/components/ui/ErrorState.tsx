import { CircleAlert, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

export function ErrorState({ message, onRetry, compact }: { message?: string; onRetry?: () => void; compact?: boolean }) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={CircleAlert}
      compact={compact}
      title={t('common.error.title')}
      description={message ?? t('common.error.description')}
      action={
        onRetry && (
          <Button variant="outline" size="sm" icon={RotateCw} onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )
      }
    />
  )
}
