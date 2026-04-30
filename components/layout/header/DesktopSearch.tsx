'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Search, X } from 'lucide-react'

import { publicSearch, type PublicSearchResult } from '@/lib/polymarket/queries'

const DEBOUNCE_MS = 250
const MIN_QUERY_CHARS = 2

/**
 * Search bar live nel header — Polymarket Gamma `/public-search`
 * cross-entity (events + profili). Debounced 250ms, dropdown con
 * thumbnail + categoria. Click su evento naviga a /event/[slug].
 *
 * Sostituisce il vecchio placeholder statico, sfrutta il nuovo
 * `publicSearch()` wrapper che serve anche profili user.
 */
export function DesktopSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_CHARS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(null)
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await publicSearch(query, 8)
        setResults(data)
      } catch {
        setResults({ events: [] })
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  const hasResults =
    results &&
    ((results.events?.length ?? 0) > 0 || (results.profiles?.length ?? 0) > 0)

  return (
    <div
      ref={containerRef}
      className="hidden md:flex"
      style={{
        flex: 1,
        minWidth: 0,
        maxWidth: 'var(--layout-sidebar-width)',
        marginLeft: 'auto',
        position: 'relative',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 8,
          padding: '6px 12px',
        }}
      >
        <Search size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search markets, events, traders…"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: 'var(--color-text-primary)',
            minWidth: 0,
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults(null)
            }}
            aria-label="Cancella"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={12} />
          </button>
        )}
      </form>

      {open && query.trim().length >= MIN_QUERY_CHARS && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            maxHeight: 480,
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          {loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: 12,
                color: 'var(--color-text-muted)',
                fontSize: 13,
              }}
            >
              <Loader2 size={12} className="animate-spin" /> Ricerca…
            </div>
          )}
          {!loading && !hasResults && (
            <div
              style={{
                padding: 12,
                color: 'var(--color-text-muted)',
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              Nessun risultato per &quot;{query}&quot;
            </div>
          )}
          {!loading && results?.events && results.events.length > 0 && (
            <div>
              <SectionLabel>Mercati</SectionLabel>
              {results.events.slice(0, 8).map((ev) => (
                <Link
                  key={ev.id}
                  href={`/event/${ev.slug}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}
                >
                  {ev.image && (
                    <Image
                      src={ev.image}
                      alt=""
                      width={28}
                      height={28}
                      style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ev.title}
                    </div>
                    {ev.tags && ev.tags.length > 0 && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--color-text-muted)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {ev.tags
                          .slice(0, 2)
                          .map((t) => t.label)
                          .join(' · ')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!loading && results?.profiles && results.profiles.length > 0 && (
            <div>
              <SectionLabel>Trader</SectionLabel>
              {results.profiles.slice(0, 5).map((p) => (
                <a
                  key={p.proxyWallet}
                  href={`https://polymarket.com/profile/${p.proxyWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--color-bg-tertiary)',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {p.profileImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profileImage}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.name || p.pseudonym}
                      </span>
                      {p.verified && <CheckCircle2 size={11} style={{ color: 'var(--color-cta)' }} />}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '6px 12px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      {children}
    </div>
  )
}
