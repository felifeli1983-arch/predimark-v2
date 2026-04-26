// Polymarket Gamma API — tipi raw delle response
// Source: https://gamma-api.polymarket.com

export interface GammaMarket {
  id: string
  question: string
  conditionId: string
  slug: string
  resolutionSource: string
  endDate: string
  liquidity: string
  startDate: string
  image: string
  icon: string
  description: string
  outcomes: string // JSON array stringificato es. '["Yes","No"]'
  outcomePrices: string // JSON array stringificato es. '["0.72","0.28"]'
  volume: string
  active: boolean
  closed: boolean
  archived: boolean
  new: boolean
  featured: boolean
  restricted: boolean
  groupItemTitle: string
  groupItemThreshold: string
  questionID: string
  enableOrderBook: boolean
  orderPriceMinTickSize: number
  orderMinSize: number
  volumeNum: number
  liquidityNum: number
  clobTokenIds: string // JSON array stringificato
  acceptingOrders: boolean
  acceptingOrdersTimestamp: string
  cyom: boolean
  competitive: number
  pagerDutyNotificationEnabled: boolean
  makerBaseFeeRate: number
  takerBaseFeeRate: number
  spread: number
  lastTradePrice: number
  bestBid: number
  bestAsk: number
  automaticallyActive: boolean
}

export interface GammTag {
  id: string
  label: string
  slug: string
}

export interface GammaSeries {
  id: string
  slug: string
  label: string
  image: string
}

export interface GammaEvent {
  id: string
  title: string
  slug: string
  description: string
  startDate: string
  endDate: string
  image: string
  icon: string
  active: boolean
  closed: boolean
  archived: boolean
  new: boolean
  featured: boolean
  restricted: boolean
  volume: string
  liquidity: string
  volume24hr: number
  commentCount: number
  markets: GammaMarket[]
  tags: GammTag[]
  series: GammaSeries[]
}

export interface GammaEventsParams {
  limit?: number
  offset?: number
  order?: 'volume24hr' | 'volume' | 'liquidity' | 'startDate' | 'endDate'
  ascending?: boolean
  tag?: string
  active?: boolean
  closed?: boolean
  archived?: boolean
  featured?: boolean
  new?: boolean
  id?: string
  slug?: string
  search?: string
}
