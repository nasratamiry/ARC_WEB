import { create } from 'zustand'
import type { TrackResponse } from '../reservation/types'

/** Client-side tracking UI state (polling runs in page; store holds latest snapshot) */
type TrackingState = {
  snapshot: TrackResponse | null
  lastPositionTimestamp: string | null
  pollingIntervalMs: number
  setSnapshot: (s: TrackResponse | null) => void
  setLastPositionTimestamp: (t: string | null) => void
  setPollingIntervalMs: (ms: number) => void
  reset: () => void
}

export const useTrackingStore = create<TrackingState>((set) => ({
  snapshot: null,
  lastPositionTimestamp: null,
  pollingIntervalMs: 12_000,
  setSnapshot: (snapshot) => set({ snapshot }),
  setLastPositionTimestamp: (lastPositionTimestamp) => set({ lastPositionTimestamp }),
  setPollingIntervalMs: (pollingIntervalMs) => set({ pollingIntervalMs }),
  reset: () =>
    set({
      snapshot: null,
      lastPositionTimestamp: null,
      pollingIntervalMs: 12_000,
    }),
}))
