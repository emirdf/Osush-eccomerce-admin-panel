import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi, type ID, type ListParams, subcategoriesApi } from '@/api'
import { dashboardKeys } from '@/features/dashboard/queries'

export const categoriesKeys = {
  all: ['categories'] as const,
  list: (params: ListParams) => [...categoriesKeys.all, 'list', params] as const,
  options: () => [...categoriesKeys.all, 'options'] as const,
  detail: (id: ID) => [...categoriesKeys.all, 'detail', id] as const,
}

export const subcategoriesKeys = {
  all: ['subcategories'] as const,
  byCategory: (categoryId: ID | null) => [...subcategoriesKeys.all, 'byCategory', categoryId] as const,
}

export function useCategories(params: ListParams) {
  return useQuery({
    queryKey: categoriesKeys.list(params),
    queryFn: () => categoriesApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Flat list for selects. */
export function useCategoryOptions() {
  return useQuery({ queryKey: categoriesKeys.options(), queryFn: categoriesApi.all, staleTime: 5 * 60_000 })
}

export function useCategory(id: ID | null) {
  return useQuery({
    queryKey: categoriesKeys.detail(id ?? 0),
    queryFn: () => categoriesApi.get(id as ID),
    enabled: id !== null,
  })
}

/** Subcategories are a separate resource: GET /subcategory?category_id= */
export function useSubcategories(categoryId: ID | null) {
  return useQuery({
    queryKey: subcategoriesKeys.byCategory(categoryId),
    queryFn: () => subcategoriesApi.listAll(categoryId),
    enabled: categoryId !== null,
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: ID) => categoriesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}
