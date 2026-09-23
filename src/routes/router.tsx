import { createBrowserRouter } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { GuestRoute, ProtectedRoute } from './guards'
import { RouteError } from './RouteError'
import { RouteLoading } from './RouteLoading'
import type { RouteHandle } from './types'

const handle = (title: string): RouteHandle => ({ title })

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      errorElement: <RouteError />,
      HydrateFallback: RouteLoading,
      lazy: async () => {
        const { LoginPage } = await import('@/features/auth/LoginPage')
        return {
          Component: () => (
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          ),
        }
      },
    },
    {
      element: (
        <ProtectedRoute>
          <PageShell />
        </ProtectedRoute>
      ),
      errorElement: <RouteError />,
      HydrateFallback: RouteLoading,
      children: [
        {
          index: true,
          handle: handle('nav.dashboard'),
          lazy: () => import('@/features/dashboard/DashboardPage').then((m) => ({ Component: m.DashboardPage })),
        },
        {
          path: 'users',
          handle: handle('nav.users'),
          lazy: () => import('@/features/users/UsersPage').then((m) => ({ Component: m.UsersPage })),
        },
        {
          path: 'products',
          handle: handle('nav.products'),
          lazy: () => import('@/features/products/ProductsPage').then((m) => ({ Component: m.ProductsPage })),
        },
        {
          path: 'products/new',
          handle: handle('products.form.createTitle'),
          lazy: () => import('@/features/products/ProductFormPage').then((m) => ({ Component: m.ProductFormPage })),
        },
        {
          path: 'products/:id/edit',
          handle: handle('products.form.editTitle'),
          lazy: () => import('@/features/products/ProductFormPage').then((m) => ({ Component: m.ProductFormPage })),
        },
        {
          path: 'categories',
          handle: handle('nav.categories'),
          lazy: () => import('@/features/categories/CategoriesPage').then((m) => ({ Component: m.CategoriesPage })),
        },
        {
          path: 'categories/new',
          handle: handle('categories.form.createTitle'),
          lazy: () => import('@/features/categories/CategoryFormPage').then((m) => ({ Component: m.CategoryFormPage })),
        },
        {
          path: 'categories/:id/edit',
          handle: handle('categories.form.editTitle'),
          lazy: () => import('@/features/categories/CategoryFormPage').then((m) => ({ Component: m.CategoryFormPage })),
        },
        {
          path: 'orders',
          handle: handle('nav.orders'),
          lazy: () => import('@/features/orders/OrdersPage').then((m) => ({ Component: m.OrdersPage })),
        },
        {
          path: 'orders/:id',
          handle: handle('nav.orders'),
          lazy: () => import('@/features/orders/OrderDetailPage').then((m) => ({ Component: m.OrderDetailPage })),
        },
        {
          path: 'ads',
          handle: handle('nav.ads'),
          lazy: () => import('@/features/ads/AdsPage').then((m) => ({ Component: m.AdsPage })),
        },
        {
          path: 'ads/new',
          handle: handle('ads.form.createTitle'),
          lazy: () => import('@/features/ads/AdFormPage').then((m) => ({ Component: m.AdFormPage })),
        },
        {
          path: 'ads/:id/edit',
          handle: handle('ads.form.editTitle'),
          lazy: () => import('@/features/ads/AdFormPage').then((m) => ({ Component: m.AdFormPage })),
        },
        {
          path: 'notifications',
          handle: handle('nav.notifications'),
          lazy: () => import('@/features/notifications/NotificationsPage').then((m) => ({ Component: m.NotificationsPage })),
        },
        {
          path: 'profile',
          handle: handle('nav.profile'),
          lazy: () => import('@/features/profile/ProfilePage').then((m) => ({ Component: m.ProfilePage })),
        },
        {
          path: '*',
          handle: handle('common.notFound.title'),
          lazy: () => import('@/routes/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
)
