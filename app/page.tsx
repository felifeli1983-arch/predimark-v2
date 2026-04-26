import { fetchFeaturedEvents } from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'
import { EventCard } from '@/components/markets/EventCard'

export default async function HomePage() {
  const rawEvents = await fetchFeaturedEvents(12)
  const events = rawEvents.map(mapGammaEvent)

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1
        style={{
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        Markets
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
