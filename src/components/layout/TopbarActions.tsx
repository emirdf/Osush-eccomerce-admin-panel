import { type ReactNode, useContext } from 'react'
import { createPortal } from 'react-dom'
import { TopbarSlotContext } from './topbar-slot'

/** Renders its children into the topbar's action area (e.g. "Add category"). */
export function TopbarActions({ children }: { children: ReactNode }) {
  const slot = useContext(TopbarSlotContext)
  return slot ? createPortal(children, slot) : null
}
