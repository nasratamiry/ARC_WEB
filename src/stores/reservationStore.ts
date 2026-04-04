import { create } from 'zustand'
import {
  createReservation,
  fetchReservation,
  fetchReservations,
} from '../reservation/reservationApi'
import type { CreateReservationPayload, ReservationDetail, ReservationListItem } from '../reservation/types'
import { ApiError } from '../services/api'

type ReservationState = {
  list: ReservationListItem[]
  listLoading: boolean
  listError: string | null
  detail: ReservationDetail | null
  detailLoading: boolean
  detailError: string | null
  createSubmitting: boolean
  createError: string | null
  loadList: (filter?: { status?: string }) => Promise<void>
  loadDetail: (id: number) => Promise<void>
  clearDetail: () => void
  submitCreate: (payload: CreateReservationPayload) => Promise<ReservationDetail>
}

export const useReservationStore = create<ReservationState>((set) => ({
  list: [],
  listLoading: false,
  listError: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  createSubmitting: false,
  createError: null,

  /** README: `GET reservations/reservations/?status=...` وقتی filter.status ست باشد. */
  loadList: async (filter) => {
    const status = filter?.status
    set({ listLoading: true, listError: null })
    try {
      const list = await fetchReservations(status ? { status } : undefined)
      set({ list, listLoading: false })
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load reservations'
      set({ listLoading: false, listError: msg })
    }
  },

  loadDetail: async (id: number) => {
    set({ detailLoading: true, detailError: null, detail: null })
    try {
      const detail = await fetchReservation(id)
      set({ detail, detailLoading: false })
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load reservation'
      set({ detailLoading: false, detailError: msg })
    }
  },

  clearDetail: () => set({ detail: null, detailError: null }),

  submitCreate: async (payload) => {
    set({ createSubmitting: true, createError: null })
    try {
      const detail = await createReservation(payload)
      set({ createSubmitting: false })
      return detail
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not create reservation'
      set({ createSubmitting: false, createError: msg })
      throw e
    }
  },
}))
