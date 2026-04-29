'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useThemeStore } from '@/lib/stores/themeStore'
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react'

export default function ChooseModePage() {
  const { ready, authenticated } = usePrivy()
  const setIsDemo = useThemeStore((s) => s.setIsDemo)
  const router = useRouter()

  function handleChoose(mode: 'real' | 'demo') {
    setIsDemo(mode === 'demo')
    if (typeof window !== 'undefined') {
      localStorage.setItem('auktora.welcome-completed', '1')
    }
    router.push(mode === 'real' ? '/me/wallet' : '/')
  }

  if (!ready) return null
  if (!authenticated) {
    router.replace('/signup')
    return null
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 600,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        textAlign: 'center',
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 'var(--font-xl)',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
        }}
      >
        Auktora
      </Link>

      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Come vuoi iniziare?
        </h1>
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 'var(--font-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Puoi cambiare modalità in qualsiasi momento dal toggle in header.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <ModeCard
          mode="real"
          icon={<TrendingUp size={32} />}
          title="REAL"
          subtitle="Trade veri, soldi veri"
          description="Deposita USDC con Apple Pay/carta, esegui trade su Polymarket CLOB V2, le posizioni vanno on-chain Polygon."
          color="var(--color-cta)"
          bullets={['Custody on-chain', 'Fee 0% Y1', 'Withdraw quando vuoi']}
          onClick={() => handleChoose('real')}
        />
        <ModeCard
          mode="demo"
          icon={<Sparkles size={32} />}
          title="DEMO"
          subtitle="$10.000 virtuali"
          description="Trade simulati con prezzi live Polymarket. Zero rischio, perfetto per imparare il flow."
          color="var(--color-warning)"
          bullets={['Zero soldi', 'Stessi mercati', 'Switch quando vuoi']}
          onClick={() => handleChoose('demo')}
        />
      </div>

      <button
        type="button"
        onClick={() => router.push('/')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-sm)',
          cursor: 'pointer',
          padding: 'var(--space-2)',
        }}
      >
        Decido dopo
      </button>
    </div>
  )
}

function ModeCard({
  mode,
  icon,
  title,
  subtitle,
  description,
  color,
  bullets,
  onClick,
}: {
  mode: 'real' | 'demo'
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  color: string
  bullets: string[]
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Inizia in modalità ${title}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
        background: 'var(--color-bg-secondary)',
        border: `2px solid ${color}`,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      data-mode={mode}
    >
      <div style={{ color }}>{icon}</div>
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--font-xl)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: 'var(--font-sm)',
            color,
            fontWeight: 600,
          }}
        >
          {subtitle}
        </p>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {bullets.map((b, i) => (
          <li
            key={i}
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ color, fontWeight: 700 }}>✓</span>
            {b}
          </li>
        ))}
      </ul>
      <div
        style={{
          marginTop: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color,
          fontSize: 'var(--font-sm)',
          fontWeight: 700,
        }}
      >
        Inizia in {title} <ArrowRight size={14} />
      </div>
    </button>
  )
}
