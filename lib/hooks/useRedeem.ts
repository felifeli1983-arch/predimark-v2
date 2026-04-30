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

export interface RedeemTask {
  positionId: string
  conditionId: string
  negRisk: boolean
}

export interface RedeemProgress {
  /** Indice della task corrente (0-based, -1 se idle). */
  currentIndex: number
  /** Numero totale di task in coda. */
  total: number
  /** Tx hash della task corrente, se firmato. */
  currentTxHash: `0x${string}` | null
  /** Lista tx hash di tutte le task completate. */
  completed: Array<{ positionId: string; txHash: `0x${string}` }>
}

export interface UseRedeemReturn {
  state: RedeemState
  progress: RedeemProgress
  error: string | null
  /** Singola redemption. Wrapper sopra a redeemBatch con array di 1. */
  redeem: (task: RedeemTask) => Promise<void>
  /**
   * Batch redemption. Esegue le task sequenzialmente (1 firma per task —
   * CTF non ha multicall built-in). Continua anche se una fallisce, lo
   * traccia in `error` ma prosegue con le altre.
   */
  redeemBatch: (tasks: RedeemTask[]) => Promise<void>
  reset: () => void
}

const POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC_URL ?? 'https://polygon-rpc.com'

const INITIAL_PROGRESS: RedeemProgress = {
  currentIndex: -1,
  total: 0,
  currentTxHash: null,
  completed: [],
}

/**
 * Hook per redimere winning tokens. Supporta batch di N posizioni —
 * loop sequenziale con 1 firma per task (CTF non ha multicall, e il
 * NegRiskAdapter neither). Polymarket stesso non ha auto-redeem
 * server-side per embedded wallets (verificato docs 2026-04-30).
 *
 * Per ogni task:
 *  1. signing: build tx + user firma
 *  2. confirming: waitForTransactionReceipt 30s timeout
 *  3. POST /api/v1/users/me/positions/[id]/redeemed → DB redeemed_at
 *  4. progress.currentIndex avanza alla prossima task
 *
 * State `done` solo quando TUTTE le task sono completate (o errori
 * salvate in `error` ma proseguite).
 */
export function useRedeem(): UseRedeemReturn {
  const { wallets } = useWallets()
  const { getAccessToken } = usePrivy()
  const [state, setState] = useState<RedeemState>('idle')
  const [progress, setProgress] = useState<RedeemProgress>(INITIAL_PROGRESS)
  const [error, setError] = useState<string | null>(null)

  async function executeOne(
    task: RedeemTask,
    walletClient: WalletClient,
    funderAddress: `0x${string}`,
    publicClient: ReturnType<typeof createPublicClient>,
    token: string | null
  ): Promise<{ txHash: `0x${string}` }> {
    const result = await redeemWinningTokens({
      signer: walletClient,
      funderAddress,
      conditionId: task.conditionId,
      negRisk: task.negRisk,
    })
    setProgress((prev) => ({ ...prev, currentTxHash: result.txHash }))
    setState('confirming')

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: result.txHash,
      timeout: 30_000,
    })
    if (receipt.status !== 'success') {
      throw new Error(`Tx fallita on-chain (status=${receipt.status})`)
    }

    if (token) {
      try {
        await markPositionRedeemed(token, task.positionId, result.txHash)
      } catch (err) {
        console.warn('[useRedeem] DB persist failed (tx OK):', err)
      }
    }

    return { txHash: result.txHash }
  }

  async function redeemBatch(tasks: RedeemTask[]): Promise<void> {
    if (tasks.length === 0) return
    setError(null)
    setProgress({
      currentIndex: 0,
      total: tasks.length,
      currentTxHash: null,
      completed: [],
    })
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
      const publicClient = createPublicClient({
        chain: polygon,
        transport: http(POLYGON_RPC),
      })
      const token = await getAccessToken()

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]!
        setProgress((prev) => ({
          ...prev,
          currentIndex: i,
          currentTxHash: null,
        }))
        setState('signing')

        try {
          const { txHash } = await executeOne(
            task,
            walletClient,
            embedded.address as `0x${string}`,
            publicClient,
            token
          )
          setProgress((prev) => ({
            ...prev,
            completed: [...prev.completed, { positionId: task.positionId, txHash }],
          }))
        } catch (err) {
          // Logga il fail ma prosegui — l'utente può riprovare le falliite.
          const msg = err instanceof Error ? err.message : 'Errore redeem'
          console.error(`[useRedeem] task ${i + 1}/${tasks.length} fallita:`, msg)
          setError((prev) => (prev ? `${prev}; task ${i + 1}: ${msg}` : `Task ${i + 1}: ${msg}`))
        }
      }

      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore redeem')
      setState('error')
    }
  }

  async function redeem(task: RedeemTask): Promise<void> {
    return redeemBatch([task])
  }

  function reset() {
    setState('idle')
    setProgress(INITIAL_PROGRESS)
    setError(null)
  }

  return { state, progress, error, redeem, redeemBatch, reset }
}
