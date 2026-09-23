import { resolveMediaUrl } from '@/lib/media'
import type { AdminDto } from '../types/auth.dto'
import type { Admin, ProfilePayload } from '../types/models'

export function toAdmin(dto: AdminDto): Admin {
  return {
    id: dto.id,
    userName: dto.user_name ?? '',
    surname: dto.surname ?? '',
    phone: dto.phone_number ?? '',
    avatar: dto.avatar ? resolveMediaUrl(dto.avatar) : null,
  }
}

export function toProfileDataDto(payload: ProfilePayload) {
  return {
    user_name: payload.userName.trim(),
    surname: payload.surname.trim(),
    phone_number: payload.phone.trim(),
  }
}
