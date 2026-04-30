'use client'

/**
 * 3 path utente per onboarding:
 *  - polymarket: importa account Polymarket esistente
 *  - wallet: BYO wallet esterno (MetaMask/Rabby/Coinbase/WalletConnect)
 *  - cash: nessun crypto, account via email + Privy embedded + fiat onramp
 *
 * Salvato in localStorage subito al click sul card di /signup, prima del
 * Privy login. Letto da:
 *  - PolymarketOnboardBanner (skip per cash users finché non depositano)
 *  - /me/wallet (mostra widget appropriato: import vs deposit vs onramp)
 *  - /signup/welcome (routing post-login)
 */
export type OnboardPath = 'polymarket' | 'wallet' | 'cash'

const STORAGE_KEY = 'auktora.onboard-path'

export function getOnboardPath(): OnboardPath | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'polymarket' || v === 'wallet' || v === 'cash' ? v : null
}

export function saveOnboardPath(path: OnboardPath) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, path)
}

export function clearOnboardPath() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
