import { z } from 'zod'

const localizedDto = z.object({ tm: z.string().nullish(), ru: z.string().nullish() }).passthrough()

export const bannerDto = z
  .object({
    id: z.number(),
    title: localizedDto.nullish(),
    url: z.string().nullish(),
    description: localizedDto.nullish(),
    phone_number: z.string().nullish(),
    image: z.string().nullish(),
    images: z.array(z.string()).nullish(),
    /** "15-09-2026" */
    display_from: z.string().nullish(),
    display_to: z.string().nullish(),
    /** Computed by the server — never recomputed client-side. */
    is_active: z.boolean().nullish(),
  })
  .passthrough()
export type BannerDto = z.infer<typeof bannerDto>

export const bannerListDto = z
  .object({ total: z.number().nullish(), banners: z.array(bannerDto).nullish() })
  .passthrough()
export type BannerListDto = z.infer<typeof bannerListDto>
