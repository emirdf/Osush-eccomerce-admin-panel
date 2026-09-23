import { createStore, useStore } from '@/lib/createStore'
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/storage'

export type Theme = 'light' | 'dark'

const media = window.matchMedia('(prefers-color-scheme: dark)')
const saved = readStorage<Theme | null>(STORAGE_KEYS.theme, null)
const systemTheme = (): Theme => (media.matches ? 'dark' : 'light')

export const themeStore = createStore<Theme>(saved === 'light' || saved === 'dark' ? saved : systemTheme())

function apply(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}
apply(themeStore.get())
themeStore.subscribe(() => apply(themeStore.get()))

// Until the user picks a theme explicitly, follow the OS setting.
media.addEventListener('change', () => {
  if (readStorage<Theme | null>(STORAGE_KEYS.theme, null) == null) themeStore.set(systemTheme())
})

export function toggleTheme() {
  const next: Theme = themeStore.get() === 'dark' ? 'light' : 'dark'
  writeStorage(STORAGE_KEYS.theme, next)
  themeStore.set(next)
}

export function useTheme() {
  return useStore(themeStore)
}
