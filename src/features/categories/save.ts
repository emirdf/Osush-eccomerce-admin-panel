import { categoriesApi, type CategoryPayload, type ID, type Subcategory, subcategoriesApi } from '@/api'

export interface SubcategoryDraft {
  /** Present when the row already exists on the server. */
  subId?: ID
  name: string
}

export type SubcategoryAction = 'create' | 'update' | 'delete'

export interface SubcategoryFailure {
  name: string
  action: SubcategoryAction
}

export interface SaveCategoryResult {
  categoryId: ID | null
  failures: SubcategoryFailure[]
}

interface SaveCategoryInput {
  id?: ID
  payload: CategoryPayload
  drafts: SubcategoryDraft[]
  /** Subcategories currently on the server (edit mode). */
  original: Subcategory[]
  onProgress?: (done: number, total: number) => void
}

/**
 * Saves the category first, then reconciles its subcategories one by one:
 * new rows → POST, renamed rows → PUT, removed rows → DELETE. Only changes are
 * sent. A failed row does not undo the category — it is reported so the user
 * can retry just that row.
 */
export async function saveCategoryWithSubcategories({
  id,
  payload,
  drafts,
  original,
  onProgress,
}: SaveCategoryInput): Promise<SaveCategoryResult> {
  let categoryId: ID | null = id ?? null

  if (categoryId === null) {
    categoryId = await categoriesApi.create(payload)
    // POST /category does not document its response body; find the new row if needed.
    if (categoryId === null) categoryId = await findCategoryIdByName(payload.name)
  } else {
    await categoriesApi.update(categoryId, payload)
  }

  const rows = drafts.filter((draft) => draft.name.trim())
  const byId = new Map(original.map((sub) => [sub.id, sub]))

  const operations: { action: SubcategoryAction; name: string; run: () => Promise<void> }[] = []

  for (const sub of original) {
    if (!rows.some((row) => row.subId === sub.id)) {
      operations.push({ action: 'delete', name: sub.name, run: () => subcategoriesApi.remove(sub.id) })
    }
  }
  for (const row of rows) {
    const name = row.name.trim()
    if (row.subId === undefined) {
      if (categoryId === null) continue
      const parentId = categoryId
      operations.push({ action: 'create', name, run: () => subcategoriesApi.create({ name, categoryId: parentId }) })
    } else if (byId.get(row.subId)?.name !== name) {
      const subId = row.subId
      operations.push({ action: 'update', name, run: () => subcategoriesApi.update(subId, { name }) })
    }
  }

  const failures: SubcategoryFailure[] = []
  let done = 0
  for (const operation of operations) {
    try {
      await operation.run()
    } catch {
      failures.push({ name: operation.name, action: operation.action })
    }
    done += 1
    onProgress?.(done, operations.length)
  }

  return { categoryId, failures }
}

async function findCategoryIdByName(name: string): Promise<ID | null> {
  try {
    const categories = await categoriesApi.all()
    const matches = categories.filter((category) => category.name.trim() === name.trim())
    return matches.length ? Math.max(...matches.map((category) => category.id)) : null
  } catch {
    return null
  }
}
