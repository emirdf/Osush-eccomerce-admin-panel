import { createStore, useStore } from '@/lib/createStore'
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/storage'

interface SidebarState {
  /** Desktop: icons-only rail. Persisted. */
  collapsed: boolean
  /** Below 1024px: overlay drawer visibility. Not persisted. */
  mobileOpen: boolean
}

export const sidebarStore = createStore<SidebarState>({
  collapsed: readStorage(STORAGE_KEYS.sidebar, false),
  mobileOpen: false,
})

export function toggleSidebarCollapsed() {
  sidebarStore.set((s) => {
    writeStorage(STORAGE_KEYS.sidebar, !s.collapsed)
    return { ...s, collapsed: !s.collapsed }
  })
}

export function setMobileSidebar(open: boolean) {
  sidebarStore.set((s) => (s.mobileOpen === open ? s : { ...s, mobileOpen: open }))
}

export function useSidebar() {
  return useStore(sidebarStore)
}
