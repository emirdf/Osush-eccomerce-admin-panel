import { Bell, CirclePlus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type ID, type Notification } from '@/api'
import { AdsSectionTabs } from '@/features/ads/AdsSectionTabs'
import { BulkBar } from '@/components/ui/BulkBar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
import { toast } from '@/store/toast'
import { NotificationModal } from './NotificationModal'
import { useDeleteNotifications, useNotifications } from './queries'

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const { page, search, limit, setPage, setSearch } = useListParams()
  const query = useNotifications({ page, limit, search })
  const remove = useDeleteNotifications()
  const errorMessage = useApiErrorMessage()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<ID[]>([])
  const [pendingDelete, setPendingDelete] = useState<{ ids: ID[]; name?: string } | null>(null)

  const listKey = `${page}|${search}`
  const [prevListKey, setPrevListKey] = useState(listKey)
  if (listKey !== prevListKey) {
    setPrevListKey(listKey)
    setSelected([])
  }

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
      className: 'w-24',
      skeleton: 'w-8',
      cell: (n) => {
        const name = localized(n.title, i18n.language)
        return (
          <Button variant="ghost-danger" size="icon-sm" onClick={() => setPendingDelete({ ids: [n.id], name })} aria-label={t('notifications.delete.action', { name })} title={t('common.delete')}>
            <Trash2 className="size-[18px]" />
          </Button>
        )
      },
    },
  ]

  const confirmDelete = () => {
    if (!pendingDelete) return
    remove.mutate(pendingDelete.ids, {
      onSuccess: () => {
        toast.success(t('notifications.delete.success', { count: pendingDelete.ids.length }))
        setSelected((ids) => ids.filter((id) => !pendingDelete.ids.includes(id)))
        setPendingDelete(null)
      },
      onError: (error) => toast.error(errorMessage(error)),
    })
  }

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <AdsSectionTabs />
      <PageHeader actions={<Button variant="success" icon={CirclePlus} onClick={openCreate}>{t('notifications.add')}</Button>}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('notifications.searchPlaceholder')} />
      </PageHeader>

      <BulkBar count={selected.length} onClear={() => setSelected([])} onDelete={() => setPendingDelete({ ids: selected })} />

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
          selection={{ selected, onChange: setSelected, rowLabel: (n) => localized(n.title, i18n.language) }}
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

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title={t('notifications.delete.title')}
        description={
          pendingDelete?.name
            ? t('notifications.delete.descriptionOne', { name: pendingDelete.name })
            : t('notifications.delete.descriptionMany', { count: pendingDelete?.ids.length ?? 0 })
        }
      />
    </Card>
  )
}
