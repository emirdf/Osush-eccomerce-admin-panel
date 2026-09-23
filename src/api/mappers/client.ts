import type { ClientDto } from '../types/client.dto'
import type { Client } from '../types/models'

export function toClient(dto: ClientDto): Client {
  return {
    id: dto.id,
    userName: dto.user_name ?? '',
    surname: dto.surname ?? '',
    phone: dto.phone_number ?? '',
    orderCount: dto.order_count ?? 0,
    totalSpent: dto.total_spent ?? 0,
  }
}

/** Display name used in tables and the dashboard list. */
export const clientName = (client: Pick<Client, 'userName' | 'surname'>) =>
  `${client.userName} ${client.surname}`.trim()
