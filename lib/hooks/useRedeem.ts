'use client'

import { useState } from 'react'
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth'
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type WalletClient,
} from 'viem'
import { polygon } from 'viem/chains'

import { redeemWinningTokens } from '@/lib/polymarket/redeem'
import { markPositionRedeemed } from '@/lib/api/positions-client'

export type RedeemState = 'idle' | 'signing' | 'confirming' | 'done' | 'error'

export interface UseRedeemArgs {
  positionId: string
  conditionId: string
  negRisk: boolean
}

export interface UseRedeemReturn {
  state: RedeemState
  txHash: `0x${string}` | null
  error: string | null
  redeem: (args: UseRedeemArgs) => Promise<void>
  reset: () => void
}

/**
 * Public RPC Polygon per `waitForTransactionReceipt`. Default endpoint
 * di llamarpc — fallback se Privy/Alchemy non disponibili.
 */
const POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC_URL ?? 'https://polygon-rpc.com'

/**
 * Hook per redimere winning tokens in pUSD on-chain via Privy embedded
 * wallet. Flow completo:
 *  1. signing: build tx (CTF standard o NegRiskAdapter) + user firma
 *  2. confirming: aspetta receipt via publicClient (max ~15s su Polygon)
 *  3. POST /api/v1/users/me/positions/[id]/redeemed → DB redeemed_at
 *  4. done: UI rimuove riga (DB-backed, niente più localStorage)
 *
 * Idempotente lato CTF — se la position era già redenta lato chain,
 * tx ritorna senza errori e DB viene comunque marcato.
 */
export function useRedeem(): UseRedeemReturn {
  const { wallets } = useWallets()
  const { getAccessToken } = usePrivy()
  const [state, setState] = useState<RedeemState>('idle')
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function redeem({ positionId, conditionId, negRisk }: UseRedeemArgs): Promise<void> {
    setError(null)
    setTxHash(null)
    setState('signing')
    try {
      const embedded = getEmbeddedConnectedWallet(wallets)
      if (!embedded) {
        throw new Error('Wallet embedded Privy non trovato. Login con email.')
      }
      const provider = await embedded.getEthereumProvider()
      const walletClient: WalletClient = createWalletClient({
        account: embedded.address as `0x${string}`,
        chain: polygon,
        transport: custom(provider),
      })

      const result = await redeemWinningTokens({
        signer: walletClient,
        funderAddress: embedded.address as `0x${string}`,
        conditionId,
        negRisk,
      })
      setTxHash(result.txHash)
      setState('confirming')

      // Aspetta che il tx sia minato — su Polygon ~2s, max 30s timeout.
      const publicClient = createPublicClient({
        chain: polygon,
        transport: http(POLYGON_RPC),
      })
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: result.txHash,
        timeout: 30_000,
      })
      if (receipt.status !== 'success') {
        throw new Error(`Tx fallita on-chain (status=${receipt.status})`)
      }

      // Persist DB → la riga sparisce alla prossima refresh fetch.
      const token = await getAccessToken()
      if (token) {
        try {
          await markPositionRedeemed(token, positionId, result.txHash)
        } catch (err) {
          // Non-fatal: il tx è on-chain, il DB sync può essere ritentato.
          console.warn('[useRedeem] DB persist failed (tx OK):', err)
        }
      }

      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore redeem')
      setState('error')
    }
  }

  function reset() {
    setState('idle')
    setTxHash(null)
    setError(null)
  }

  return { state, txHash, error, redeem, reset }
}
