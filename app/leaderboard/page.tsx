import { LeaderboardView } from '@/components/leaderboard/LeaderboardView'

export const metadata = {
  title: 'Leaderboard',
  description: 'Top trader e Verified Creator su Auktora',
}

interface Props {
  searchParams: Promise<{ tab?: string; period?: string }>
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const params = await searchParams
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Leaderboard
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Top trader Polymarket + Verified Creator Auktora. Click su un nome per vedere il profilo.
        </p>
      </header>
      <LeaderboardView initialTab={params.tab} initialPeriod={params.period} />
    </div>
  )
}
