import { clampLimit, DEFAULT_LIMIT, ensurePageSlice, MAX_LIMIT, toOffset } from '@/lib/pagination'
import { http } from './client'
import { buildFormData } from './formData'
import { toCategory, toCategoryDataDto } from './mappers/category'
import { categoryDto, categoryListDto } from './types/category.dto'
import { parseDto } from './types/common'
import type { Category, CategoryPayload, ID, ListParams, ListResult } from './types/models'

export const categoriesApi = {
  async list({ page = 1, limit = DEFAULT_LIMIT, search = '' }: ListParams = {}): Promise<ListResult<Category>> {
    const size = clampLimit(limit)
    const { data } = await http.get('/category', {
      params: { limit: size, offset: toOffset(page, size), search: search || undefined },
    })
    const dto = parseDto(categoryListDto, data, 'GET /category')
    const items = (dto.categories ?? []).map(toCategory)
    return ensurePageSlice(items, dto.total ?? items.length, page, limit)
  },

  /** Every category (for selects), fetched a page at a time — limit is capped at 100. */
  async all(): Promise<Category[]> {
    const collected: Category[] = []
    for (let page = 1; page <= 20; page += 1) {
      const { items, total } = await categoriesApi.list({ page, limit: MAX_LIMIT })
      collected.push(...items)
      if (!items.length || collected.length >= total) break
    }
    return collected
  },

  async get(id: ID): Promise<Category> {
    const { data } = await http.get(`/category/${id}`)
    return toCategory(parseDto(categoryDto, data, `GET /category/${id}`))
  },

  /** Returns the new id so subcategories can be created against it. */
  async create(payload: CategoryPayload): Promise<ID | null> {
    const { data } = await http.post(
      '/category',
      buildFormData({ data: toCategoryDataDto(payload), files: { image: payload.image?.file ?? null } }),
    )
    const parsed = categoryDto.safeParse(data)
    return parsed.success ? parsed.data.id : null
  },

  async update(id: ID, payload: CategoryPayload): Promise<void> {
    await http.put(
      `/category/${id}`,
      buildFormData({ data: toCategoryDataDto(payload), files: { image: payload.image?.file ?? null } }),
    )
  },

  async remove(id: ID): Promise<void> {
    await http.delete(`/category/${id}`)
  },
}
