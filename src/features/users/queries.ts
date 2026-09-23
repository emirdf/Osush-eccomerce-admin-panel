import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { clientsApi, type ListParams } from '@/api'

export const clientsKeys = {
  all: ['clients'] as const,
  list: (params: ListParams) => [...clientsKeys.all, 'list', params] as const,
}

/** Store customers — the "Ulanyjylar" screen. */
export function useClients(params: ListParams) {
  return useQuery({
    queryKey: clientsKeys.list(params),
    queryFn: () => clientsApi.list(params),
    placeholderData: keepPreviousData,
  })
}
