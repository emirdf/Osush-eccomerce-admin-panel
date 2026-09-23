import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError, errorCode, serverMessage } from '@/api'

/**
 * 4xx: show the backend's own message when it sent one (§2).
 * Everything else: a localized message from `errors.<code>`.
 */
export function useApiErrorMessage() {
  const { t } = useTranslation()
  return useCallback(
    (error: unknown) => {
      const message = serverMessage(error)
      if (message && error instanceof ApiError && error.status >= 400 && error.status < 500) return message
      return t(`errors.${errorCode(error)}`, { defaultValue: t('errors.unknown') })
    },
    [t],
  )
}
