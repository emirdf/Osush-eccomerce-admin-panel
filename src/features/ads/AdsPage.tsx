import { CirclePlus, Megaphone, SquarePen, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type Banner, DISABLED } from '@/api'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { type Column, DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { MediaCell } from '@/components/ui/MediaCell'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useListParams } from '@/hooks/useListParams'
import { formatDate } from '@/lib/format'
import { localized } from '@/lib/i18n'
import { toTotalPages } from '@/lib/pagination'
import { AdsSectionTabs } from './AdsSectionTabs'
import { AdStatusBadge } from './AdStatusBadge'
import { useBanners } from './queries'

export function AdsPage() {
  const { t, i18n } = useTranslation()
  const { page, search, limit, setPage, setSearch } = useListParams()
  const query = useBanners({ page, limit, search })
  const errorMessage = useApiErrorMessage()

  const columns: Column<Banner>[] = [
    { id: 'no', header: t('ads.table.no'), cell: (_, i) => (page - 1) * limit + i + 1, className: 'w-14 text-fg-muted tabular-nums', skeleton: 'w-6' },
    {
      id: 'title',
      header: t('ads.table.title'),
      cell: (banner) => <MediaCell src={banner.image} title={localized(banner.title, i18n.language)} shape="wide" />,
      className: 'min-w-56',
      skeleton: 'w-44',
    },
    { id: 'start', header: t('ads.table.startDate'), align: 'center', cell: (banner) => <span className="tabular-nums">{formatDate(banner.displayFrom)}</span> },
    { id: 'end', header: t('ads.table.endDate'), align: 'center', cell: (banner) => <span className="tabular-nums">{formatDate(banner.displayTo)}</span> },
    { id: 'status', header: t('ads.table.status'), align: 'center', cell: (banner) => <AdStatusBadge isActive={banner.isActive} />, skeleton: 'w-16' },
    {
      id: 'actions',
      header: t('common.table.actions'),
      align: 'center',
      className: 'w-28',
      skeleton: 'w-14',
      cell: (banner) => (
        <div className="flex items-center justify-center gap-1">
          <ButtonLink to={`/ads/${banner.id}/edit`} variant="ghost" size="icon-sm" aria-label={t('ads.edit', { name: localized(banner.title, i18n.language) })} title={t('common.edit')}>
            <SquarePen className="size-[18px]" />
          </ButtonLink>
          {/* DELETE /banner/{id} does not exist — disabled rather than faked. */}
          <Button variant="ghost-danger" size="icon-sm" disabled={DISABLED.bannerDelete} title={t('ads.delete.unavailable')} aria-label={t('ads.delete.unavailable')}>
            <Trash2 className="size-[18px]" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <AdsSectionTabs />
      <PageHeader actions={<ButtonLink to="/ads/new" variant="success" icon={CirclePlus}>{t('ads.add')}</ButtonLink>}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('ads.searchPlaceholder')} />
      </PageHeader>

      {query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <DataTable
          tone="success"
          caption={t('ads.tabs.banners')}
          columns={columns}
          rows={query.data?.items}
          rowKey={(banner) => banner.id}
          isLoading={query.isPending}
          isFetching={query.isPlaceholderData}
          minWidth={840}
          empty={
            search ? (
              <EmptyState title={t('common.table.noResults')} description={t('common.table.noResultsHint', { query: search })} />
            ) : (
              <EmptyState icon={Megaphone} title={t('ads.empty.title')} description={t('ads.empty.description')} />
            )
          }
        />
      )}

      <Pagination tone="success" page={page} totalPages={toTotalPages(query.data?.total ?? 0, limit)} onPageChange={setPage} />
    </Card>
  )
}
