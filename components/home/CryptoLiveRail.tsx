'use client'

import { useCryptoLivePrice } from '@/lib/ws/hooks/useCryptoLivePrice'

const COINS: Array<{ symbol: string; label: string }> = [
  { symbol: 'btcusdt', label: 'BTC' },
  { symbol: 'ethusdt', label: 'ETH' },
  { symbol: 'solusdt', label: 'SOL' },
  { symbol: 'xrpusdt', label: 'XRP' },
  { symbol: 'dogeusdt', label: 'DOGE' },
  { symbol: 'bnbusdt', label: 'BNB' },
]

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (p >= 1) return `$${p.toFixed(2)}`
  return `$${p.toFixed(4)}`
}

function CoinTile({ symbol, label }: { symbol: string; label: string }) {
  const { price, change24h } = useCryptoLivePrice(symbol, 'binance')
  const isUp = change24h !== null && change24h >= 0
  const changeColor =
    change24h === null
      ? 'var(--color-text-muted)'
      : isUp
        ? 'var(--color-success)'
        : 'var(--color-danger)'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 8px',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 6,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {price !== null ? formatPrice(price) : '—'}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: changeColor,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {change24h !== null ? `${isUp ? '+' : ''}${change24h.toFixed(2)}%` : '—'}
      </div>
    </div>
  )
}

export function CryptoLiveRail() {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <h3
        style={{
          margin: '0 0 10px',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Hot Crypto
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
        }}
      >
        {COINS.map((c) => (
          <CoinTile key={c.symbol} symbol={c.symbol} label={c.label} />
        ))}
      </div>
    </section>
  )
}
