import { clampLimit, DEFAULT_LIMIT, MAX_LIMIT, toOffset } from '@/lib/pagination'
import { http } from './client'
import { toSubcategory } from './mappers/category'
import { parseDto } from './types/common'
import { subcategoryDto, subcategoryListDto } from './types/subcategory.dto'
import type { ID, ListParams, Subcategory, SubcategoryPayload } from './types/models'

interface SubcategoryListParams extends ListParams {
  categoryId?: ID | null
}

/** Subcategories are their own resource with JSON endpoints (not nested in category). */
export const subcategoriesApi = {
  async list({ page = 1, limit = MAX_LIMIT, search = '', categoryId }: SubcategoryListParams = {}): Promise<Subcategory[]> {
    const size = clampLimit(limit)
    const { data } = await http.get('/subcategory', {
      params: {
        limit: size,
        offset: toOffset(page, size),
        search: search || undefined,
        category_id: categoryId ?? undefined,
      },
    })
    const dto = parseDto(subcategoryListDto, data, 'GET /subcategory')
    return (dto.subcategories ?? []).map(toSubcategory)
  },

  /** Every subcategory of a category, paged through the 100-row cap. */
  async listAll(categoryId: ID | null): Promise<Subcategory[]> {
    const collected: Subcategory[] = []
    for (let page = 1; page <= 20; page += 1) {
      const items = await subcategoriesApi.list({ page, limit: MAX_LIMIT, categoryId })
      collected.push(...items)
      if (items.length < MAX_LIMIT) break
    }
    return collected
  },

  async get(id: ID): Promise<Subcategory> {
    const { data } = await http.get(`/subcategory/${id}`)
    return toSubcategory(parseDto(subcategoryDto, data, `GET /subcategory/${id}`))
  },

  async create({ name, categoryId }: SubcategoryPayload & { categoryId: ID }): Promise<void> {
    await http.post('/subcategory', { name: name.trim(), category_id: categoryId })
  },

  async update(id: ID, { name }: SubcategoryPayload): Promise<void> {
    await http.put(`/subcategory/${id}`, { name: name.trim() })
  },

  async remove(id: ID): Promise<void> {
    await http.delete(`/subcategory/${id}`)
  },
}

export const SUBCATEGORY_PAGE_LIMIT = DEFAULT_LIMIT
