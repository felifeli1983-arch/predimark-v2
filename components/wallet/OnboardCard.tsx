'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { ClobClient, Chain } from '@polymarket/clob-client-v2'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { polygon } from 'viem/chains'
import { CheckCircle2, AlertCircle, Loader2, Wallet as WalletIcon } from 'lucide-react'
import { FundActionsRow } from '@/components/funding/FundActionsRow'

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
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-base)' }}>
          Verifica stato…
        </span>
      </Card>
    )
  }

  if (!authenticated) {
    return (
      <Card>
        <WalletIcon size={28} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
        <p
          style={{ margin: 0, fontSize: 'var(--font-base)', color: 'var(--color-text-secondary)' }}
        >
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
          <code style={mono} title={status.funderAddress ?? undefined}>
            {status.funderAddress
              ? `${status.funderAddress.slice(0, 6)}…${status.funderAddress.slice(-4)}`
              : '—'}
          </code>
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

        {status.funderAddress && (
          <FundActionsRow
            address={status.funderAddress}
            pusdBalance={balance?.pusd ?? 0}
            onSuccess={refresh}
          />
        )}

        <WrapPusdSection onSuccess={refresh} />

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
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
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
        borderRadius: 'var(--radius-lg)',
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
        fontSize: 'var(--font-base)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      {children}
    </div>
  )
}

function WrapPusdSection({ onSuccess }: { onSuccess: () => void | Promise<void> }) {
  const { wallets } = useWallets()
  const [amount, setAmount] = useState('100')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleWrap() {
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      const num = Number(amount)
      if (!Number.isFinite(num) || num <= 0) throw new Error('Importo non valido')

      const embedded = getEmbeddedConnectedWallet(wallets)
      if (!embedded) throw new Error('Wallet embedded non trovato')

      const provider = await embedded.getEthereumProvider()
      const walletClient = createWalletClient({
        account: embedded.address as `0x${string}`,
        chain: polygon,
        transport: custom(provider),
      })

      const { wrapPusdHelper } = await import('@/lib/polymarket/pusd-wrap').then((m) => ({
        wrapPusdHelper: m.wrapUsdcToPusd,
      }))
      const res = await wrapPusdHelper({
        signer: walletClient,
        funderAddress: embedded.address as `0x${string}`,
        amountUsdc: num,
      })
      setSuccess(`Wrap completato — tx ${res.wrapTxHash.slice(0, 10)}…`)
      await onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore wrap')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        marginTop: 4,
        paddingTop: 12,
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}
      >
        Wrap USDC.e → pUSD per tradare REAL. Richiede MATIC per gas (~$0.02). L&apos;approve è una
        tantum.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={busy}
          placeholder="USDC.e da wrappare"
          style={{
            flex: 1,
            padding: '8px 10px',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-base)',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        <button
          type="button"
          onClick={handleWrap}
          disabled={busy}
          style={{
            ...primaryBtn,
            padding: '8px 14px',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : 'Wrap'}
        </button>
      </div>
      {error && <ErrorBanner message={error} />}
      {success && (
        <p
          style={{
            margin: 0,
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
            border: '1px solid var(--color-success)',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-success)',
          }}
        >
          {success}
        </p>
      )}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      style={{
        margin: 0,
        padding: '8px 10px',
        borderRadius: 'var(--radius-md)',
        background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
        border: '1px solid var(--color-danger)',
        fontSize: 'var(--font-sm)',
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
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-base)',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const mono: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: 'var(--font-xs)',
  background: 'var(--color-bg-tertiary)',
  padding: '2px 6px',
  borderRadius: 'var(--radius-sm)',
}
