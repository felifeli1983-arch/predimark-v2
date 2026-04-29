'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search as SearchIcon, Loader2 } from 'lucide-react'

interface MarketResult {
  id: string
  slug: string
  question: string
  volume: number
  active: boolean
  closed: boolean
  endDate?: string
}

export default function SearchPage() {
  const router = useRouter()
  const params = useSearchParams()
  const initialQ = params.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [results, setResults] = useState<MarketResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        // Search direct via Polymarket Gamma API (markets are live there, not in Supabase)
        const res = await fetch(
          `https://gamma-api.polymarket.com/events?search=${encodeURIComponent(query)}&limit=20&active=true`
        )
        if (!res.ok) return
        const data = (await res.json()) as MarketResult[]
        if (!cancelled) setResults(Array.isArray(data) ? data : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <SearchIcon size={20} style={{ display: 'inline', marginRight: 8 }} />
          Cerca mercati
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Cerca tra tutti i mercati Polymarket attivi.
        </p>
      </header>

      <form onSubmit={submit} style={{ position: 'relative' }}>
        <SearchIcon
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }}
        />
        <input
          type="text"
          autoFocus
          placeholder="Es: trump, bitcoin, election..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-md)',
          }}
        />
      </form>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      )}

      {!loading && query.length >= 3 && results.length === 0 && (
        <div
          style={{
            padding: 'var(--space-4)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-sm)',
          }}
        >
          Nessun mercato trovato per &quot;{query}&quot;.
        </div>
      )}

      {!loading && results.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {results.map((m) => (
            <li key={m.id}>
              <Link
                href={`/event/${m.slug}`}
                style={{
                  display: 'block',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                }}
              >
                <strong style={{ fontSize: 'var(--font-md)' }}>{m.question}</strong>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 'var(--font-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Volume: $
                  {Number(m.volume ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  {' · '}
                  {m.closed ? 'Chiuso' : m.active ? 'Attivo' : 'Inattivo'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
