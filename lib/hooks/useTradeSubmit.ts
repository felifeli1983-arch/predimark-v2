'use client'

import { useState, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { postTradeSubmit, TradeError, type TradeSubmitPayload } from '@/lib/api/trades-client'
import type { TradeSubmitResponse } from '@/app/api/v1/trades/submit/route'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'

export type TradeSubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface UseTradeSubmitResult {
  status: TradeSubmitStatus
  error: { code: string; message: string } | null
  result: TradeSubmitResponse | null
  submit: () => Promise<TradeSubmitResponse | null>
  reset: () => void
}

/**
 * Hook che orchestra:
 * - Privy token recovery
 * - chiamata POST /api/v1/trades/submit
 * - gestione status (idle/submitting/success/error)
 * - clear del draft + close del widget su successo
 *
 * MA4.3: solo modalità Mercato e isDemo=true.
 */
export function useTradeSubmit(): UseTradeSubmitResult {
  const { authenticated, getAccessToken } = usePrivy()
  const draft = useTradeWidget((s) => s.draft)
  const amountUsdc = useTradeWidget((s) => s.amountUsdc)
  const closeWidget = useTradeWidget((s) => s.close)

  const [status, setStatus] = useState<TradeSubmitStatus>('idle')
  const [error, setError] = useState<{ code: string; message: string } | null>(null)
  const [result, setResult] = useState<TradeSubmitResponse | null>(null)

  const submit = useCallback(async (): Promise<TradeSubmitResponse | null> => {
    if (!authenticated) {
      setError({ code: 'NOT_AUTHENTICATED', message: 'Effettua il login per fare trading' })
      setStatus('error')
      return null
    }
    if (!draft) {
      setError({ code: 'NO_DRAFT', message: 'Nessun mercato selezionato' })
      setStatus('error')
      return null
    }

    setStatus('submitting')
    setError(null)

    try {
      const token = await getAccessToken()
      if (!token) {
        throw new TradeError('NO_TOKEN', 'Sessione scaduta — rilogga', 401)
      }

      const payload: TradeSubmitPayload = {
        polymarketMarketId: draft.polymarketMarketId,
        polymarketEventId: draft.polymarketEventId,
        slug: draft.slug,
        title: draft.title,
        cardKind: draft.cardKind,
        category: draft.category,
        side: draft.side,
        amountUsdc,
        pricePerShare: draft.pricePerShare,
        isDemo: true, // MA4.3: solo demo
      }

      const res = await postTradeSubmit(token, payload)
      setResult(res)
      setStatus('success')
      closeWidget()
      return res
    } catch (err) {
      if (err instanceof TradeError) {
        setError({ code: err.code, message: err.message })
      } else {
        setError({
          code: 'UNKNOWN',
          message: err instanceof Error ? err.message : 'Errore sconosciuto',
        })
      }
      setStatus('error')
      return null
    }
  }, [authenticated, draft, amountUsdc, getAccessToken, closeWidget])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  return { status, error, result, submit, reset }
}
