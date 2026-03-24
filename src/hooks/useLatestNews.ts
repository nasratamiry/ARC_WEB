import { useCallback, useEffect, useState } from 'react'
import { getLatestNews } from '../services/news'
import type { NewsItem } from '../types/api'

type UseLatestNewsOptions = {
  enabled?: boolean
}

export const useLatestNews = ({ enabled = true }: UseLatestNewsOptions = {}) => {
  const [data, setData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLatestNews = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await getLatestNews()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load latest news.')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void fetchLatestNews()
  }, [fetchLatestNews])

  return {
    data,
    loading,
    error,
    refetch: fetchLatestNews,
  }
}
