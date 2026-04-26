import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { HeroCard } from './HeroCard'

interface Props {
  events: AuktoraEvent[]
}

/**
 * Hero zone:
 * - Desktop: layout 60% / 40% — 1 hero big + 2 hero small impilati
 * - Mobile: stack verticale
 */
export function HeroZone({ events }: Props) {
  if (events.length === 0) return null
  const [big, ...rest] = events
  const smalls = rest.slice(0, 2)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 12,
        padding: '12px 16px',
      }}
      className="md:grid-cols-2"
    >
      {big && <HeroCard event={big} size="big" />}
      {smalls.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {smalls.map((event) => (
            <HeroCard key={event.id} event={event} size="small" />
          ))}
        </div>
      )}
    </div>
  )
}
