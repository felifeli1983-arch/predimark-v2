import { OnboardCard } from '@/components/wallet/OnboardCard'

export default function WalletPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <header>
        <h1
          style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}
        >
          Polymarket Onboarding
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
          Per fare trade REAL su Polymarket V2 devi prima derivare le tue credenziali API firmando
          un messaggio col tuo wallet, poi convertire USDC.e in pUSD (collateral V2).
        </p>
      </header>
      <OnboardCard />
    </div>
  )
}
