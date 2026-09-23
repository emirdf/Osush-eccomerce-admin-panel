import type { MouseEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { ID } from '@/api'
import { cn } from '@/lib/cn'
import { Checkbox } from './Checkbox'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'

export interface Column<T> {
  id: string
  header: ReactNode
  cell: (row: T, index: number) => ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
  /** Skeleton width while loading, e.g. "w-24". */
  skeleton?: string
}

interface Selection<T> {
  selected: ID[]
  onChange: (ids: ID[]) => void
  rowLabel: (row: T) => string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => ID
  caption: string
  isLoading?: boolean
  /** Background refetch with stale rows on screen. */
  isFetching?: boolean
  skeletonRows?: number
  tone?: 'primary' | 'success'
  selection?: Selection<T>
  empty?: ReactNode
  dense?: boolean
  minWidth?: number
  /**
   * Makes the whole row clickable (mouse only). Keep a real link or button in
   * one of the cells for keyboard and screen-reader users.
   */
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string | undefined
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  isLoading,
  isFetching,
  skeletonRows = 10,
  tone = 'primary',
  selection,
  empty,
  dense,
  minWidth = 720,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const pageIds = rows?.map(rowKey) ?? []
  const selectedOnPage = selection ? pageIds.filter((id) => selection.selected.includes(id)) : []
  const allSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length
  const someSelected = selectedOnPage.length > 0 && !allSelected
  const colSpan = columns.length + (selection ? 1 : 0)
  const cellPad = dense ? 'px-3 py-2.5' : 'px-4 py-3'

  const headerTone = tone === 'success' ? 'bg-success-soft' : 'bg-primary-soft'

  const toggleAll = () => {
    if (!selection) return
    selection.onChange(allSelected ? selection.selected.filter((id) => !pageIds.includes(id)) : [...new Set([...selection.selected, ...pageIds])])
  }

  const toggleRow = (id: ID) => {
    if (!selection) return
    selection.onChange(selection.selected.includes(id) ? selection.selected.filter((x) => x !== id) : [...selection.selected, id])
  }

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, row: T) => {
    // Links, buttons and checkboxes inside the row handle their own clicks.
    if ((event.target as HTMLElement).closest('a, button, input, label')) return
    // Don't hijack text selection.
    if (window.getSelection()?.toString()) return
    onRowClick?.(row)
  }

  return (
    // `relative` keeps absolutely positioned cell content (e.g. sr-only text) inside the scroll area.
    <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full border-separate border-spacing-0 text-base" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {selection && (
              <th scope="col" className={cn('w-12 rounded-l-control pl-4', headerTone)}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  disabled={!rows?.length}
                  aria-label={t('common.table.selectAll')}
                />
              </th>
            )}
            {columns.map((col, i) => (
              <th
                key={col.id}
                scope="col"
                className={cn(
                  'h-11 font-semibold whitespace-nowrap text-fg',
                  dense ? 'px-3 text-sm' : 'px-4 text-sm',
                  headerTone,
                  alignClass[col.align ?? 'left'],
                  i === 0 && !selection && 'rounded-l-control',
                  i === columns.length - 1 && 'rounded-r-control',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody aria-busy={isLoading || isFetching || undefined} className={cn('transition-opacity', isFetching && !isLoading && 'opacity-60')}>
          {isLoading &&
            Array.from({ length: skeletonRows }, (_, r) => (
              <tr key={`skeleton-${r}`}>
                {selection && (
                  <td className={cn(cellPad, 'border-b border-border pl-4')}>
                    <Skeleton className="size-[18px]" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.id} className={cn(cellPad, 'border-b border-border')}>
                    <Skeleton className={cn('h-4', col.skeleton ?? 'w-20', col.align === 'center' && 'mx-auto', col.align === 'right' && 'ml-auto')} />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && rows?.length === 0 && (
            <tr>
              <td colSpan={colSpan}>{empty ?? <EmptyState title={t('common.table.empty')} />}</td>
            </tr>
          )}

          {!isLoading &&
            rows?.map((row, index) => {
              const id = rowKey(row)
              const isSelected = selection?.selected.includes(id)
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
                  className={cn(
                    'transition-colors hover:bg-surface-hover',
                    rowClassName?.(row),
                    isSelected && 'bg-primary-soft/50',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {selection && (
                    <td className={cn(cellPad, 'border-b border-border pl-4')}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        aria-label={t('common.table.selectRow', { name: selection.rowLabel(row) })}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.id} className={cn(cellPad, 'border-b border-border text-fg', alignClass[col.align ?? 'left'], col.className)}>
                      {col.cell(row, index)}
                    </td>
                  ))}
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
