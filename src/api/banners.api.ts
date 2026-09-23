import { DEFAULT_LIMIT, ensurePageSlice } from '@/lib/pagination'
import { http } from './client'
import { ApiError } from './errors'
import { USE_MOCK } from './featureFlags'
import { buildFormData } from './formData'
import { toBanner, toBannerDataDto } from './mappers/banner'
import { bannerListDto } from './types/banner.dto'
import { parseDto } from './types/common'
import type { Banner, BannerPayload, ID, ListParams, ListResult } from './types/models'

const matchesSearch = (banner: Banner, search: string) => {
  const query = search.trim().toLocaleLowerCase()
  if (!query) return true
  return [banner.title.tk, banner.title.ru].some((title) => title.toLocaleLowerCase().includes(query))
}

async function fetchAll(): Promise<{ items: Banner[]; total: number }> {
  // GET /banner ignores limit/offset (verified against the live API).
  const { data } = await http.get('/banner')
  const dto = parseDto(bannerListDto, data, 'GET /banner')
  const items = (dto.banners ?? []).map(toBanner)
  return { items, total: dto.total ?? items.length }
}

export const bannersApi = {
  async list({ page = 1, limit = DEFAULT_LIMIT, search = '' }: ListParams): Promise<ListResult<Banner>> {
    const { items, total } = await fetchAll()
    const filtered = search ? items.filter((banner) => matchesSearch(banner, search)) : items
    return ensurePageSlice(filtered, search ? filtered.length : total, page, limit)
  },

  /** No GET /banner/{id}: read the one banner out of the list. */
  async get(id: ID): Promise<Banner> {
    const { items } = await fetchAll()
    const banner = items.find((item) => item.id === id)
    if (!banner) throw new ApiError(404, 'not_found')
    return banner
  },

  async create(payload: BannerPayload): Promise<void> {
    await http.post(
      '/banner',
      buildFormData({
        data: toBannerDataDto(payload),
        files: {
          mainImage: payload.mainImage?.file ?? null,
          additionImages: (payload.additionalImages ?? []).map((i) => i.file).filter((f): f is File => !!f),
        },
      }),
    )
  },

  /**
   * PUT /banner/{id} does not exist yet (USE_MOCK.bannerWrite): the form saves
   * against nothing and says so. Flip the flag when the endpoint lands.
   */
  async update(id: ID, payload: BannerPayload): Promise<void> {
    if (USE_MOCK.bannerWrite) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return
    }
    await http.put(
      `/banner/${id}`,
      buildFormData({
        data: toBannerDataDto(payload),
        files: {
          mainImage: payload.mainImage?.file ?? null,
          additionImages: (payload.additionalImages ?? []).map((i) => i.file).filter((f): f is File => !!f),
        },
      }),
    )
  },
}
