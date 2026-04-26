export default function TestDesignSystem() {
  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1
        className="text-4xl font-bold mb-2"
        style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-4xl)' }}
      >
        Design System
      </h1>
      <p
        className="mb-12"
        style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}
      >
        Predimark V2 — Sprint 1.1.3
      </p>

      {/* PALETTE */}
      <section className="mb-12">
        <h2
          className="mb-4 font-semibold"
          style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)' }}
        >
          Colors
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'bg-primary', bg: 'var(--color-bg-primary)', border: true },
            { label: 'bg-secondary', bg: 'var(--color-bg-secondary)' },
            { label: 'bg-tertiary', bg: 'var(--color-bg-tertiary)' },
            { label: 'bg-elevated', bg: 'var(--color-bg-elevated)' },
            { label: 'success', bg: 'var(--color-success)' },
            { label: 'danger', bg: 'var(--color-danger)' },
            { label: 'cta', bg: 'var(--color-cta)' },
            { label: 'live', bg: 'var(--color-live)' },
            { label: 'hot', bg: 'var(--color-hot)' },
            { label: 'info', bg: 'var(--color-info)' },
            { label: 'warning', bg: 'var(--color-warning)' },
          ].map(({ label, bg, border }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="w-14 h-14 rounded-lg"
                style={{
                  background: bg,
                  border: border ? '1px solid var(--color-border-strong)' : undefined,
                }}
              />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY COLORS */}
      <section className="mb-12">
        <h2
          className="mb-4 font-semibold"
          style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)' }}
        >
          Category Colors
        </h2>
        <div className="flex flex-wrap gap-2">
          {['sport', 'politics', 'crypto', 'culture', 'news', 'geopolitics', 'economy', 'tech'].map(
            (cat) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-white font-medium"
                style={{
                  background: `var(--color-cat-${cat})`,
                  fontSize: 'var(--text-sm)',
                }}
              >
                {cat}
              </span>
            )
          )}
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="mb-12">
        <h2
          className="mb-4 font-semibold"
          style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)' }}
        >
          Typography
        </h2>
        <div className="space-y-2">
          {[
            { label: 'text-6xl / 60px', size: 'var(--text-6xl)', weight: 700 },
            { label: 'text-5xl / 48px', size: 'var(--text-5xl)', weight: 700 },
            { label: 'text-4xl / 36px', size: 'var(--text-4xl)', weight: 700 },
            { label: 'text-3xl / 30px', size: 'var(--text-3xl)', weight: 700 },
            { label: 'text-2xl / 24px', size: 'var(--text-2xl)', weight: 600 },
            { label: 'text-xl / 20px', size: 'var(--text-xl)', weight: 600 },
            { label: 'text-lg / 17px', size: 'var(--text-lg)', weight: 400 },
            { label: 'text-base / 15px (default)', size: 'var(--text-base)', weight: 400 },
            { label: 'text-sm / 13px', size: 'var(--text-sm)', weight: 400 },
            { label: 'text-xs / 11px', size: 'var(--text-xs)', weight: 400 },
          ].map(({ label, size, weight }) => (
            <div
              key={label}
              style={{ fontSize: size, fontWeight: weight, color: 'var(--color-text-primary)' }}
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* BORDER RADIUS */}
      <section className="mb-12">
        <h2
          className="mb-4 font-semibold"
          style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)' }}
        >
          Border Radius
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          {[
            { label: 'xs / 2px', r: 'var(--radius-xs)' },
            { label: 'sm / 4px', r: 'var(--radius-sm)' },
            { label: 'default / 8px', r: 'var(--radius)' },
            { label: 'md / 12px', r: 'var(--radius-md)' },
            { label: 'lg / 16px', r: 'var(--radius-lg)' },
            { label: 'xl / 24px', r: 'var(--radius-xl)' },
            { label: 'full', r: 'var(--radius-full)' },
          ].map(({ label, r }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14"
                style={{
                  borderRadius: r,
                  background: 'var(--color-cta)',
                }}
              />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ANIMATIONS */}
      <section className="mb-12">
        <h2
          className="mb-4 font-semibold"
          style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)' }}
        >
          Animations
        </h2>
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className="live-dot w-3 h-3 rounded-full"
              style={{ background: 'var(--color-live)' }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
              live-dot
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="skeleton w-32 h-4 rounded" />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
              skeleton
            </span>
          </div>
        </div>
      </section>

      {/* SEMANTIC BADGES */}
      <section className="mb-12">
        <h2
          className="mb-4 font-semibold"
          style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)' }}
        >
          Semantic Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: 'Success',
              bg: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              border: 'var(--color-success)',
            },
            {
              label: 'Danger',
              bg: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: 'var(--color-danger)',
            },
            {
              label: 'CTA',
              bg: 'var(--color-cta-bg)',
              color: 'var(--color-cta)',
              border: 'var(--color-cta)',
            },
            {
              label: 'Warning',
              bg: 'var(--color-warning-bg)',
              color: 'var(--color-warning)',
              border: 'var(--color-warning)',
            },
          ].map(({ label, bg, color, border }) => (
            <span
              key={label}
              className="px-3 py-1 font-medium"
              style={{
                background: bg,
                color,
                border: `1px solid ${border}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
        Nota: per verificare light mode, usa DevTools → Rendering → Emulate CSS media →
        prefers-color-scheme: light
      </p>
    </main>
  )
}
