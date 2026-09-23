import { Bell, CirclePlus, SquarePen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DISABLED, type Notification } from '@/api'
import { AdsSectionTabs } from '@/features/ads/AdsSectionTabs'
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
import { formatDate } from '@/lib/format'
import { localized } from '@/lib/i18n'
import { toTotalPages } from '@/lib/pagination'
import { NotificationModal } from './NotificationModal'
import { useNotifications } from './queries'

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const { page, search, limit, setPage, setSearch } = useListParams()
  const query = useNotifications({ page, limit, search })
  const errorMessage = useApiErrorMessage()
  const [modalOpen, setModalOpen] = useState(false)

  const openCreate = () => setModalOpen(true)

  const columns: Column<Notification>[] = [
    { id: 'no', header: t('notifications.table.no'), cell: (_, i) => (page - 1) * limit + i + 1, className: 'w-14 text-fg-muted tabular-nums', skeleton: 'w-6' },
    {
      id: 'title',
      header: t('notifications.table.title'),
      cell: (n) => <span className="line-clamp-2 font-medium">{localized(n.title, i18n.language)}</span>,
      className: 'min-w-44',
      skeleton: 'w-36',
    },
    {
      id: 'body',
      header: t('notifications.table.body'),
      cell: (n) => {
        const body = localized(n.body, i18n.language)
        return (
          <p className="line-clamp-2 max-w-md text-fg-muted" title={body}>
            {body}
          </p>
        )
      },
      className: 'min-w-64',
      skeleton: 'w-64',
    },
    { id: 'life', header: t('notifications.table.life'), align: 'center', cell: (n) => <span className="tabular-nums">{n.life}</span>, skeleton: 'w-6' },
    { id: 'created', header: t('notifications.table.createdAt'), align: 'center', cell: (n) => <span className="tabular-nums">{formatDate(n.createdAt)}</span> },
    {
      id: 'actions',
      header: t('common.table.actions'),
      align: 'center',
      className: 'w-28',
      skeleton: 'w-14',
      // No PUT or DELETE /notification yet — visible but disabled, never a dead button.
      cell: () => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon-sm" disabled={DISABLED.notificationEdit} title={t('notifications.editUnavailable')} aria-label={t('notifications.editUnavailable')}>
            <SquarePen className="size-[18px]" />
          </Button>
          <Button variant="ghost-danger" size="icon-sm" disabled={DISABLED.notificationDelete} title={t('notifications.deleteUnavailable')} aria-label={t('notifications.deleteUnavailable')}>
            <Trash2 className="size-[18px]" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <AdsSectionTabs />
      <PageHeader actions={<Button variant="success" icon={CirclePlus} onClick={openCreate}>{t('notifications.add')}</Button>}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('notifications.searchPlaceholder')} />
      </PageHeader>

      {query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <DataTable
          tone="success"
          caption={t('nav.notifications')}
          columns={columns}
          rows={query.data?.items}
          rowKey={(n) => n.id}
          isLoading={query.isPending}
          isFetching={query.isPlaceholderData}
          minWidth={860}
          empty={
            search ? (
              <EmptyState title={t('common.table.noResults')} description={t('common.table.noResultsHint', { query: search })} />
            ) : (
              <EmptyState
                icon={Bell}
                title={t('notifications.empty.title')}
                description={t('notifications.empty.description')}
                action={<Button variant="success" size="sm" icon={CirclePlus} onClick={openCreate}>{t('notifications.add')}</Button>}
              />
            )
          }
        />
      )}

      <Pagination tone="success" page={page} totalPages={toTotalPages(query.data?.total ?? 0, limit)} onPageChange={setPage} />

      <NotificationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Card>
  )
}
