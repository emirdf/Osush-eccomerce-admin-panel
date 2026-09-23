import { fileFromUrl, IMAGE_PLACEHOLDER } from '@/lib/media'
import { DEFAULT_LIMIT, ensurePageSlice, MAX_LIMIT, toOffset } from '@/lib/pagination'
import { categoriesApi } from './categories.api'
import { http } from './client'
import { buildFormData } from './formData'
import { toProduct, toProductDataDto, toProductListItem } from './mappers/product'
import { subcategoriesApi } from './subcategories.api'
import { parseDto } from './types/common'
import { productDetailDto, productListDto } from './types/product.dto'
import type { ID, ListParams, ListResult, Product, ProductListItem, ProductPayload } from './types/models'

export interface ProductListParams extends ListParams {
  categoryId?: ID | null
  subcategoryId?: ID | null
  sort?: 'ASC' | 'DESC'
}

/** What `GET /product/{id}` leaves out — recovered from the list endpoint. See `findPlacement`. */
export interface ProductPlacement {
  categoryId: ID | null
  subcategoryId: ID | null
  /** The cover image as the list endpoint labels it, or null when it could not be read. */
  mainImage: string | null
}

export const EMPTY_PLACEMENT: ProductPlacement = { categoryId: null, subcategoryId: null, mainImage: null }

/** Probes are cheap but there can be many — a few at a time, stopping at the first hit. */
const PROBE_CONCURRENCY = 4

/** The product's row inside one filtered page of the list, or null when it is not there. */
async function findRow(productId: ID, params: ProductListParams): Promise<ProductListItem | null> {
  const { items } = await productsApi.list({ ...params, limit: MAX_LIMIT })
  return items.find((item) => item.id === productId) ?? null
}

async function firstMatch<T>(candidates: T[], probe: (candidate: T) => Promise<boolean>): Promise<T | null> {
  for (let i = 0; i < candidates.length; i += PROBE_CONCURRENCY) {
    const batch = candidates.slice(i, i + PROBE_CONCURRENCY)
    const hits = await Promise.all(batch.map(probe))
    const index = hits.indexOf(true)
    if (index !== -1) return batch[index]
  }
  return null
}

/**
 * `POST`/`PUT /product` will not save without a `mainImage` file — an edit that
 * only touches the price or the attributes is rejected. The admin has usually
 * not re-picked the cover, so the stored one is downloaded and sent straight
 * back. `additionImages` still carries only newly picked files: the backend's
 * semantics for the rest of the gallery are unconfirmed (API_GAPS.md §4.4).
 */
async function productFiles(payload: ProductPayload) {
  const { mainImage } = payload
  return {
    mainImage: mainImage?.file ?? (await fileFromUrl(mainImage?.url)),
    additionImages: (payload.additionalImages ?? []).map((image) => image.file).filter((file): file is File => !!file),
  }
}

export const productsApi = {
  async list({ page = 1, limit = DEFAULT_LIMIT, search = '', categoryId, subcategoryId, sort }: ProductListParams): Promise<ListResult<ProductListItem>> {
    const { data } = await http.get('/product', {
      params: {
        limit,
        offset: toOffset(page, limit),
        search: search || undefined,
        category_id: categoryId ?? undefined,
        subcategory_id: subcategoryId ?? undefined,
        sort_by_value: sort,
      },
    })
    const dto = parseDto(productListDto, data, 'GET /product')
    const items = (dto.products ?? []).map(toProductListItem)
    return ensurePageSlice(items, dto.total ?? items.length, page, limit)
  },

  async get(id: ID): Promise<Product> {
    const { data } = await http.get(`/product/${id}`)
    return toProduct(parseDto(productDetailDto, data, `GET /product/${id}`))
  },

  /**
   * Recovers the category, subcategory and cover image that `GET /product/{id}`
   * does not return (API_GAPS.md §3). The list endpoint *does* filter by
   * `category_id` and `subcategory_id`, so the placement is found by asking
   * which category — then which of its subcategories — still returns this
   * product. Probes are narrowed by the product's own name when the API's
   * `search` matches it, which keeps every response to a handful of rows.
   *
   * Remove this the day the detail response carries `subcategory_id`.
   */
  async findPlacement(product: Pick<Product, 'id' | 'name'>): Promise<ProductPlacement> {
    const name = product.name.trim()
    let search: string | undefined = name || undefined
    let row = search ? await findRow(product.id, { search }) : null
    if (!row) {
      // The name is not a usable search term (or the product is gone) — probe unfiltered.
      search = undefined
      row = await findRow(product.id, {})
    }
    if (!row) return EMPTY_PLACEMENT
    // `image` is already resolved, so an absent cover arrives as the placeholder.
    const mainImage = row.image === IMAGE_PLACEHOLDER ? null : row.image

    const categories = await categoriesApi.all()
    const category = await firstMatch(categories, async (c) => Boolean(await findRow(product.id, { categoryId: c.id, search })))
    if (!category) return { ...EMPTY_PLACEMENT, mainImage }

    const subcategories = await subcategoriesApi.listAll(category.id)
    const subcategory = await firstMatch(subcategories, async (s) => Boolean(await findRow(product.id, { subcategoryId: s.id, search })))
    return { categoryId: category.id, subcategoryId: subcategory?.id ?? null, mainImage }
  },

  async create(payload: ProductPayload): Promise<void> {
    await http.post('/product', buildFormData({ data: toProductDataDto(payload), files: await productFiles(payload) }))
  },

  async update(id: ID, payload: ProductPayload): Promise<void> {
    await http.put(`/product/${id}`, buildFormData({ data: toProductDataDto(payload), files: await productFiles(payload) }))
  },

  async remove(id: ID): Promise<void> {
    await http.delete(`/product/${id}`)
  },

  /** No bulk endpoint: delete sequentially so one failure stops the rest. */
  async removeMany(ids: ID[]): Promise<void> {
    for (const id of ids) await productsApi.remove(id)
  },
}
