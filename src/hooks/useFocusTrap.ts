import { type RefObject, useEffect, useEffectEvent } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0)
}

/** Only the most recently opened trap reacts to Tab / Escape. */
const stack: symbol[] = []

/**
 * Keeps focus inside `ref` while active, closes on Escape, and restores focus
 * to the previously focused element on deactivation. An element marked with
 * `data-autofocus` receives initial focus.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void) {
  const handleEscape = useEffectEvent(() => onEscape?.())

  useEffect(() => {
    const root = ref.current
    if (!active || !root) return

    const token = Symbol('focus-trap')
    stack.push(token)
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const initial = root.querySelector<HTMLElement>('[data-autofocus]') ?? focusableIn(root)[0] ?? root
    initial.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== token) return
      if (event.key === 'Escape') {
        event.preventDefault()
        handleEscape()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusableIn(root)
      if (items.length === 0) {
        event.preventDefault()
        root.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement
      if (event.shiftKey && (current === first || !root.contains(current))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (current === last || !root.contains(current))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      stack.splice(stack.indexOf(token), 1)
      previous?.focus({ preventScroll: true })
    }
  }, [ref, active])
}
