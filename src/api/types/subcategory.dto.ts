import { z } from 'zod'

export const subcategoryDto = z
  .object({ id: z.number(), name: z.string().nullish(), category_id: z.number().nullish() })
  .passthrough()
export type SubcategoryDto = z.infer<typeof subcategoryDto>

export const subcategoryListDto = z
  .object({ total: z.number().nullish(), subcategories: z.array(subcategoryDto).nullish() })
  .passthrough()
export type SubcategoryListDto = z.infer<typeof subcategoryListDto>
