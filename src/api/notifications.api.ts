import { DEFAULT_LIMIT, ensurePageSlice } from '@/lib/pagination'
import { http } from './client'
import { toNotification, toNotificationDto } from './mappers/notification'
import { parseDto } from './types/common'
import { notificationListDto } from './types/notification.dto'
import type { ID, ListParams, ListResult, Notification, NotificationPayload } from './types/models'

const matchesSearch = (notification: Notification, search: string) => {
  const query = search.trim().toLocaleLowerCase()
  if (!query) return true
  const { title, body } = notification
  return [title.tk, title.ru, body.tk, body.ru].some((text) => text.toLocaleLowerCase().includes(query))
}

/** List, create and delete only — no update or unread count (API_GAPS.md). */
export const notificationsApi = {
  /** TODO(api): limit/offset/search support is undocumented — filter and slice locally, like banners. */
  async list({ page = 1, limit = DEFAULT_LIMIT, search = '' }: ListParams): Promise<ListResult<Notification>> {
    const { data } = await http.get('/notification/admin')
    const dto = parseDto(notificationListDto, data, 'GET /notification/admin')
    const items = (dto.notifications ?? dto.data ?? []).map(toNotification)
    const filtered = search ? items.filter((n) => matchesSearch(n, search)) : items
    return ensurePageSlice(filtered, search ? filtered.length : (dto.total ?? items.length), page, limit)
  },

  async create(payload: NotificationPayload): Promise<void> {
    await http.post('/notification/admin', toNotificationDto(payload))
  },

  /** DELETE takes one id; a bulk delete is one request per id. */
  async remove(ids: ID[]): Promise<void> {
    await Promise.all(ids.map((id) => http.delete(`/notification/admin/${id}`)))
  },
}
