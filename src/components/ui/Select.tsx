import { Check, ChevronDown, Search } from 'lucide-react'
import { type KeyboardEvent, type Ref, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'
import { mergeRefs } from '@/lib/utils'
import { useFieldContext } from './field-context'
import { controlClasses } from './styles'

export interface SelectOption {
  value: string
  label: string
  /** 0 = group / top level, 1 = nested (rendered indented under the previous level-0 option). */
  level?: 0 | 1
  /** Text shown in the closed trigger, e.g. "Telefonlar › Apple". Defaults to label. */
  selectedLabel?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: SelectOption[]
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  invalid?: boolean
  id?: string
  ref?: Ref<HTMLButtonElement>
}

/** Accessible select / combobox with optional search and two-level grouping. */
export function Select({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  searchable = false,
  disabled,
  invalid,
  id: idProp,
  ref,
}: SelectProps) {
  const { t } = useTranslation()
  const field = useFieldContext()
  const autoId = useId()
  const id = idProp ?? field?.id ?? autoId
  const listId = `${id}-listbox`

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [dropUp, setDropUp] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    if (!q) return options
    return options.filter((o) => (o.selectedLabel ?? o.label).toLocaleLowerCase().includes(q))
  }, [options, query])

  function openList() {
    if (disabled) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const below = window.innerHeight - rect.bottom
      setDropUp(below < 320 && rect.top > below)
    }
    setQuery('')
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }

  function close(returnFocus = true) {
    setOpen(false)
    onBlur?.()
    if (returnFocus) triggerRef.current?.focus()
  }

  function choose(option: SelectOption) {
    onChange(option.value)
    close()
  }

  useClickOutside(rootRef, () => close(false), open)

  useEffect(() => {
    if (open) (searchable ? searchRef.current : listRef.current)?.focus()
  }, [open, searchable])

  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function onListKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((i) => Math.max(i - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(filtered.length - 1)
        break
      case 'Enter':
        event.preventDefault()
        if (filtered[active]) choose(filtered[active])
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

  const activeId = filtered[active] ? `${id}-option-${active}` : undefined

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={mergeRefs(triggerRef, ref)}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={(invalid ?? field?.invalid) || undefined}
        aria-describedby={field?.describedBy}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault()
            openList()
          }
        }}
        className={cn(controlClasses, 'flex h-10 items-center justify-between gap-2 px-3 text-left')}
      >
        <span className={cn('truncate', !selected && 'text-fg-subtle')}>
          {selected ? (selected.selectedLabel ?? selected.label) : (placeholder ?? t('common.select'))}
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-fg-muted transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-40 w-full min-w-56 animate-pop-in overflow-hidden rounded-control border border-border bg-surface shadow-card',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          {searchable && (
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActive(0)
                  }}
                  onKeyDown={onListKeyDown}
                  placeholder={t('common.search')}
                  aria-label={t('common.search')}
                  aria-controls={listId}
                  aria-activedescendant={activeId}
                  className="h-9 w-full rounded-md bg-surface-muted pr-2 pl-8 text-base text-fg outline-none placeholder:text-fg-subtle focus:ring-2 focus:ring-primary/25"
                />
              </div>
            </div>
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={searchable ? -1 : 0}
            aria-activedescendant={searchable ? undefined : activeId}
            onKeyDown={searchable ? undefined : onListKeyDown}
            className="max-h-64 overflow-y-auto p-1 outline-none"
          >
            {filtered.length === 0 && <li className="px-3 py-2 text-fg-muted">{t('common.noOptions')}</li>}
            {filtered.map((option, index) => {
              const isSelected = option.value === value
              return (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onMouseMove={() => setActive(index)}
                  onClick={() => choose(option)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-md py-2 pr-3',
                    option.level === 1 ? 'pl-7 text-fg-muted' : 'pl-3 font-semibold text-fg',
                    index === active && 'bg-surface-muted text-fg',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-primary-text" aria-hidden="true" />}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
