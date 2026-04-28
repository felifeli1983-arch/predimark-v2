'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { ClobClient, Chain } from '@polymarket/clob-client-v2'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { polygon } from 'viem/chains'
import { CheckCircle2, AlertCircle, Loader2, Wallet as WalletIcon } from 'lucide-react'

interface OnboardStatusResponse {
  onboarded: boolean
  funderAddress: string | null
  onboardedAt: string | null
}

interface BalanceResponse {
  address: string
  raw: string
  pusd: number
}

const CLOB_HOST = process.env.NEXT_PUBLIC_POLYMARKET_CLOB_URL ?? 'https://clob-v2.polymarket.com'

export function OnboardCard() {
  const { authenticated, ready, getAccessToken, login } = usePrivy()
  const { wallets } = useWallets()
  const [status, setStatus] = useState<OnboardStatusResponse | null>(null)
  const [balance, setBalance] = useState<BalanceResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  const refresh = useCallback(async () => {
    if (!authenticated) {
      setLoadingStatus(false)
      return
    }
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Sessione scaduta')
      const res = await fetch('/api/v1/polymarket/onboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as OnboardStatusResponse
      setStatus(data)
      if (data.onboarded) {
        const balRes = await fetch('/api/v1/polymarket/balance', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (balRes.ok) setBalance((await balRes.json()) as BalanceResponse)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento status')
    } finally {
      setLoadingStatus(false)
    }
  }, [authenticated, getAccessToken])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) refresh()
  }, [ready, refresh])

  async function handleOnboard() {
    setError(null)
    setBusy(true)
    try {
      const embedded = getEmbeddedConnectedWallet(wallets)
      if (!embedded) throw new Error('Wallet embedded Privy non trovato')
      const provider = await embedded.getEthereumProvider()
      const walletClient: WalletClient = createWalletClient({
        account: embedded.address as `0x${string}`,
        chain: polygon,
        transport: custom(provider),
      })

      const client = new ClobClient({
        host: CLOB_HOST,
        chain: Chain.POLYGON,
        signer: walletClient,
        funderAddress: embedded.address,
      })

      const creds = await client.createOrDeriveApiKey()

      const token = await getAccessToken()
      if (!token) throw new Error('Sessione scaduta')
      const res = await fetch('/api/v1/polymarket/onboard', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: creds.key,
          secret: creds.secret,
          passphrase: creds.passphrase,
          funderAddress: embedded.address,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string }
        } | null
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore onboarding')
    } finally {
      setBusy(false)
    }
  }

  if (!ready || loadingStatus) {
    return (
      <Card>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Verifica stato…</span>
      </Card>
    )
  }

  if (!authenticated) {
    return (
      <Card>
        <WalletIcon size={28} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Per fare trade REAL su Polymarket devi prima loggarti. Auktora userà il tuo wallet (creato
          da te o auto-generato al signup) per piazzare ordini on-chain.
        </p>
        <button type="button" onClick={() => login()} style={primaryBtn}>
          Sign in
        </button>
      </Card>
    )
  }

  if (status?.onboarded) {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
          <span style={{ fontWeight: 600 }}>Polymarket onboardato</span>
        </div>
        <Row label="Wallet">
          <code style={mono}>{status.funderAddress}</code>
        </Row>
        <Row label="Onboard date">
          <span>
            {status.onboardedAt ? new Date(status.onboardedAt).toLocaleString('it-IT') : '—'}
          </span>
        </Row>
        <Row label="Balance pUSD">
          {balance ? (
            <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              ${balance.pusd.toFixed(2)}
            </span>
          ) : (
            <Loader2 size={14} className="animate-spin" />
          )}
        </Row>
        {error && <ErrorBanner message={error} />}
      </Card>
    )
  }

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertCircle size={20} style={{ color: 'var(--color-warning)' }} />
        <span style={{ fontWeight: 600 }}>Onboarding Polymarket non completato</span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
        Per tradare REAL devi associare il tuo wallet al CLOB Polymarket V2. Cliccando firmerai un
        messaggio (off-chain, no gas, no spesa): Polymarket ti restituirà delle credenziali API
        legate al tuo wallet, che Auktora salva cifrate per inoltrare ordini per tuo conto. Il
        wallet resta tuo, le posizioni vanno direttamente on-chain su Polygon.
      </p>
      <button type="button" onClick={handleOnboard} disabled={busy} style={primaryBtn}>
        {busy ? (
          <>
            <Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />
            Onboarding…
          </>
        ) : (
          'Onboard Polymarket'
        )}
      </button>
      {error && <ErrorBanner message={error} />}
    </Card>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 20,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
      }}
    >
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 13,
        color: 'var(--color-text-secondary)',
      }}
    >
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      {children}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      style={{
        margin: 0,
        padding: '8px 10px',
        borderRadius: 6,
        background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
        border: '1px solid var(--color-danger)',
        fontSize: 12,
        color: 'var(--color-danger)',
      }}
    >
      {message}
    </p>
  )
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const mono: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: 11,
  background: 'var(--color-bg-tertiary)',
  padding: '2px 6px',
  borderRadius: 4,
}
