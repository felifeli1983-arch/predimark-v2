'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BetSlipLeg {
  /** Stable id locale per la riga (uuid v4 client-side). */
  id: string
  /** ID Polymarket del market (per dedupe). */
  marketId: string
  eventId: string
  slug: string
  title: string
  cardKind: string
  category: string
  /** Etichetta human (Yes / No / Up / Down / nome team / strike). */
  outcomeLabel: string
  side: string
  /** Prezzo snapshot al momento dell'add (0-1). */
  pricePerShare: number
  /** ERC-1155 conditional token id selezionato (YES o NO). */
  tokenId: string
  /** [yesTokenId, noTokenId] per redeem futuro. */
  clobTokenIds: [string, string] | null
  conditionId: string
  /** USDC amount per questa singola leg. Default 5. */
  amountUsdc: number
}

export interface BetSlipState {
  legs: BetSlipLeg[]
  /** Drawer aperto/chiuso. */
  open: boolean
}

interface BetSlipActions {
  /** Aggiunge un leg. Se già presente per stesso (marketId, side) → no-op. */
  addLeg: (leg: Omit<BetSlipLeg, 'id' | 'amountUsdc'> & { amountUsdc?: number }) => void
  removeLeg: (id: string) => void
  setLegAmount: (id: string, amountUsdc: number) => void
  clear: () => void
  setOpen: (open: boolean) => void
  toggle: () => void
}

export type BetSlipStore = BetSlipState & BetSlipActions

const MAX_LEGS = 10
const DEFAULT_AMOUNT = 5
const AMOUNT_MIN = 1
const AMOUNT_MAX = 100000

function clamp(v: number): number {
  if (!Number.isFinite(v)) return AMOUNT_MIN
  return Math.min(AMOUNT_MAX, Math.max(AMOUNT_MIN, Math.round(v * 100) / 100))
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `leg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useBetSlip = create<BetSlipStore>()(
  persist(
    (set, get) => ({
      legs: [],
      open: false,

      addLeg: (input) => {
        const state = get()
        // Dedupe per (marketId, side) — 1 sola leg per outcome scelto
        const dup = state.legs.find((l) => l.marketId === input.marketId && l.side === input.side)
        if (dup) {
          set({ open: true })
          return
        }
        if (state.legs.length >= MAX_LEGS) {
          set({ open: true })
          return
        }
        const newLeg: BetSlipLeg = {
          ...input,
          id: genId(),
          amountUsdc: clamp(input.amountUsdc ?? DEFAULT_AMOUNT),
        }
        set({ legs: [...state.legs, newLeg], open: true })
      },

      removeLeg: (id) =>
        set((s) => {
          const next = s.legs.filter((l) => l.id !== id)
          return { legs: next, open: next.length > 0 ? s.open : false }
        }),

      setLegAmount: (id, amountUsdc) =>
        set((s) => ({
          legs: s.legs.map((l) => (l.id === id ? { ...l, amountUsdc: clamp(amountUsdc) } : l)),
        })),

      clear: () => set({ legs: [], open: false }),
      setOpen: (open) => set({ open }),
      toggle: () => set((s) => ({ open: !s.open })),
    }),
    {
      name: 'auktora-bet-slip',
      partialize: (s) => ({ legs: s.legs }),
    }
  )
)

/** Helper non-reattivo per chiamate fuori da React (es. add da bottone server-side rendered). */
export const betSlipActions = {
  addLeg: (...args: Parameters<BetSlipStore['addLeg']>) => useBetSlip.getState().addLeg(...args),
  removeLeg: (...args: Parameters<BetSlipStore['removeLeg']>) =>
    useBetSlip.getState().removeLeg(...args),
  open: () => useBetSlip.getState().setOpen(true),
  close: () => useBetSlip.getState().setOpen(false),
  clear: () => useBetSlip.getState().clear(),
}

export const BET_SLIP_LIMITS = { MAX_LEGS, AMOUNT_MIN, AMOUNT_MAX, DEFAULT_AMOUNT }
