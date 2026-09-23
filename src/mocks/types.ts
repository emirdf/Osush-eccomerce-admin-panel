/*
 * Shapes returned by the REST API. Mocks return exactly these, so components
 * never know whether data came from memory or the network.
 */

export type ID = number

export interface Localized {
  tk: string
  ru: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
}

export interface Admin {
  id: ID
  first_name: string
  last_name: string
  phone: string
  avatar: string | null
}

export interface User {
  id: ID
  first_name: string
  last_name: string
  phone: string
  orders_count: number
  total_spent: number
  created_at: string
}

export interface ProductAttribute {
  key: Localized
  value: Localized
}

export interface Product {
  id: ID
  name: string
  description: string
  price: number
  discount_price: number | null
  main_image: string
  additional_images: string[]
  category_id: ID
  subcategory_id: ID | null
  attributes: ProductAttribute[]
  orders_count: number
  stock: number
  created_at: string
}

export interface Subcategory {
  id: ID
  name: Localized
}

export interface Category {
  id: ID
  name: Localized
  image: string
  subcategories: Subcategory[]
}

export interface Ad {
  id: ID
  title: string
  description: string
  phone: string
  link: string
  start_date: string
  end_date: string
  is_active: boolean
  main_image: string
  additional_images: string[]
  created_at: string
}

export interface Notification {
  id: ID
  title: string
  body: string
  sent_at: string
  created_at: string
}

export interface DashboardStats {
  users_count: number
  products_count: number
  categories_count: number
}

/* ─── Write payloads ─────────────────────────────────────────────────────── */

/**
 * An image in a form: either already on the server (`url` only) or freshly
 * picked (`file` present, `url` is a local object URL for previewing).
 */
export interface ImageInput {
  id: string
  url: string
  file?: File
}

export interface LoginInput {
  phone: string
  password: string
}

export interface LoginResponse {
  token: string
  admin: Admin
}

export interface ProductInput {
  name: string
  description: string
  price: number
  discount_price: number | null
  stock: number
  category_id: ID
  subcategory_id: ID | null
  attributes: ProductAttribute[]
  main_image: ImageInput
  additional_images: ImageInput[]
}

export interface CategoryInput {
  name: Localized
  image: ImageInput
  subcategories: { id?: ID; name: Localized }[]
}

export interface AdInput {
  title: string
  description: string
  phone: string
  link: string
  start_date: string
  end_date: string
  is_active: boolean
  main_image: ImageInput
  additional_images: ImageInput[]
}

export interface NotificationInput {
  title: string
  body: string
}

export interface ProfileInput {
  first_name: string
  last_name: string
  phone: string
  avatar: ImageInput | null
}

export interface PasswordInput {
  current_password: string
  new_password: string
}
