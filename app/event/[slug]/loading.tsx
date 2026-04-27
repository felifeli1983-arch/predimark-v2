export default function EventPageLoading() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]"
      style={{
        gap: 12,
        maxWidth: 1440,
        margin: '0 auto',
        padding: '0 0 24px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px 16px 0',
          minWidth: 0,
        }}
      >
        <Skeleton height={20} width={260} />
        <Skeleton height={120} />
        <Skeleton height={200} />
        <Skeleton height={180} />
        <Skeleton height={240} />
      </div>
      <div
        className="hidden md:flex"
        style={{ flexDirection: 'column', gap: 12, padding: '12px 16px 0 0' }}
      >
        <Skeleton height={360} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
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
