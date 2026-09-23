import { z } from 'zod'
import type { Category, CategoryPayload, Subcategory } from '@/api'
import { uid } from '@/lib/utils'
import { imageSchema, requiredString } from '@/lib/validation'
import type { SubcategoryDraft } from './save'

/** The API stores a single `name` per category — not one per language. */
export const categorySchema = z.object({
  name: requiredString(120),
  subcategories: z.array(z.object({ subId: z.number().optional(), name: z.string().max(120, 'validation.tooLong') })),
  image: imageSchema.nullable(),
})

export type CategoryFormValues = z.input<typeof categorySchema>

export const emptySubcategory = (): CategoryFormValues['subcategories'][number] => ({ subId: undefined, name: '' })

export function toCategoryFormValues(category: Category | null, subcategories: Subcategory[]): CategoryFormValues {
  return {
    name: category?.name ?? '',
    // `subId` rather than `id`: react-hook-form reserves `id` on field-array items.
    subcategories: subcategories.length ? subcategories.map((sub) => ({ subId: sub.id, name: sub.name })) : [emptySubcategory()],
    image: category?.image ? { id: uid('img'), url: category.image } : null,
  }
}

export function toCategoryPayload(values: CategoryFormValues): CategoryPayload {
  return { name: values.name.trim(), image: values.image }
}

export const toSubcategoryDrafts = (values: CategoryFormValues): SubcategoryDraft[] =>
  values.subcategories.filter((row) => row.name.trim()).map((row) => ({ subId: row.subId, name: row.name.trim() }))
