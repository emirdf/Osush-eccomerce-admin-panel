import { createContext } from 'react'

/** DOM node inside the topbar where pages can portal extra actions. */
export const TopbarSlotContext = createContext<HTMLElement | null>(null)
