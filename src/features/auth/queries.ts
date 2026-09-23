import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginPayload } from '@/api'
import { profileKeys } from '@/features/profile/queries'
import { clearSession, setSession } from '@/store/auth'
import { toast } from '@/store/toast'

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userName, password }: LoginPayload & { remember: boolean }) =>
      authApi.login({ userName, password }),
    onSuccess: (token, { remember }) => {
      setSession(token, remember)
      void queryClient.invalidateQueries({ queryKey: profileKeys.me })
    },
  })
}

/** No logout endpoint: clear the token and the cache client-side. */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: () => Promise.resolve(),
    onSettled: () => {
      navigate('/login', { replace: true })
      clearSession()
      queryClient.clear()
      toast.info(t('auth.logout.success'))
    },
  })
}
