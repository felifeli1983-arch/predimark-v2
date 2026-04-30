'use client'

import { useCallback, useState } from 'react'
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type WalletClient,
  type PublicClient,
} from 'viem'
import { polygon } from 'viem/chains'
import { ClobClient, Chain } from '@polymarket/clob-client-v2'

import { CLOB_URL } from '@/lib/polymarket/clob'
import {
  readAllowances,
  diffAllowances,
  approveMissingAllowances,
} from '@/lib/polymarket/allowances'

export type OnboardStep =
  | 'idle'
  | 'preparing'
  | 'deriving_api_key' // L1 sig + tempClient.createOrDeriveApiKey()
  | 'saving_creds' // POST /api/v1/polymarket/onboard
  | 'reading_allowances'
  | 'approving' // user firma 1..6 tx
  | 'success'
  | 'error'

export interface OnboardState {
  step: OnboardStep
  /** Indice approval in corso (1..6) — utile per UI "approval N di M". */
  approvingIndex: number
  /** Numero totale approvals da fare (calcolato dopo readAllowances). */
  approvingTotal: number
  error: { code: string; message: string } | null
}

export interface UseOnboardPolymarketResult extends OnboardState {
  /**
   * Esegue l'intero flow Path A:
   *  1. Wallet detection (Privy embedded → EOA viem)
   *  2. Derive L2 API creds via signing (createOrDeriveApiKey)
   *  3. POST creds + funderAddress al server (cifrate at-rest)
   *  4. Read allowances on-chain
   *  5. Approve missing (utente firma N tx)
   *
   * Idempotente: se già onboardato, riusa creds esistenti e fa solo allowances.
   */
  start: () => Promise<boolean>
  reset: () => void
}

/**
 * Hook onboarding Polymarket V2 — Quickstart "Set Up Your Client" flow:
 *   tempClient.createOrDeriveApiKey() → save L2 creds → approve allowances.
 *
 * Adatta l'esempio del Quickstart (Node.js + privateKeyToAccount) a Privy
 * embedded wallet via getEthereumProvider() + viem custom transport.
 */
export function useOnboardPolymarket(): UseOnboardPolymarketResult {
  const { authenticated, getAccessToken } = usePrivy()
  const { wallets } = useWallets()
  const [state, setState] = useState<OnboardState>({
    step: 'idle',
    approvingIndex: 0,
    approvingTotal: 0,
    error: null,
  })

  const reset = useCallback(() => {
    setState({ step: 'idle', approvingIndex: 0, approvingTotal: 0, error: null })
  }, [])

  const start = useCallback(async (): Promise<boolean> => {
    if (!authenticated) {
      setState((s) => ({
        ...s,
        step: 'error',
        error: { code: 'NOT_AUTHENTICATED', message: 'Effettua il login prima' },
      }))
      return false
    }

    try {
      setState((s) => ({ ...s, step: 'preparing', error: null }))

      const embedded = getEmbeddedConnectedWallet(wallets)
      if (!embedded) {
        throw {
          code: 'NO_WALLET',
          message:
            'Wallet Privy embedded non trovato. Effettua login con email o connetti un wallet esterno.',
        }
      }

      const provider = await embedded.getEthereumProvider()
      const walletClient: WalletClient = createWalletClient({
        account: embedded.address as `0x${string}`,
        chain: polygon,
        transport: custom(provider),
      })
      const publicClient: PublicClient = createPublicClient({
        chain: polygon,
        transport: http(),
      })

      // 1. Derive L2 API creds
      setState((s) => ({ ...s, step: 'deriving_api_key' }))
      const tempClient = new ClobClient({
        host: CLOB_URL,
        chain: Chain.POLYGON,
        signer: walletClient,
        funderAddress: embedded.address,
        throwOnError: true,
      })
      const apiCreds = await tempClient.createOrDeriveApiKey()
      if (!apiCreds?.key || !apiCreds?.secret || !apiCreds?.passphrase) {
        throw {
          code: 'API_KEY_FAIL',
          message: 'Non sono riuscito a derivare le L2 API credentials',
        }
      }

      // 2. POST creds al server (cifrate at-rest in users.polymarket_*)
      setState((s) => ({ ...s, step: 'saving_creds' }))
      const token = await getAccessToken()
      if (!token) throw { code: 'NO_TOKEN', message: 'Sessione scaduta — rilogga' }

      const onboardRes = await fetch('/api/v1/polymarket/onboard', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiCreds.key,
          secret: apiCreds.secret,
          passphrase: apiCreds.passphrase,
          funderAddress: embedded.address,
        }),
      })
      if (!onboardRes.ok) {
        const body = (await onboardRes.json().catch(() => null)) as {
          error?: { message?: string }
        } | null
        throw {
          code: 'SAVE_FAIL',
          message: body?.error?.message ?? `HTTP ${onboardRes.status}`,
        }
      }

      // 3. Read allowances + approve missing
      setState((s) => ({ ...s, step: 'reading_allowances' }))
      const status = await readAllowances(publicClient, embedded.address as `0x${string}`)
      const missing = diffAllowances(status)

      if (missing.any) {
        const total = [
          missing.usdcExchange,
          missing.usdcNegRiskExchange,
          missing.usdcNegRiskAdapter,
          missing.ctfExchange,
          missing.ctfNegRiskExchange,
          missing.ctfNegRiskAdapter,
        ].filter(Boolean).length
        setState((s) => ({
          ...s,
          step: 'approving',
          approvingIndex: 0,
          approvingTotal: total,
        }))
        await approveMissingAllowances(walletClient, embedded.address as `0x${string}`, missing)
      }

      setState((s) => ({ ...s, step: 'success' }))
      return true
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? (err as { code: string }).code
          : 'UNKNOWN'
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Errore onboarding'
      setState((s) => ({
        ...s,
        step: 'error',
        error: { code, message },
      }))
      return false
    }
  }, [authenticated, getAccessToken, wallets])

  return { ...state, start, reset }
}
