'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { FollowButton } from '@/components/creator/FollowButton'

type Tab = 'creators' | 'external' | 'both'
type Period = 'today' | '7d' | '30d' | 'all'

interface CreatorItem {
  kind: 'creator'
  user_id: string
  score?: number | null
  tier?: string | null
  followers_count?: number | null
  total_earnings?: number | null
  bio_creator?: string | null
  twitter_handle?: string | null
  specialization?: string[] | null
}

interface ExternalItem {
  kind: 'external'
  id: string
  wallet_address: string
  polymarket_nickname?: string | null
  polymarket_pnl_total?: number | null
  polymarket_volume_total?: number | null
  win_rate?: number | null
  trades_count?: number | null
  rank_today?: number | null
  rank_7d?: number | null
  rank_30d?: number | null
  rank_all_time?: number | null
}

type Item = CreatorItem | ExternalItem

interface Props {
  initialTab?: string
  initialPeriod?: string
}

export function LeaderboardView({ initialTab, initialPeriod }: Props) {
  const [tab, setTab] = useState<Tab>(
    initialTab === 'creators' || initialTab === 'external' ? initialTab : 'both'
  )
  const [period, setPeriod] = useState<Period>(
    initialPeriod === 'today' || initialPeriod === '7d' || initialPeriod === 'all'
      ? initialPeriod
      : '30d'
  )
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fetch(`/api/v1/leaderboard?tab=${tab}&period=${period}&limit=50`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ items: Item[] }>
      })
      .then((data) => {
        if (cancelled) return
        setItems(data.items)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Errore caricamento')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tab, period])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <TabPill label="Tutti" active={tab === 'both'} onClick={() => setTab('both')} />
        <TabPill
          label="Verified Creators"
          active={tab === 'creators'}
          onClick={() => setTab('creators')}
        />
        <TabPill
          label="Top Polymarket Traders"
          active={tab === 'external'}
          onClick={() => setTab('external')}
        />
        <div style={{ flex: 1 }} />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          style={selectStyle}
          aria-label="Periodo"
        >
          <option value="today">Oggi</option>
          <option value="7d">7 giorni</option>
          <option value="30d">30 giorni</option>
          <option value="all">All-time</option>
        </select>
      </div>

      {loading ? (
        <div style={emptyStyle}>
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      ) : error ? (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-base)' }}>{error}</p>
      ) : items.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>
            Nessun trader nella categoria selezionata.
          </p>
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {items.map((item, idx) => (
            <li key={item.kind === 'creator' ? item.user_id : item.id}>
              {item.kind === 'creator' ? (
                <CreatorRow rank={idx + 1} item={item} />
              ) : (
                <ExternalRow rank={idx + 1} item={item} period={period} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CreatorRow({ rank, item }: { rank: number; item: CreatorItem }) {
  return (
    <Link href={`/creator/${item.user_id}`} style={rowLinkStyle}>
      <RankBadge n={rank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <strong style={nameStyle}>
            {item.twitter_handle ? `@${item.twitter_handle}` : item.user_id.slice(0, 8)}
          </strong>
          <span style={tierBadge}>VERIFIED CREATOR</span>
          {item.tier && <span style={tierBadge}>{item.tier.toUpperCase()}</span>}
        </div>
        {item.bio_creator && (
          <p style={subtitleStyle}>
            {item.bio_creator.slice(0, 80)}
            {item.bio_creator.length > 80 ? '…' : ''}
          </p>
        )}
      </div>
      <div style={statsCol}>
        <Stat label="Followers" value={item.followers_count ?? 0} />
        <Stat
          label="Earnings"
          value={`$${(item.total_earnings ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        />
      </div>
      <FollowButton targetType="creator" targetId={item.user_id} />
    </Link>
  )
}

function ExternalRow({ rank, item, period }: { rank: number; item: ExternalItem; period: Period }) {
  const rankFromData =
    period === 'today'
      ? item.rank_today
      : period === '7d'
        ? item.rank_7d
        : period === '30d'
          ? item.rank_30d
          : item.rank_all_time
  return (
    <Link href={`/trader/${item.id}`} style={rowLinkStyle}>
      <RankBadge n={rankFromData ?? rank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <strong style={nameStyle}>
            {item.polymarket_nickname ??
              `${item.wallet_address.slice(0, 6)}…${item.wallet_address.slice(-4)}`}
          </strong>
          <span style={externalBadge}>POLYMARKET</span>
        </div>
        <p style={subtitleStyle}>
          {item.win_rate != null ? `${(item.win_rate * 100).toFixed(0)}% win-rate` : '—'} ·{' '}
          {item.trades_count ?? 0} trade
        </p>
      </div>
      <div style={statsCol}>
        <Stat
          label="P&L"
          value={`$${(item.polymarket_pnl_total ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        />
        <Stat
          label="Volume"
          value={`$${(item.polymarket_volume_total ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        />
      </div>
      <FollowButton targetType="external" targetId={item.id} />
    </Link>
  )
}

function RankBadge({ n }: { n: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-full)',
        background: n <= 3 ? 'var(--color-warning-bg)' : 'var(--color-bg-tertiary)',
        color: n <= 3 ? 'var(--color-warning)' : 'var(--color-text-secondary)',
        fontWeight: 700,
        fontSize: 'var(--font-sm)',
        flexShrink: 0,
      }}
    >
      {n}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}

function TabPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 'var(--space-1) var(--space-3)',
        background: active ? 'var(--color-cta)' : 'var(--color-bg-tertiary)',
        color: active ? '#fff' : 'var(--color-text-secondary)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-sm)',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

const rowLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  padding: 'var(--space-3)',
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  textDecoration: 'none',
}

const nameStyle: React.CSSProperties = {
  fontSize: 'var(--font-md)',
  color: 'var(--color-text-primary)',
  fontWeight: 600,
}

const subtitleStyle: React.CSSProperties = {
  margin: '2px 0 0',
  fontSize: 'var(--font-xs)',
  color: 'var(--color-text-muted)',
  lineHeight: 1.3,
}

const tierBadge: React.CSSProperties = {
  fontSize: 9,
  padding: '2px 6px',
  background: 'color-mix(in srgb, var(--color-cta) 16%, transparent)',
  color: 'var(--color-cta)',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 700,
  letterSpacing: '0.06em',
}

const externalBadge: React.CSSProperties = {
  fontSize: 9,
  padding: '2px 6px',
  background: 'color-mix(in srgb, var(--color-warning) 16%, transparent)',
  color: 'var(--color-warning)',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 700,
  letterSpacing: '0.06em',
}

const statsCol: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  alignItems: 'center',
}

const selectStyle: React.CSSProperties = {
  padding: 'var(--space-1) var(--space-2)',
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-sm)',
  cursor: 'pointer',
}

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-6)',
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
}
