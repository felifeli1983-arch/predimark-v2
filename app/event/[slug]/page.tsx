import { notFound } from 'next/navigation'
import { fetchEventBySlug } from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'
import { EventPageShell } from '@/components/event/EventPageShell'

interface Params {
  slug: string
}

export const revalidate = 60

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const raw = await fetchEventBySlug(slug)
  if (!raw) notFound()

  const event = mapGammaEvent(raw)

  return <EventPageShell event={event} />
}
