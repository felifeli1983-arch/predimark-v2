'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { AuktoraEvent, AuktoraMarket } from '@/lib/polymarket/mappers'
import { tradeWidgetActions } from '@/lib/stores/useTradeWidget'

interface Props {
  event: AuktoraEvent
}

/**
 * Boot helper per la event page: legge `?market=X&side=Y` da URL,
 * pre-compila il TradeWidget store, apre la sheet su mobile.
 *
 * One-shot: dopo il pre-fill cancella i query param via replaceState
 * (evita ri-trigger su navigazione client-side).
 */
export function EventTradeBoot({ event }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const consumed = useRef(false)

  useEffect(() => {
    if (consumed.current) return
    const marketId = searchParams.get('market')
    const side = searchParams.get('side')

    // Caso 1: deeplink esplicito ?market=X&side=Y dalla home → pre-fill + open sheet
    if (marketId && side) {
      const market = event.markets.find((m) => m.id === marketId)
      if (!market) return
      const draft = buildDraft(event, market, side)
      if (!draft) return
      consumed.current = true
      tradeWidgetActions.setDraft(draft)
      tradeWidgetActions.open()
      // Pulisce URL preservando pathname
      const params = new URLSearchParams(searchParams.toString())
      params.delete('market')
      params.delete('side')
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      return
    }

    // Caso 2: landing diretto su event page senza query → auto-prefill desktop
    // con primo market e Yes/Up/primo outcome. Il sheet mobile resta CHIUSO
    // (l'utente decide quando tradare); su desktop il widget è in sidebar
    // sempre visibile, quindi vedrà già il draft pre-compilato.
    const firstMarket = event.markets[0]
    if (!firstMarket) return
    const defaultSide = pickDefaultSide(firstMarket)
    if (!defaultSide) return
    const draft = buildDraft(event, firstMarket, defaultSide)
    if (!draft) return
    consumed.current = true
    tradeWidgetActions.setDraft(draft)
    // Niente .open() qui — non vogliamo aprire il sheet mobile auto
  }, [event, searchParams, router, pathname])

  return null
}

/** Sceglie il side di default per il pre-fill desktop. */
function pickDefaultSide(market: AuktoraMarket): string | null {
  if (market.yesPrice > 0 && market.yesPrice < 1) return 'yes'
  if (market.noPrice > 0 && market.noPrice < 1) return 'no'
  const firstOutcome = market.outcomes.find((o) => o.price > 0 && o.price < 1)
  return firstOutcome ? firstOutcome.name.toLowerCase() : null
}

function buildDraft(
  event: AuktoraEvent,
  market: AuktoraMarket,
  side: string
): import('@/lib/stores/useTradeWidget').TradeDraft | null {
  // Determina pricePerShare e outcomeLabel in base al side
  let priceAtAdd: number
  let outcomeLabel: string
  const lower = side.toLowerCase()

  if (lower === 'yes' || lower === 'up') {
    priceAtAdd = market.yesPrice
    outcomeLabel = lower === 'up' ? 'Up' : 'Yes'
  } else if (lower === 'no' || lower === 'down') {
    priceAtAdd = market.noPrice
    outcomeLabel = lower === 'down' ? 'Down' : 'No'
  } else {
    // Team name (H2H) o altro outcome
    const outcome = market.outcomes.find((o) => o.name.toLowerCase() === lower)
    if (!outcome) return null
    priceAtAdd = outcome.price
    outcomeLabel = outcome.name
  }

  // Validazione: prezzo deve essere strict (0,1) per il submit
  if (priceAtAdd <= 0 || priceAtAdd >= 1) return null

  return {
    polymarketMarketId: market.id,
    polymarketEventId: event.id,
    slug: event.slug,
    title: event.title,
    cardKind: event.kind,
    category: event.tags[0] ?? 'general',
    side: lower,
    pricePerShare: priceAtAdd,
    outcomeLabel,
  }
}
