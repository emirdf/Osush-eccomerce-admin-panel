import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { NotificationPayload } from '@/api'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { parseAmount } from '@/lib/utils'
import { amountString, requiredString } from '@/lib/validation'
import { toast } from '@/store/toast'
import { useCreateNotification } from './queries'

/** Title and body are bilingual; `life` is a positive whole number. */
const notificationSchema = z.object({
  titleTk: requiredString(120),
  titleRu: requiredString(120),
  bodyTk: requiredString(1000),
  bodyRu: requiredString(1000),
  life: amountString({ required: true, integer: true, positive: true }),
})

type NotificationValues = z.infer<typeof notificationSchema>

const DEFAULT_VALUES: NotificationValues = { titleTk: '', titleRu: '', bodyTk: '', bodyRu: '', life: '3' }

const toNotificationPayload = (values: NotificationValues): NotificationPayload => ({
  title: { tk: values.titleTk, ru: values.titleRu },
  body: { tk: values.bodyTk, ru: values.bodyRu },
  life: parseAmount(values.life),
})

interface NotificationModalProps {
  open: boolean
  onClose: () => void
}

/** Create only — the API has no endpoint to edit a sent notification. */
export function NotificationModal({ open, onClose }: NotificationModalProps) {
  const { t } = useTranslation()
  const create = useCreateNotification()
  const formId = useId()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      dismissible={!create.isPending}
      title={t('notifications.form.createTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={create.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} variant="success" loading={create.isPending}>
            {t('notifications.form.send')}
          </Button>
        </>
      }
    >
      <NotificationForm formId={formId} create={create} onDone={onClose} />
    </Modal>
  )
}

function NotificationForm({
  formId,
  create,
  onDone,
}: {
  formId: string
  create: ReturnType<typeof useCreateNotification>
  onDone: () => void
}) {
  const { t } = useTranslation()
  const errorMessage = useApiErrorMessage()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotificationValues>({ resolver: zodResolver(notificationSchema), defaultValues: DEFAULT_VALUES })

  const onSubmit = handleSubmit((values) =>
    create.mutate(toNotificationPayload(values), {
      onSuccess: () => {
        toast.success(t('notifications.form.created'))
        onDone()
      },
      onError: (error) => toast.error(errorMessage(error)),
    }),
  )

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('notifications.form.titleTk')} error={errors.titleTk?.message} required>
          <Input data-autofocus placeholder={t('notifications.form.titleTkPlaceholder')} {...register('titleTk')} />
        </Field>
        <Field label={t('notifications.form.titleRu')} error={errors.titleRu?.message} required>
          <Input lang="ru" placeholder={t('notifications.form.titleRuPlaceholder')} {...register('titleRu')} />
        </Field>
        <Field label={t('notifications.form.bodyTk')} error={errors.bodyTk?.message} required>
          <Textarea rows={5} placeholder={t('notifications.form.bodyTkPlaceholder')} {...register('bodyTk')} />
        </Field>
        <Field label={t('notifications.form.bodyRu')} error={errors.bodyRu?.message} required>
          <Textarea lang="ru" rows={5} placeholder={t('notifications.form.bodyRuPlaceholder')} {...register('bodyRu')} />
        </Field>
      </div>
      <Field label={t('notifications.form.life')} error={errors.life?.message} hint={t('notifications.form.lifeHint')} required>
        <Input inputMode="numeric" className="sm:max-w-40" {...register('life')} />
      </Field>
    </form>
  )
}
