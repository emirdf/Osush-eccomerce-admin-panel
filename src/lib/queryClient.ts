import { QueryClient } from '@tanstack/react-query'

/** Retries live in the axios interceptor (GET only), so React Query does not retry again. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})
