import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'

interface FormActionsProps {
  isDirty: boolean
  isSubmitting: boolean
  /** Where "cancel" goes. Asks for confirmation first if there are unsaved changes. */
  cancelTo: string
  className?: string
}

export function FormActions({ isDirty, isSubmitting, cancelTo, className }: FormActionsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className={cn('flex items-center justify-between gap-3', className)}>
        <Button variant="secondary" disabled={isSubmitting} onClick={() => (isDirty ? setConfirmOpen(true) : navigate(cancelTo))}>
          {t('common.cancelEdit')}
        </Button>
        <Button type="submit" variant="success" loading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => navigate(cancelTo)}
        icon={TriangleAlert}
        title={t('common.discard.title')}
        description={t('common.discard.description')}
        confirmLabel={t('common.discard.confirm')}
      />
    </>
  )
}
