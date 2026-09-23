import { DEFAULT_LIMIT, ensurePageSlice, toOffset } from '@/lib/pagination'
import { http } from './client'
import { toOrder, toOrderListItem } from './mappers/order'
import { parseDto } from './types/common'
import { orderDetailDto, orderListDto } from './types/order.dto'
import type { ID, ListParams, ListResult, Order, OrderListItem } from './types/models'

export interface OrderListParams extends ListParams {
  /** `null` — both sent and not-sent orders. */
  isSent?: boolean | null
}

export const ordersApi = {
  async list({ page = 1, limit = DEFAULT_LIMIT, search = '', isSent = null }: OrderListParams): Promise<ListResult<OrderListItem>> {
    const { data } = await http.get('/product/order', {
      params: {
        limit,
        offset: toOffset(page, limit),
        search: search || undefined,
        is_send: isSent ?? undefined,
      },
    })
    const dto = parseDto(orderListDto, data, 'GET /product/order')
    const items = (dto.orders ?? []).map(toOrderListItem)
    return ensurePageSlice(items, dto.total ?? items.length, page, limit)
  },

  /** Side effect: the server clears the order's `is_new` flag. */
  async get(id: ID): Promise<Order> {
    const { data } = await http.get(`/product/order/${id}`)
    return toOrder(id, parseDto(orderDetailDto, data, `GET /product/order/${id}`))
  },
}
