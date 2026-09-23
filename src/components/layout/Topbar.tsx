import { Bell, LogOut, Menu, User } from 'lucide-react'
import { type Ref, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { buttonClasses } from '@/components/ui/styles'
import { useProfile } from '@/features/profile/queries'
import { setMobileSidebar, useSidebar } from '@/store/sidebar'

interface TopbarProps {
  title: string
  onLogout: () => void
  actionsRef: Ref<HTMLDivElement>
}

export function Topbar({ title, onLogout, actionsRef }: TopbarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mobileOpen } = useSidebar()
  const { data: admin } = useProfile()
  const fullName = admin ? `${admin.userName} ${admin.surname}`.trim() : ''

  useEffect(() => {
    document.title = title ? `${title} · ${t('common.appName')}` : t('common.appName')
  }, [title, t])

  return (
    <header className="flex h-16 items-center gap-2 rounded-card border border-border bg-surface px-2 shadow-card sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebar(true)}
        aria-label={t('nav.openMenu')}
        aria-expanded={mobileOpen}
      >
        <Menu className="size-5" />
      </Button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-fg sm:text-xl">{title}</h1>

      <div className="flex items-center gap-0.5 sm:gap-1">
        <div ref={actionsRef} className="mr-1 flex items-center empty:hidden sm:mr-2" />
        <Link
          to="/notifications"
          className={buttonClasses({ variant: 'ghost', size: 'icon' })}
          aria-label={t('nav.notifications')}
          title={t('nav.notifications')}
        >
          <Bell className="size-5" />
        </Link>
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu
          label={t('nav.accountMenu')}
          triggerClassName="ml-1 flex rounded-full"
          trigger={<Avatar src={admin?.avatar} name={fullName || '·'} size="md" />}
          items={[
            { key: 'profile', label: t('nav.profile'), icon: User, onSelect: () => navigate('/profile') },
            { key: 'logout', label: t('auth.logout.action'), icon: LogOut, tone: 'danger', onSelect: onLogout },
          ]}
        />
      </div>
    </header>
  )
}
