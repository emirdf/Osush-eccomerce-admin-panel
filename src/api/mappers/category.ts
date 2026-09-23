import { resolveMediaUrl } from '@/lib/media'
import type { CategoryDto } from '../types/category.dto'
import type { SubcategoryDto } from '../types/subcategory.dto'
import type { Category, CategoryPayload, Subcategory } from '../types/models'

export function toCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    name: dto.name ?? '',
    // `image_path`, not `image`.
    image: resolveMediaUrl(dto.image_path),
  }
}

export function toCategoryDataDto(payload: CategoryPayload) {
  return { name: payload.name.trim() }
}

export function toSubcategory(dto: SubcategoryDto): Subcategory {
  return { id: dto.id, name: dto.name ?? '', categoryId: dto.category_id ?? null }
}
