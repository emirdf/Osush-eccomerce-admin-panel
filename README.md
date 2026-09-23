# Ösüş Store — Admin Panel

Admin dashboard for the Ösüş Store e-commerce platform, wired to the REST API. Notifications and a
few write endpoints do not exist yet and run behind feature flags — see **[API_GAPS.md](API_GAPS.md)**.

- React 19 · Vite 8 · TypeScript (strict)
- React Router 6 (data router, lazy routes, protected routes)
- TanStack Query 5 + Axios
- React Hook Form + Zod (validating UI models, not DTOs)
- i18next: Turkmen (`tk`, default) and Russian (`ru`)
- Tailwind CSS 4 with all design tokens as CSS variables
- Vitest for the mapper and helper unit tests

---

## Getting started

```bash
npm install
cp .env.example .env.local     # then edit if needed
npm run dev                    # http://localhost:5173
```

### Environment variables

| Variable | Required | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | yes | API base, e.g. `https://osush72-production.up.railway.app/api/v1`. No trailing slash. |
| `VITE_MEDIA_BASE_URL` | no | Rewrites image hosts. Responses may point at `http://localhost:9000` (MinIO in dev); set this to the reachable media origin and those URLs are rewritten. Leave empty to use URLs as-is. |

No URL is hardcoded anywhere in `src/`.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |
| `npm test` | Vitest (mappers, dates, media, pagination) |
| `npm run i18n:check` | Fails if `tk` and `ru` differ or a used key is missing |

Sign in with the username and password issued by the backend (the API authenticates with
`user_name` + password, not a phone number).

---

## Architecture

```
src/
  api/                     The only layer that knows about HTTP
    client.ts              axios instance, interceptors, error normalizer
    formData.ts            buildFormData({ data, files }) — the multipart convention
    featureFlags.ts        USE_MOCK / DISABLED for missing endpoints
    types/                 *.dto.ts — zod schemas mirroring the backend + models.ts (UI models)
    mappers/               dto → model and model → dto, one file per entity
    auth.api.ts clients.api.ts categories.api.ts subcategories.api.ts
    products.api.ts banners.api.ts notifications.api.ts (mock)
  mocks/                   In-memory fake backend, still used for notifications
  components/ui, components/layout
  features/<feature>/      Pages, form schemas, TanStack Query hooks
  hooks/ lib/ locales/ routes/ store/
```

**Rules that keep this maintainable**

- **No component imports axios or a DTO type.** Components use hooks → `*.api.ts` → mappers.
- **Every entity crosses an explicit mapper.** The API is `snake_case` with `tm` for Turkmen and
  `image_path` for images; UI models are camelCase with `tk` and `image`. No blanket auto-conversion.
- **Responses are validated with Zod** (`parseDto`) at the service boundary. A mismatch logs a
  warning in dev and still renders — the backend is still changing.
- **Errors are normalized** to `ApiError { status, code, serverMessage, fieldErrors? }`. For 4xx the
  backend's message is shown; otherwise a localized `errors.<code>` message.
- **Retries** live in the axios interceptor: GET only, 2 attempts, exponential backoff, for network
  errors and 5xx. React Query does not retry on top of that.
- **401** clears the session and shows a toast; `<ProtectedRoute>` redirects to `/login`.
- **Multipart:** `data` is one JSON string field, files go in `mainImage` / `additionImages` /
  `image` / `avatar`. `Content-Type` is never set by hand, so the browser adds the boundary.

### Pagination

The API takes `limit`/`offset`; the UI works in pages and keeps `?page=&search=` in the URL.
`src/lib/pagination.ts` converts (`toOffset`, `toTotalPages`). Endpoints that ignore `limit`/`offset`
(banners today, possibly clients) are sliced client-side by `ensurePageSlice` — marked `TODO(api)`.

### Dates

The API sends and expects `DD-MM-YYYY`. `src/lib/date.ts` (`parseApiDate` / `formatApiDate`) converts
at the mapper boundary only; inside the app dates are ISO `YYYY-MM-DD` and display as `DD.MM.YYYY`.

### Images

`resolveMediaUrl` (`src/lib/media.ts`) rewrites hosts, and `<Image>` (`components/ui/Image.tsx`)
falls back to a placeholder on error. Every remote image goes through it.

### Product attributes ⇄ rows

The API stores `attributes: { tm: { key: value }, ru: { key: value } }`; the form edits rows of
`{ keyTk, valueTk, keyRu, valueRu }`. `attributesToRows` / `rowsToAttributes`
(`src/api/mappers/product.ts`) convert both ways: the languages can hold different numbers of
entries, so they are paired by index and the shorter side is padded — no entry is ever dropped.
Duplicate keys in one language are rejected by the form instead of silently overwriting.
Covered by unit tests (`npm test`).

### Feature flags

`src/api/featureFlags.ts` is the single switch for everything the API cannot do yet:

- `USE_MOCK.notifications`, `USE_MOCK.bannerWrite`, `USE_MOCK.passwordChange` — the screen works
  against the mock and says so on screen.
- `DISABLED.clientDelete`, `DISABLED.bannerDelete`, `DISABLED.removeAdditionalImage`,
  `DISABLED.avatarDelete`, `DISABLED.orderMarkSent` — the control stays visible but disabled with a tooltip. No dead buttons.

Flip one boolean when the endpoint lands. Details in [API_GAPS.md](API_GAPS.md).

---

## Design tokens

All tokens live in `src/index.css`: `:root` (light), `[data-theme='dark']` (dark), and `@theme`
blocks mapping them to Tailwind utilities (`bg-surface`, `text-fg-muted`, `rounded-card`,
`shadow-card`, the type scale). The default Tailwind palette is removed, so only tokens can be used.

| Token | Light | Dark | Use |
|---|---|---|---|
| `primary` | `#0C4094` | `#3A6FD8` | Active nav item, primary buttons |
| `primary-text` | `#0C4094` | `#8DB2F7` | Links, values, icons |
| `success` | `#4EA674` | `#2B7F50` | Save / add buttons, active badge |
| `success-soft` | `#EAF8E7` | `#15271D` | Banner and notification table headers |
| `danger` | `#D22630` | `#C62F38` | Delete, inactive badge |
| `orange` | `#E8761C` | `#F5A05A` | Only the category-count stat |

The theme follows the OS until the user picks one; the choice is stored in `localStorage`
(`osus.theme`) and applied before first paint by an inline script in `index.html`.

## Localization

`src/locales/<lang>/<namespace>.json`, one file per feature; the file name is the key prefix
(`products.json` → `t('products.form.price')`). Zod schemas use translation keys as messages.
The API's `tm` is converted to i18next's `tk` in the mappers. Run `npm run i18n:check` after adding
keys; dynamic keys go in `DYNAMIC_KEYS` in `scripts/check-i18n.mjs`.

## Screens

| Route | Data |
|---|---|
| `/` | `GET /auth/index` — totals, recent products, client names |
| `/users` | `GET /client/list` (delete disabled — no endpoint) |
| `/products`, `/products/:id/edit` | `GET/POST/PUT/DELETE /product` |
| `/categories`, `/categories/:id/edit` | `/category` + `/subcategory` (created, renamed and deleted by diffing) |
| `/orders`, `/orders/:id` | `GET /product/order` (`search`, `is_send`), `GET /product/order/{id}` — opening an order clears `is_new`; "mark as sent" disabled (no endpoint) |
| `/ads`, `/ads/:id/edit` | `GET /banner`, `POST /banner` (edit mocked, delete disabled) |
| `/notifications` | Mocked end to end |
| `/profile` | `GET /auth`, `PUT /auth` (password change mocked) |

## Deviations from the original UI specification

These are API-driven, and each is visible in the UI rather than silent:

- **Login is username + password** (the API has no phone login). The phone input is still used in the
  profile and banner forms.
- **Category and subcategory names are single-language** — the API stores one `name`.
- **Subcategories are a separate resource.** The category form saves the category, then creates,
  renames or deletes subcategories one by one, shows progress, and reports rows that failed so they
  can be retried without duplicating the ones that succeeded.
- **Product name is one field; description and attributes are bilingual.**
- **Products belong to a subcategory**, chosen through two dependent selects.
- **`is_paused`** adds a toggle in the product form and a badge in the list.
- **Banner status (`is_active`) is read-only**, computed by the server.
- **The product "stock" field is gone** — the API has no such field.
- **Font:** Manrope rather than Poppins, which has no Cyrillic glyphs.
