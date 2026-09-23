import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { EMPTY_PLACEMENT, type Category, type Product, type ProductPlacement } from '@/api'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { FormActions } from '@/components/ui/FormActions'
import { FormPageSkeleton } from '@/components/ui/FormPageSkeleton'
import { FormSection } from '@/components/ui/FormSection'
import { GalleryUploader } from '@/components/ui/ImageUploader'
import { Input, Textarea } from '@/components/ui/Input'
import { MockNotice } from '@/components/ui/MockNotice'
import { RepeatableFieldGroup } from '@/components/ui/RepeatableFieldGroup'
import { Select, type SelectOption } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useCategoryOptions, useSubcategories } from '@/features/categories/queries'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { toast } from '@/store/toast'
import { useProduct, useProductPlacement, useSaveProduct } from './queries'
import { emptyAttributeRow, type ProductFormOutput, type ProductFormValues, productSchema, toProductFormValues, toProductPayload } from './schema'

export function ProductFormPage() {
  const { id } = useParams()
  const productId = id === undefined ? null : Number(id)
  const product = useProduct(productId)
  const categories = useCategoryOptions()
  // The detail endpoint omits category, subcategory and which image is the
  // cover; they are looked up separately, so the form waits for both.
  const placement = useProductPlacement(product.data ?? null)
  const errorMessage = useApiErrorMessage()

  if (productId !== null && (product.isPending || placement.isPending)) return <FormPageSkeleton />
  if (productId !== null && product.isError) {
    return (
      <Card className="p-6">
        <ErrorState message={errorMessage(product.error)} onRetry={() => product.refetch()} />
      </Card>
    )
  }

  return (
    <ProductForm
      key={product.data?.id ?? 'new'}
      product={product.data ?? null}
      // A failed lookup is not fatal: the admin picks the category by hand.
      placement={placement.data ?? EMPTY_PLACEMENT}
      categories={categories.data ?? []}
      categoriesLoading={categories.isPending}
    />
  )
}

interface ProductFormProps {
  product: Product | null
  placement: ProductPlacement
  categories: Category[]
  categoriesLoading: boolean
}

function ProductForm({ product, placement, categories, categoriesLoading }: ProductFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const save = useSaveProduct(product?.id)
  const errorMessage = useApiErrorMessage()
  const [defaultValues] = useState(() => toProductFormValues(product, placement))

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues, unknown, ProductFormOutput>({ resolver: zodResolver(productSchema), defaultValues })

  const attributes = useFieldArray({ control, name: 'attributes' })
  const categoryId = useWatch({ control, name: 'categoryId' })
  const subcategories = useSubcategories(categoryId ? Number(categoryId) : null)

  const categoryOptions = useMemo<SelectOption[]>(
    () => categories.map((category) => ({ value: String(category.id), label: category.name })),
    [categories],
  )
  const subcategoryOptions = useMemo<SelectOption[]>(
    () => (subcategories.data ?? []).map((sub) => ({ value: String(sub.id), label: sub.name })),
    [subcategories.data],
  )

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(toProductPayload(values))
      toast.success(t(product ? 'products.form.updated' : 'products.form.created'))
      navigate('/products')
    } catch (error) {
      toast.error(errorMessage(error))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <Card className="flex flex-col gap-8 p-4 sm:p-6">
        <FormSection title={t('products.form.about')}>
          <Field label={t('products.form.name')} error={errors.name?.message} required hint={t('products.form.nameHint')}>
            <Input placeholder={t('products.form.namePlaceholder')} {...register('name')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('products.form.descriptionTk')} error={errors.descriptionTk?.message}>
              <Textarea rows={5} placeholder={t('products.form.descriptionTkPlaceholder')} {...register('descriptionTk')} />
            </Field>
            <Field label={t('products.form.descriptionRu')} error={errors.descriptionRu?.message}>
              <Textarea lang="ru" rows={5} placeholder={t('products.form.descriptionRuPlaceholder')} {...register('descriptionRu')} />
            </Field>
          </div>
        </FormSection>

        <FormSection title={t('products.form.pricing')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('products.form.price')} error={errors.price?.message} required>
              <Input inputMode="decimal" suffix="TMT" placeholder="0" {...register('price')} />
            </Field>
            <Field label={t('products.form.discountPrice')} error={errors.discountPrice?.message} hint={t('products.form.discountHint')}>
              <Input inputMode="decimal" suffix="TMT" placeholder="0" {...register('discountPrice')} />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border p-4">
            <Field className="flex-1" hint={t('products.form.pausedHint')}>
              <div className="flex items-center gap-3">
                <Controller
                  control={control}
                  name="isPaused"
                  render={({ field }) => (
                    <Switch
                      ref={field.ref}
                      checked={!field.value}
                      onChange={(checked) => field.onChange(!checked)}
                      aria-label={t('products.form.onSale')}
                    />
                  )}
                />
                <span className="text-base font-semibold text-fg">{t('products.form.onSale')}</span>
              </div>
            </Field>
          </div>
        </FormSection>

        <FormSection title={t('products.form.attributes')} description={t('products.form.attributesHint')}>
          <RepeatableFieldGroup
            items={attributes.fields}
            minItems={1}
            onAdd={() => attributes.append(emptyAttributeRow())}
            onRemove={attributes.remove}
            addLabel={t('products.form.addAttribute')}
            removeLabel={(i) => t('products.form.removeAttribute', { n: i + 1 })}
            itemTitle={(i) => t('products.form.attributeN', { n: i + 1 })}
            renderItem={(field, i) => {
              const error = errors.attributes?.[i]
              return (
                <div key={field.id} className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                  <Field label={t('products.form.attrKeyTk')} error={error?.keyTk?.message}>
                    <Input placeholder={t('products.form.attrKeyTkPlaceholder')} {...register(`attributes.${i}.keyTk`)} />
                  </Field>
                  <Field label={t('products.form.attrValue')} error={error?.valueTk?.message}>
                    <Input placeholder={t('products.form.attrValueTkPlaceholder')} {...register(`attributes.${i}.valueTk`)} />
                  </Field>
                  <Field label={t('products.form.attrKeyRu')} error={error?.keyRu?.message}>
                    <Input lang="ru" placeholder={t('products.form.attrKeyRuPlaceholder')} {...register(`attributes.${i}.keyRu`)} />
                  </Field>
                  <Field label={t('products.form.attrValue')} error={error?.valueRu?.message}>
                    <Input lang="ru" placeholder={t('products.form.attrValueRuPlaceholder')} {...register(`attributes.${i}.valueRu`)} />
                  </Field>
                </div>
              )
            }}
          />
        </FormSection>
      </Card>

      <Card className="flex flex-col gap-6 p-4 sm:p-6 xl:sticky xl:top-3">
        <FormSection title={t('products.form.images')} required>
          <Field error={errors.mainImage?.message} hint={t('products.form.imagesHint')}>
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
                      lockServerImages={product !== null}
                      lockedHint={t('products.form.imageLockedHint')}
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

        <div className="flex flex-col gap-4">
          {/* The detail endpoint returns no subcategory; when the lookup could
              not recover it either, the admin has to pick one. See API_GAPS.md. */}
          {product && !defaultValues.subcategoryId && <MockNotice>{t('products.form.categoryUnknownNotice')}</MockNotice>}

          <Field label={t('products.form.category')} error={errors.categoryId?.message} required>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  ref={field.ref}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue('subcategoryId', '', { shouldValidate: false })
                  }}
                  onBlur={field.onBlur}
                  options={categoryOptions}
                  searchable
                  disabled={categoriesLoading}
                  placeholder={t('products.form.categoryPlaceholder')}
                />
              )}
            />
          </Field>

          <Field
            label={t('products.form.subcategory')}
            error={errors.subcategoryId?.message}
            required
            hint={categoryId ? undefined : t('products.form.subcategoryHint')}
          >
            <Controller
              control={control}
              name="subcategoryId"
              render={({ field }) => (
                <Select
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={subcategoryOptions}
                  searchable
                  disabled={!categoryId || subcategories.isPending}
                  placeholder={t('products.form.subcategoryPlaceholder')}
                />
              )}
            />
          </Field>
        </div>

        <FormActions isDirty={isDirty} isSubmitting={isSubmitting} cancelTo="/products" />
      </Card>
    </form>
  )
}
