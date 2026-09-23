import { SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <Card className="p-6">
      <EmptyState
        icon={SearchX}
        title={t('common.notFound.title')}
        description={t('common.notFound.description')}
        action={<ButtonLink to="/">{t('common.notFound.backHome')}</ButtonLink>}
      />
    </Card>
  )
}
