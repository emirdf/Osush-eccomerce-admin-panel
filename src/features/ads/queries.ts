import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type BannerPayload, bannersApi, type ID, type ListParams } from '@/api'

export const bannersKeys = {
  all: ['banners'] as const,
  list: (params: ListParams) => [...bannersKeys.all, 'list', params] as const,
  detail: (id: ID) => [...bannersKeys.all, 'detail', id] as const,
}

export function useBanners(params: ListParams) {
  return useQuery({
    queryKey: bannersKeys.list(params),
    queryFn: () => bannersApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** No GET /banner/{id}: the banner is read out of the list response. */
export function useBanner(id: ID | null) {
  return useQuery({
    queryKey: bannersKeys.detail(id ?? 0),
    queryFn: () => bannersApi.get(id as ID),
    enabled: id !== null,
  })
}

export function useSaveBanner(id?: ID) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BannerPayload) => (id ? bannersApi.update(id, payload) : bannersApi.create(payload)),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bannersKeys.all }),
  })
}
