'use client'

import { useState } from 'react'
import { getEmbeddedConnectedWallet, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { polygon } from 'viem/chains'

import { redeemWinningTokens } from '@/lib/polymarket/redeem'

export type RedeemState = 'idle' | 'signing' | 'confirming' | 'done' | 'error'

export interface UseRedeemReturn {
  state: RedeemState
  txHash: `0x${string}` | null
  error: string | null
  redeem: (conditionId: string) => Promise<void>
  reset: () => void
}

/**
 * Hook per redimere winning tokens in pUSD on-chain via Privy embedded
 * wallet. Single-tx flow (idempotente lato CTF, no approve necessario
 * perché redeem brucia tokens che l'utente già detiene).
 */
export function useRedeem(): UseRedeemReturn {
  const { wallets } = useWallets()
  const [state, setState] = useState<RedeemState>('idle')
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function redeem(conditionId: string): Promise<void> {
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
      })
      setTxHash(result.txHash)
      setState('confirming')
      // Per V1 non aspettiamo il receipt — l'utente vede il tx hash e
      // il balance pUSD si aggiorna entro pochi secondi. Polling
      // confirmation richiederebbe RPC dedicato (futuro fix).
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
