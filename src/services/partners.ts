import api from './api'
import { normalizeAssetUrl } from './helpers'
import type { Partner } from '../types/api'

const normalizePartner = (partner: Partner): Partner => ({
  ...partner,
  logo: normalizeAssetUrl(partner.logo),
})

export const getPartners = async (): Promise<Partner[]> => {
  const response = await api.get<Partner[]>('partners/')
  return response.data.map(normalizePartner).sort((a, b) => a.order - b.order)
}
