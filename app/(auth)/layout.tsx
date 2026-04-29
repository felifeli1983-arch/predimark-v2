export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        background: 'var(--color-bg-primary)',
      }}
    >
      {children}
    </div>
  )
}
