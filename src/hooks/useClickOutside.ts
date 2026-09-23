import { type RefObject, useEffect, useEffectEvent } from 'react'

export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void, active = true) {
  const onOutside = useEffectEvent(handler)

  useEffect(() => {
    if (!active) return
    const listener = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside()
    }
    document.addEventListener('pointerdown', listener)
    return () => document.removeEventListener('pointerdown', listener)
  }, [ref, active])
}
