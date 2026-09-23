import { z } from 'zod'

/** Note: the image field is `image_path`, and the name is single-language. */
export const categoryDto = z
  .object({ id: z.number(), name: z.string().nullish(), image_path: z.string().nullish() })
  .passthrough()
export type CategoryDto = z.infer<typeof categoryDto>

export const categoryListDto = z
  .object({ total: z.number().nullish(), categories: z.array(categoryDto).nullish() })
  .passthrough()
export type CategoryListDto = z.infer<typeof categoryListDto>
