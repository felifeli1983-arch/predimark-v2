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
  /**
   * Conditional token id (ERC-1155) della specifica side selezionata.
   * Per binary: clobTokenIds[0]=YES, [1]=NO. Necessario per REAL submit.
   */
  tokenId: string | null
  /**
   * Coppia completa [yesTokenId, noTokenId] del market — persistiti in DB
   * per supportare sell REAL (che ha bisogno del tokenId del side della
   * posizione, anche se diverso dal side aperto).
   */
  clobTokenIds: [string, string] | null
  /**
   * Polymarket conditionId del market — usato per fetch tickSize + negRisk
   * reali da getMarket() prima del signing (Quickstart Polymarket).
   */
  conditionId: string
}

export type TradeMode = 'market' | 'limit'

/**
 * Preset scadenza GTD (Doc 4 wireframe page-2):
 *  - 'gtc'  → Good-Till-Cancelled (no expiration)
 *  - '5m'   → 5 minuti (crypto round 5m)
 *  - '1h'   → 1 ora (crypto round 15m / breve)
 *  - '12h'  → 12 ore
 *  - '24h'  → 24 ore
 *  - 'eod'  → Fine giornata (mezzanotte UTC oggi)
 *  - 'custom' → date picker (placeholder, non implementato)
 */
export type LimitExpirationPreset = 'gtc' | '5m' | '1h' | '12h' | '24h' | 'eod' | 'custom'

interface TradeWidgetState {
  draft: TradeDraft | null
  mode: TradeMode
  amountUsdc: number
  /** Limite — placeholder MA4.4, UI presente */
  limitPriceCents: number
  limitShares: number
  /** Preset scadenza GTD selezionato. Default 'gtc' (no expire). */
  limitExpiration: LimitExpirationPreset
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
  setLimitExpiration: (preset: LimitExpirationPreset) => void
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
  limitExpiration: 'gtc',
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

  setLimitExpiration: (preset) => set({ limitExpiration: preset }),

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
