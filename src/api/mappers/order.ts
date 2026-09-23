import { resolveMediaUrl } from '@/lib/media'
import type { OrderDetailDto, OrderListItemDto, OrderProductDto } from '../types/order.dto'
import type { ID, Order, OrderListItem, OrderProduct } from '../types/models'

export function toOrderListItem(dto: OrderListItemDto): OrderListItem {
  return {
    id: dto.id,
    customerName: dto.customer_name ?? '',
    phone: dto.phone_number ?? '',
    city: dto.city ?? '',
    productCount: dto.total_product ?? 0,
    totalPrice: dto.total_price ?? 0,
    isSent: dto.is_send ?? false,
    isNew: dto.is_new ?? false,
  }
}

function toOrderProduct(dto: OrderProductDto): OrderProduct {
  return {
    id: dto.id,
    name: dto.name ?? '',
    price: dto.price ?? 0,
    discountPrice: dto.discount_price ?? null,
    image: resolveMediaUrl(dto.image),
    quantity: dto.total ?? 1,
  }
}

export function toOrder(id: ID, dto: OrderDetailDto): Order {
  return {
    id,
    phone: dto.phone_number ?? '',
    city: dto.city ?? '',
    deliveryAddress: dto.delivery_address ?? '',
    notes: dto.notes ?? '',
    productCount: dto.total_product ?? 0,
    products: (dto.products ?? []).map(toOrderProduct),
    totalPrice: dto.total_price ?? 0,
    isSent: dto.is_send ?? false,
  }
}
