import { CirclePlus, Trash2 } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

interface RepeatableFieldGroupProps<T extends { id: string }> {
  /** Usually `fields` from react-hook-form's useFieldArray. */
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  onAdd: () => void
  onRemove: (index: number) => void
  addLabel: string
  removeLabel: (index: number) => string
  /** The list can never shrink below this many items. */
  minItems?: number
  maxItems?: number
  /** "block" = bordered card per item, "inline" = row with trailing delete icon. */
  variant?: 'block' | 'inline'
  itemTitle?: (index: number) => ReactNode
}

export function RepeatableFieldGroup<T extends { id: string }>({
  items,
  renderItem,
  onAdd,
  onRemove,
  addLabel,
  removeLabel,
  minItems = 0,
  maxItems = 50,
  variant = 'block',
  itemTitle,
}: RepeatableFieldGroupProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const addRef = useRef<HTMLButtonElement>(null)
  const prevCount = useRef(items.length)

  // Move focus into a freshly added item.
  useEffect(() => {
    if (items.length > prevCount.current) {
      const last = listRef.current?.querySelector<HTMLElement>('[data-repeat-item]:last-of-type')
      last?.querySelector<HTMLElement>('input, textarea, select')?.focus()
    }
    prevCount.current = items.length
  }, [items.length])

  const remove = (index: number) => {
    onRemove(index)
    addRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-3">
      <div ref={listRef} className="flex flex-col gap-3">
        {items.map((item, index) => {
          const removable = items.length > minItems
          const removeButton = removable ? (
            <Button variant="ghost-danger" size="icon-sm" onClick={() => remove(index)} aria-label={removeLabel(index)} title={removeLabel(index)}>
              <Trash2 className="size-[18px]" />
            </Button>
          ) : null

          if (variant === 'inline') {
            return (
              <div key={item.id} data-repeat-item className="flex items-start gap-2">
                <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
                <div className={cn('flex h-10 w-8 shrink-0 items-center justify-center', itemTitle && 'mt-6')}>{removeButton}</div>
              </div>
            )
          }

          return (
            <div key={item.id} data-repeat-item className="flex flex-col gap-3 rounded-card border border-border p-4">
              {(itemTitle || removeButton) && (
                <div className="flex min-h-8 items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-fg-muted">{itemTitle?.(index)}</p>
                  {removeButton}
                </div>
              )}
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>
      <div>
        <Button ref={addRef} variant="outline-primary" size="sm" icon={CirclePlus} className="rounded-full" onClick={onAdd} disabled={items.length >= maxItems}>
          {addLabel}
        </Button>
      </div>
    </div>
  )
}
