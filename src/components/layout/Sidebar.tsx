import { ChevronsLeft, House, LayoutGrid, LogOut, type LucideIcon, Megaphone, Package, ShoppingCart, SquareUser, X } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tooltip } from '@/components/ui/Tooltip'
import { useProfile } from '@/features/profile/queries'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/cn'
import { setMobileSidebar, toggleSidebarCollapsed } from '@/store/sidebar'
import { Logo, LogoMark } from './Logo'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Extra path prefixes that keep this item active. */
  also?: string[]
}

const NAV: NavItem[] = [
  { to: '/', label: 'nav.dashboard', icon: House },
  { to: '/users', label: 'nav.users', icon: SquareUser },
  { to: '/products', label: 'nav.products', icon: Package },
  { to: '/categories', label: 'nav.categories', icon: LayoutGrid },
  { to: '/orders', label: 'nav.orders', icon: ShoppingCart },
  { to: '/ads', label: 'nav.ads', icon: Megaphone, also: ['/notifications'] },
]

function isActive(pathname: string, item: NavItem) {
  if (item.to === '/') return pathname === '/'
  return [item.to, ...(item.also ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

interface SidebarContentProps {
  collapsed: boolean
  variant: 'desktop' | 'drawer'
  onLogout: () => void
}

function SidebarContent({ collapsed, variant, onLogout }: SidebarContentProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { data: admin } = useProfile()
  const fullName = admin ? `${admin.userName} ${admin.surname}`.trim() : ''
  const closeDrawer = () => variant === 'drawer' && setMobileSidebar(false)

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center gap-2 pt-5 pb-6', collapsed ? 'flex-col px-2' : 'justify-between px-5')}>
        <Link to="/" onClick={closeDrawer} className="rounded-md">
          {collapsed ? <LogoMark /> : <Logo className="h-7" />}
        </Link>
        {variant === 'desktop' ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebarCollapsed}
            aria-label={t(collapsed ? 'nav.expand' : 'nav.collapse')}
            title={t(collapsed ? 'nav.expand' : 'nav.collapse')}
            aria-expanded={!collapsed}
          >
            <ChevronsLeft className={cn('size-5 transition-transform duration-200', collapsed && 'rotate-180')} />
          </Button>
        ) : (
          <Button variant="ghost" size="icon-sm" onClick={closeDrawer} aria-label={t('common.close')}>
            <X className="size-5" />
          </Button>
        )}
      </div>

      <nav aria-label={t('nav.main')} className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item)
            const label = t(item.label)
            const link = (
              <Link
                to={item.to}
                onClick={closeDrawer}
                aria-current={active ? 'page' : undefined}
                aria-label={collapsed ? label : undefined}
                className={cn(
                  'flex h-10 items-center gap-3 rounded-control text-base whitespace-nowrap transition-colors',
                  collapsed ? 'justify-center' : 'px-3',
                  active ? 'bg-primary font-semibold text-on-primary' : 'font-medium text-fg-muted hover:bg-surface-muted hover:text-fg',
                )}
              >
                <item.icon className="size-5 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
            return <li key={item.to}>{collapsed ? <Tooltip content={label}>{link}</Tooltip> : link}</li>
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className={cn('flex items-center gap-1', collapsed && 'flex-col gap-2')}>
          <Link
            to="/profile"
            onClick={closeDrawer}
            aria-label={collapsed ? t('nav.profile') : undefined}
            className={cn(
              'flex min-w-0 items-center gap-3 rounded-control p-1.5 transition-colors hover:bg-surface-muted',
              !collapsed && 'flex-1',
            )}
          >
            {admin ? <Avatar src={admin.avatar} name={fullName} /> : <Skeleton className="size-10 rounded-full" />}
            {!collapsed && (
              <span className="min-w-0">
                {admin ? (
                  <span className="block truncate text-base font-semibold text-fg">{fullName}</span>
                ) : (
                  <Skeleton className="mb-1 h-4 w-24" />
                )}
                <span className="block text-sm text-fg-muted">{t('common.role.admin')}</span>
              </span>
            )}
          </Link>
          <Tooltip content={t('auth.logout.action')} disabled={!collapsed}>
            <Button variant="ghost" size="icon-sm" onClick={onLogout} aria-label={t('auth.logout.action')} title={collapsed ? undefined : t('auth.logout.action')}>
              <LogOut className="size-[18px]" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export function DesktopSidebar({ collapsed, onLogout }: { collapsed: boolean; onLogout: () => void }) {
  return (
    <aside
      className={cn(
        'fixed inset-y-3 left-3 z-30 hidden overflow-hidden rounded-card border border-border bg-surface shadow-card transition-[width] duration-200 lg:block',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <SidebarContent collapsed={collapsed} variant="desktop" onLogout={onLogout} />
    </aside>
  )
}

export function MobileSidebar({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const close = () => setMobileSidebar(false)
  useFocusTrap(panelRef, true, close)

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.main')}
        tabIndex={-1}
        className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-drawer-in bg-surface shadow-card outline-none"
      >
        <SidebarContent collapsed={false} variant="drawer" onLogout={onLogout} />
      </div>
    </div>
  )
}
