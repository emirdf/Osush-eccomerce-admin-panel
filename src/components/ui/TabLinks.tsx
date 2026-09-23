import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

interface TabLinksProps {
  label: string
  tabs: { to: string; label: string; icon?: LucideIcon }[]
}

/** Segmented navigation between sibling pages (e.g. Banners ↔ Notifications). */
export function TabLinks({ label, tabs }: TabLinksProps) {
  return (
    <nav aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded-control bg-surface-muted p-1">
      {tabs.map(({ to, label: tabLabel, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-semibold whitespace-nowrap transition-colors',
              isActive ? 'bg-surface text-fg shadow-card' : 'text-fg-muted hover:text-fg',
            )
          }
        >
          {Icon && <Icon className="size-4" aria-hidden="true" />}
          {tabLabel}
        </NavLink>
      ))}
    </nav>
  )
}
