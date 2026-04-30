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

    // Caso 2: landing diretto su event page senza query → auto-prefill desktop.
    // Itera la lista markets per trovare il primo con prezzo NON degenere
    // (yesPrice strict in (0,1)). Salta market già risolti / scaduti che
    // avrebbero yesPrice=0 o =1, dove il trade è impossibile.
    const pair = findDefaultPair(event.markets)
    if (!pair) return
    const draft = buildDraft(event, pair.market, pair.side)
    if (!draft) return
    consumed.current = true
    tradeWidgetActions.setDraft(draft)
    // Niente .open() qui — non vogliamo aprire il sheet mobile auto
  }, [event, searchParams, router, pathname])

  return null
}

/** Trova il primo market con almeno un side valido per pre-fill widget. */
function findDefaultPair(markets: AuktoraMarket[]): { market: AuktoraMarket; side: string } | null {
  for (const market of markets) {
    const side = pickDefaultSide(market)
    if (side) return { market, side }
  }
  return null
}

/** Sceglie il side di default per il pre-fill desktop (prezzo strict in (0,1)). */
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
  let priceAtAdd: number
  let outcomeLabel: string
  let tokenId: string | null = null
  const lower = side.toLowerCase()

  if (lower === 'yes' || lower === 'up') {
    priceAtAdd = market.yesPrice
    outcomeLabel = lower === 'up' ? 'Up' : 'Yes'
    tokenId = market.clobTokenIds?.[0] ?? null
  } else if (lower === 'no' || lower === 'down') {
    priceAtAdd = market.noPrice
    outcomeLabel = lower === 'down' ? 'Down' : 'No'
    tokenId = market.clobTokenIds?.[1] ?? null
  } else {
    const outcome = market.outcomes.find((o) => o.name.toLowerCase() === lower)
    if (!outcome) return null
    priceAtAdd = outcome.price
    outcomeLabel = outcome.name
    tokenId = market.clobTokenIds?.[0] ?? null
  }

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
    tokenId,
    clobTokenIds: market.clobTokenIds,
    conditionId: market.conditionId,
  }
}
