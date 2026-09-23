import { z } from 'zod'
import type { Banner, BannerPayload } from '@/api'
import { uid } from '@/lib/utils'
import { imageSchema, optionalHttpsUrl, optionalPhoneSchema, requiredString } from '@/lib/validation'

/** title and description are bilingual; url, description and phone may be null. */
export const bannerSchema = z
  .object({
    titleTk: requiredString(160),
    titleRu: requiredString(160),
    descriptionTk: z.string().max(1000, 'validation.tooLong'),
    descriptionRu: z.string().max(1000, 'validation.tooLong'),
    url: optionalHttpsUrl,
    phone: optionalPhoneSchema,
    displayFrom: z.string().min(1, 'validation.required'),
    displayTo: z.string().min(1, 'validation.required'),
    mainImage: imageSchema.nullable().refine((value) => value !== null, 'validation.bannerRequired'),
    additionalImages: z.array(imageSchema),
  })
  .superRefine((values, ctx) => {
    if (values.displayFrom && values.displayTo && values.displayTo < values.displayFrom) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['displayTo'], message: 'validation.endNotBeforeStart' })
    }
  })

export type BannerFormValues = z.input<typeof bannerSchema>
export type BannerFormOutput = z.output<typeof bannerSchema>

export function toBannerFormValues(banner: Banner | null): BannerFormValues {
  return {
    titleTk: banner?.title.tk ?? '',
    titleRu: banner?.title.ru ?? '',
    descriptionTk: banner?.description.tk ?? '',
    descriptionRu: banner?.description.ru ?? '',
    url: banner?.url ?? '',
    phone: banner?.phone ?? '',
    displayFrom: banner?.displayFrom ?? '',
    displayTo: banner?.displayTo ?? '',
    mainImage: banner?.image ? { id: uid('img'), url: banner.image } : null,
    additionalImages: (banner?.images ?? []).map((url) => ({ id: uid('img'), url })),
  }
}

export function toBannerPayload(values: BannerFormOutput): BannerPayload {
  return {
    title: { tk: values.titleTk, ru: values.titleRu },
    description: { tk: values.descriptionTk.trim(), ru: values.descriptionRu.trim() },
    url: values.url.trim(),
    phone: values.phone.trim(),
    displayFrom: values.displayFrom,
    displayTo: values.displayTo,
    mainImage: values.mainImage,
    additionalImages: values.additionalImages,
  }
}
