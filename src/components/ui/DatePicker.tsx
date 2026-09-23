import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { type KeyboardEvent, type Ref, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'
import { formatDate, parseDate, toISODate } from '@/lib/format'
import { mergeRefs } from '@/lib/utils'
import { Button } from './Button'
import { useFieldContext } from './field-context'
import { controlClasses } from './styles'

interface DatePickerProps {
  /** "YYYY-MM-DD" or "" */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  ref?: Ref<HTMLButtonElement>
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const addMonths = (d: Date, n: number) => {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay))
}
const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && toISODate(a) === toISODate(b)

export function DatePicker({ value, onChange, onBlur, min, max, placeholder, disabled, id: idProp, ref }: DatePickerProps) {
  const { t } = useTranslation()
  const field = useFieldContext()
  const autoId = useId()
  const id = idProp ?? field?.id ?? autoId
  const dialogId = `${id}-calendar`

  const months = t('common.date.months', { returnObjects: true }) as string[]
  const weekdays = t('common.date.weekdaysShort', { returnObjects: true }) as string[]

  const selected = parseDate(value)
  const [open, setOpen] = useState(false)
  const [focusDate, setFocusDate] = useState<Date>(() => selected ?? new Date())
  const [dropUp, setDropUp] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const focusDay = useRef(false)

  const isDisabled = (d: Date) => {
    const iso = toISODate(d)
    return (!!min && iso < min) || (!!max && iso > max)
  }

  function openCalendar() {
    if (disabled) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const below = window.innerHeight - rect.bottom
      setDropUp(below < 380 && rect.top > below)
    }
    setFocusDate(parseDate(value) ?? parseDate(min) ?? new Date())
    focusDay.current = true
    setOpen(true)
  }

  function close(returnFocus = true) {
    setOpen(false)
    onBlur?.()
    if (returnFocus) triggerRef.current?.focus()
  }

  function select(date: Date) {
    if (isDisabled(date)) return
    onChange(toISODate(date))
    close()
  }

  useClickOutside(rootRef, () => close(false), open)

  useEffect(() => {
    if (!open || !focusDay.current) return
    focusDay.current = false
    gridRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]')?.focus()
  }, [open, focusDate])

  function moveFocus(next: Date) {
    focusDay.current = true
    setFocusDate(next)
  }

  function onGridKeyDown(event: KeyboardEvent) {
    const offsets: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusDate, -1),
      ArrowRight: () => addDays(focusDate, 1),
      ArrowUp: () => addDays(focusDate, -7),
      ArrowDown: () => addDays(focusDate, 7),
      PageUp: () => addMonths(focusDate, -1),
      PageDown: () => addMonths(focusDate, 1),
      Home: () => addDays(focusDate, -((focusDate.getDay() + 6) % 7)),
      End: () => addDays(focusDate, 6 - ((focusDate.getDay() + 6) % 7)),
    }
    if (offsets[event.key]) {
      event.preventDefault()
      moveFocus(offsets[event.key]())
    }
  }

  const year = focusDate.getFullYear()
  const month = focusDate.getMonth()
  const first = new Date(year, month, 1)
  const gridStart = addDays(first, -((first.getDay() + 6) % 7))
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const today = new Date()

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={mergeRefs(triggerRef, ref)}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-invalid={field?.invalid || undefined}
        aria-describedby={field?.describedBy}
        disabled={disabled}
        onClick={() => (open ? close() : openCalendar())}
        className={cn(controlClasses, 'flex h-10 items-center justify-between gap-2 px-3 text-left')}
      >
        <span className={cn(!selected && 'text-fg-subtle')}>
          {selected ? formatDate(selected) : (placeholder ?? t('common.date.placeholder'))}
        </span>
        <Calendar className="size-[18px] shrink-0 text-fg-muted" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label={t('common.date.choose')}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              e.stopPropagation()
              close()
            }
          }}
          className={cn(
            'absolute left-0 z-40 w-[18.5rem] animate-pop-in rounded-card border border-border bg-surface p-3 shadow-card',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <Button variant="ghost" size="icon-sm" aria-label={t('common.date.prevMonth')} onClick={() => setFocusDate(addMonths(focusDate, -1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-base font-semibold text-fg" aria-live="polite">
              {months[month]} {year}
            </p>
            <Button variant="ghost" size="icon-sm" aria-label={t('common.date.nextMonth')} onClick={() => setFocusDate(addMonths(focusDate, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1" aria-hidden="true">
            {weekdays.map((d) => (
              <span key={d} className="flex h-8 items-center justify-center text-xs font-medium text-fg-subtle">
                {d}
              </span>
            ))}
          </div>
          <div ref={gridRef} className="grid grid-cols-7 gap-1" onKeyDown={onGridKeyDown}>
            {days.map((day) => {
              const inMonth = day.getMonth() === month
              const isSelected = sameDay(day, selected)
              const isFocused = sameDay(day, focusDate)
              const off = isDisabled(day)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  tabIndex={isFocused ? 0 : -1}
                  data-focused={isFocused}
                  disabled={off}
                  aria-pressed={isSelected}
                  aria-current={sameDay(day, today) ? 'date' : undefined}
                  aria-label={`${day.getDate()} ${months[day.getMonth()]} ${day.getFullYear()}`}
                  onClick={() => select(day)}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-md text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35',
                    isSelected
                      ? 'bg-primary font-semibold text-on-primary'
                      : cn('hover:bg-surface-muted', inMonth ? 'text-fg' : 'text-fg-subtle'),
                    !isSelected && sameDay(day, today) && 'font-semibold text-primary-text ring-1 ring-primary-text/40 ring-inset',
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <Button variant="ghost" size="sm" onClick={() => { onChange(''); close() }}>
              {t('common.clear')}
            </Button>
            <Button variant="ghost" size="sm" className="text-primary-text" disabled={isDisabled(today)} onClick={() => select(today)}>
              {t('common.date.today')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
