import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/api'

export const dashboardKeys = {
  all: ['dashboard'] as const,
}

/** GET /auth/index returns totals, recent products and client names in one call. */
export function useDashboard() {
  return useQuery({ queryKey: dashboardKeys.all, queryFn: authApi.dashboard })
}
