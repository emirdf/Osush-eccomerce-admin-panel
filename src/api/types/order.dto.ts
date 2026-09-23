import { z } from 'zod'

export const orderListItemDto = z
  .object({
    id: z.number(),
    customer_name: z.string().nullish(),
    phone_number: z.string().nullish(),
    city: z.string().nullish(),
    total_product: z.number().nullish(),
    total_price: z.number().nullish(),
    is_send: z.boolean().nullish(),
    /** True until the order is opened: `GET /product/order/{id}` clears it server-side. */
    is_new: z.boolean().nullish(),
  })
  .passthrough()
export type OrderListItemDto = z.infer<typeof orderListItemDto>

export const orderListDto = z
  .object({ total: z.number().nullish(), orders: z.array(orderListItemDto).nullish() })
  .passthrough()

export const orderProductDto = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
    /** Unit price. */
    price: z.number().nullish(),
    discount_price: z.number().nullish(),
    image: z.string().nullish(),
    /** Quantity ordered. */
    total: z.number().nullish(),
  })
  .passthrough()
export type OrderProductDto = z.infer<typeof orderProductDto>

/** No `id` or `customer_name` in the detail response — see API_GAPS.md. */
export const orderDetailDto = z
  .object({
    phone_number: z.string().nullish(),
    city: z.string().nullish(),
    delivery_address: z.string().nullish(),
    notes: z.string().nullish(),
    total_product: z.number().nullish(),
    products: z.array(orderProductDto).nullish(),
    total_price: z.number().nullish(),
    is_send: z.boolean().nullish(),
  })
  .passthrough()
export type OrderDetailDto = z.infer<typeof orderDetailDto>
