import { createStore, useStore } from '@/lib/createStore'
import { STORAGE_KEYS, readStorage, removeStorage, writeStorage } from '@/lib/storage'

const initialToken =
  readStorage<string | null>(STORAGE_KEYS.token, null, 'local') ??
  readStorage<string | null>(STORAGE_KEYS.token, null, 'session')

export const authStore = createStore<string | null>(initialToken)

/** "Remember me" keeps the token in localStorage; otherwise it dies with the tab. */
export function setSession(token: string, remember: boolean) {
  removeStorage(STORAGE_KEYS.token)
  writeStorage(STORAGE_KEYS.token, token, remember ? 'local' : 'session')
  authStore.set(token)
}

export function clearSession() {
  removeStorage(STORAGE_KEYS.token)
  authStore.set(null)
}

export function useAuthToken() {
  return useStore(authStore)
}
