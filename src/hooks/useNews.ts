import { useCallback, useEffect, useState } from 'react'
import { getNews } from '../services/news'
import type { NewsItem, PaginatedResponse } from '../types/api'

type UseNewsOptions = {
  page?: number
  tag?: string
  enabled?: boolean
}

export const useNews = ({ page = 1, tag, enabled = true }: UseNewsOptions = {}) => {
  const [data, setData] = useState<PaginatedResponse<NewsItem> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await getNews(page, tag)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news.')
    } finally {
      setLoading(false)
    }
  }, [enabled, page, tag])

  useEffect(() => {
    void fetchNews()
  }, [fetchNews])

  return {
    data,
    loading,
    error,
    refetch: fetchNews,
  }
}
