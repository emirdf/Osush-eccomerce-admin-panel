import { keepPreviousData, type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ID, type ListResult, type OrderListItem, type OrderListParams, ordersApi } from '@/api'

export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...ordersKeys.lists(), params] as const,
  detail: (id: ID) => [...ordersKeys.all, 'detail', id] as const,
}

export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: ordersKeys.list(params),
    queryFn: () => ordersApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * Opening an order clears `is_new` on the server. Mirror that in every cached
 * list page right away, and mark the lists stale so the next visit refetches.
 */
function markSeen(queryClient: QueryClient, id: ID) {
  queryClient.setQueriesData<ListResult<OrderListItem>>({ queryKey: ordersKeys.lists() }, (data) =>
    data?.items.some((item) => item.id === id && item.isNew)
      ? { ...data, items: data.items.map((item) => (item.id === id ? { ...item, isNew: false } : item)) }
      : data,
  )
  void queryClient.invalidateQueries({ queryKey: ordersKeys.lists(), refetchType: 'none' })
}

export function useOrder(id: ID | null) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ordersKeys.detail(id ?? 0),
    queryFn: async () => {
      const order = await ordersApi.get(id as ID)
      markSeen(queryClient, order.id)
      return order
    },
    enabled: id !== null,
  })
}

/** The order's row from any cached list page — the detail response has no customer name. */
export function useCachedOrderRow(id: ID | null): OrderListItem | undefined {
  const queryClient = useQueryClient()
  if (id === null) return undefined
  for (const [, data] of queryClient.getQueriesData<ListResult<OrderListItem>>({ queryKey: ordersKeys.lists() })) {
    const row = data?.items.find((item) => item.id === id)
    if (row) return row
  }
  return undefined
}
