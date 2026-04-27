'use client'

import { create } from 'zustand'

export interface TradeDraft {
  polymarketMarketId: string
  polymarketEventId: string
  slug: string
  title: string
  cardKind: string
  category: string
  side: string
  /** Prezzo snapshot al momento dell'apertura widget (0-1) */
  pricePerShare: number
  /** Etichetta human-readable per UI (es. "Yes", "Finland", "Up") */
  outcomeLabel: string
}

export type TradeMode = 'market' | 'limit'

interface TradeWidgetState {
  draft: TradeDraft | null
  mode: TradeMode
  amountUsdc: number
  /** Limite — placeholder MA4.4, UI presente */
  limitPriceCents: number
  limitShares: number
  /** Mobile bottom sheet visibility */
  isOpen: boolean
}

interface TradeWidgetActions {
  setDraft: (draft: TradeDraft) => void
  setMode: (mode: TradeMode) => void
  setAmountUsdc: (amount: number) => void
  incrementAmount: (delta: number) => void
  setLimitPrice: (cents: number) => void
  setLimitShares: (shares: number) => void
  open: () => void
  close: () => void
  clear: () => void
}

export type TradeWidgetStore = TradeWidgetState & TradeWidgetActions

const DEFAULT_AMOUNT = 5
const AMOUNT_MIN = 1
const AMOUNT_MAX = 100000

function clampAmount(value: number): number {
  if (!Number.isFinite(value)) return AMOUNT_MIN
  return Math.min(AMOUNT_MAX, Math.max(AMOUNT_MIN, Math.round(value * 100) / 100))
}

const INITIAL_STATE: TradeWidgetState = {
  draft: null,
  mode: 'market',
  amountUsdc: DEFAULT_AMOUNT,
  limitPriceCents: 50,
  limitShares: 0,
  isOpen: false,
}

export const useTradeWidget = create<TradeWidgetStore>()((set) => ({
  ...INITIAL_STATE,

  setDraft: (draft) =>
    set({
      draft,
      // reset import al cambio di mercato
      amountUsdc: DEFAULT_AMOUNT,
      limitPriceCents: Math.max(1, Math.round(draft.pricePerShare * 100)),
      limitShares: 0,
    }),

  setMode: (mode) => set({ mode }),

  setAmountUsdc: (amount) => set({ amountUsdc: clampAmount(amount) }),

  incrementAmount: (delta) =>
    set((state) => ({ amountUsdc: clampAmount(state.amountUsdc + delta) })),

  setLimitPrice: (cents) => {
    const clamped = Math.max(1, Math.min(99, Math.round(cents)))
    set({ limitPriceCents: clamped })
  },

  setLimitShares: (shares) => set({ limitShares: Math.max(0, Math.round(shares)) }),

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  clear: () => set({ ...INITIAL_STATE }),
}))

/** Helper non-reattivo per chiamate fuori da componenti React */
export const tradeWidgetActions = {
  setDraft: (...args: Parameters<TradeWidgetStore['setDraft']>) =>
    useTradeWidget.getState().setDraft(...args),
  open: () => useTradeWidget.getState().open(),
  close: () => useTradeWidget.getState().close(),
}
