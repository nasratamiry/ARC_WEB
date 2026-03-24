import { useCallback, useEffect, useState } from 'react'
import { getPartners } from '../services/partners'
import type { Partner } from '../types/api'

type UsePartnersOptions = {
  enabled?: boolean
}

export const usePartners = ({ enabled = true }: UsePartnersOptions = {}) => {
  const [data, setData] = useState<Partner[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPartners = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await getPartners()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partners.')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void fetchPartners()
  }, [fetchPartners])

  return {
    data,
    loading,
    error,
    refetch: fetchPartners,
  }
}
