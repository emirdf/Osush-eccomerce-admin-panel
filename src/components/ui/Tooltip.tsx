import { type ReactNode, type SyntheticEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

interface TooltipProps {
  content: string
  children: ReactNode
  side?: 'right' | 'bottom'
  disabled?: boolean
  className?: string
}

/** Visual tooltip on hover/focus. The wrapped control must carry its own accessible name. */
export function Tooltip({ content, children, side = 'right', disabled, className }: TooltipProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  const show = (event: SyntheticEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPosition(
      side === 'right'
        ? { x: rect.right + 10, y: rect.top + rect.height / 2 }
        : { x: rect.left + rect.width / 2, y: rect.bottom + 8 },
    )
  }
  const hide = () => setPosition(null)

  return (
    <span className={cn('block', className)} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {!disabled &&
        position &&
        createPortal(
          <span
            aria-hidden="true"
            style={{ left: position.x, top: position.y }}
            className={cn(
              'pointer-events-none fixed z-[70] animate-fade-in rounded-md bg-gray-900 px-2 py-1 text-xs font-semibold whitespace-nowrap text-gray-50 shadow-card',
              side === 'right' ? '-translate-y-1/2' : '-translate-x-1/2',
            )}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  )
}
