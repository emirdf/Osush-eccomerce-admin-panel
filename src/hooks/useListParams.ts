import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * List state that lives in the URL (`?page=2&search=iphone`), so it survives
 * refresh and can be shared.
 */
export function useListParams(limit = 10) {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Math.floor(Number(searchParams.get('page'))) || 1)
  const search = searchParams.get('search') ?? ''

  const setPage = useCallback(
    (next: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        if (next <= 1) params.delete('page')
        else params.set('page', String(next))
        return params
      })
    },
    [setSearchParams],
  )

  const setSearch = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.delete('page')
          if (next.trim()) params.set('search', next)
          else params.delete('search')
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { page, search, limit, setPage, setSearch }
}

/**
 * If the server clamps the page (e.g. the last row of the last page was
 * deleted), sync the URL. Pass `undefined` while showing placeholder data.
 */
export function useClampPage(serverPage: number | undefined, page: number, setPage: (page: number) => void) {
  useEffect(() => {
    if (serverPage !== undefined && serverPage !== page) setPage(serverPage)
  }, [serverPage, page, setPage])
}
