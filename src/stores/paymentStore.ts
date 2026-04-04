import { create } from 'zustand'
import {
  fetchMerchantPayments,
  fetchMyPaymentRequests,
  requestPayment,
} from '../reservation/reservationApi'
import type { MerchantPaymentItem, PaymentRequestItem } from '../reservation/types'
import { ApiError } from '../services/api'

type PaymentState = {
  merchantPayments: MerchantPaymentItem[]
  myPaymentRequests: PaymentRequestItem[]
  loading: boolean
  error: string | null
  requestSubmitting: boolean
  loadAll: () => Promise<void>
  requestForReservation: (reservationId: number) => Promise<void>
}

export const usePaymentStore = create<PaymentState>((set) => ({
  merchantPayments: [],
  myPaymentRequests: [],
  loading: false,
  error: null,
  requestSubmitting: false,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const [merchantPayments, myPaymentRequests] = await Promise.all([
        fetchMerchantPayments(),
        fetchMyPaymentRequests(),
      ])
      set({ merchantPayments, myPaymentRequests, loading: false })
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load payments'
      set({ loading: false, error: msg })
    }
  },

  requestForReservation: async (reservationId: number) => {
    set({ requestSubmitting: true, error: null })
    try {
      await requestPayment(reservationId)
      const myPaymentRequests = await fetchMyPaymentRequests()
      set({ myPaymentRequests, requestSubmitting: false })
    } catch (e) {
      let msg = e instanceof ApiError ? e.message : 'Payment request failed'
      if (e instanceof ApiError && e.details) {
        const flat = Object.values(e.details).flat().find((x) => typeof x === 'string' && x.trim())
        if (flat) msg = flat
      }
      set({ requestSubmitting: false, error: msg })
      if (e instanceof ApiError) throw e
      throw new Error(msg)
    }
  },
}))
