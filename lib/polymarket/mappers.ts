import type { GammaEvent, GammaMarket } from './types'

// I 5 CardKind dell'app (da Doc 1 e Doc 4)
export type CardKind =
  | 'binary' // 1 mercato, outcomes Yes/No
  | 'multi_outcome' // 1 evento, N candidati (elezioni, premi)
  | 'multi_strike' // 1 evento, N soglie numeriche
  | 'h2h_sport' // 2 outcomes, titoli tipo "Team A vs Team B"
  | 'crypto_up_down' // binary su crypto price, ha round con scadenza

/** Singolo outcome di un mercato (es. "Yes", "No", "Lakers", "Draw", "≥$130k") */
export interface AuktoraOutcome {
  name: string
  /** Probabilità implicita 0-1 */
  price: number
}

export interface AuktoraMarket {
  id: string
  question: string
  slug: string
  yesPrice: number // 0-1, alias di outcomes[0].price
  noPrice: number // alias di outcomes[1].price
  /**
   * Tutti gli outcome del mercato.
   * - Binary: 2 elementi (Yes/No)
   * - H2H sport: 2 (Team A / Team B) o 3 (con Draw)
   * - Multi-strike: nome è la soglia
   */
  outcomes: AuktoraOutcome[]
  volume: number
  liquidity: number
  endDate: Date
  active: boolean
  closed: boolean
  clobTokenIds: [string, string] | null
}

export interface AuktoraEvent {
  id: string
  title: string
  slug: string
  description: string
  image: string
  icon: string
  endDate: Date
  active: boolean
  closed: boolean
  volume24hr: number
  totalVolume: number
  totalLiquidity: number
  commentCount: number
  tags: string[]
  markets: AuktoraMarket[]
  kind: CardKind
}

const CRYPTO_HINTS = ['btc', 'eth', 'sol', 'crypto', 'bitcoin', 'ethereum']
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function safeParseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function isYesNo(outcomes: string[]): boolean {
  if (outcomes.length !== 2) return false
  const lower = outcomes.map((o) => o.toLowerCase())
  return lower.includes('yes') && lower.includes('no')
}

function isNumericString(value: string): boolean {
  if (!value) return false
  return !Number.isNaN(Number(value))
}

export function classifyEvent(event: GammaEvent): CardKind {
  const markets = event.markets ?? []

  if (markets.length === 1) {
    const m = markets[0]!
    const outcomes = safeParseJsonArray(m.outcomes)

    if (isYesNo(outcomes)) {
      const slugLower = (event.slug ?? '').toLowerCase()
      const isCrypto = CRYPTO_HINTS.some((hint) => slugLower.includes(hint))
      if (isCrypto) {
        const endTs = new Date(event.endDate).getTime()
        const now = Date.now()
        if (Number.isFinite(endTs) && endTs - now <= SEVEN_DAYS_MS) {
          return 'crypto_up_down'
        }
      }
      return 'binary'
    }

    // 1 mercato con outcomes non Yes/No → tipicamente sport H2H
    return 'h2h_sport'
  }

  // N mercati (>1): se il primo outcome del primo mercato è numerico → strike
  const first = markets[0]
  if (first) {
    const outcomes = safeParseJsonArray(first.outcomes)
    if (outcomes[0] && isNumericString(outcomes[0])) {
      return 'multi_strike'
    }
  }

  return 'multi_outcome'
}

export function mapGammaMarket(raw: GammaMarket): AuktoraMarket {
  const names = safeParseJsonArray(raw.outcomes)
  const priceStrings = safeParseJsonArray(raw.outcomePrices)

  const outcomes: AuktoraOutcome[] = names.map((name, i) => {
    const priceStr = priceStrings[i]
    const price = priceStr ? parseFloat(priceStr) : 0
    return { name, price: Number.isFinite(price) ? price : 0 }
  })

  const yesPrice = outcomes[0]?.price ?? 0
  const noPrice = outcomes[1]?.price ?? 0

  let clobTokenIds: [string, string] | null = null
  if (raw.clobTokenIds) {
    const parsed = safeParseJsonArray(raw.clobTokenIds)
    if (parsed.length === 2 && parsed[0] && parsed[1]) {
      clobTokenIds = [parsed[0], parsed[1]]
    }
  }

  return {
    id: raw.id,
    question: raw.question,
    slug: raw.slug,
    yesPrice,
    noPrice,
    outcomes,
    volume: parseFloat(raw.volume) || 0,
    liquidity: parseFloat(raw.liquidity) || 0,
    endDate: new Date(raw.endDate),
    active: raw.active,
    closed: raw.closed,
    clobTokenIds,
  }
}

export function mapGammaEvent(raw: GammaEvent): AuktoraEvent {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    image: raw.image,
    icon: raw.icon,
    endDate: new Date(raw.endDate),
    active: raw.active,
    closed: raw.closed,
    volume24hr: raw.volume24hr ?? 0,
    totalVolume: parseFloat(raw.volume) || 0,
    totalLiquidity: parseFloat(raw.liquidity) || 0,
    commentCount: raw.commentCount ?? 0,
    tags: (raw.tags ?? []).map((t) => t.slug),
    markets: (raw.markets ?? []).map(mapGammaMarket),
    kind: classifyEvent(raw),
  }
}
