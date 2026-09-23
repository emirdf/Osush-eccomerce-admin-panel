import { parseApiDate } from '@/lib/date'
import type { NotificationDto } from '../types/notification.dto'
import type { Notification, NotificationPayload } from '../types/models'
import { fromLocalized, toLocalized } from './localized'

export function toNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    title: toLocalized(dto.title),
    body: toLocalized(dto.body),
    life: dto.life ?? 0,
    createdAt: parseApiDate(dto.created_at),
  }
}

export function toNotificationDto(payload: NotificationPayload) {
  return { title: fromLocalized(payload.title), body: fromLocalized(payload.body), life: payload.life }
}
