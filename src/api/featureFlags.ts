/**
 * Endpoints that do not exist yet. See API_GAPS.md.
 *
 * USE_MOCK  — the hook calls the in-memory mock instead of the API. The screen
 *             works, and the UI shows that the data is not persisted.
 * DISABLED  — no endpoint and no safe fake: the control stays visible but
 *             disabled, with a tooltip explaining why (never a dead button).
 *
 * When an endpoint lands, flip one boolean here.
 */
export const USE_MOCK = {
  /** GET /banner/{id} and PUT /banner/{id} are missing; the list is real. */
  bannerWrite: true,
  /** No password-change endpoint. */
  passwordChange: true,
} as const

export const DISABLED = {
  /** DELETE /client/{id} does not exist. */
  clientDelete: true,
  /** DELETE /banner/{id} does not exist — destructive, so never faked. */
  bannerDelete: true,
  /** No endpoint to remove one existing additional product image. */
  removeAdditionalImage: true,
  /** Only GET and POST /notification/admin exist — no PUT. */
  notificationEdit: true,
  /** …and no DELETE. */
  notificationDelete: true,
  /** No endpoint to mark an order as sent (`is_send`). */
  orderMarkSent: true,
  /** PUT /auth only accepts a new avatar file; there is no way to clear one. */
  avatarDelete: true,
} as const
