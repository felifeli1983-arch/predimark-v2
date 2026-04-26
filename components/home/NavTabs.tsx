'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Tab {
  slug: string
  label: string
  isLive?: boolean
}

const TABS: Tab[] = [
  { slug: 'live', label: 'LIVE', isLive: true },
  { slug: 'all', label: 'All' },
  { slug: 'for-you', label: 'For You' },
  { slug: 'politics', label: 'Politics' },
  { slug: 'sports', label: 'Sports' },
  { slug: 'crypto', label: 'Crypto' },
  { slug: 'esports', label: 'Esports' },
  { slug: 'mentions', label: 'Mentions' },
  { slug: 'creators', label: 'Creators' },
  { slug: 'pop-culture', label: 'Pop Culture' },
  { slug: 'business', label: 'Business' },
  { slug: 'science', label: 'Science' },
  { slug: 'geopolitics', label: 'Geopolitics' },
]

export function NavTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') ?? 'all'

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') params.delete('category')
    else params.set('category', slug)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <nav
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-primary)',
      }}
    >
      {/* Container interno allineato all'Header (maxWidth 1440 + margin auto). */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          padding: '8px 16px',
          maxWidth: 1440,
          margin: '0 auto',
          scrollbarWidth: 'none',
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.slug === active
          return (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setCategory(tab.slug)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
                background: isActive ? 'var(--color-cta-bg)' : 'transparent',
                color: isActive
                  ? 'var(--color-cta)'
                  : tab.isLive
                    ? 'var(--color-danger)'
                    : 'var(--color-text-secondary)',
                border: isActive
                  ? '1px solid var(--color-cta)'
                  : '1px solid var(--color-border-subtle)',
                transition: 'background 150ms, color 150ms',
              }}
            >
              {tab.isLive && (
                <span
                  className="live-dot"
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--color-danger)',
                  }}
                />
              )}
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
