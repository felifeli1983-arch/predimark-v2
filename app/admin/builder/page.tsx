'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { AlertTriangle, ExternalLink, Hammer, Loader2, RefreshCw } from 'lucide-react'

interface BuilderTradeRow {
  id: string
  tradeType: string
  takerOrderHash: string
  market: string
  side: 'BUY' | 'SELL'
  outcome: string
  outcomeIndex: number
  size: number
  sizeUsdc: number
  price: number
  owner: string
  feeUsdc: number
  transactionHash: string
  matchTime: string
  bucketIndex: number
  status: string
  errMsg: string | null
  createdAt: string | null
  updatedAt: string | null
}

interface BuilderStats {
  totalCount: number
  totalVolumeUsdc: number
  totalFeeUsdc: number
  uniqueTraders: number
  uniqueMarkets: number
}

interface ApiResponse {
  items: BuilderTradeRow[]
  meta: {
    nextCursor: string
    count: number
    limit: number
  }
  stats: BuilderStats
}

const POLYGONSCAN_TX = 'https://polygonscan.com/tx'
const POLYGONSCAN_ADDR = 'https://polygonscan.com/address'

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

function shortHex(s: string, len = 6): string {
  if (!s || s.length <= 2 + len * 2) return s
  return `${s.slice(0, 2 + len)}…${s.slice(-len)}`
}

/**
 * Aggregate stats client-side accumulando across pages caricate.
 * Doc Builder Methods → BuilderTradesPaginatedResponse: il `stats` API
 * copre solo la pagina corrente; per total cross-page accumuliamo qui.
 */
function aggregateLocal(trades: BuilderTradeRow[]): BuilderStats {
  const traders = new Set<string>()
  const markets = new Set<string>()
  let volume = 0
  let fee = 0
  for (const t of trades) {
    traders.add(t.owner)
    markets.add(t.market)
    volume += t.sizeUsdc
    fee += t.feeUsdc
  }
  return {
    totalCount: trades.length,
    totalVolumeUsdc: volume,
    totalFeeUsdc: fee,
    uniqueTraders: traders.size,
    uniqueMarkets: markets.size,
  }
}

export default function AdminBuilderPage() {
  const { getAccessToken } = usePrivy()
  const [allTrades, setAllTrades] = useState<BuilderTradeRow[]>([])
  const [nextCursor, setNextCursor] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const fetchPage = useCallback(
    async (cursor: string, append: boolean): Promise<void> => {
      try {
        if (append) setLoadingMore(true)
        else setLoading(true)
        setError(null)
        const token = await getAccessToken()
        if (!token) throw new Error('Sessione scaduta')
        const url = cursor
          ? `/api/v1/admin/builder/trades?before=${encodeURIComponent(cursor)}`
          : '/api/v1/admin/builder/trades'
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
          const body = (await res.json()) as { error?: { message?: string } }
          throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
        }
        const json = (await res.json()) as ApiResponse
        setAllTrades((prev) => (append ? [...prev, ...json.items] : json.items))
        setNextCursor(json.meta.nextCursor)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [getAccessToken]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPage('', false)
  }, [fetchPage, reloadKey])

  const stats = aggregateLocal(allTrades)
  const hasMore = nextCursor !== ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--font-2xl)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Hammer size={24} style={{ color: 'var(--color-cta)' }} />
            Builder Analytics
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Trade attribuiti al builder code Auktora — paginazione cursor-based
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          disabled={loading}
          aria-label="Reload"
          style={{
            padding: '8px 12px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)',
            cursor: loading ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
          }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Reload
        </button>
      </header>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: 'var(--font-sm)',
          }}
        >
          {error}
        </div>
      )}

      {loading && allTrades.length === 0 && <SkeletonStats />}

      {(allTrades.length > 0 || !loading) && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            <StatCard label="Total trades" value={stats.totalCount.toLocaleString('en-US')} />
            <StatCard
              label="Volume facilitato"
              value={formatUsd(stats.totalVolumeUsdc)}
              accent="var(--color-cta)"
            />
            <StatCard
              label="Fee earned"
              value={formatUsd(stats.totalFeeUsdc)}
              accent="var(--color-success)"
            />
            <StatCard label="Unique trader" value={String(stats.uniqueTraders)} />
            <StatCard label="Unique market" value={String(stats.uniqueMarkets)} />
          </div>

          <section>
            <h2
              style={{
                margin: '0 0 12px',
                fontSize: 'var(--font-md)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              Trades caricati ({allTrades.length})
            </h2>
            {allTrades.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  padding: 16,
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-sm)',
                  textAlign: 'center',
                }}
              >
                Nessun trade attribuito ancora — quando gli utenti tradono via Auktora appariranno
                qui.
              </p>
            ) : (
              <>
                <div
                  style={{
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 'var(--font-xs)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    <thead
                      style={{
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-muted)',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <tr>
                        <th style={cellHead}>Time</th>
                        <th style={cellHead}>Side</th>
                        <th style={cellHead}>Status</th>
                        <th style={cellHead}>Outcome</th>
                        <th style={cellHeadRight}>Size</th>
                        <th style={cellHeadRight}>Price</th>
                        <th style={cellHeadRight}>Volume</th>
                        <th style={cellHeadRight}>Fee</th>
                        <th style={cellHead}>Trader</th>
                        <th style={cellHead}>Tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTrades.map((t) => (
                        <TradeRow key={t.id} trade={t} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasMore && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      paddingTop: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => fetchPage(nextCursor, true)}
                      disabled={loadingMore}
                      style={{
                        padding: '10px 20px',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-secondary)',
                        cursor: loadingMore ? 'wait' : 'pointer',
                        fontSize: 'var(--font-sm)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {loadingMore && <Loader2 size={13} className="animate-spin" />}
                      Carica altri trade
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function TradeRow({ trade: t }: { trade: BuilderTradeRow }) {
  const hasError = t.errMsg !== null && t.errMsg !== ''
  const statusColor = hasError
    ? 'var(--color-danger)'
    : t.status === 'CONFIRMED'
      ? 'var(--color-success)'
      : t.status === 'FAILED'
        ? 'var(--color-danger)'
        : 'var(--color-text-muted)'
  return (
    <tr style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
      <td style={cell}>
        {t.matchTime
          ? new Date(t.matchTime).toLocaleString('it-IT', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—'}
      </td>
      <td style={cell}>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 'var(--radius-full)',
            background:
              t.side === 'BUY'
                ? 'color-mix(in srgb, var(--color-success) 18%, transparent)'
                : 'color-mix(in srgb, var(--color-danger) 18%, transparent)',
            color: t.side === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)',
            fontWeight: 700,
            fontSize: 9,
          }}
        >
          {t.side}
        </span>
      </td>
      <td style={cell}>
        <span
          title={t.errMsg ?? undefined}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: statusColor,
            fontWeight: 600,
            fontSize: 9,
            letterSpacing: '0.04em',
          }}
        >
          {hasError && <AlertTriangle size={9} />}
          {t.status || '—'}
        </span>
      </td>
      <td style={cell}>{t.outcome}</td>
      <td style={cellRight}>{t.size.toFixed(0)}</td>
      <td style={cellRight}>{(t.price * 100).toFixed(2)}¢</td>
      <td style={cellRight}>{formatUsd(t.sizeUsdc)}</td>
      <td
        style={{
          ...cellRight,
          color: t.feeUsdc > 0 ? 'var(--color-success)' : 'inherit',
        }}
      >
        {t.feeUsdc > 0 ? formatUsd(t.feeUsdc) : '—'}
      </td>
      <td style={cell}>
        <a
          href={`${POLYGONSCAN_ADDR}/${t.owner}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-cta)', textDecoration: 'none' }}
        >
          {shortHex(t.owner, 4)}
        </a>
      </td>
      <td style={cell}>
        {t.transactionHash && (
          <a
            href={`${POLYGONSCAN_TX}/${t.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {shortHex(t.transactionHash, 4)}
            <ExternalLink size={9} />
          </a>
        )}
      </td>
    </tr>
  )
}

const cellHead: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
}
const cellHeadRight: React.CSSProperties = { ...cellHead, textAlign: 'right' }
const cell: React.CSSProperties = {
  padding: '8px 12px',
  color: 'var(--color-text-secondary)',
}
const cellRight: React.CSSProperties = { ...cell, textAlign: 'right' }

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-xl)',
          fontWeight: 700,
          color: accent ?? 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </strong>
    </div>
  )
}

function SkeletonStats() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: 64,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      ))}
    </div>
  )
}
