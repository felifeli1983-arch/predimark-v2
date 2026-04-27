'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'

const FOOTER_LINKS = [
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/help', label: 'Support' },
  { href: '/about', label: 'About' },
]

const linkStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  transition: 'color 150ms',
}

const langButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: '6px',
  padding: '4px 10px',
  cursor: 'not-allowed',
  opacity: 0.7,
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="hidden md:block"
      style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border-subtle)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--layout-max-width)',
          margin: '0 auto',
          padding: '20px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <nav
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={linkStyle}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            disabled
            title="Language switch coming soon"
            aria-label="Language: English"
            style={langButtonStyle}
          >
            <Globe size={12} />
            EN
          </button>
        </div>

        <p
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Auktora is not a licensed broker. Prediction markets involve risk.
        </p>

        <p
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          © {year} Auktora. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
