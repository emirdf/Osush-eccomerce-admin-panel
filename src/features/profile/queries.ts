import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, type PasswordPayload, type ProfilePayload } from '@/api'
import { useAuthToken } from '@/store/auth'

export const profileKeys = {
  me: ['profile', 'me'] as const,
}

export function useProfile() {
  const token = useAuthToken()
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: authApi.profile,
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (admin) => queryClient.setQueryData(profileKeys.me, admin),
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: (payload: PasswordPayload) => authApi.changePassword(payload) })
}
