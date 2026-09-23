import { useTranslation } from 'react-i18next'
import { Card } from './Card'
import { Skeleton } from './Skeleton'

function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-10 w-full rounded-control" />
    </div>
  )
}

export function FormPageSkeleton() {
  const { t } = useTranslation()
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" role="status" aria-label={t('common.loading')}>
      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <Skeleton className="h-6 w-40" />
        <FieldSkeleton />
        <Skeleton className="h-28 w-full rounded-control" />
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </Card>
      <Card className="flex flex-col gap-4 self-start p-5 sm:p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="aspect-[4/3] w-full rounded-card" />
        <FieldSkeleton />
      </Card>
    </div>
  )
}
