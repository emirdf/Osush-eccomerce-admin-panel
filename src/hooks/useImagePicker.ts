import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImageInput } from '@/api'
import { uid } from '@/lib/utils'

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_MB = 5

/**
 * Validates picked files and turns them into previewable ImageInputs backed by
 * object URLs. Object URLs created here are revoked on removal and unmount.
 */
export function useImagePicker() {
  const { t } = useTranslation()
  const created = useRef(new Set<string>())

  useEffect(() => {
    const urls = created.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  const pick = useCallback(
    (files: FileList | File[] | null | undefined) => {
      const images: ImageInput[] = []
      const errors: string[] = []
      for (const file of Array.from(files ?? [])) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          errors.push(t('common.images.errorType', { name: file.name }))
          continue
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
          errors.push(t('common.images.errorSize', { name: file.name, size: MAX_IMAGE_MB }))
          continue
        }
        const url = URL.createObjectURL(file)
        created.current.add(url)
        images.push({ id: uid('img'), url, file })
      }
      return { images, errors }
    },
    [t],
  )

  const release = useCallback((image: ImageInput | null | undefined) => {
    if (image && created.current.has(image.url)) {
      URL.revokeObjectURL(image.url)
      created.current.delete(image.url)
    }
  }, [])

  return { pick, release, accept: ACCEPTED_IMAGE_TYPES.join(','), maxMb: MAX_IMAGE_MB }
}
