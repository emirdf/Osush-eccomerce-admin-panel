import { Package, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { DashboardProduct } from '@/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { type Column, DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { MediaCell } from '@/components/ui/MediaCell'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { cn } from '@/lib/cn'
import { formatMoney, formatNumber } from '@/lib/format'
import { useDashboard } from './queries'

function ViewAllLink({ to }: { to: string }) {
  const { t } = useTranslation()
  return (
    <Link to={to} className="rounded-sm text-sm font-semibold text-primary-text hover:underline">
      {t('common.viewAll')}
    </Link>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  const dashboard = useDashboard()
  const errorMessage = useApiErrorMessage()
  const data = dashboard.data

  const statCards = [
    { key: 'clients', label: t('dashboard.stats.users'), value: data?.totalClients, tone: 'text-success dark:text-success-text' },
    { key: 'products', label: t('dashboard.stats.products'), value: data?.totalProducts, tone: 'text-primary-text' },
    { key: 'categories', label: t('dashboard.stats.categories'), value: data?.totalCategories, tone: 'text-orange' },
  ]

  const productColumns: Column<DashboardProduct>[] = [
    {
      id: 'product',
      header: t('dashboard.products.product'),
      cell: (product) => <MediaCell src={product.image} title={product.name} />,
      skeleton: 'w-40',
    },
    {
      id: 'orders',
      header: t('dashboard.products.orders'),
      align: 'center',
      cell: (product) => formatNumber(product.orderCount),
      skeleton: 'w-10',
    },
    {
      id: 'price',
      header: t('dashboard.products.price'),
      align: 'right',
      cell: (product) => <span className="font-semibold whitespace-nowrap">{formatMoney(product.discountPrice ?? product.price)}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <section aria-label={t('dashboard.stats.label')} className="grid gap-3 sm:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.key} className="flex flex-col gap-1 p-5">
            <p className="text-base font-medium text-fg-muted">{card.label}</p>
            {dashboard.isPending ? (
              <Skeleton className="mt-1 h-9 w-28" />
            ) : (
              <p className={cn('text-3xl font-bold tracking-tight tabular-nums', card.tone)}>
                {card.value === undefined ? '—' : formatNumber(card.value)}
              </p>
            )}
          </Card>
        ))}
      </section>

      {dashboard.isError && (
        <Card className="p-6">
          <ErrorState message={errorMessage(dashboard.error)} onRetry={() => dashboard.refetch()} />
        </Card>
      )}

      {!dashboard.isError && (
        <div className="grid gap-3 lg:grid-cols-3">
          <Card className="flex flex-col gap-4 p-4 sm:p-5 lg:col-span-2">
            <CardHeader title={t('dashboard.products.title')} action={<ViewAllLink to="/products" />} />
            <DataTable
              dense
              caption={t('dashboard.products.title')}
              columns={productColumns}
              rows={data?.products}
              rowKey={(product) => product.id}
              isLoading={dashboard.isPending}
              skeletonRows={5}
              minWidth={480}
              empty={<EmptyState compact icon={Package} title={t('products.empty.title')} />}
            />
          </Card>

          <Card className="flex flex-col gap-4 p-4 sm:p-5">
            <CardHeader title={t('dashboard.users.title')} action={<ViewAllLink to="/users" />} />
            <div>
              <div className="flex h-11 items-center rounded-control bg-primary-soft px-4 text-sm font-semibold text-fg">
                {t('dashboard.users.header')}
              </div>
              {dashboard.isPending ? (
                <ul aria-hidden="true">
                  {Array.from({ length: 6 }, (_, i) => (
                    <li key={i} className="border-b border-border px-4 py-3 last:border-0">
                      <Skeleton className="h-4 w-40" />
                    </li>
                  ))}
                </ul>
              ) : data && data.clientNames.length > 0 ? (
                <ul>
                  {data.clientNames.map((name, index) => (
                    <li key={`${name}-${index}`} className="truncate border-b border-border px-4 py-2.5 text-base text-fg last:border-0">
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon={Users} title={t('users.empty.title')} />
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
