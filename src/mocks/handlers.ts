/*
 * In-memory fake backend. Every function mirrors one REST endpoint and returns
 * the same shape. Data resets on page reload.
 */
import { ApiError } from '@/api/errors'
import type {
  Ad,
  AdInput,
  Admin,
  Category,
  CategoryInput,
  DashboardStats,
  ID,
  ListParams,
  LoginInput,
  LoginResponse,
  Notification,
  NotificationInput,
  Paginated,
  PasswordInput,
  Product,
  ProductInput,
  ProfileInput,
  User,
} from './types'
import { seedAdmin, seedAds, seedCategories, seedNotifications, seedPassword, seedProducts, seedUsers } from './seed'
import { clone, delay, findOr404, matches, newestFirst, nextId, paginate, uploadImage } from './utils'

const db = {
  admin: clone(seedAdmin),
  password: seedPassword,
  users: clone(seedUsers),
  products: clone(seedProducts),
  categories: clone(seedCategories),
  ads: clone(seedAds),
  notifications: clone(seedNotifications),
  unreadNotifications: 3,
}

const without = <T extends { id: ID }>(items: T[], ids: ID[]) => items.filter((item) => !ids.includes(item.id))

export const mockApi = {
  auth: {
    async login({ phone, password }: LoginInput): Promise<LoginResponse> {
      await delay(500, 800)
      if (phone !== db.admin.phone || password !== db.password) throw new ApiError(401, 'invalid_credentials')
      return { token: `mock.${crypto.randomUUID()}`, admin: clone(db.admin) }
    },
    async logout(): Promise<void> {
      await delay(150, 300)
    },
  },

  dashboard: {
    async stats(): Promise<DashboardStats> {
      await delay()
      return {
        users_count: db.users.length,
        products_count: db.products.reduce((sum, p) => sum + p.stock, 0),
        categories_count: db.categories.length,
      }
    },
  },

  users: {
    async list(params: ListParams): Promise<Paginated<User>> {
      await delay()
      const rows = db.users
        .filter((u) => matches(params.search, `${u.last_name} ${u.first_name}`, `${u.first_name} ${u.last_name}`, u.phone))
        .sort(newestFirst)
      return paginate(rows, params)
    },
    async remove(id: ID): Promise<void> {
      await delay()
      findOr404(db.users, id)
      db.users = without(db.users, [id])
    },
  },

  products: {
    async list(params: ListParams): Promise<Paginated<Product>> {
      await delay()
      return paginate(db.products.filter((p) => matches(params.search, p.name)).sort(newestFirst), params)
    },
    async get(id: ID): Promise<Product> {
      await delay()
      return clone(findOr404(db.products, id))
    },
    async create(input: ProductInput): Promise<Product> {
      await delay()
      const product: Product = {
        ...input,
        id: nextId(db.products),
        main_image: await uploadImage(input.main_image),
        additional_images: await Promise.all(input.additional_images.map(uploadImage)),
        orders_count: 0,
        created_at: new Date().toISOString(),
      }
      db.products.push(product)
      return clone(product)
    },
    async update(id: ID, input: ProductInput): Promise<Product> {
      await delay()
      const current = findOr404(db.products, id)
      const product: Product = {
        ...current,
        ...input,
        id,
        main_image: await uploadImage(input.main_image),
        additional_images: await Promise.all(input.additional_images.map(uploadImage)),
      }
      db.products = db.products.map((p) => (p.id === id ? product : p))
      return clone(product)
    },
    async remove(ids: ID[]): Promise<void> {
      await delay()
      db.products = without(db.products, ids)
    },
  },

  categories: {
    async list(): Promise<Category[]> {
      await delay()
      return clone(db.categories)
    },
    async get(id: ID): Promise<Category> {
      await delay()
      return clone(findOr404(db.categories, id))
    },
    async create(input: CategoryInput): Promise<Category> {
      await delay()
      const category: Category = {
        id: nextId(db.categories),
        name: input.name,
        image: await uploadImage(input.image),
        subcategories: assignSubcategoryIds(input.subcategories),
      }
      db.categories.push(category)
      return clone(category)
    },
    async update(id: ID, input: CategoryInput): Promise<Category> {
      await delay()
      findOr404(db.categories, id)
      const category: Category = {
        id,
        name: input.name,
        image: await uploadImage(input.image),
        subcategories: assignSubcategoryIds(input.subcategories),
      }
      db.categories = db.categories.map((c) => (c.id === id ? category : c))
      return clone(category)
    },
    async remove(id: ID): Promise<void> {
      await delay()
      findOr404(db.categories, id)
      if (db.products.some((p) => p.category_id === id)) throw new ApiError(409, 'category_in_use')
      db.categories = without(db.categories, [id])
    },
  },

  ads: {
    async list(params: ListParams): Promise<Paginated<Ad>> {
      await delay()
      return paginate(db.ads.filter((a) => matches(params.search, a.title)).sort(newestFirst), params)
    },
    async get(id: ID): Promise<Ad> {
      await delay()
      return clone(findOr404(db.ads, id))
    },
    async create(input: AdInput): Promise<Ad> {
      await delay()
      const ad: Ad = {
        ...input,
        id: nextId(db.ads),
        main_image: await uploadImage(input.main_image),
        additional_images: await Promise.all(input.additional_images.map(uploadImage)),
        created_at: new Date().toISOString(),
      }
      db.ads.push(ad)
      return clone(ad)
    },
    async update(id: ID, input: AdInput): Promise<Ad> {
      await delay()
      const current = findOr404(db.ads, id)
      const ad: Ad = {
        ...current,
        ...input,
        id,
        main_image: await uploadImage(input.main_image),
        additional_images: await Promise.all(input.additional_images.map(uploadImage)),
      }
      db.ads = db.ads.map((a) => (a.id === id ? ad : a))
      return clone(ad)
    },
    async remove(ids: ID[]): Promise<void> {
      await delay()
      db.ads = without(db.ads, ids)
    },
  },

  notifications: {
    async list(params: ListParams): Promise<Paginated<Notification>> {
      await delay()
      const rows = db.notifications.filter((n) => matches(params.search, n.title, n.body)).sort(newestFirst)
      return paginate(rows, params)
    },
    async create(input: NotificationInput): Promise<Notification> {
      await delay()
      const now = new Date().toISOString()
      const notification: Notification = { ...input, id: nextId(db.notifications), sent_at: now, created_at: now }
      db.notifications.push(notification)
      return clone(notification)
    },
    async update(id: ID, input: NotificationInput): Promise<Notification> {
      await delay()
      const notification = { ...findOr404(db.notifications, id), ...input }
      db.notifications = db.notifications.map((n) => (n.id === id ? notification : n))
      return clone(notification)
    },
    async remove(ids: ID[]): Promise<void> {
      await delay()
      db.notifications = without(db.notifications, ids)
    },
    async unreadCount(): Promise<{ count: number }> {
      await delay(100, 200)
      return { count: db.unreadNotifications }
    },
    async markAllRead(): Promise<void> {
      await delay(100, 200)
      db.unreadNotifications = 0
    },
  },

  profile: {
    async get(): Promise<Admin> {
      await delay()
      return clone(db.admin)
    },
    async update(input: ProfileInput): Promise<Admin> {
      await delay()
      db.admin = { ...db.admin, ...input, avatar: input.avatar ? await uploadImage(input.avatar) : null }
      return clone(db.admin)
    },
    async changePassword({ current_password, new_password }: PasswordInput): Promise<void> {
      await delay()
      if (current_password !== db.password) throw new ApiError(422, 'wrong_current_password')
      db.password = new_password
    },
  },
}

function assignSubcategoryIds(subs: CategoryInput['subcategories']) {
  let id = db.categories.flatMap((c) => c.subcategories).reduce((max, s) => Math.max(max, s.id), 0)
  return subs.map((s) => ({ id: s.id ?? ++id, name: s.name }))
}
