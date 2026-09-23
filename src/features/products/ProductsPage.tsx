import { CirclePlus, Package, SquarePen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ID, ProductListItem } from '@/api'
import { Badge } from '@/components/ui/Badge'
import { BulkBar } from '@/components/ui/BulkBar'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { type Column, DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { MediaCell } from '@/components/ui/MediaCell'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useListParams } from '@/hooks/useListParams'
import { formatDate, formatMoney, formatNumber } from '@/lib/format'
import { toTotalPages } from '@/lib/pagination'
import { toast } from '@/store/toast'
import { useDeleteProducts, useProducts } from './queries'

export function ProductsPage() {
  const { t } = useTranslation()
  const { page, search, limit, setPage, setSearch } = useListParams()
  const query = useProducts({ page, limit, search })
  const remove = useDeleteProducts()
  const errorMessage = useApiErrorMessage()

  const [selected, setSelected] = useState<ID[]>([])
  const [pendingDelete, setPendingDelete] = useState<{ ids: ID[]; name?: string } | null>(null)

  // Selection is per page: reset it when the page or search changes.
  const listKey = `${page}|${search}`
  const [prevListKey, setPrevListKey] = useState(listKey)
  if (listKey !== prevListKey) {
    setPrevListKey(listKey)
    setSelected([])
  }

  const columns: Column<ProductListItem>[] = [
    { id: 'no', header: t('products.table.no'), cell: (_, i) => (page - 1) * limit + i + 1, className: 'w-14 text-fg-muted tabular-nums', skeleton: 'w-6' },
    {
      id: 'product',
      header: t('products.table.product'),
      cell: (product) => <MediaCell src={product.image} title={product.name} />,
      className: 'min-w-56',
      skeleton: 'w-44',
    },
    { id: 'created', header: t('products.table.createdAt'), align: 'center', cell: (product) => <span className="tabular-nums">{formatDate(product.createdAt)}</span> },
    { id: 'orders', header: t('products.table.orders'), align: 'center', cell: (product) => formatNumber(product.orderCount), skeleton: 'w-10' },
    {
      id: 'status',
      header: t('products.table.status'),
      align: 'center',
      skeleton: 'w-16',
      // is_paused is not in the original UI spec — added per §4.5.
      cell: (product) => (
        <Badge tone={product.isPaused ? 'danger' : 'success'}>
          {t(product.isPaused ? 'products.status.paused' : 'products.status.onSale')}
        </Badge>
      ),
    },
    {
      id: 'price',
      header: t('products.table.price'),
      align: 'right',
      cell: (product) =>
        product.discountPrice ? (
          <div className="flex flex-col items-end">
            <span className="font-semibold whitespace-nowrap">{formatMoney(product.discountPrice)}</span>
            <span className="text-xs whitespace-nowrap text-fg-subtle line-through">{formatMoney(product.price)}</span>
          </div>
        ) : (
          <span className="font-semibold whitespace-nowrap">{formatMoney(product.price)}</span>
        ),
    },
    {
      id: 'actions',
      header: t('common.table.actions'),
      align: 'center',
      className: 'w-28',
      skeleton: 'w-14',
      cell: (product) => (
        <div className="flex items-center justify-center gap-1">
          <ButtonLink to={`/products/${product.id}/edit`} variant="ghost" size="icon-sm" aria-label={t('products.edit', { name: product.name })} title={t('common.edit')}>
            <SquarePen className="size-[18px]" />
          </ButtonLink>
          <Button variant="ghost-danger" size="icon-sm" onClick={() => setPendingDelete({ ids: [product.id], name: product.name })} aria-label={t('products.delete.action', { name: product.name })} title={t('common.delete')}>
            <Trash2 className="size-[18px]" />
          </Button>
        </div>
      ),
    },
  ]

  const confirmDelete = () => {
    if (!pendingDelete) return
    remove.mutate(pendingDelete.ids, {
      onSuccess: () => {
        toast.success(t('products.delete.success', { count: pendingDelete.ids.length }))
        setSelected((ids) => ids.filter((id) => !pendingDelete.ids.includes(id)))
        setPendingDelete(null)
      },
      onError: (error) => {
        toast.error(errorMessage(error))
        setPendingDelete(null)
      },
    })
  }

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <PageHeader actions={<ButtonLink to="/products/new" variant="success" icon={CirclePlus}>{t('products.add')}</ButtonLink>}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('products.searchPlaceholder')} />
      </PageHeader>

      <BulkBar count={selected.length} onClear={() => setSelected([])} onDelete={() => setPendingDelete({ ids: selected })} />

      {query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <DataTable
          caption={t('nav.products')}
          columns={columns}
          rows={query.data?.items}
          rowKey={(product) => product.id}
          isLoading={query.isPending}
          isFetching={query.isPlaceholderData}
          selection={{ selected, onChange: setSelected, rowLabel: (product) => product.name }}
          minWidth={900}
          empty={
            search ? (
              <EmptyState title={t('common.table.noResults')} description={t('common.table.noResultsHint', { query: search })} />
            ) : (
              <EmptyState
                icon={Package}
                title={t('products.empty.title')}
                description={t('products.empty.description')}
                action={<ButtonLink to="/products/new" variant="success" size="sm" icon={CirclePlus}>{t('products.add')}</ButtonLink>}
              />
            )
          }
        />
      )}

      <Pagination page={page} totalPages={toTotalPages(query.data?.total ?? 0, limit)} onPageChange={setPage} />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title={t('products.delete.title')}
        description={
          pendingDelete?.name
            ? t('products.delete.descriptionOne', { name: pendingDelete.name })
            : t('products.delete.descriptionMany', { count: pendingDelete?.ids.length ?? 0 })
        }
      />
    </Card>
  )
}
