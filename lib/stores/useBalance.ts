'use client'

import { create } from 'zustand'

export interface BalanceState {
  usdcBalance: number
  usdcLocked: number
  demoBalance: number
  demoLocked: number
  /** True dopo il primo fetch riuscito */
  hydrated: boolean
}

interface BalanceActions {
  /** Sostituisce lo state (usato dopo GET /api/v1/balances) */
  setBalance: (b: Omit<BalanceState, 'hydrated'>) => void
  /** Aggiorna SOLO demo_balance (post-trade DEMO) */
  setDemoBalance: (newBalance: number) => void
  /** Reset al logout */
  reset: () => void
}

export type BalanceStore = BalanceState & BalanceActions

const INITIAL_STATE: BalanceState = {
  usdcBalance: 0,
  usdcLocked: 0,
  demoBalance: 10000, // default schema (mostriamo questo durante la fase pre-hydrate)
  demoLocked: 0,
  hydrated: false,
}

export const useBalance = create<BalanceStore>()((set) => ({
  ...INITIAL_STATE,
  setBalance: (b) =>
    set({
      usdcBalance: b.usdcBalance,
      usdcLocked: b.usdcLocked,
      demoBalance: b.demoBalance,
      demoLocked: b.demoLocked,
      hydrated: true,
    }),
  setDemoBalance: (newBalance) => set({ demoBalance: newBalance }),
  reset: () => set({ ...INITIAL_STATE }),
}))

/** Helper non-reattivo */
export const balanceActions = {
  setBalance: (...args: Parameters<BalanceStore['setBalance']>) =>
    useBalance.getState().setBalance(...args),
  setDemoBalance: (...args: Parameters<BalanceStore['setDemoBalance']>) =>
    useBalance.getState().setDemoBalance(...args),
  reset: () => useBalance.getState().reset(),
}
