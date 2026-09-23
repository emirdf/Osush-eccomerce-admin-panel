import { CirclePlus, LayoutGrid, SquarePen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Category } from '@/api'
import { TopbarActions } from '@/components/layout/TopbarActions'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Image } from '@/components/ui/Image'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useListParams } from '@/hooks/useListParams'
import { toTotalPages } from '@/lib/pagination'
import { toast } from '@/store/toast'
import { useCategories, useDeleteCategory } from './queries'

export function CategoriesPage() {
  const { t } = useTranslation()
  const { page, search, limit, setPage, setSearch } = useListParams(12)
  const query = useCategories({ page, limit, search })
  const remove = useDeleteCategory()
  const errorMessage = useApiErrorMessage()
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success(t('categories.delete.success'))
        setToDelete(null)
      },
      onError: (error) => {
        toast.error(errorMessage(error))
        setToDelete(null)
      },
    })
  }

  const addButton = (
    <ButtonLink to="/categories/new" variant="success" icon={CirclePlus} aria-label={t('categories.add')} className="max-sm:w-10 max-sm:px-0">
      <span className="max-sm:sr-only">{t('categories.add')}</span>
    </ButtonLink>
  )

  return (
    <>
      <TopbarActions>{addButton}</TopbarActions>

      <Card className="flex flex-col gap-4 p-4 sm:p-5">
        <PageHeader>
          <SearchInput value={search} onChange={setSearch} placeholder={t('categories.searchPlaceholder')} />
        </PageHeader>

        {query.isError ? (
          <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
        ) : query.isPending ? (
          <ul className="grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <Card className="flex items-center gap-3 p-3">
                  <Skeleton className="size-14 rounded-control" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : query.data.items.length === 0 ? (
          search ? (
            <EmptyState title={t('common.table.noResults')} description={t('common.table.noResultsHint', { query: search })} />
          ) : (
            <EmptyState icon={LayoutGrid} title={t('categories.empty.title')} description={t('categories.empty.description')} action={addButton} />
          )
        ) : (
          <ul className="grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {query.data.items.map((category) => (
              <li key={category.id}>
                <Card className="group relative flex items-center gap-3 p-3 transition-colors hover:border-border-strong">
                  <Image src={category.image} className="size-14 shrink-0 rounded-control border border-border object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/categories/${category.id}/edit`}
                      className="block truncate text-md font-semibold text-fg after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
                    >
                      {category.name || '—'}
                    </Link>
                  </div>
                  <div className="relative z-10 flex gap-0.5 transition-opacity pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
                    <ButtonLink to={`/categories/${category.id}/edit`} variant="ghost" size="icon-sm" aria-label={t('categories.edit', { name: category.name })} title={t('common.edit')}>
                      <SquarePen className="size-[18px]" />
                    </ButtonLink>
                    <Button variant="ghost-danger" size="icon-sm" onClick={() => setToDelete(category)} aria-label={t('categories.delete.action', { name: category.name })} title={t('common.delete')}>
                      <Trash2 className="size-[18px]" />
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} totalPages={toTotalPages(query.data?.total ?? 0, limit)} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title={t('categories.delete.title')}
        description={toDelete ? t('categories.delete.description', { name: toDelete.name }) : undefined}
      />
    </>
  )
}
