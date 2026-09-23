#!/usr/bin/env node
/**
 * Verifies localization completeness:
 *  1. tk and ru define exactly the same keys;
 *  2. every literal translation key referenced in src/ exists.
 * Dynamic keys built with template literals are listed in DYNAMIC_KEYS below.
 * Usage: npm run i18n:check   (add --used to print every key found in code)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const LOCALES = join(ROOT, 'src/locales')
const LANGS = ['tk', 'ru']

/** Keys composed at runtime (`common.language.${lang}` etc.). */
const DYNAMIC_KEYS = [
  'common.language.tk',
  'common.language.ru',
  'common.password.weak',
  'common.password.medium',
  'common.password.strong',
  // errors.<code> — codes come from ApiError (api/errors.ts, mocks/handlers.ts, api/client.ts)
  'errors.unknown',
  'errors.network',
  'errors.not_found',
  'errors.invalid_credentials',
  'errors.category_in_use',
  'errors.upload_failed',
  'errors.http_401',
  'errors.http_403',
  'errors.http_500',
  'errors.bad_request',
  'errors.conflict',
  'errors.validation',
  'errors.wrong_current_password',
]

function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, path, out)
    else out.set(path, value)
  }
  return out
}

function loadLang(lang) {
  const keys = new Map()
  for (const file of readdirSync(join(LOCALES, lang)).filter((f) => f.endsWith('.json'))) {
    const ns = file.replace(/\.json$/, '')
    const json = JSON.parse(readFileSync(join(LOCALES, lang, file), 'utf8'))
    for (const [k, v] of flatten(json, ns)) keys.set(k, v)
  }
  return keys
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, files)
    else if (/\.(ts|tsx)$/.test(entry)) files.push(full)
  }
  return files
}

const dicts = Object.fromEntries(LANGS.map((l) => [l, loadLang(l)]))
const namespaces = [...new Set([...dicts.tk.keys()].map((k) => k.split('.')[0]))]
const keyPattern = new RegExp(`['"\`]((?:${namespaces.join('|')})\\.[A-Za-z0-9_.]+)['"\`]`, 'g')

const used = new Map()
for (const file of walk(join(ROOT, 'src'))) {
  if (file.includes('/mocks/')) continue
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(keyPattern)) {
    const key = match[1]
    if (key.endsWith('.')) continue
    if (!used.has(key)) used.set(key, relative(ROOT, file))
  }
}
for (const key of DYNAMIC_KEYS) if (!used.has(key)) used.set(key, '(dynamic)')

let problems = 0
const report = (title, items) => {
  if (!items.length) return
  problems += items.length
  console.error(`\n✗ ${title} (${items.length})`)
  for (const item of items) console.error(`   ${item}`)
}

for (const lang of LANGS) {
  const other = LANGS.find((l) => l !== lang)
  report(`Keys in ${other} missing from ${lang}`, [...dicts[other].keys()].filter((k) => !dicts[lang].has(k)))
  report(`Empty values in ${lang}`, [...dicts[lang]].filter(([, v]) => v === '' || (Array.isArray(v) && !v.length)).map(([k]) => k))
  report(
    `Keys used in code but missing from ${lang}`,
    [...used].filter(([k]) => !dicts[lang].has(k)).map(([k, file]) => `${k}  ← ${file}`),
  )
}

const unused = [...dicts.tk.keys()].filter((k) => !used.has(k) && ![...used.keys()].some((u) => k.startsWith(`${u}.`)))
if (unused.length) console.warn(`\n⚠ ${unused.length} keys defined but not referenced literally:\n   ${unused.join('\n   ')}`)
if (process.argv.includes('--used')) console.log([...used.keys()].sort().join('\n'))

if (problems) {
  console.error(`\n${problems} localization problem(s).`)
  process.exit(1)
}
console.log(`✓ Localization complete: ${dicts.tk.size} keys in tk and ru, ${used.size} referenced in code.`)
