import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ID, ListResult, Product, ProductListItem, ProductPayload } from '@/api'
import { type ProductListParams, productsApi } from '@/api'
import { dashboardKeys } from '@/features/dashboard/queries'

export const productsKeys = {
  all: ['products'] as const,
  list: (params: ProductListParams) => [...productsKeys.all, 'list', params] as const,
  detail: (id: ID) => [...productsKeys.all, 'detail', id] as const,
  placement: (id: ID) => [...productsKeys.all, 'placement', id] as const,
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productsKeys.list(params),
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: ID | null) {
  return useQuery({
    queryKey: productsKeys.detail(id ?? 0),
    queryFn: () => productsApi.get(id as ID),
    enabled: id !== null,
  })
}

/**
 * The category/subcategory/cover the detail endpoint omits, looked up from the
 * list endpoint. Kept fresh for a while: it only changes when the product is
 * moved, which happens through this very form.
 */
export function useProductPlacement(product: Product | null) {
  return useQuery({
    queryKey: productsKeys.placement(product?.id ?? 0),
    queryFn: () => productsApi.findPlacement(product as Product),
    enabled: product !== null,
    staleTime: 5 * 60_000,
  })
}

export function useSaveProduct(id?: ID) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => (id ? productsApi.update(id, payload) : productsApi.create(payload)),
    onSuccess: () => {
      if (id) {
        void queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) })
        void queryClient.invalidateQueries({ queryKey: productsKeys.placement(id) })
      }
      void queryClient.invalidateQueries({ queryKey: [...productsKeys.all, 'list'] })
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}

/** Delete is the one optimistic mutation (rolled back if the request fails). */
export function useDeleteProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: ID[]) => productsApi.removeMany(ids),
    onMutate: async (ids) => {
      const listKey = [...productsKeys.all, 'list']
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueriesData<ListResult<ProductListItem>>({ queryKey: listKey })
      previous.forEach(([key, data]) => {
        if (!data) return
        const removed = data.items.filter((item) => ids.includes(item.id)).length
        queryClient.setQueryData(key, {
          items: data.items.filter((item) => !ids.includes(item.id)),
          total: Math.max(0, data.total - removed),
        })
      })
      return { previous }
    },
    onError: (_error, _ids, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.all })
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}
