import { z } from 'zod'

const localizedDto = z.object({ tm: z.string().nullish(), ru: z.string().nullish() }).passthrough()

export const notificationDto = z
  .object({
    id: z.number(),
    title: localizedDto.nullish(),
    body: localizedDto.nullish(),
    life: z.number().nullish(),
    /** "22-09-2026" */
    created_at: z.string().nullish(),
  })
  .passthrough()
export type NotificationDto = z.infer<typeof notificationDto>

/** The array's key was not documented; accept the names the other lists use. */
export const notificationListDto = z
  .object({
    total: z.number().nullish(),
    notifications: z.array(notificationDto).nullish(),
    data: z.array(notificationDto).nullish(),
  })
  .passthrough()
export type NotificationListDto = z.infer<typeof notificationListDto>
