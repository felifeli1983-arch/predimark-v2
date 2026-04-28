'use client'

import { useState, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import {
  postSellTrade,
  type SellTradePayload,
  type SellTradeResponse,
} from '@/lib/api/positions-client'
import { balanceActions } from '@/lib/stores/useBalance'

export type SellStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface UseSellTradeResult {
  status: SellStatus
  error: string | null
  result: SellTradeResponse | null
  submit: (payload: SellTradePayload) => Promise<SellTradeResponse | null>
  reset: () => void
}

/**
 * Hook che orchestra Privy token + POST /api/v1/trades/sell + balance store update.
 */
export function useSellTrade(): UseSellTradeResult {
  const { authenticated, getAccessToken } = usePrivy()
  const [status, setStatus] = useState<SellStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SellTradeResponse | null>(null)

  const submit = useCallback(
    async (payload: SellTradePayload): Promise<SellTradeResponse | null> => {
      if (!authenticated) {
        setError('Effettua il login per vendere')
        setStatus('error')
        return null
      }
      setStatus('submitting')
      setError(null)
      try {
        const token = await getAccessToken()
        if (!token) throw new Error('Sessione scaduta')
        const res = await postSellTrade(token, payload)
        setResult(res)
        setStatus('success')
        if (payload.isDemo && typeof res.newDemoBalance === 'number') {
          balanceActions.setDemoBalance(res.newDemoBalance)
        }
        if (!payload.isDemo && typeof res.newRealBalance === 'number') {
          balanceActions.setUsdcBalance(res.newRealBalance)
        }
        return res
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        setStatus('error')
        return null
      }
    },
    [authenticated, getAccessToken]
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  return { status, error, result, submit, reset }
}
