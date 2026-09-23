import { resolveMediaUrl } from '@/lib/media'
import type { DashboardDto } from '../types/auth.dto'
import type { Dashboard } from '../types/models'

export function toDashboard(dto: DashboardDto): Dashboard {
  return {
    totalClients: dto.total_clients ?? 0,
    totalProducts: dto.total_products ?? 0,
    totalCategories: dto.total_categories ?? 0,
    products: (dto.products ?? []).map((product) => ({
      id: product.id,
      name: product.name ?? '',
      orderCount: product.order_count ?? 0,
      price: product.price ?? 0,
      discountPrice: product.discount_price ?? null,
      image: resolveMediaUrl(product.image),
    })),
    clientNames: (dto.clients ?? []).filter((name): name is string => typeof name === 'string'),
  }
}
