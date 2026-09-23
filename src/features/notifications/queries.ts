import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ID, type ListParams, type NotificationPayload, notificationsApi } from '@/api'

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: (params: ListParams) => [...notificationsKeys.all, 'list', params] as const,
}

export function useNotifications(params: ListParams) {
  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => notificationsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: NotificationPayload) => notificationsApi.create(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...notificationsKeys.all, 'list'] }),
  })
}

export function useDeleteNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: ID[]) => notificationsApi.remove(ids),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...notificationsKeys.all, 'list'] }),
  })
}
