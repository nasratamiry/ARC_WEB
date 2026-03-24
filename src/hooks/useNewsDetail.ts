import { useCallback, useEffect, useState } from 'react'
import { getNewsDetail } from '../services/news'
import type { NewsDetail } from '../types/api'

type UseNewsDetailOptions = {
  enabled?: boolean
}

export const useNewsDetail = (slug: string | undefined, { enabled = true }: UseNewsDetailOptions = {}) => {
  const [data, setData] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNewsDetail = useCallback(async () => {
    if (!enabled || !slug) return

    setLoading(true)
    setError(null)

    try {
      const result = await getNewsDetail(slug)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news details.')
    } finally {
      setLoading(false)
    }
  }, [enabled, slug])

  useEffect(() => {
    void fetchNewsDetail()
  }, [fetchNewsDetail])

  return {
    data,
    loading,
    error,
    refetch: fetchNewsDetail,
  }
}
