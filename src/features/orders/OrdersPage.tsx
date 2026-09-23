import { Check, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { OrderListItem } from '@/api'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { type Column, DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useListParams } from '@/hooks/useListParams'
import { formatMoney, formatNumber } from '@/lib/format'
import { toTotalPages } from '@/lib/pagination'
import { formatPhone } from '@/lib/phone'
import type { OrderLocationState } from './OrderDetailPage'
import { useOrders } from './queries'

type SentFilter = 'all' | 'sent' | 'notSent'

const SENT_PARAM = 'sent'

/** `?sent=true|false` ⇄ the `is_send` query param; absent means both. */
function useSentFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get(SENT_PARAM)
  const filter: SentFilter = raw === 'true' ? 'sent' : raw === 'false' ? 'notSent' : 'all'
  const isSent = filter === 'all' ? null : filter === 'sent'

  const setFilter = (next: SentFilter) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.delete('page')
      if (next === 'all') params.delete(SENT_PARAM)
      else params.set(SENT_PARAM, String(next === 'sent'))
      return params
    })
  }

  return { filter, isSent, setFilter }
}

export function OrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { page, search, limit, setPage, setSearch } = useListParams()
  const { filter, isSent, setFilter } = useSentFilter()
  const query = useOrders({ page, limit, search, isSent })
  const errorMessage = useApiErrorMessage()

  const detailLink = (order: OrderListItem) => ({
    pathname: `/orders/${order.id}`,
    state: { from: location.search, customerName: order.customerName } satisfies OrderLocationState,
  })
  const openOrder = (order: OrderListItem) => {
    const { pathname, state } = detailLink(order)
    navigate(pathname, { state })
  }

  const columns: Column<OrderListItem>[] = [
    { id: 'no', header: t('orders.table.no'), cell: (_, i) => (page - 1) * limit + i + 1, className: 'w-14 text-fg-muted tabular-nums', skeleton: 'w-6' },
    {
      id: 'name',
      header: t('orders.table.name'),
      align: 'center',
      skeleton: 'w-36',
      // The row is clickable too; this link is what keyboard and screen-reader users reach.
      cell: (order) => {
        const { pathname, state } = detailLink(order)
        return (
          <Link to={pathname} state={state} className="rounded-sm font-medium hover:text-primary-text hover:underline">
            {order.customerName || t('orders.detail.unnamed', { id: order.id })}
          </Link>
        )
      },
    },
    { id: 'phone', header: t('orders.table.phone'), align: 'center', cell: (order) => <span className="whitespace-nowrap tabular-nums">{formatPhone(order.phone) || '—'}</span>, skeleton: 'w-32' },
    { id: 'city', header: t('orders.table.city'), align: 'center', cell: (order) => order.city || '—' },
    { id: 'products', header: t('orders.table.products'), align: 'center', cell: (order) => formatNumber(order.productCount), skeleton: 'w-8' },
    { id: 'total', header: t('orders.table.total'), align: 'center', cell: (order) => <span className="font-semibold whitespace-nowrap">{formatMoney(order.totalPrice)}</span> },
    {
      id: 'status',
      header: t('orders.table.sent'),
      align: 'center',
      className: 'w-28',
      skeleton: 'w-12',
      cell: (order) => (
        <div className="flex items-center justify-center gap-2">
          {order.isNew && <Badge tone="success-soft">{t('orders.status.new')}</Badge>}
          {order.isSent ? (
            <>
              <Check className="size-5 text-success-text" aria-hidden="true" />
              <span className="sr-only">{t('orders.status.sent')}</span>
            </>
          ) : (
            <span className="sr-only">{t('orders.status.notSent')}</span>
          )}
        </div>
      ),
    },
  ]

  const filtered = Boolean(search) || filter !== 'all'

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <PageHeader
        actions={
          <SegmentedControl
            label={t('orders.filter.label')}
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: t('orders.filter.all') },
              { value: 'notSent', label: t('orders.filter.notSent') },
              { value: 'sent', label: t('orders.filter.sent') },
            ]}
          />
        }
      >
        <SearchInput value={search} onChange={setSearch} placeholder={t('orders.searchPlaceholder')} />
      </PageHeader>

      {query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <DataTable
          caption={t('nav.orders')}
          columns={columns}
          rows={query.data?.items}
          rowKey={(order) => order.id}
          isLoading={query.isPending}
          isFetching={query.isPlaceholderData}
          onRowClick={openOrder}
          rowClassName={(order) => (order.isNew ? 'bg-row-new' : undefined)}
          minWidth={860}
          empty={
            filtered ? (
              <EmptyState
                title={t('common.table.noResults')}
                description={search ? t('common.table.noResultsHint', { query: search }) : t('orders.empty.filtered')}
              />
            ) : (
              <EmptyState icon={ShoppingCart} title={t('orders.empty.title')} description={t('orders.empty.description')} />
            )
          }
        />
      )}

      <Pagination page={page} totalPages={toTotalPages(query.data?.total ?? 0, limit)} onPageChange={setPage} />
    </Card>
  )
}
