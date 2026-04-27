'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SlipLeg {
  /** ID univoco = `${marketId}:${outcome}` per dedupe */
  id: string
  eventId: string
  marketId: string
  /** 'yes' / 'no' / nome team / nome candidato / 'up' / 'down' */
  outcome: string
  /** Prezzo 0-1 al momento dell'add (per detect drift e calcolare payout) */
  priceAtAdd: number
  /** Stake USDC scelto dall'utente per questa leg (default 10) */
  stake: number
  /** Etichette human-readable per UI drawer */
  marketTitle: string
  outcomeLabel: string
  addedAt: number
  /** Errore in fase di place ("insufficient balance", "market closed", ecc.) — set in MA4.2 */
  errorAtPlace?: string
}

interface BetSlipState {
  legs: SlipLeg[]
  drawerOpen: boolean
}

/** Payload accettato dagli handler `onAddToSlip` delle card. */
export interface AddToSlipPayload {
  eventId: string
  marketId: string
  outcome: string
  priceAtAdd: number
  marketTitle: string
  outcomeLabel: string
  stake?: number
}

interface BetSlipActions {
  /**
   * Aggiunge (o sostituisce per dedupe) una leg.
   * Se esiste già una leg con stesso `marketId+outcome`, viene SOSTITUITA con il nuovo stake/price.
   * Apre automaticamente il drawer.
   */
  addLeg: (leg: AddToSlipPayload) => void
  removeLeg: (id: string) => void
  /** Aggiorna lo stake di una leg, clamp [1, 10000] */
  updateStake: (id: string, stake: number) => void
  /** Svuota tutto lo slip e chiude il drawer */
  clearSlip: () => void
  openDrawer: () => void
  closeDrawer: () => void
  /** Toggle drawer aperto/chiuso (per FAB e BottomNav) */
  toggleDrawer: () => void
}

export type BetSlipStore = BetSlipState & BetSlipActions

const DEFAULT_STAKE = 10
const STAKE_MIN = 1
const STAKE_MAX = 10000

function clampStake(stake: number): number {
  if (!Number.isFinite(stake)) return STAKE_MIN
  return Math.min(STAKE_MAX, Math.max(STAKE_MIN, Math.round(stake)))
}

function makeLegId(marketId: string, outcome: string): string {
  return `${marketId}:${outcome}`
}

export const useBetSlip = create<BetSlipStore>()(
  persist(
    (set) => ({
      legs: [],
      drawerOpen: false,

      addLeg: (input) =>
        set((state) => {
          const id = makeLegId(input.marketId, input.outcome)
          const stake = clampStake(input.stake ?? DEFAULT_STAKE)
          const newLeg: SlipLeg = {
            id,
            eventId: input.eventId,
            marketId: input.marketId,
            outcome: input.outcome,
            priceAtAdd: input.priceAtAdd,
            stake,
            marketTitle: input.marketTitle,
            outcomeLabel: input.outcomeLabel,
            addedAt: Date.now(),
          }
          const existingIdx = state.legs.findIndex((l) => l.id === id)
          const nextLegs =
            existingIdx >= 0
              ? state.legs.map((l, i) => (i === existingIdx ? newLeg : l))
              : [...state.legs, newLeg]
          return { legs: nextLegs, drawerOpen: true }
        }),

      removeLeg: (id) =>
        set((state) => ({
          legs: state.legs.filter((l) => l.id !== id),
        })),

      updateStake: (id, stake) =>
        set((state) => ({
          legs: state.legs.map((l) => (l.id === id ? { ...l, stake: clampStake(stake) } : l)),
        })),

      clearSlip: () => set({ legs: [], drawerOpen: false }),

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
    }),
    {
      name: 'auktora-slip',
      partialize: (state) => ({ legs: state.legs }),
    }
  )
)

/** Helper non-reactive per chiamate fuori da componenti React (event handlers) */
export const betSlipActions = {
  addLeg: (...args: Parameters<BetSlipStore['addLeg']>) => useBetSlip.getState().addLeg(...args),
  openDrawer: () => useBetSlip.getState().openDrawer(),
  closeDrawer: () => useBetSlip.getState().closeDrawer(),
}

/** Selettore: payout teorico per leg = stake / priceAtAdd (es. $10 a 50¢ → $20) */
export function legPayout(leg: SlipLeg): number {
  if (leg.priceAtAdd <= 0) return 0
  return leg.stake / leg.priceAtAdd
}

/** Selettore: somma stake totale */
export function totalStake(legs: SlipLeg[]): number {
  return legs.reduce((acc, l) => acc + l.stake, 0)
}

/** Selettore: somma payout teorico totale */
export function totalPayout(legs: SlipLeg[]): number {
  return legs.reduce((acc, l) => acc + legPayout(l), 0)
}

/** Builder fee Auktora = 0.5% dello stake totale (placeholder, valore definitivo in MA4.2) */
export const BUILDER_FEE_RATE = 0.005

export function builderFee(stake: number): number {
  return stake * BUILDER_FEE_RATE
}
