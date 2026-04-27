'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { fetchUserBalance } from '@/lib/api/trades-client'
import { useBalance } from '@/lib/stores/useBalance'

/**
 * Monta in RootLayout. Quando l'utente diventa autenticato, scarica
 * il saldo USDC + DEMO da `GET /api/v1/balances` e popola lo store.
 * Resetta al logout.
 *
 * Side-effect-only — restituisce null.
 */
export function BalanceHydrator() {
  const { authenticated, ready, getAccessToken } = usePrivy()
  const setBalance = useBalance((s) => s.setBalance)
  const reset = useBalance((s) => s.reset)

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      reset()
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const b = await fetchUserBalance(token)
        if (!cancelled) setBalance(b)
      } catch (err) {
        console.warn('[balance] hydrate failed', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken, setBalance, reset])

  return null
}
