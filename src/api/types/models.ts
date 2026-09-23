/*
 * UI-facing models. camelCase, no `tm`, no `*_path`, dates as ISO `YYYY-MM-DD`,
 * image URLs already resolved. Components only ever see these.
 */

export type ID = number

export interface Localized {
  tk: string
  ru: string
}

/** An image in a form: already on the server (url only) or freshly picked (file). */
export interface ImageInput {
  id: string
  url: string
  file?: File
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
}

export interface ListResult<T> {
  items: T[]
  total: number
}

export interface Admin {
  id: ID
  userName: string
  surname: string
  phone: string
  avatar: string | null
}

/** Store customer ("Ulanyjylar" screen). */
export interface Client {
  id: ID
  userName: string
  surname: string
  phone: string
  orderCount: number
  totalSpent: number
}

export interface Category {
  id: ID
  /** Single-language: the API stores one name for both locales. */
  name: string
  image: string
}

export interface Subcategory {
  id: ID
  name: string
  categoryId: ID | null
}

/** One editable attribute row in the product form. */
export interface AttributeRow {
  keyTk: string
  valueTk: string
  keyRu: string
  valueRu: string
}

export interface ProductListItem {
  id: ID
  name: string
  price: number
  discountPrice: number | null
  image: string
  isPaused: boolean
  orderCount: number
  createdAt: string
}

export interface Product {
  id: ID
  name: string
  description: Localized
  price: number
  discountPrice: number | null
  attributes: AttributeRow[]
  isPaused: boolean
  /** images[0] is treated as the main image. */
  images: string[]
  subcategoryId: ID | null
  categoryId: ID | null
}

export interface Banner {
  id: ID
  title: Localized
  description: Localized
  url: string
  phone: string
  image: string
  images: string[]
  displayFrom: string
  displayTo: string
  /** Read-only, computed by the server. */
  isActive: boolean
}

/** One row of the "Sargyt edilenler" list. */
export interface OrderListItem {
  id: ID
  customerName: string
  phone: string
  city: string
  productCount: number
  totalPrice: number
  isSent: boolean
  /** Not opened by an admin yet. */
  isNew: boolean
}

export interface OrderProduct {
  id: ID
  name: string
  /** Unit price. */
  price: number
  discountPrice: number | null
  image: string
  quantity: number
}

export interface Order {
  id: ID
  phone: string
  city: string
  deliveryAddress: string
  notes: string
  productCount: number
  products: OrderProduct[]
  totalPrice: number
  isSent: boolean
}

export interface Notification {
  id: ID
  title: Localized
  body: Localized
  /** `life` from the API, sent as-is. */
  life: number
  /** ISO date, "" when missing. */
  createdAt: string
}

export interface DashboardProduct {
  id: ID
  name: string
  orderCount: number
  price: number
  discountPrice: number | null
  image: string
}

export interface Dashboard {
  totalClients: number
  totalProducts: number
  totalCategories: number
  products: DashboardProduct[]
  /** Plain display names — the endpoint returns strings, not objects. */
  clientNames: string[]
}

/* ─── Write payloads (UI → API) ─────────────────────────────────────────── */

export interface LoginPayload {
  userName: string
  password: string
}

export interface ProfilePayload {
  userName: string
  surname: string
  phone: string
  avatar?: ImageInput | null
}

export interface CategoryPayload {
  name: string
  image?: ImageInput | null
}

export interface SubcategoryPayload {
  name: string
  categoryId?: ID
}

export interface ProductPayload {
  name: string
  description: Localized
  price: number
  discountPrice: number | null
  subcategoryId: ID
  attributes: AttributeRow[]
  isPaused: boolean
  mainImage?: ImageInput | null
  additionalImages?: ImageInput[]
}

export interface BannerPayload {
  title: Localized
  description: Localized
  url: string
  phone: string
  displayFrom: string
  displayTo: string
  mainImage?: ImageInput | null
  additionalImages?: ImageInput[]
}

export interface NotificationPayload {
  title: Localized
  body: Localized
  life: number
}

export interface PasswordPayload {
  currentPassword: string
  newPassword: string
}
