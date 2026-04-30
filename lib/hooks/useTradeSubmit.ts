'use client'

import { useState, useCallback } from 'react'
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { polygon } from 'viem/chains'

import { postTradeSubmit, TradeError, type TradeSubmitPayload } from '@/lib/api/trades-client'
import type { TradeSubmitResponse } from '@/app/api/v1/trades/submit/route'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'
import { balanceActions } from '@/lib/stores/useBalance'
import { useThemeStore } from '@/lib/stores/themeStore'
import { buildAndSignOrder } from '@/lib/polymarket/order-create'

export type TradeSubmitStatus = 'idle' | 'submitting' | 'signing' | 'success' | 'error'

export interface UseTradeSubmitResult {
  status: TradeSubmitStatus
  error: { code: string; message: string } | null
  result: TradeSubmitResponse | null
  submit: () => Promise<TradeSubmitResponse | null>
  reset: () => void
}

/**
 * Hook che orchestra il submit trade:
 * - DEMO: POST diretto a /api/v1/trades/submit (paper money)
 * - REAL: build SignedOrder via Privy embedded wallet → POST con signedOrder
 *         a /api/v1/trades/submit, server posta a CLOB V2 + insert DB
 *
 * Status `signing` indica che stiamo aspettando firma utente sul popup Privy.
 * Toggle DEMO/REAL preso da themeStore.isDemo.
 */
export function useTradeSubmit(): UseTradeSubmitResult {
  const { authenticated, getAccessToken } = usePrivy()
  const { wallets } = useWallets()
  const isDemo = useThemeStore((s) => s.isDemo)
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
      if (!token) throw new TradeError('NO_TOKEN', 'Sessione scaduta — rilogga', 401)

      const basePayload: TradeSubmitPayload = {
        polymarketMarketId: draft.polymarketMarketId,
        polymarketEventId: draft.polymarketEventId,
        slug: draft.slug,
        title: draft.title,
        cardKind: draft.cardKind,
        category: draft.category,
        side: draft.side,
        amountUsdc,
        pricePerShare: draft.pricePerShare,
        isDemo,
        clobTokenIds: draft.clobTokenIds ?? undefined,
      }

      let payload: TradeSubmitPayload = basePayload

      if (!isDemo) {
        if (!draft.tokenId) {
          throw new TradeError(
            'NO_TOKEN_ID',
            'Token ID mancante per questo mercato (REAL non supportato)',
            400
          )
        }
        const embedded = getEmbeddedConnectedWallet(wallets)
        if (!embedded) {
          throw new TradeError(
            'NO_EMBEDDED_WALLET',
            'Wallet embedded Privy non trovato. Effettua login con email.',
            400
          )
        }
        setStatus('signing')
        const provider = await embedded.getEthereumProvider()
        const walletClient: WalletClient = createWalletClient({
          account: embedded.address as `0x${string}`,
          chain: polygon,
          transport: custom(provider),
        })
        const signedOrder = await buildAndSignOrder({
          signer: walletClient,
          funderAddress: embedded.address,
          tokenId: draft.tokenId,
          conditionId: draft.conditionId,
          side: draft.side,
          pricePerShare: draft.pricePerShare,
          amountUsdc,
          // walletKind default 'eoa' — Privy embedded wallet è EOA. Path A
          // (Polymarket import) imposterà 'poly_proxy' quando wired.
        })
        payload = {
          ...basePayload,
          tokenId: draft.tokenId,
          signedOrder: signedOrder as unknown as Record<string, unknown>,
        }
        setStatus('submitting')
      }

      const res = await postTradeSubmit(token, payload)
      setResult(res)
      setStatus('success')
      if (res.newDemoBalance !== null) balanceActions.setDemoBalance(res.newDemoBalance)
      if (res.newRealBalance !== null) balanceActions.setUsdcBalance(res.newRealBalance)
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
  }, [authenticated, draft, amountUsdc, isDemo, wallets, getAccessToken, closeWidget])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  return { status, error, result, submit, reset }
}
