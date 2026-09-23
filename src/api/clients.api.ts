import { DEFAULT_LIMIT, ensurePageSlice, toOffset } from '@/lib/pagination'
import { http } from './client'
import { clientName, toClient } from './mappers/client'
import { clientListDto } from './types/client.dto'
import { parseDto } from './types/common'
import type { Client, ListParams, ListResult } from './types/models'

const matchesSearch = (client: Client, search: string) => {
  const query = search.trim().toLocaleLowerCase().replace(/\s+/g, '')
  if (!query) return true
  return [clientName(client), client.phone].some((field) =>
    field.toLocaleLowerCase().replace(/\s+/g, '').includes(query),
  )
}

export const clientsApi = {
  /**
   * GET /client/list documents no pagination or search params. We send them
   * anyway and fall back to filtering/slicing locally when the server ignores
   * them. TODO(api): remove the fallback once the endpoint supports them.
   */
  async list({ page = 1, limit = DEFAULT_LIMIT, search = '' }: ListParams): Promise<ListResult<Client>> {
    const { data } = await http.get('/client/list', {
      params: { limit, offset: toOffset(page, limit), search: search || undefined },
    })
    const dto = parseDto(clientListDto, data, 'GET /client/list')
    let items = (dto.clients ?? []).map(toClient)
    let total = dto.total ?? items.length

    if (search && items.some((client) => !matchesSearch(client, search))) {
      items = items.filter((client) => matchesSearch(client, search))
      total = items.length
    }
    return ensurePageSlice(items, total, page, limit)
  },
}
