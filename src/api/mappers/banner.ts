import { formatApiDate, parseApiDate } from '@/lib/date'
import { resolveMediaUrl } from '@/lib/media'
import type { BannerDto } from '../types/banner.dto'
import type { Banner, BannerPayload } from '../types/models'
import { fromLocalized, toLocalized } from './localized'

export function toBanner(dto: BannerDto): Banner {
  return {
    id: dto.id,
    title: toLocalized(dto.title),
    description: toLocalized(dto.description),
    url: dto.url ?? '',
    phone: dto.phone_number ?? '',
    image: resolveMediaUrl(dto.image),
    images: (dto.images ?? []).map(resolveMediaUrl),
    displayFrom: parseApiDate(dto.display_from),
    displayTo: parseApiDate(dto.display_to),
    isActive: dto.is_active ?? false,
  }
}

export function toBannerDataDto(payload: BannerPayload) {
  return {
    title: fromLocalized(payload.title),
    url: payload.url.trim() || null,
    description: payload.description.tk.trim() || payload.description.ru.trim() ? fromLocalized(payload.description) : null,
    phone_number: payload.phone.trim() || null,
    display_from: formatApiDate(payload.displayFrom),
    display_to: formatApiDate(payload.displayTo),
  }
}
