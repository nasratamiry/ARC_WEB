import api from './api'
import type { ContactPayload } from '../types/api'

type ContactSuccessResponse = {
  detail?: string
  message?: string
}

export const sendMessage = async (payload: ContactPayload): Promise<ContactSuccessResponse> => {
  const response = await api.post<ContactSuccessResponse>('contact/', payload)
  return response.data
}
