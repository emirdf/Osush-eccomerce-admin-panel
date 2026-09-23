import i18n, { type Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { STORAGE_KEYS, readStorage, writeStorage } from './storage'

export const LANGUAGES = ['tk', 'ru'] as const
export type Language = (typeof LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'tk'

/*
 * Each feature owns one JSON file per language (locales/tk/products.json …).
 * Files are merged into a single "translation" namespace keyed by file name,
 * so `products.json → { form: { price } }` is used as t('products.form.price').
 */
const modules = import.meta.glob<Record<string, unknown>>('../locales/*/*.json', {
  eager: true,
  import: 'default',
})

const resources: Resource = {}
for (const [path, content] of Object.entries(modules)) {
  const match = /locales\/(\w+)\/(\w+)\.json$/.exec(path)
  if (!match) continue
  const [, lang, file] = match
  resources[lang] ??= { translation: {} }
  ;(resources[lang].translation as Record<string, unknown>)[file] = content
}

const stored = readStorage<string | null>(STORAGE_KEYS.lang, null)
const initial: Language = (LANGUAGES as readonly string[]).includes(stored ?? '')
  ? (stored as Language)
  : DEFAULT_LANGUAGE

void i18n.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnNull: false,
})

i18n.on('languageChanged', (lng) => {
  writeStorage(STORAGE_KEYS.lang, lng)
  document.documentElement.lang = lng
})
document.documentElement.lang = initial

/** Picks the current language from a bilingual record field. */
export function localized(value: { tk: string; ru: string } | null | undefined, lang = i18n.language): string {
  if (!value) return ''
  return (lang === 'ru' ? value.ru : value.tk) || value.tk || value.ru
}

export default i18n
