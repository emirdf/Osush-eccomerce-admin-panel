/**
 * Multipart convention used by this API (products, banners, categories, profile):
 *   data           = JSON.stringify(payload)   — one JSON string field
 *   mainImage      = File                      — exactly one
 *   additionImages = File, File, …             — repeated key
 *   image / avatar = File                      — categories / profile
 * Never append `data` as separate flat fields.
 */
export type FormDataFiles = Record<string, File | File[] | null | undefined>

export function buildFormData({ data, files }: { data: unknown; files?: FormDataFiles }): FormData {
  const form = new FormData()
  form.append('data', JSON.stringify(data))
  for (const [field, value] of Object.entries(files ?? {})) {
    if (!value) continue
    for (const file of Array.isArray(value) ? value : [value]) {
      if (file) form.append(field, file)
    }
  }
  return form
}
