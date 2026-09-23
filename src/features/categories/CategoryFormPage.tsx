import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { Category, Subcategory } from '@/api'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { FormActions } from '@/components/ui/FormActions'
import { FormPageSkeleton } from '@/components/ui/FormPageSkeleton'
import { FormSection } from '@/components/ui/FormSection'
import { SingleImageUploader } from '@/components/ui/ImageUploader'
import { Input } from '@/components/ui/Input'
import { RepeatableFieldGroup } from '@/components/ui/RepeatableFieldGroup'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { toast } from '@/store/toast'
import { categoriesKeys, subcategoriesKeys, useCategory, useSubcategories } from './queries'
import { saveCategoryWithSubcategories, type SubcategoryFailure } from './save'
import { type CategoryFormValues, categorySchema, emptySubcategory, toCategoryFormValues, toCategoryPayload, toSubcategoryDrafts } from './schema'

export function CategoryFormPage() {
  const { id } = useParams()
  const categoryId = id === undefined ? null : Number(id)
  const category = useCategory(categoryId)
  const subcategories = useSubcategories(categoryId)
  const errorMessage = useApiErrorMessage()

  const loading = categoryId !== null && (category.isPending || subcategories.isPending)
  const failed = categoryId !== null && (category.isError || subcategories.isError)

  if (loading) return <FormPageSkeleton />
  if (failed) {
    return (
      <Card className="p-6">
        <ErrorState
          message={errorMessage(category.error ?? subcategories.error)}
          onRetry={() => {
            void category.refetch()
            void subcategories.refetch()
          }}
        />
      </Card>
    )
  }

  return (
    <CategoryForm
      key={category.data?.id ?? 'new'}
      category={category.data ?? null}
      subcategories={subcategories.data ?? []}
    />
  )
}

function CategoryForm({ category, subcategories }: { category: Category | null; subcategories: Subcategory[] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const errorMessage = useApiErrorMessage()
  const [defaultValues] = useState(() => toCategoryFormValues(category, subcategories))
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [failures, setFailures] = useState<SubcategoryFailure[]>([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema), defaultValues })

  const rows = useFieldArray({ control, name: 'subcategories' })

  const onSubmit = handleSubmit(async (values) => {
    setFailures([])
    setProgress(null)
    try {
      const result = await saveCategoryWithSubcategories({
        id: category?.id,
        payload: toCategoryPayload(values),
        drafts: toSubcategoryDrafts(values),
        original: subcategories,
        onProgress: (done, total) => setProgress({ done, total }),
      })

      void queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
      void queryClient.invalidateQueries({ queryKey: subcategoriesKeys.all })

      if (result.failures.length) {
        // Keep the user here so they can retry just the rows that failed.
        setFailures(result.failures)
        toast.error(t('categories.form.partialFailure', { count: result.failures.length }))
        if (result.categoryId !== null) {
          const fresh = await queryClient.fetchQuery({
            queryKey: subcategoriesKeys.byCategory(result.categoryId),
            queryFn: () => import('@/api').then((m) => m.subcategoriesApi.listAll(result.categoryId)),
          })
          const saved = new Set(fresh.map((sub) => sub.name.trim()))
          reset({
            ...values,
            subcategories: [
              ...fresh.map((sub) => ({ subId: sub.id, name: sub.name })),
              ...values.subcategories.filter((row) => row.name.trim() && !saved.has(row.name.trim())),
            ],
          })
        }
        return
      }

      toast.success(t(category ? 'categories.form.updated' : 'categories.form.created'))
      navigate('/categories')
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setProgress(null)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <Card className="flex flex-col gap-8 p-4 sm:p-6">
        <FormSection title={t('categories.form.about')}>
          <Field label={t('categories.form.name')} error={errors.name?.message} required hint={t('categories.form.nameHint')}>
            <Input placeholder={t('categories.form.namePlaceholder')} {...register('name')} />
          </Field>
        </FormSection>

        <FormSection title={t('categories.form.subcategories')} description={t('categories.form.subcategoriesHint')}>
          {failures.length > 0 && (
            <div role="alert" className="flex items-start gap-2 rounded-control border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger-text">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                {t('categories.form.failedRows')}
                <span className="font-semibold"> {failures.map((failure) => failure.name).join(', ')}</span>
              </span>
            </div>
          )}

          <RepeatableFieldGroup
            variant="inline"
            items={rows.fields}
            minItems={0}
            onAdd={() => rows.append(emptySubcategory())}
            onRemove={rows.remove}
            addLabel={t('categories.form.addSubcategory')}
            removeLabel={(i) => t('categories.form.removeSubcategory', { n: i + 1 })}
            renderItem={(field, i) => (
              <Field key={field.id} label={t('categories.form.subName', { n: i + 1 })} error={errors.subcategories?.[i]?.name?.message}>
                <Input placeholder={t('categories.form.subPlaceholder')} {...register(`subcategories.${i}.name`)} />
              </Field>
            )}
          />
        </FormSection>
      </Card>

      <Card className="flex flex-col gap-6 p-4 sm:p-6 lg:sticky lg:top-3">
        <FormSection title={t('categories.form.image')}>
          <Field error={errors.image?.message} hint={t('categories.form.imageHint')}>
            <Controller
              control={control}
              name="image"
              render={({ field }) => <SingleImageUploader ref={field.ref} value={field.value} onChange={field.onChange} />}
            />
          </Field>
        </FormSection>

        {progress && (
          <p className="text-sm text-fg-muted" aria-live="polite">
            {t('categories.form.savingSubcategories', { done: progress.done, total: progress.total })}
          </p>
        )}

        <FormActions isDirty={isDirty} isSubmitting={isSubmitting} cancelTo="/categories" />
      </Card>
    </form>
  )
}
