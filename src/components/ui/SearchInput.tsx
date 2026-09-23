import { Search, X } from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/cn'
import { Input } from './Input'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  delay?: number
  className?: string
}

/** Debounced search box. `value` may change externally (e.g. browser back). */
export function SearchInput({ value, onChange, placeholder, delay = 350, className }: SearchInputProps) {
  const { t } = useTranslation()
  const [text, setText] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setText(value)
  }

  const debounced = useDebouncedValue(text, delay)
  const emit = useEffectEvent((next: string) => {
    if (next !== value) onChange(next)
  })
  useEffect(() => {
    emit(debounced)
  }, [debounced])

  const label = placeholder ?? t('common.search')

  return (
    <div className={cn('w-full sm:max-w-sm', className)}>
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={label}
        aria-label={label}
        leftIcon={<Search className="size-[18px]" />}
        className="[&::-webkit-search-cancel-button]:appearance-none"
        rightSlot={
          text ? (
            <button
              type="button"
              onClick={() => {
                setText('')
                onChange('')
              }}
              aria-label={t('common.clear')}
              className="flex size-8 items-center justify-center rounded-md text-fg-subtle hover:bg-surface-muted hover:text-fg"
            >
              <X className="size-4" />
            </button>
          ) : undefined
        }
      />
    </div>
  )
}
