export default function EventPageLoading() {
  return (
    <div className="page-grid">
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px var(--layout-padding-x) 0',
          minWidth: 0,
        }}
      >
        <Skeleton height={20} width={260} />
        <Skeleton height={120} />
        <Skeleton height={200} />
        <Skeleton height={180} />
        <Skeleton height={240} />
      </main>
      <aside
        className="hidden md:flex"
        style={{
          flexDirection: 'column',
          gap: 12,
          padding: '12px var(--layout-padding-x) 0 0',
        }}
      >
        <Skeleton height={360} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </aside>
    </div>
  )
}

function Skeleton({ height, width }: { height: number; width?: number }) {
  return (
    <div
      style={{
        height,
        width: width ?? '100%',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 10,
      }}
    />
  )
}
