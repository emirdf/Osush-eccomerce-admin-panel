import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface BulkBarProps {
  count: number
  onClear: () => void
  onDelete: () => void
}

/** Appears above a table when rows are selected. */
export function BulkBar({ count, onClear, onDelete }: BulkBarProps) {
  const { t } = useTranslation()
  if (count === 0) return null

  return (
    <div
      role="region"
      aria-label={t('common.bulk.label')}
      className="flex animate-fade-in flex-wrap items-center justify-between gap-2 rounded-control bg-primary-soft px-4 py-2"
    >
      <p className="text-sm font-semibold text-primary-text" aria-live="polite">
        {t('common.bulk.selected', { count })}
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClear}>
          {t('common.bulk.clear')}
        </Button>
        <Button variant="danger" size="sm" icon={Trash2} onClick={onDelete}>
          {t('common.bulk.deleteSelected')}
        </Button>
      </div>
    </div>
  )
}
