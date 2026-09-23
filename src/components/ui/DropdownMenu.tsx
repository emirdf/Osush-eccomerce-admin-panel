import { Check, type LucideIcon } from 'lucide-react'
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'

export interface MenuItem {
  key: string
  label: string
  onSelect: () => void
  icon?: LucideIcon
  tone?: 'danger'
  /** When defined the item behaves as a radio option. */
  checked?: boolean
}

interface DropdownMenuProps {
  /** Accessible name of the trigger. */
  label: string
  trigger: ReactNode
  items: MenuItem[]
  align?: 'start' | 'end'
  triggerClassName?: string
}

export function DropdownMenu({ label, trigger, items, align = 'end', triggerClassName }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useClickOutside(rootRef, () => setOpen(false), open)

  useEffect(() => {
    if (!open) return
    const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]')
    const checked = menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
    ;(checked ?? buttons?.[0])?.focus()
  }, [open])

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  function onMenuKeyDown(event: KeyboardEvent) {
    const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const focusAt = (i: number) => buttons[(i + buttons.length) % buttons.length]?.focus()
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusAt(index + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusAt(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusAt(0)
        break
      case 'End':
        event.preventDefault()
        focusAt(buttons.length - 1)
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close()
        break
      case 'Tab':
        close(false)
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute top-full z-40 mt-2 min-w-44 animate-pop-in rounded-control border border-border bg-surface p-1 shadow-card',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map(({ key, label: itemLabel, onSelect, icon: Icon, tone, checked }) => (
            <button
              key={key}
              type="button"
              role={checked === undefined ? 'menuitem' : 'menuitemradio'}
              aria-checked={checked}
              tabIndex={-1}
              onClick={() => {
                close()
                onSelect()
              }}
              className={cn(
                'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-base transition-colors focus:outline-none',
                tone === 'danger'
                  ? 'text-danger-text hover:bg-danger-soft focus:bg-danger-soft'
                  : 'text-fg hover:bg-surface-muted focus:bg-surface-muted',
              )}
            >
              {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
              <span className="flex-1">{itemLabel}</span>
              {checked && <Check className="size-4 text-primary-text" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
