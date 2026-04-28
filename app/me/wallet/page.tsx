import { OnboardCard } from '@/components/wallet/OnboardCard'

export default function WalletPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <header>
        <h1
          style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}
        >
          Wallet & Trading REAL
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
          Auktora usa il tuo wallet (creato al signup oppure connesso esternamente) per tradare REAL
          su Polymarket V2. Qui colleghi il wallet al CLOB e gestisci il balance pUSD on-chain.
        </p>
      </header>
      <OnboardCard />
    </div>
  )
}
