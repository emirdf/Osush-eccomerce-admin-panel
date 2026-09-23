import { z } from 'zod'

export const clientDto = z
  .object({
    id: z.number(),
    user_name: z.string().nullish(),
    surname: z.string().nullish(),
    phone_number: z.string().nullish(),
    order_count: z.number().nullish(),
    total_spent: z.number().nullish(),
  })
  .passthrough()
export type ClientDto = z.infer<typeof clientDto>

export const clientListDto = z
  .object({ total: z.number().nullish(), clients: z.array(clientDto).nullish() })
  .passthrough()
export type ClientListDto = z.infer<typeof clientListDto>
