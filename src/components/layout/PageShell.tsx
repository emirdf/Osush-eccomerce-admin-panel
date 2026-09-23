import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useMatches, useNavigation } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useLogout } from '@/features/auth/queries'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import type { RouteHandle } from '@/routes/types'
import { useSidebar } from '@/store/sidebar'
import { Footer } from './Footer'
import { DesktopSidebar, MobileSidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { TopbarSlotContext } from './topbar-slot'

/** Authenticated app frame: sidebar + topbar + content + footer. */
export function PageShell() {
  const { t } = useTranslation()
  const { collapsed, mobileOpen } = useSidebar()
  const isDesktop = useIsDesktop()
  const navigation = useNavigation()
  const matches = useMatches()
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const logout = useLogout()

  const handle = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.title)?.handle as RouteHandle | undefined
  const openLogout = () => setLogoutOpen(true)

  return (
    <TopbarSlotContext value={slot}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card"
      >
        {t('common.skipToContent')}
      </a>

      {navigation.state === 'loading' && (
        <div className="fixed inset-x-0 top-0 z-[80] h-0.5 animate-fade-in bg-primary" role="progressbar" aria-label={t('common.loading')} />
      )}

      <DesktopSidebar collapsed={collapsed} onLogout={openLogout} />
      {mobileOpen && !isDesktop && <MobileSidebar onLogout={openLogout} />}

      <div
        className={cn(
          'flex min-h-dvh flex-col gap-3 p-3 transition-[padding] duration-200',
          collapsed ? 'lg:pl-[6.5rem]' : 'lg:pl-[17.5rem]',
        )}
      >
        <Topbar title={handle ? t(handle.title) : ''} onLogout={openLogout} actionsRef={setSlot} />
        <main id="main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col outline-none">
          <Outlet />
        </main>
        <Footer />
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => logout.mutate()}
        loading={logout.isPending}
        icon={LogOut}
        title={t('auth.logout.title')}
        description={t('auth.logout.description')}
        confirmLabel={t('auth.logout.confirm')}
      />
    </TopbarSlotContext>
  )
}
