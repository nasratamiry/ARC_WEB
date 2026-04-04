/** Types for Reservation / Core / Tracking APIs — fields may vary by backend; keep optional. */

export type Station = {
  id: number
  name?: string
  code?: string
  city?: string
  province_or_state?: string
  country?: string
  address?: string
  location?: string
  allowed_destinations_count?: number
  available_wagons_count?: number
  available_wagons?: number
  [key: string]: unknown
}

export type DestinationStation = {
  /** شناسهٔ ایستگاه مقصد (برای journey_availability و POST رزرو) */
  id: number
  /** در صورت وجود، pk رابطهٔ مبدا→مقصد در بک‌اند (فقط نمایشی/ردیابی) */
  relation_id?: number
  name?: string
  code?: string
  city?: string
  country?: string
  province_or_state?: string
  /** اگر بک‌اند روی ردیف مقصد بفرستد */
  available_wagons_at_route?: number
  [key: string]: unknown
}

export type WagonType = {
  id: number
  /** README GET /wagon-types/: list/detail */
  type_name?: string
  name?: string
  code?: string
  pricing?: {
    base_price_usd?: string | number
    total_price_usd?: string | number
    base_price_afn?: string | number
    total_price_afn?: string | number
  }
  available_wagons_count?: number
  total_wagons_count?: number
  [key: string]: unknown
}

/** README journey_availability.wagon_types[] + enrich از wagon-types/{id}/ */
export type JourneyWagonOption = {
  id?: number
  wagon_type?: number | Record<string, unknown>
  wagon_type_id?: number
  wagon_type_name?: string
  type_name?: string
  name?: string
  price_usd?: string | number
  price_afn?: string | number
  calculated_price_usd?: string
  calculated_price_afn?: string
  available?: number
  available_count?: number
  capacity?: number | string
  pricing?: Record<string, unknown>
  [key: string]: unknown
}

export type AssignedWagon = {
  id?: number
  identifier?: string
  [key: string]: unknown
}

export type ReservationListItem = {
  id: number
  status?: string
  status_display?: string
  financially_settled?: boolean
  tracking_code?: string | null
  calculated_price_usd?: string | number
  calculated_price_afn?: string | number
  origin_station_name?: string
  destination_station_name?: string
  wagon_type_name?: string
  number_of_wagons?: number
  created_at?: string
  approved_at?: string
  estimated_delivery_time?: string
  total_paid_usd?: string | number
  total_paid_afn?: string | number
  assigned_wagons?: AssignedWagon[]
  message?: string
  [key: string]: unknown
}

export type PaymentRecord = {
  id?: number
  installment_number?: number
  amount?: string | number
  amount_paid?: string | number
  paid_currency?: string
  payment_method?: string
  currency?: string
  status?: string
  status_display?: string
  created_at?: string
  amount_usd?: string | number
  amount_afn?: string | number
  remaining_amount?: string | number
  [key: string]: unknown
}

export type ReservationDetail = ReservationListItem & {
  origin_station?: number | Station
  destination_station?: number | Station
  wagon_type?: number | WagonType
  number_of_wagons?: number
  payments?: PaymentRecord[]
  assigned_wagons?: AssignedWagon[]
  cargo_description?: string
  /** بک‌اند ممکن است عدد یا رشته برگرداند؛ POST طبق README به‌صورت عدد ارسال شود. */
  cargo_weight?: string | number
  special_requirements?: string
  notes?: string
}

/** فقط فیلدهای الزامی README + اختیاری‌ها؛ مقادیر خالی ارسال نمی‌شوند. */
export type CreateReservationPayload = {
  origin_station: number
  destination_station: number
  wagon_type: number
  number_of_wagons: number
  cargo_description?: string
  cargo_weight?: number
  special_requirements?: string
  notes?: string
}

export type TrackJourney = {
  from?: string
  from_code?: string
  from_latitude?: number
  from_longitude?: number
  to?: string
  to_code?: string
  to_latitude?: number
  to_longitude?: number
  [key: string]: unknown
}

export type TrackMovement = {
  identifier?: string
  [key: string]: unknown
} | null

export type TrackPosition = {
  latitude?: number
  longitude?: number
  altitude?: number | null
  speed?: number
  heading?: number
  accuracy?: number
  location_name?: string
  timestamp?: string
  [key: string]: unknown
} | null

export type TrackResponse = {
  tracking_code?: string
  journey?: TrackJourney
  movement?: TrackMovement
  current_position?: TrackPosition
  message?: string
  [key: string]: unknown
}

export type PaymentRequestItem = {
  id?: number
  status?: string
  status_display?: string
  admin_response?: string
  responded_at?: string
  reservation_id?: number
  [key: string]: unknown
}

export type MerchantPaymentItem = {
  id?: number
  amount?: string | number
  currency?: string
  status?: string
  status_display?: string
  installment_number?: number
  created_at?: string
  [key: string]: unknown
}
