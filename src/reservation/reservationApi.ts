import api from '../services/api'
import { ApiError } from '../services/api'
import { normalizeList } from './apiHelpers'
import { trackingCodeFromUnknown } from './displayHelpers'
import type {
  CreateReservationPayload,
  MerchantPaymentItem,
  PaymentRequestItem,
  ReservationDetail,
  ReservationListItem,
  TrackResponse,
} from './types'

/** Unwraps nested payloads and normalizes `tracking_code` string | `{ code }`. */
function normalizeReservationDetailPayload(raw: unknown): ReservationDetail | null {
  if (raw == null || typeof raw !== 'object') return null
  let o = raw as Record<string, unknown>
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    o = o.data as Record<string, unknown>
  }
  if (o.reservation && typeof o.reservation === 'object') {
    o = o.reservation as Record<string, unknown>
  }
  const tc = trackingCodeFromUnknown(o.tracking_code)
  const next = { ...o, ...(tc != null ? { tracking_code: tc } : {}) } as ReservationDetail
  return next
}

function normalizeListItemTracking(r: ReservationListItem): ReservationListItem {
  const tc = trackingCodeFromUnknown(r.tracking_code as unknown)
  if (tc != null) return { ...r, tracking_code: tc }
  return r
}

function serializeCreateReservationPayload(payload: CreateReservationPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    origin_station: payload.origin_station,
    destination_station: payload.destination_station,
    wagon_type: payload.wagon_type,
    number_of_wagons: payload.number_of_wagons,
  }
  const desc = payload.cargo_description?.trim()
  if (desc) body.cargo_description = desc
  if (payload.cargo_weight != null && Number.isFinite(Number(payload.cargo_weight))) {
    body.cargo_weight = Number(payload.cargo_weight)
  }
  const sr = payload.special_requirements?.trim()
  if (sr) body.special_requirements = sr
  const notes = payload.notes?.trim()
  if (notes) body.notes = notes
  return body
}

export async function fetchReservations(params?: { status?: string }): Promise<ReservationListItem[]> {
  const { data } = await api.get<unknown>('reservations/reservations/', {
    params: params?.status ? { status: params.status } : undefined,
  })
  const list = normalizeList<ReservationListItem>(data)
  return list.map(normalizeListItemTracking)
}

export async function fetchReservation(id: number): Promise<ReservationDetail> {
  const { data } = await api.get<unknown>(`reservations/reservations/${id}/`)
  const detail = normalizeReservationDetailPayload(data)
  if (!detail) {
    throw new ApiError(
      'Invalid or empty reservation response.',
      500,
      null,
      'server',
      `reservations/reservations/${id}/`,
      false,
      null,
    )
  }
  return detail
}

export async function createReservation(payload: CreateReservationPayload): Promise<ReservationDetail> {
  const { data } = await api.post<unknown>('reservations/reservations/', serializeCreateReservationPayload(payload))
  const detail = normalizeReservationDetailPayload(data)
  if (!detail) {
    throw new ApiError('Invalid reservation response after create.', 500, null, 'server', 'reservations/reservations/', false, null)
  }
  return detail
}

/** README: GET — پایدارترین مسیر برای UI */
export async function fetchTrack(trackingCode: string): Promise<TrackResponse> {
  const code = encodeURIComponent(trackingCode)
  const { data } = await api.get<TrackResponse>(`reservations/track/${code}/`)
  return data
}

/** README: POST جایگزین روی ViewSet با body `{ code }` */
export async function postReservationTrack(trackingCode: string): Promise<TrackResponse> {
  const { data } = await api.post<TrackResponse>('reservations/reservations/track/', {
    code: trackingCode,
  })
  return data
}

export async function requestPayment(reservationId: number): Promise<unknown> {
  const body = { reservation_id: reservationId }
  try {
    const { data } = await api.post<unknown>('payments/request/', body)
    return data
  } catch {
    const { data } = await api.post<unknown>('reservations/reservations/request-payment/', body)
    return data
  }
}

export async function fetchMyPaymentRequests(): Promise<PaymentRequestItem[]> {
  const { data } = await api.get<unknown>('reservations/reservations/my-payment-requests/')
  return normalizeList<PaymentRequestItem>(data)
}

export async function fetchMerchantPayments(): Promise<MerchantPaymentItem[]> {
  const { data } = await api.get<unknown>('reservations/merchant/payments/')
  return normalizeList<MerchantPaymentItem>(data)
}
