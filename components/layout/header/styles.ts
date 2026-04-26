import type { CSSProperties } from 'react'

export const HEADER_OUTER: CSSProperties = {
  flexShrink: 0,
  background: 'var(--color-bg-primary)',
  borderBottom: '1px solid var(--color-border-subtle)',
  zIndex: 50,
  position: 'relative',
}

export const HEADER_INNER: CSSProperties = {
  maxWidth: '1440px',
  margin: '0 auto',
  padding: '0 16px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

export const HAMBURGER: CSSProperties = {
  flexShrink: 0,
  color: 'var(--color-text-secondary)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '6px',
  alignItems: 'center',
}

export const LOGO: CSSProperties = {
  flexShrink: 0,
  fontWeight: 700,
  fontSize: '17px',
  color: 'var(--color-text-primary)',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
}
