/**
 * Auth pages (signup, login, choose-mode, welcome) usano Privy hooks
 * (useLogin/useWallets/usePrivy) che richiedono il PrivyProvider mounted.
 * Durante CI build con stub envs, il PrivyProvider va in passthrough
 * (no provider context) → hooks crashano con "useWallets was called
 * outside the PrivyProvider component".
 *
 * Marca tutto il gruppo come dynamic = no prerender SSG, render solo on-demand
 * server-side dove gli env veri sono presenti (Vercel deploy).
 */
export const dynamic = 'force-dynamic'

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
