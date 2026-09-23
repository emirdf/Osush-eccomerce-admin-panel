import type { ReactNode } from 'react'
import { type Location, Navigate, useLocation } from 'react-router-dom'
import { useAuthToken } from '@/store/auth'

/** Redirects to /login when there is no session token, remembering where the user was going. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuthToken()
  const location = useLocation()
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

/** Keeps signed-in admins away from /login; after login, returns to the original page. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const token = useAuthToken()
  const location = useLocation()
  if (token) {
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={from ? `${from.pathname}${from.search}` : '/'} replace />
  }
  return children
}
