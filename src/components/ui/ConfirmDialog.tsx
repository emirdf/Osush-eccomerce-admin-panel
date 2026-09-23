import { type LucideIcon, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  loading?: boolean
  tone?: 'danger' | 'primary'
  icon?: LucideIcon
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  loading = false,
  tone = 'danger',
  icon: Icon = Trash2,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      dismissible={!loading}
      hideClose
      footer={
        <div className="grid w-full grid-cols-2 gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel ?? t('common.delete')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className={cn(
            'flex size-12 items-center justify-center rounded-full',
            tone === 'danger' ? 'bg-danger-soft text-danger-text' : 'bg-primary-soft text-primary-text',
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
        {description && <p className="text-base text-fg-muted">{description}</p>}
      </div>
    </Modal>
  )
}
