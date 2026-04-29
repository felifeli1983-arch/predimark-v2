'use client'

import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { HeroDefault } from './hero/HeroDefault'
import { HeroH2H } from './hero/HeroH2H'
import { HeroCrypto } from './hero/HeroCrypto'

interface Props {
  event: AuktoraEvent
}

/**
 * EventHero — router CardKind-aware (sprint 3.5.3).
 *  - h2h_sport     → HeroH2H (due team affiancati + score stub)
 *  - crypto_up_down → HeroCrypto (live midpoint + countdown)
 *  - binary | multi_outcome | multi_strike → HeroDefault
 */
export function EventHero({ event }: Props) {
  if (event.kind === 'h2h_sport') return <HeroH2H event={event} />
  if (event.kind === 'crypto_up_down') return <HeroCrypto event={event} />
  return <HeroDefault event={event} />
}
