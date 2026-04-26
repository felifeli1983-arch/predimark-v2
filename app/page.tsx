export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-brand-primary)' }}>
          Predimark V2
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Prediction markets, simplified.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-300">
          Next.js ✓
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-300">
          Tailwind 4 ✓
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-900 text-purple-300">
          TypeScript ✓
        </span>
      </div>

      <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
        Sprint 1.1.2 completato — stack base operativo
      </p>
    </main>
  )
}
