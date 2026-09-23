import { createStore, useStore } from '@/lib/createStore'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  variant: ToastVariant
  /** Already translated text. */
  message: string
}

const DURATION = 4000
let nextId = 1

export const toastStore = createStore<ToastItem[]>([])

export function dismissToast(id: number) {
  toastStore.set((list) => list.filter((t) => t.id !== id))
}

function push(variant: ToastVariant, message: string) {
  const id = nextId++
  toastStore.set((list) => [...list.slice(-3), { id, variant, message }])
  window.setTimeout(() => dismissToast(id), DURATION)
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message),
  info: (message: string) => push('info', message),
}

export function useToasts() {
  return useStore(toastStore)
}
