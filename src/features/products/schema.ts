import { z } from 'zod'
import {
  duplicateAttributeRows,
  isEmptyAttributeRow,
  orderProductImages,
  type Product,
  type ProductPayload,
  type ProductPlacement,
} from '@/api'
import { parseAmount, uid } from '@/lib/utils'
import { amountString, imageSchema, requiredString } from '@/lib/validation'

const attributeRowSchema = z.object({
  keyTk: z.string().max(120, 'validation.tooLong'),
  valueTk: z.string().max(400, 'validation.tooLong'),
  keyRu: z.string().max(120, 'validation.tooLong'),
  valueRu: z.string().max(400, 'validation.tooLong'),
})

export const productSchema = z
  .object({
    /** The API keeps one name; only description and attributes are bilingual. */
    name: requiredString(200),
    descriptionTk: z.string().max(2000, 'validation.tooLong'),
    descriptionRu: z.string().max(2000, 'validation.tooLong'),
    price: amountString({ required: true, positive: true }),
    discountPrice: amountString({ required: false, positive: true }),
    /** UI-only: drives which subcategories are loaded. */
    categoryId: z.string().min(1, 'validation.required'),
    /** The product belongs to a subcategory — this is what gets submitted. */
    subcategoryId: z.string().min(1, 'validation.required'),
    isPaused: z.boolean(),
    attributes: z.array(attributeRowSchema),
    mainImage: imageSchema.nullable().refine((value) => value !== null, 'validation.mainImageRequired'),
    additionalImages: z.array(imageSchema),
  })
  .superRefine((values, ctx) => {
    const price = parseAmount(values.price)
    const discount = parseAmount(values.discountPrice)
    if (values.discountPrice.trim() && !Number.isNaN(price) && !Number.isNaN(discount) && discount >= price) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountPrice'], message: 'validation.discountLessThanPrice' })
    }

    // A value without a key cannot be stored in the API's object map.
    values.attributes.forEach((row, index) => {
      if (row.valueTk.trim() && !row.keyTk.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['attributes', index, 'keyTk'], message: 'validation.attributeKeyRequired' })
      }
      if (row.valueRu.trim() && !row.keyRu.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['attributes', index, 'keyRu'], message: 'validation.attributeKeyRequired' })
      }
    })

    // Duplicate keys would silently overwrite each other — warn instead.
    const duplicates = duplicateAttributeRows(values.attributes)
    duplicates.tk.forEach((index) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['attributes', index, 'keyTk'], message: 'validation.duplicateAttributeKey' }),
    )
    duplicates.ru.forEach((index) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['attributes', index, 'keyRu'], message: 'validation.duplicateAttributeKey' }),
    )
  })

export type ProductFormValues = z.input<typeof productSchema>
export type ProductFormOutput = z.output<typeof productSchema>

export const emptyAttributeRow = () => ({ keyTk: '', valueTk: '', keyRu: '', valueRu: '' })

/**
 * `placement` fills the three things `GET /product/{id}` does not return: the
 * category, the subcategory and which of `images` is the cover. The detail
 * response is still preferred when it carries them, so this degrades to a
 * no-op the day the backend adds them.
 */
export function toProductFormValues(product: Product | null, placement?: ProductPlacement | null): ProductFormValues {
  const categoryId = product?.categoryId ?? placement?.categoryId ?? null
  const subcategoryId = product?.subcategoryId ?? placement?.subcategoryId ?? null
  const [main, ...rest] = orderProductImages(product?.images ?? [], placement?.mainImage)
  return {
    name: product?.name ?? '',
    descriptionTk: product?.description.tk ?? '',
    descriptionRu: product?.description.ru ?? '',
    price: product ? String(product.price) : '',
    discountPrice: product?.discountPrice != null ? String(product.discountPrice) : '',
    categoryId: categoryId != null ? String(categoryId) : '',
    subcategoryId: subcategoryId != null ? String(subcategoryId) : '',
    isPaused: product?.isPaused ?? false,
    attributes: product?.attributes.length ? product.attributes : [emptyAttributeRow()],
    mainImage: main ? { id: uid('img'), url: main } : null,
    additionalImages: rest.map((url) => ({ id: uid('img'), url })),
  }
}

export function toProductPayload(values: ProductFormOutput): ProductPayload {
  return {
    name: values.name,
    description: { tk: values.descriptionTk.trim(), ru: values.descriptionRu.trim() },
    price: parseAmount(values.price),
    discountPrice: values.discountPrice.trim() ? parseAmount(values.discountPrice) : null,
    subcategoryId: Number(values.subcategoryId),
    attributes: values.attributes.filter((row) => !isEmptyAttributeRow(row)),
    isPaused: values.isPaused,
    mainImage: values.mainImage,
    additionalImages: values.additionalImages,
  }
}
