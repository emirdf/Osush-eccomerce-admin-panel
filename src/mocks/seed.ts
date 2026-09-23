import type { Ad, Admin, Category, Notification, Product, ProductAttribute, User } from './types'
import { bannerImage, glyphImage, type GlyphKind } from './images'

/* Deterministic PRNG so the seed is identical on every reload. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260914)
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)]

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setHours(int(8, 19), int(0, 59), int(0, 59), 0)
  d.setDate(d.getDate() + days)
  return d
}
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const randomPhone = () => `+993${pick(['61', '62', '63', '64', '65', '71'])}${String(int(0, 999999)).padStart(6, '0')}`

/* ─── Admin ─────────────────────────────────────────────────────────────── */

export const seedAdmin: Admin = {
  id: 1,
  first_name: 'Kerim',
  last_name: 'Meýlisow',
  phone: '+99361234567',
  avatar: null,
}
export const seedPassword = 'admin123'

/* ─── Users ─────────────────────────────────────────────────────────────── */

const MALE = ['Begenç', 'Meýlis', 'Osman', 'Juma', 'Kerim', 'Hydyr', 'Merdan', 'Serdar', 'Döwlet', 'Aýdogdy', 'Batyr', 'Nury', 'Rustam', 'Maksat', 'Aşyr']
const FEMALE = ['Nuraana', 'Mira', 'Gunça', 'Hatyja', 'Ejeş', 'Hurma', 'Aýgül', 'Jeren', 'Maýsa', 'Bahar', 'Ogulgerek', 'Selbi', 'Leýli', 'Mähri', 'Gülälek']
const SURNAMES: [string, string][] = [
  ['Akmyradow', 'Akmyradowa'],
  ['Kakajanow', 'Kakajanowa'],
  ['Hydyrow', 'Hydyrowa'],
  ['Geldimyradow', 'Geldimyradowa'],
  ['Meredow', 'Meredowa'],
  ['Çaryýarow', 'Çaryýarowa'],
  ['Amantajow', 'Amantajowa'],
  ['Gerekliýew', 'Gerekliýewa'],
  ['Osmanow', 'Osmanowa'],
  ['Jemşidow', 'Jemşidowa'],
  ['Janmyradow', 'Janmyradowa'],
  ['Kerimow', 'Kerimowa'],
  ['Annaberdiýew', 'Annaberdiýewa'],
  ['Orazgeldiýew', 'Orazgeldiýewa'],
  ['Baýramow', 'Baýramowa'],
  ['Täçmyradow', 'Täçmyradowa'],
]

export const seedUsers: User[] = Array.from({ length: 238 }, (_, i) => {
  const female = rand() < 0.5
  const surname = pick(SURNAMES)
  const orders = int(0, 140)
  return {
    id: i + 1,
    first_name: pick(female ? FEMALE : MALE),
    last_name: female ? surname[1] : surname[0],
    phone: randomPhone(),
    orders_count: orders,
    total_spent: orders * int(4, 90) * 100,
    created_at: daysFromNow(-i * 2 - int(0, 1)).toISOString(),
  }
})

/* ─── Categories ────────────────────────────────────────────────────────── */

const same = (name: string) => ({ tk: name, ru: name })

const CATEGORY_DEFS: { kind: GlyphKind; name: [string, string]; subs: { tk: string; ru: string }[] }[] = [
  { kind: 'phone', name: ['Telefonlar', 'Телефоны'], subs: [same('Apple'), same('Samsung'), same('Xiaomi'), same('Honor')] },
  { kind: 'cable', name: ['Kabeller', 'Кабели'], subs: [same('USB-C'), same('Lightning'), same('HDMI'), { tk: 'Zarýad kabelleri', ru: 'Зарядные кабели' }] },
  { kind: 'laptop', name: ['Kompýuterler', 'Компьютеры'], subs: [{ tk: 'Noutbuklar', ru: 'Ноутбуки' }, { tk: 'Monobloklar', ru: 'Моноблоки' }, { tk: 'Ulgam bloklary', ru: 'Системные блоки' }] },
  { kind: 'flash', name: ['Fleşkalar', 'Флешки'], subs: [same('USB 3.0'), same('USB-C'), { tk: 'Ýat kartlary', ru: 'Карты памяти' }] },
  { kind: 'headphones', name: ['Nauşnikler', 'Наушники'], subs: [{ tk: 'Simsiz', ru: 'Беспроводные' }, { tk: 'Simli', ru: 'Проводные' }, { tk: 'Oýun üçin', ru: 'Игровые' }] },
  { kind: 'tablet', name: ['Planşetler', 'Планшеты'], subs: [same('iPad'), same('Samsung Galaxy Tab'), same('Xiaomi Pad')] },
  { kind: 'keyboard', name: ['Klawiaturalar', 'Клавиатуры'], subs: [{ tk: 'Mehaniki', ru: 'Механические' }, { tk: 'Simsiz', ru: 'Беспроводные' }] },
  { kind: 'mouse', name: ['Syçanjyklar', 'Мыши'], subs: [{ tk: 'Oýun üçin', ru: 'Игровые' }, { tk: 'Ofis üçin', ru: 'Офисные' }] },
  { kind: 'watch', name: ['Sagatlar', 'Часы'], subs: [{ tk: 'Akylly sagatlar', ru: 'Умные часы' }, { tk: 'Fitnes bilezikler', ru: 'Фитнес-браслеты' }] },
]

let subId = 1
export const seedCategories: Category[] = CATEGORY_DEFS.map((def, i) => ({
  id: i + 1,
  name: { tk: def.name[0], ru: def.name[1] },
  image: glyphImage(def.kind, i),
  subcategories: def.subs.map((name) => ({ id: subId++, name })),
}))

/* ─── Products ──────────────────────────────────────────────────────────── */

/** [name, subcategory index, base price] per category (same order as CATEGORY_DEFS). */
const CATALOG: [string, number, number][][] = [
  [['iPhone 17 Pro Silver', 0, 32000], ['iPhone 17 Pro Max', 0, 38000], ['iPhone 16', 0, 22000], ['Samsung Galaxy S25 Ultra', 1, 30000], ['Samsung Galaxy A56', 1, 9500], ['Xiaomi 15T Pro', 2, 14500], ['Redmi Note 14', 2, 5200], ['Honor 400', 3, 9800]],
  [['USB-C – USB-C kabel 2 m', 0, 180], ['Lightning – USB-C kabel', 1, 250], ['HDMI 2.1 kabel 3 m', 2, 320], ['Baseus 100W zarýad kabeli', 3, 290]],
  [['MacBook M4 Air', 0, 42000], ['MacBook M3 Air', 0, 36000], ['MacBook Pro 14 M4', 0, 58000], ['Lenovo IdeaPad Slim 5', 0, 21000], ['ASUS Vivobook 16', 0, 17500], ['iMac 24 M4', 1, 49000], ['HP Victus 15L', 2, 26000]],
  [['SanDisk Ultra 128 GB', 0, 210], ['Kingston DataTraveler 64 GB', 0, 120], ['Samsung Type-C 256 GB', 1, 450], ['microSD Samsung EVO 128 GB', 2, 190]],
  [['AirPods Pro 3', 0, 6200], ['Sony WH-1000XM6', 0, 8900], ['JBL Tune 770NC', 0, 2400], ['Audio enjamlary', 1, 650], ['Nauşnik audio hyzmatlary', 1, 450], ['HyperX Cloud III', 2, 2100]],
  [['iPad Air M3', 0, 19000], ['iPad 11', 0, 13000], ['Galaxy Tab S10', 1, 17000], ['Xiaomi Pad 7', 2, 9000]],
  [['Keychron K8 Pro', 0, 2300], ['Logitech MX Keys S', 1, 2600], ['Redragon Kumara K552', 0, 900]],
  [['Logitech G502 X', 0, 1600], ['Razer DeathAdder V3', 0, 1900], ['Logitech MX Master 3S', 1, 2100]],
  [['Apple Watch Series 11', 0, 11000], ['Galaxy Watch 8', 0, 8500], ['Xiaomi Smart Band 10', 1, 950]],
]

const COLORS: [string, string][] = [['Gara', 'Чёрный'], ['Ak', 'Белый'], ['Gök', 'Синий'], ['Kümüş', 'Серебристый'], ['Gyzyl', 'Красный'], ['Ýaşyl', 'Зелёный']]
const MEMORY = ['128 GB', '256 GB', '512 GB', '1 TB']

function attributesFor(kind: GlyphKind): ProductAttribute[] {
  const [a, b] = [pick(COLORS), pick(COLORS)]
  const attrs: ProductAttribute[] = [
    { key: { tk: 'Reňki', ru: 'Цвет' }, value: a === b ? { tk: a[0], ru: a[1] } : { tk: `${a[0]}, ${b[0].toLowerCase()}`, ru: `${a[1]}, ${b[1].toLowerCase()}` } },
    { key: { tk: 'Kepillik', ru: 'Гарантия' }, value: { tk: '12 aý', ru: '12 месяцев' } },
  ]
  if (kind === 'phone' || kind === 'laptop' || kind === 'tablet') {
    attrs.push({ key: { tk: 'Ýat', ru: 'Память' }, value: same(pick(MEMORY)) })
  }
  if (kind === 'cable') attrs.push({ key: { tk: 'Uzynlygy', ru: 'Длина' }, value: { tk: `${int(1, 3)} m`, ru: `${int(1, 3)} м` } })
  return attrs
}

const DESCRIPTIONS = [
  'Ýokary hilli we ygtybarly haryt. Resmi kepillik bilen hödürlenýär.',
  'Gündelik ulanmak üçin amatly, ýeňil we owadan dizaýnly.',
  'Häzirki zaman tehnologiýalary bilen döredilen, uzak wagtlap hyzmat edýär.',
  'Aşgabat şäheri boýunça mugt eltip bermek hyzmaty bilen.',
]

export const seedProducts: Product[] = Array.from({ length: 235 }, (_, i) => {
  const catIndex = int(0, CATEGORY_DEFS.length - 1)
  const def = CATEGORY_DEFS[catIndex]
  const category = seedCategories[catIndex]
  const [name, subIndex, base] = pick(CATALOG[catIndex])
  const price = Math.max(100, Math.round((base * (0.9 + rand() * 0.2)) / 100) * 100)
  const variant = int(0, 5)
  return {
    id: i + 1,
    name,
    description: pick(DESCRIPTIONS),
    price,
    discount_price: rand() < 0.35 && price >= 500 ? Math.floor((price * 0.9) / 100) * 100 : null,
    main_image: glyphImage(def.kind, variant),
    additional_images: Array.from({ length: int(0, 3) }, (_, k) => glyphImage(def.kind, variant + k + 1)),
    category_id: category.id,
    subcategory_id: category.subcategories[subIndex]?.id ?? null,
    attributes: attributesFor(def.kind),
    orders_count: int(0, 480),
    stock: int(0, 400),
    created_at: daysFromNow(-Math.floor(i / 2) - int(0, 1)).toISOString(),
  }
})

/* ─── Ads ───────────────────────────────────────────────────────────────── */

const AD_TITLES = ['Mekdep harytlary', 'Banner reklama Okuwçy', 'Banner reklama Ak ýol', 'Täze ýyl arzanladyşy', 'Gara anna', 'Smartfon hepdeligi', 'Noutbuk aksiýasy', 'Nauşnikler −20%', 'Mugt eltip bermek', 'Tomus arzanladyşy', 'Oýun enjamlary', 'Akylly sagatlar']
const AD_SUBTITLES = ['Iň amatly baha, sanlar çäkli!', 'Diňe şu hepde', 'Ähli harytlara arzanladyş', 'Täze kolleksiýa geldi']

export const seedAds: Ad[] = Array.from({ length: 58 }, (_, i) => {
  const title = pick(AD_TITLES)
  const subtitle = pick(AD_SUBTITLES)
  const start = daysFromNow(int(-75, 20))
  const end = new Date(start)
  end.setDate(end.getDate() + int(20, 120))
  const variant = int(0, 4)
  return {
    id: i + 1,
    title,
    description: `${title}: ${subtitle.toLowerCase()} Jikme-jiklikler üçin biziň saýtymyza giriň.`,
    phone: randomPhone(),
    link: `https://osush.com.tm/promo/${i + 1}`,
    start_date: isoDate(start),
    end_date: isoDate(end),
    is_active: rand() > 0.1,
    main_image: bannerImage(title, subtitle, variant),
    additional_images: Array.from({ length: int(0, 2) }, (_, k) => bannerImage(title, subtitle, variant + k + 1)),
    created_at: daysFromNow(-i).toISOString(),
  }
})

/* ─── Notifications ─────────────────────────────────────────────────────── */

const NOTIFICATIONS: [string, string][] = [
  ['Banner reklama Okuwçy', 'Okuwçy dükanymyzda ähli okuwçylara we talyplara degişli harytlarda 15% arzanladyş bar. Aksiýa aýyň ahyryna çenli dowam edýär.'],
  ['Täze harytlar geldi', 'Telefonlar we planşetler bölümine täze harytlar goşuldy. Iň soňky modellerini ilkinji bolup satyn alyň.'],
  ['Arzanladyş başlady', 'Ähli nauşniklere we klawiaturalara 20% arzanladyş. Teklip çäkli wagtlaýyn hereket edýär.'],
  ['Tehniki işler', 'Şu gije sagat 02:00-dan 04:00-a çenli programmada tehniki işler geçiriler. Düşünjäňiz üçin sag boluň.'],
  ['Mugt eltip bermek', '500 TMT-den ýokary sargytlar üçin Aşgabat şäheriniň çäginde mugt eltip bermek hyzmaty işleýär.'],
  ['Baýramçylyk gutlagy', 'Garaşsyzlyk baýramy mynasybetli ähli müşderilerimizi gutlaýarys! Baýram günleri aýratyn teklipler garaşýar.'],
]

export const seedNotifications: Notification[] = Array.from({ length: 57 }, (_, i) => {
  const [title, body] = pick(NOTIFICATIONS)
  const sent = daysFromNow(-i * 2 - int(0, 1))
  return { id: i + 1, title, body, sent_at: sent.toISOString(), created_at: sent.toISOString() }
})
