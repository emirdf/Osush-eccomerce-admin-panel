import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { type Banner, USE_MOCK } from '@/api'
import { Card } from '@/components/ui/Card'
import { DatePicker } from '@/components/ui/DatePicker'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { FormActions } from '@/components/ui/FormActions'
import { FormPageSkeleton } from '@/components/ui/FormPageSkeleton'
import { FormSection } from '@/components/ui/FormSection'
import { GalleryUploader } from '@/components/ui/ImageUploader'
import { Input, Textarea } from '@/components/ui/Input'
import { MockNotice } from '@/components/ui/MockNotice'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { toast } from '@/store/toast'
import { AdStatusBadge } from './AdStatusBadge'
import { useBanner, useSaveBanner } from './queries'
import { type BannerFormOutput, type BannerFormValues, bannerSchema, toBannerFormValues, toBannerPayload } from './schema'

export function AdFormPage() {
  const { id } = useParams()
  const bannerId = id === undefined ? null : Number(id)
  const banner = useBanner(bannerId)
  const errorMessage = useApiErrorMessage()

  if (bannerId !== null && banner.isPending) return <FormPageSkeleton />
  if (bannerId !== null && banner.isError) {
    return (
      <Card className="p-6">
        <ErrorState message={errorMessage(banner.error)} onRetry={() => banner.refetch()} />
      </Card>
    )
  }
  return <AdForm key={banner.data?.id ?? 'new'} banner={banner.data ?? null} />
}

function AdForm({ banner }: { banner: Banner | null }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const save = useSaveBanner(banner?.id)
  const errorMessage = useApiErrorMessage()
  const [defaultValues] = useState(() => toBannerFormValues(banner))

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BannerFormValues, unknown, BannerFormOutput>({ resolver: zodResolver(bannerSchema), defaultValues })

  const displayFrom = useWatch({ control, name: 'displayFrom' })
  const isEdit = banner !== null

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(toBannerPayload(values))
      toast.success(t(isEdit ? 'ads.form.updated' : 'ads.form.created'))
      navigate('/ads')
    } catch (error) {
      toast.error(errorMessage(error))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <Card className="flex flex-col gap-6 p-4 sm:p-6">
        {isEdit && USE_MOCK.bannerWrite && <MockNotice>{t('ads.form.mockNotice')}</MockNotice>}

        <FormSection title={t('ads.form.about')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('ads.form.titleTk')} error={errors.titleTk?.message} required>
              <Input placeholder={t('ads.form.titleTkPlaceholder')} {...register('titleTk')} />
            </Field>
            <Field label={t('ads.form.titleRu')} error={errors.titleRu?.message} required>
              <Input lang="ru" placeholder={t('ads.form.titleRuPlaceholder')} {...register('titleRu')} />
            </Field>
            <Field label={t('ads.form.descriptionTk')} error={errors.descriptionTk?.message}>
              <Textarea rows={4} placeholder={t('ads.form.descriptionTkPlaceholder')} {...register('descriptionTk')} />
            </Field>
            <Field label={t('ads.form.descriptionRu')} error={errors.descriptionRu?.message}>
              <Textarea lang="ru" rows={4} placeholder={t('ads.form.descriptionRuPlaceholder')} {...register('descriptionRu')} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('ads.form.phone')} error={errors.phone?.message}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => <PhoneInput ref={field.ref} name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
              />
            </Field>
            <Field label={t('ads.form.link')} error={errors.url?.message}>
              <Input type="url" inputMode="url" placeholder="https://" {...register('url')} />
            </Field>
            <Field label={t('ads.form.startDate')} error={errors.displayFrom?.message} required>
              <Controller
                control={control}
                name="displayFrom"
                render={({ field }) => <DatePicker ref={field.ref} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
              />
            </Field>
            <Field label={t('ads.form.endDate')} error={errors.displayTo?.message} required>
              <Controller
                control={control}
                name="displayTo"
                render={({ field }) => (
                  <DatePicker ref={field.ref} value={field.value} onChange={field.onChange} onBlur={field.onBlur} min={displayFrom || undefined} />
                )}
              />
            </Field>
          </div>
        </FormSection>

        {isEdit && banner && (
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            {t('ads.form.currentStatus')}
            <AdStatusBadge isActive={banner.isActive} />
            <span className="text-xs text-fg-subtle">{t('ads.form.statusHint')}</span>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-6 p-4 sm:p-6 xl:sticky xl:top-3">
        <FormSection title={t('ads.form.banner')} required>
          <Field error={errors.mainImage?.message} hint={t('ads.form.bannerHint')}>
            <Controller
              control={control}
              name="mainImage"
              render={({ field: mainField }) => (
                <Controller
                  control={control}
                  name="additionalImages"
                  render={({ field: extraField }) => (
                    <GalleryUploader
                      ref={mainField.ref}
                      main={mainField.value}
                      additional={extraField.value}
                      mainAspectClassName="aspect-[16/6]"
                      fit="cover"
                      lockServerImages={isEdit}
                      lockedHint={t('ads.form.imageLockedHint')}
                      onChange={({ main, additional }) => {
                        mainField.onChange(main)
                        extraField.onChange(additional)
                      }}
                    />
                  )}
                />
              )}
            />
          </Field>
        </FormSection>
        <FormActions isDirty={isDirty} isSubmitting={isSubmitting} cancelTo="/ads" />
      </Card>
    </form>
  )
}
