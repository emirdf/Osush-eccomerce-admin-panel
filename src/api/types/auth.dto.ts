import { z } from 'zod'

export const loginResponseDto = z.object({ token: z.string() }).passthrough()
export type LoginResponseDto = z.infer<typeof loginResponseDto>

/** GET /auth — surname / phone_number / avatar come back null for fresh admins. */
export const adminDto = z
  .object({
    id: z.number(),
    user_name: z.string().nullish(),
    surname: z.string().nullish(),
    phone_number: z.string().nullish(),
    avatar: z.string().nullish(),
  })
  .passthrough()
export type AdminDto = z.infer<typeof adminDto>

/** GET /auth/index */
export const dashboardProductDto = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
    order_count: z.number().nullish(),
    price: z.number().nullish(),
    discount_price: z.number().nullish(),
    image: z.string().nullish(),
  })
  .passthrough()

export const dashboardDto = z
  .object({
    total_clients: z.number().nullish(),
    total_products: z.number().nullish(),
    total_categories: z.number().nullish(),
    products: z.array(dashboardProductDto).nullish(),
    /** Plain strings such as "surname Nurjemal" — not objects. */
    clients: z.array(z.string()).nullish(),
  })
  .passthrough()
export type DashboardDto = z.infer<typeof dashboardDto>
