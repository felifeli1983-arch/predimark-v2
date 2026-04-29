import { notFound } from 'next/navigation'
import { fetchEventBySlug } from '@/lib/polymarket/queries'
import { mapGammaEvent, type AuktoraEvent } from '@/lib/polymarket/mappers'
import { EventPageShell } from '@/components/event/EventPageShell'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveOrUpsertMarket } from '@/lib/markets/upsert'

interface Params {
  slug: string
}

export const revalidate = 60

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const raw = await fetchEventBySlug(slug)
  if (!raw) notFound()

  const event = mapGammaEvent(raw)

  // Fire-and-forget: popola la tabella `markets` locale così il cron
  // sync-price-history può iniziare a registrare prezzi per questo evento.
  // Non bloccante: errori vengono ignorati silenziosamente.
  void seedMarketsFromEvent(event)

  return <EventPageShell event={event} />
}

async function seedMarketsFromEvent(event: AuktoraEvent): Promise<void> {
  try {
    const supabase = createAdminClient()
    await Promise.allSettled(
      event.markets.map((m) =>
        resolveOrUpsertMarket(supabase, {
          polymarketMarketId: m.id,
          polymarketEventId: event.id,
          slug: m.slug,
          title: m.question,
          cardKind: event.kind,
          category: event.tags[0] ?? 'general',
          image: event.image,
          currentYesPrice: m.yesPrice,
          clobTokenIds: m.clobTokenIds,
          isActive: m.active && !m.closed,
        })
      )
    )
  } catch {
    // silenzioso — non deve bloccare la pagina
  }
}
