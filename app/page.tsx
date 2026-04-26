export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      <div className="text-center">
        <h1
          className="font-bold mb-2"
          style={{
            color: 'var(--color-cta)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Auktora
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
          Prediction markets, simplified.
        </p>
      </div>

      <div className="flex gap-3">
        {[
          {
            label: 'Next.js ✓',
            bg: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: 'var(--color-success)',
          },
          {
            label: 'Tailwind 4 ✓',
            bg: 'var(--color-cta-bg)',
            color: 'var(--color-cta)',
            border: 'var(--color-cta)',
          },
          {
            label: 'TypeScript ✓',
            bg: '#a855f715',
            color: 'var(--color-cat-culture)',
            border: 'var(--color-cat-culture)',
          },
        ].map(({ label, bg, color, border }) => (
          <span
            key={label}
            className="px-3 py-1 font-medium"
            style={{
              background: bg,
              color,
              border: `1px solid ${border}`,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <a
        href="/test-design-system"
        style={{
          color: 'var(--color-cta)',
          fontSize: 'var(--text-sm)',
        }}
      >
        → Apri test design system
      </a>
    </main>
  )
}
