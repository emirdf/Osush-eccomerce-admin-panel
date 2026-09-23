import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { getPageItems } from '@/lib/utils'
import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  tone?: 'primary' | 'success'
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, tone = 'primary', className }: PaginationProps) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null

  const activeTone = tone === 'success' ? 'bg-success-soft text-success-text' : 'bg-primary-soft text-primary-text'

  return (
    <nav aria-label={t('common.pagination.label')} className={cn('flex items-center justify-between gap-3', className)}>
      <Button variant="outline" size="sm" icon={ArrowLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {t('common.pagination.prev')}
      </Button>

      <ul className="hidden items-center gap-1.5 sm:flex">
        {getPageItems(page, totalPages).map((item, i) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${i}`} aria-hidden="true" className="flex h-8 min-w-8 items-center justify-center rounded-md border border-border px-2 text-sm text-fg-subtle">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={t('common.pagination.page', { page: item })}
                className={cn(
                  'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors',
                  item === page ? cn(activeTone, 'font-semibold') : 'border border-border text-fg hover:bg-surface-muted',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>
      <p className="text-sm text-fg-muted sm:hidden" aria-live="polite">
        {t('common.pagination.pageOf', { page, total: totalPages })}
      </p>

      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        {t('common.pagination.next')}
        <ArrowRight className="size-[18px]" aria-hidden="true" />
      </Button>
    </nav>
  )
}
