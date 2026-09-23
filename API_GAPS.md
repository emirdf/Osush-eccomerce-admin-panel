# Ösüş Store admin panel — API gaps and assumptions

Written for the backend team. Everything below was found while wiring the admin panel to
`https://osush-production.up.railway.app/api/v1` on 16.09.2026. Endpoints were verified with
read-only requests (`GET`) plus one login; no data was created or modified.

Each item says what the panel does today, so nothing silently breaks while an endpoint is missing.

---

## 1. Missing endpoints

| # | Gap | Screen | What the panel does today |
|---|---|---|---|
| 1 | **Notifications — no update, delete or unread count** (only `GET`/`POST /notification/admin`) | `/notifications` | List and create are live. Edit and delete buttons are visible but **disabled** with a tooltip; the topbar bell has no unread dot. Flags: `DISABLED.notificationEdit`, `DISABLED.notificationDelete`. The list's array key and limit/offset/search support are undocumented — the panel accepts `notifications` or `data`, and filters/slices client-side. |
| 2 | **`GET /banner/{id}`** | Banner edit | The banner is read out of `GET /banner` and found by id. Works, but fetches the whole list. |
| 3 | **`PUT /banner/{id}`** | Banner edit | The form is fully usable and validates, but saving does not reach the server. The page shows a notice saying so. Flag: `USE_MOCK.bannerWrite`. |
| 4 | **`DELETE /banner/{id}`** | Banner list | Delete button is visible but **disabled**, with a tooltip. Never faked — it is destructive. |
| 5 | **`DELETE /client/{id}`** | Users list | Delete button visible but **disabled**, with a tooltip. |
| 6 | **Password change** | Profile | Form works and validates; the request is not sent. Notice shown. Flag: `USE_MOCK.passwordChange`. Suggested: `PUT /auth/password { current_password, new_password }`. |
| 7 | **Logout** | Sidebar / topbar | Client-side only: the token and cache are cleared. Fine unless tokens must be revoked server-side. |
| 8 | **Remove an existing product image (cover or additional)** | Product edit | `PUT /product/{id}` only accepts *new* files, so there is no way to delete or reorder what is already stored. The ⊗ button is disabled on every server-side image, including the cover — only "Replace" (which uploads a new `mainImage`) is offered. New images added in the same session can still be removed before saving. |
| 9 | **Clear the admin avatar** | Profile | `PUT /auth` only accepts a new avatar file, so "Delete" is disabled. A way to clear it (e.g. `avatar: null` in `data`) would help. |
| 10 | **Mark an order as sent** (set `is_send`) | Order detail | "Ugradyldy belle" is visible but **disabled** with an explanation. Flag: `DISABLED.orderMarkSent`. Suggested: `PUT /product/order/{id} { is_send: true }`. |

## 2. Endpoints that ignore documented parameters

| Endpoint | Finding | Workaround |
|---|---|---|
| `GET /banner` | `limit` / `offset` are ignored — `?limit=1` still returned all 4 banners. No `search` either. | The panel slices and filters client-side, and keeps its pagination UI. Marked `TODO(api)`. |
| `GET /client/list` | Pagination and search are not documented. Only 2 clients exist, so it could not be confirmed. | Params are sent anyway; if the response is not sliced, the panel slices locally. Marked `TODO(api)`. |
| `GET /product`, `GET /category`, `GET /subcategory` | **`offset` is a 1-based *page number*, not a row offset** (undocumented). With `limit=5`: `offset=0` and `offset=1` both return rows 1–5, `offset=2` returns rows 6–10, `offset=5` returns nothing. Verified on all three endpoints on 20.09.2026. | The panel still sends `offset = (page - 1) × limit`, so every list is stuck on page 1. **Not yet fixed — needs a decision: change the API to a real row offset, or the panel to send a page number.** |
| `GET /product/order` | Needs a token, so `offset` could not be checked without credentials. The documented example (`limit=2&offset=1`, `total: 3`) fits both a row offset and the 1-based page number the product endpoints use. | The panel sends a row offset, like every other list. **If orders use page numbers too, page 2+ will repeat page 1** — the same open decision as the row above. |
| All list endpoints | **`limit` must be ≤ 100** — larger values return `400 {"error":"limit must be less than or equal to 100"}`. Undocumented. | The panel caps the limit and pages through when it needs every row (e.g. category selects). Please document the cap. |

## 3. Contradictions between the docs and the live API

| Topic | Docs | Live API | What the panel does |
|---|---|---|---|
| **Product attributes** | `features: { tm: {...}, ru: {...} }` | The backend uses **`attributes`** on both reads and writes | Resolved: the panel reads and writes `attributes`. The docs still say `features` — **please update them.** |
| **Product category** | — | `GET /product/{id}` returns no `category_id` or `subcategory_id` | The panel recovers them by probing the list endpoint (`GET /product?category_id=…`, then `?subcategory_id=…`, narrowed by `search`) until the product turns up — 7–8 extra requests per edit. **Please add `subcategory_id` (ideally `category_id` too) to the detail response so this can be deleted.** |
| **Product cover image** | — | `GET /product/{id}` returns one unlabelled `images[]`; only `GET /product` names the cover (`image`) | The form takes the cover from the list row and moves it to the front of `images[]`. Banners already model this properly (`image` + `images`) — **please do the same for the product detail response.** |
| **Profile endpoint** | Path not documented | `GET /auth` works | Assumed `GET /auth`. |
| **Order detail** | — | `GET /product/order/{id}` returns no `id` or `customer_name` | The name comes from the list row the admin clicked (router state, then the query cache). Opened from a bare link it shows "—". **Please add `customer_name` to the detail response.** |
| **Category image field** | — | `image_path` (not `image`) | Mapped. |
| **Auth on reads** | — | `GET /product` returns 200 **without a token** | Read endpoints appear public. Worth confirming this is intended. |

## 4. Response-shape questions

1. **`POST /category`** — the response body is not documented. The panel needs the new `id` to create subcategories against it. It reads `id` from the response, and if that is absent falls back to re-fetching the list and matching by name (fragile). **Please return the created category.**
2. **`POST`/`PUT` for products and banners** — the response is not documented; the panel ignores the body and refetches. Returning the saved entity would save a round-trip.
3. **Error format** — not documented. The client reads a message from `message`, `error`, `detail` or `msg`, and field errors from `errors` / `fields`. A single documented shape (e.g. `{ code, message, errors? }`) would let the UI show precise field-level errors.
4. **`PUT /product/{id}` requires a `mainImage` file** — undocumented, and it makes an ordinary edit impossible: changing only the price or the attributes sends no file part and does not save. Since the panel cannot ask the admin to re-pick a cover they did not change, it now **downloads the stored cover and re-uploads it on every save**. That works (the media host allows cross-origin GETs), but it moves the image over the wire twice for no reason. **Please keep the existing cover when `mainImage` is absent.**
5. **Replacing a cover deletes the old object.** After a save with a new `mainImage`, the previous URL returns `404 NoSuchKey` from MinIO. Expected, but worth documenting — any cached or externally linked copy breaks.
6. **`additionImages` semantics are still unconfirmed.** The panel sends only newly picked files, never the ones already stored. Whether the server then keeps, replaces or appends to the existing gallery is unknown, so removing and reordering existing images stays disabled. **Please document what a `PUT` does to images that are not resent.**

## 5. CORS — blocks the panel in a browser

`https://osush-production.up.railway.app/api/v1/*` returns **no `Access-Control-Allow-Origin`
header**, so a browser refuses every request from another origin:

```
Access to XMLHttpRequest at '.../api/v1/auth/login' from origin 'http://localhost:5173'
has been blocked by CORS policy: Response to preflight request doesn't pass access control
check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

`curl` succeeds, which is why this is invisible outside a browser. Preflight (`OPTIONS`) is
triggered for every call, because the panel sends `Authorization` and `Content-Type: application/json`.

**Needed from the backend:**
- `Access-Control-Allow-Origin` for the panel's origins (dev + deployed domain)
- `Access-Control-Allow-Headers: Authorization, Content-Type`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `OPTIONS` answered with 204 for those paths

**Until then:** the frontend dev server proxies `/api` to the API (`VITE_DEV_API_TARGET` in
`.env.local`), so local development works. That proxy exists only in dev — a deployed panel needs
either CORS headers or to be served from the same domain as the API.

---

## 6. Modelling notes

1. **Categories and subcategories are single-language.** The original UI specification assumed bilingual names (`{tk, ru}`). The API stores one `name`, so those inputs were collapsed to a single field. If bilingual category names are wanted later, the field needs to become an object like `title` on banners.
2. **Language key mismatch.** The API uses `tm` for Turkmen; the app (and i18next) uses `tk`. Converted in the mappers; no component sees `tm`.
3. **Dates.** `DD-MM-YYYY` everywhere (`created_at`, `display_from`, `display_to`). Converted at the mapper boundary. An ISO 8601 date would remove a conversion step and the ambiguity.
4. **Dashboard `clients[]` is an array of plain strings** (e.g. `"surname Nurjemal"`), so rows cannot link to a client. Returning `{ id, user_name, surname }` would let the dashboard link through.
5. **`is_liked`** is a storefront flag and is ignored by the admin panel.
6. **`is_paused`** was not in the UI spec; the panel now has a toggle in the product form and a status badge in the list.
7. **No bulk delete** for products: the panel deletes sequentially, stopping at the first failure.
