import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import i18n from '@/lib/i18n'
import { authStore, clearSession } from '@/store/auth'
import { toast } from '@/store/toast'
import { ApiError, type FieldErrors } from './errors'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn('[api] VITE_API_BASE_URL is not set — copy .env.example to .env.local')
}

const TIMEOUT_MS = 20_000
const MAX_RETRIES = 2

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { Accept: 'application/json' },
})

/**
 * The only place that knows the auth scheme. The login response documents just
 * `{ token }`; if the backend expects a raw token or another header, change here.
 */
export function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  config.headers.set('Authorization', `Bearer ${token}`)
}

http.interceptors.request.use((config) => {
  const token = authStore.get()
  if (token) setAuthHeader(config, token)
  // Let the browser set the multipart boundary itself.
  if (config.data instanceof FormData) config.headers.delete('Content-Type')
  if (import.meta.env.DEV) {
    console.debug('[api] →', config.method?.toUpperCase(), config.url, config.params ?? '')
  }
  return config
})

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

const isLoginRequest = (config?: AxiosRequestConfig) => Boolean(config?.url?.includes('/auth/login'))

http.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) console.debug('[api] ←', response.status, response.config.url)
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined
    const status = error.response?.status ?? 0
    const isGet = (config?.method ?? 'get').toLowerCase() === 'get'
    const retriable = status === 0 || status >= 500

    // Retry GETs only: 2 attempts, exponential backoff.
    if (config && isGet && retriable && (config._retryCount ?? 0) < MAX_RETRIES) {
      config._retryCount = (config._retryCount ?? 0) + 1
      await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** (config._retryCount! - 1)))
      return http(config)
    }

    const apiError = toApiError(error)

    if (status === 401 && !isLoginRequest(config)) {
      // Session is gone: clear it, tell the user; <ProtectedRoute> sends them to /login.
      clearSession()
      toast.error(i18n.t('errors.http_401'))
    } else if (retriable) {
      toast.error(i18n.t(`errors.${apiError.code}`, { defaultValue: i18n.t('errors.unknown') }))
    }

    if (import.meta.env.DEV) console.debug('[api] ✕', status, config?.url, apiError.serverMessage)
    throw apiError
  },
)

const STATUS_CODES: Record<number, string> = {
  0: 'network',
  400: 'bad_request',
  401: 'http_401',
  403: 'http_403',
  404: 'not_found',
  409: 'conflict',
  422: 'validation',
}

function extractMessage(data: unknown): string | null {
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    for (const key of ['message', 'error', 'detail', 'msg']) {
      const value = record[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }
  return null
}

function extractFieldErrors(data: unknown): FieldErrors | undefined {
  if (!data || typeof data !== 'object') return undefined
  const raw = (data as Record<string, unknown>).errors ?? (data as Record<string, unknown>).fields
  if (!raw || typeof raw !== 'object') return undefined
  const fields: FieldErrors = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string') fields[key] = value
    else if (Array.isArray(value) && typeof value[0] === 'string') fields[key] = value[0]
  }
  return Object.keys(fields).length ? fields : undefined
}

/** Normalizes anything axios throws into one ApiError shape. */
function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const data = error.response?.data
  const code = (data && typeof data === 'object' && typeof (data as Record<string, unknown>).code === 'string'
    ? ((data as Record<string, unknown>).code as string)
    : undefined) ?? STATUS_CODES[status] ?? (status >= 500 ? 'http_500' : `http_${status}`)
  return new ApiError(status, code, extractMessage(data), extractFieldErrors(data))
}
