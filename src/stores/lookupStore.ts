import { create } from 'zustand'
import {
  fetchDestinations,
  fetchJourneyAvailability,
  fetchStation,
  fetchStations,
  parseAndEnrichJourney,
} from '../reservation/coreApi'
import type { DestinationStation, JourneyWagonOption, Station } from '../reservation/types'
import { sumAvailableAcrossRows } from '../reservation/wagonHelpers'
import { ApiError } from '../services/api'

type LookupState = {
  stations: Station[]
  stationsLoading: boolean
  stationsError: string | null
  /** جمع واگن آزاد از journey (همان منطق صفحهٔ جزئیات) — همیشه از API محاسبه می‌شود نه فیلد لیست ایستگاه‌ها */
  aggregatedAvailabilityByStationId: Record<number, number | null | undefined>
  /** تعداد مقصدهای واقعاً برگشتی از API برای هماهنگی با صفحهٔ جزئیات */
  aggregatedDestinationCountByStationId: Record<number, number | undefined>
  availabilitySummaryLoading: boolean
  stationById: Record<number, Station | undefined>
  destinationsByStation: Record<number, DestinationStation[] | undefined>
  destinationsLoading: Record<number, boolean>
  journeyOptionsByKey: Record<string, JourneyWagonOption[] | undefined>
  journeyLoading: Record<string, boolean>
  journeyError: Record<string, string | null>
  loadStations: () => Promise<void>
  loadStation: (id: number, options?: { force?: boolean }) => Promise<Station | null>
  loadDestinations: (stationId: number, options?: { force?: boolean }) => Promise<DestinationStation[]>
  loadJourneyAvailability: (originId: number, destinationId: number) => Promise<JourneyWagonOption[]>
  refreshStationsAvailabilitySummary: () => Promise<void>
  reset: () => void
}

const journeyKey = (o: number, d: number) => `${o}-${d}`

export const useLookupStore = create<LookupState>((set, get) => ({
  stations: [],
  stationsLoading: false,
  stationsError: null,
  aggregatedAvailabilityByStationId: {},
  aggregatedDestinationCountByStationId: {},
  availabilitySummaryLoading: false,
  stationById: {},
  destinationsByStation: {},
  destinationsLoading: {},
  journeyOptionsByKey: {},
  journeyLoading: {},
  journeyError: {},

  loadStations: async () => {
    set({ stationsLoading: true, stationsError: null })
    try {
      const stations = await fetchStations()
      const stationById = { ...get().stationById }
      stations.forEach((s) => {
        stationById[s.id] = s
      })
      set({
        stations,
        stationsLoading: false,
        stationById,
        aggregatedAvailabilityByStationId: {},
        aggregatedDestinationCountByStationId: {},
      })
      /** نمی‌زنیم: برای هر استیشن docها + journey enrich = ده‌ها درخواست، timeout و عدد متفاوت از فیلدهای GET stations/ */
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load stations'
      set({ stationsLoading: false, stationsError: msg })
    }
  },

  refreshStationsAvailabilitySummary: async () => {
    const { stations } = get()
    if (!stations.length) return
    /** همیشه همهٔ ایستگاه‌ها: فیلد `available_wagons` روی لیست اغلب با journey هم‌خوان نیست. */
    set({ availabilitySummaryLoading: true })
    const nextAvail: Record<number, number | null> = {}
    const nextDest: Record<number, number> = {}
    await Promise.all(
      stations.map(async (s) => {
        try {
          const dests = await get().loadDestinations(s.id)
          nextDest[s.id] = dests.length
          if (!dests.length) {
            nextAvail[s.id] = null
            return
          }
          let sumAll = 0
          let any = false
          for (const d of dests) {
            try {
              const raw = await fetchJourneyAvailability(s.id, d.id)
              const rows = await parseAndEnrichJourney(raw, s.id, d.id)
              const leg = sumAvailableAcrossRows(rows)
              if (leg != null) {
                sumAll += leg
                any = true
              }
            } catch {
              /* یک مقصد را رد کن */
            }
          }
          nextAvail[s.id] = any ? sumAll : null
        } catch {
          nextAvail[s.id] = null
        }
      }),
    )
    set((state) => ({
      aggregatedAvailabilityByStationId: { ...state.aggregatedAvailabilityByStationId, ...nextAvail },
      aggregatedDestinationCountByStationId: { ...state.aggregatedDestinationCountByStationId, ...nextDest },
      availabilitySummaryLoading: false,
    }))
  },

  loadStation: async (id: number, options?: { force?: boolean }) => {
    if (!options?.force) {
      const cached = get().stationById[id]
      if (cached) return cached
    }
    try {
      const station = await fetchStation(id)
      set({ stationById: { ...get().stationById, [id]: station } })
      return station
    } catch {
      return get().stationById[id] ?? null
    }
  },

  loadDestinations: async (stationId: number, options?: { force?: boolean }) => {
    if (!options?.force) {
      const cached = get().destinationsByStation[stationId]
      if (cached !== undefined && cached.length > 0) return cached
    }
    set({ destinationsLoading: { ...get().destinationsLoading, [stationId]: true } })
    try {
      const list = await fetchDestinations(stationId)
      set({
        destinationsByStation: { ...get().destinationsByStation, [stationId]: list },
        destinationsLoading: { ...get().destinationsLoading, [stationId]: false },
      })
      return list
    } catch {
      set({ destinationsLoading: { ...get().destinationsLoading, [stationId]: false } })
      return []
    }
  },

  loadJourneyAvailability: async (originId: number, destinationId: number) => {
    const key = journeyKey(originId, destinationId)
    set({
      journeyLoading: { ...get().journeyLoading, [key]: true },
      journeyError: { ...get().journeyError, [key]: null },
      journeyOptionsByKey: { ...get().journeyOptionsByKey, [key]: undefined },
    })
    try {
      const raw = await fetchJourneyAvailability(originId, destinationId)
      const options = await parseAndEnrichJourney(raw, originId, destinationId)
      set({
        journeyOptionsByKey: { ...get().journeyOptionsByKey, [key]: options },
        journeyLoading: { ...get().journeyLoading, [key]: false },
      })
      return options
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load availability'
      set({
        journeyOptionsByKey: { ...get().journeyOptionsByKey, [key]: [] },
        journeyLoading: { ...get().journeyLoading, [key]: false },
        journeyError: { ...get().journeyError, [key]: msg },
      })
      return []
    }
  },

  reset: () =>
    set({
      stations: [],
      stationsLoading: false,
      stationsError: null,
      aggregatedAvailabilityByStationId: {},
      aggregatedDestinationCountByStationId: {},
      availabilitySummaryLoading: false,
      stationById: {},
      destinationsByStation: {},
      destinationsLoading: {},
      journeyOptionsByKey: {},
      journeyLoading: {},
      journeyError: {},
    }),
}))
