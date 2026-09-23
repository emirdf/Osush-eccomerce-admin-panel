import { API_LANG } from '../types/common'
import type { Localized } from '../types/models'

type LocalizedDtoLike = { tm?: string | null; ru?: string | null } | null | undefined

/** API `{ tm, ru }` → UI `{ tk, ru }`. */
export function toLocalized(dto: LocalizedDtoLike): Localized {
  return { tk: dto?.[API_LANG.tk] ?? '', ru: dto?.[API_LANG.ru] ?? '' }
}

/** UI `{ tk, ru }` → API `{ tm, ru }`. */
export function fromLocalized(value: Localized): { tm: string; ru: string } {
  return { [API_LANG.tk]: value.tk.trim(), [API_LANG.ru]: value.ru.trim() } as { tm: string; ru: string }
}
