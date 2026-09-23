export const STORAGE_KEYS = {
  theme: 'osus.theme',
  lang: 'osus.lang',
  sidebar: 'osus.sidebar',
  token: 'osus.token',
} as const

type Area = 'local' | 'session'

function area(which: Area): Storage | null {
  try {
    return which === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readStorage<T>(key: string, fallback: T, which: Area = 'local'): T {
  try {
    const raw = area(which)?.getItem(key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown, which: Area = 'local'): void {
  try {
    area(which)?.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked — state simply won't persist.
  }
}

export function removeStorage(key: string): void {
  try {
    area('local')?.removeItem(key)
    area('session')?.removeItem(key)
  } catch {
    // ignore
  }
}
