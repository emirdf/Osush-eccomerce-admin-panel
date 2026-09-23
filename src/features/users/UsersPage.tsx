import { Trash2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type Client, clientName, DISABLED } from '@/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { type Column, DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useListParams } from '@/hooks/useListParams'
import { formatMoney, formatNumber } from '@/lib/format'
import { formatPhone } from '@/lib/phone'
import { toTotalPages } from '@/lib/pagination'
import { useClients } from './queries'

export function UsersPage() {
  const { t } = useTranslation()
  const { page, search, limit, setPage, setSearch } = useListParams()
  const query = useClients({ page, limit, search })
  const errorMessage = useApiErrorMessage()

  const columns: Column<Client>[] = [
    { id: 'no', header: t('users.table.no'), cell: (_, i) => (page - 1) * limit + i + 1, className: 'w-16 text-fg-muted tabular-nums', skeleton: 'w-6' },
    { id: 'name', header: t('users.table.name'), cell: (client) => <span className="font-medium">{clientName(client) || '—'}</span>, skeleton: 'w-40' },
    { id: 'phone', header: t('users.table.phone'), cell: (client) => <span className="whitespace-nowrap tabular-nums">{formatPhone(client.phone) || '—'}</span>, skeleton: 'w-32' },
    { id: 'orders', header: t('users.table.orders'), align: 'center', cell: (client) => formatNumber(client.orderCount), skeleton: 'w-10' },
    { id: 'spent', header: t('users.table.spent'), align: 'right', cell: (client) => <span className="font-semibold whitespace-nowrap">{formatMoney(client.totalSpent)}</span> },
    {
      id: 'actions',
      header: t('common.table.actions'),
      align: 'center',
      className: 'w-24',
      skeleton: 'w-8',
      // DELETE /client/{id} does not exist yet — visible but disabled, never a dead button.
      cell: () => (
        <Button
          variant="ghost-danger"
          size="icon-sm"
          disabled={DISABLED.clientDelete}
          title={t('users.delete.unavailable')}
          aria-label={t('users.delete.unavailable')}
        >
          <Trash2 className="size-[18px]" />
        </Button>
      ),
    },
  ]

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <PageHeader>
        <SearchInput value={search} onChange={setSearch} placeholder={t('users.searchPlaceholder')} />
      </PageHeader>

      {query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <DataTable
          caption={t('nav.users')}
          columns={columns}
          rows={query.data?.items}
          rowKey={(client) => client.id}
          isLoading={query.isPending}
          isFetching={query.isPlaceholderData}
          empty={
            search ? (
              <EmptyState title={t('common.table.noResults')} description={t('common.table.noResultsHint', { query: search })} />
            ) : (
              <EmptyState icon={Users} title={t('users.empty.title')} description={t('users.empty.description')} />
            )
          }
        />
      )}

      <Pagination page={page} totalPages={toTotalPages(query.data?.total ?? 0, limit)} onPageChange={setPage} />
    </Card>
  )
}
