import { z } from 'zod'

const localizedDto = z.object({ tm: z.string().nullish(), ru: z.string().nullish() }).passthrough()

/** `{ "<key>": "<value>" }` per language. */
const attributeMapDto = z.record(z.string(), z.string().nullish())
const attributesDto = z.object({ tm: attributeMapDto.nullish(), ru: attributeMapDto.nullish() }).passthrough()

export type AttributeMapDto = z.infer<typeof attributeMapDto>
export type AttributesDto = z.infer<typeof attributesDto>

export const productListItemDto = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
    price: z.number().nullish(),
    discount_price: z.number().nullish(),
    image: z.string().nullish(),
    is_paused: z.boolean().nullish(),
    order_count: z.number().nullish(),
    /** "03-09-2026" */
    created_at: z.string().nullish(),
    /** Storefront-only flag; ignored in the admin panel. */
    is_liked: z.boolean().nullish(),
  })
  .passthrough()
export type ProductListItemDto = z.infer<typeof productListItemDto>

export const productListDto = z
  .object({ total: z.number().nullish(), products: z.array(productListItemDto).nullish() })
  .passthrough()

export const productDetailDto = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
    description: localizedDto.nullish(),
    price: z.number().nullish(),
    discount_price: z.number().nullish(),
    attributes: attributesDto.nullish(),
    is_paused: z.boolean().nullish(),
    images: z.array(z.string()).nullish(),
    /** Not documented and absent in live responses — used when the backend adds it. */
    subcategory_id: z.number().nullish(),
    category_id: z.number().nullish(),
  })
  .passthrough()
export type ProductDetailDto = z.infer<typeof productDetailDto>
