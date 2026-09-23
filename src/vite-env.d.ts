/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST API, e.g. https://osush-production.up.railway.app/api/v1 */
  readonly VITE_API_BASE_URL?: string
  /** Optional override for image hosts returned by the API (MinIO). */
  readonly VITE_MEDIA_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
