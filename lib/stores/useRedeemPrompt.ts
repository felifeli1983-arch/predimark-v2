'use client'

import { create } from 'zustand'

/**
 * Store per il prompt redeem: contatore unclaimed wins + open/close
 * del modal globale. Il gift icon in HeaderActions legge `unclaimedCount`
 * per il badge e chiama `setOpen(true)` al click.
 */
interface RedeemPromptState {
  /** Numero di posizioni vincenti non-claimate. */
  unclaimedCount: number
  /** Totale $ delle vincite non-claimate (per badge tooltip + modal header). */
  unclaimedTotal: number
  /** True quando il modal è aperto. */
  open: boolean
  /** True quando il fetch iniziale è completato (per evitare flash di badge a 0). */
  hydrated: boolean
}

interface RedeemPromptActions {
  setUnclaimed: (count: number, total: number) => void
  setOpen: (open: boolean) => void
  reset: () => void
}

const INITIAL: RedeemPromptState = {
  unclaimedCount: 0,
  unclaimedTotal: 0,
  open: false,
  hydrated: false,
}

export const useRedeemPromptStore = create<RedeemPromptState & RedeemPromptActions>((set) => ({
  ...INITIAL,
  setUnclaimed: (count, total) =>
    set({ unclaimedCount: count, unclaimedTotal: total, hydrated: true }),
  setOpen: (open) => set({ open }),
  reset: () => set(INITIAL),
}))
