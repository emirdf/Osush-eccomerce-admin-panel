import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'

/** Last-resort boundary for render errors and failed lazy chunks. */
export function RouteError() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md p-6">
        <ErrorState />
        <div className="flex justify-center">
          <Button variant="primary" onClick={() => window.location.assign('/')}>
            {t('common.notFound.backHome')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
