import { describe, it, expect } from 'vitest'
import { classifyEvent, mapGammaMarket, mapGammaEvent } from '../mappers'
import type { GammaEvent, GammaMarket } from '../types'

function makeMarket(overrides: Partial<GammaMarket> = {}): GammaMarket {
  return {
    id: 'm1',
    question: 'Will X happen?',
    conditionId: 'cond1',
    slug: 'x-happen',
    resolutionSource: '',
    endDate: '2026-12-31T00:00:00Z',
    liquidity: '1000.5',
    startDate: '2026-01-01T00:00:00Z',
    image: '',
    icon: '',
    description: '',
    outcomes: '["Yes","No"]',
    outcomePrices: '["0.72","0.28"]',
    volume: '5000',
    active: true,
    closed: false,
    archived: false,
    new: false,
    featured: false,
    restricted: false,
    groupItemTitle: '',
    groupItemThreshold: '',
    questionID: '',
    enableOrderBook: true,
    orderPriceMinTickSize: 0.01,
    orderMinSize: 5,
    volumeNum: 5000,
    liquidityNum: 1000.5,
    clobTokenIds: '["token-yes","token-no"]',
    acceptingOrders: true,
    acceptingOrdersTimestamp: '',
    cyom: false,
    competitive: 0,
    pagerDutyNotificationEnabled: false,
    makerBaseFeeRate: 0,
    takerBaseFeeRate: 0,
    spread: 0,
    lastTradePrice: 0.7,
    bestBid: 0.71,
    bestAsk: 0.73,
    automaticallyActive: true,
    ...overrides,
  }
}

function makeEvent(overrides: Partial<GammaEvent> = {}): GammaEvent {
  return {
    id: 'e1',
    title: 'Will X happen?',
    slug: 'will-x-happen',
    description: '',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T00:00:00Z',
    image: '',
    icon: '',
    active: true,
    closed: false,
    archived: false,
    new: false,
    featured: false,
    restricted: false,
    volume: '5000',
    liquidity: '1000',
    volume24hr: 250,
    commentCount: 0,
    markets: [makeMarket()],
    tags: [{ id: 't1', label: 'Politics', slug: 'politics' }],
    series: [],
    ...overrides,
  }
}

describe('classifyEvent', () => {
  it('binary: 1 mercato Yes/No, slug non crypto', () => {
    const ev = makeEvent({ slug: 'will-trump-win-2028' })
    expect(classifyEvent(ev)).toBe('binary')
  })

  it('crypto_up_down: 1 mercato Yes/No con slug crypto + endDate entro 7gg', () => {
    const inSixDays = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
    const ev = makeEvent({
      slug: 'btc-above-100k-this-week',
      endDate: inSixDays,
    })
    expect(classifyEvent(ev)).toBe('crypto_up_down')
  })

  it('binary (non crypto_up_down) se slug crypto ma endDate >7gg', () => {
    const inOneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    const ev = makeEvent({ slug: 'btc-above-200k-2027', endDate: inOneYear })
    expect(classifyEvent(ev)).toBe('binary')
  })

  it('h2h_sport: 1 mercato con outcomes non Yes/No', () => {
    const ev = makeEvent({
      markets: [makeMarket({ outcomes: '["Lakers","Celtics"]' })],
    })
    expect(classifyEvent(ev)).toBe('h2h_sport')
  })

  it('multi_outcome: N mercati con outcomes non numerici', () => {
    const ev = makeEvent({
      markets: [
        makeMarket({ id: 'm1', outcomes: '["Yes","No"]' }),
        makeMarket({ id: 'm2', outcomes: '["Yes","No"]' }),
      ],
    })
    expect(classifyEvent(ev)).toBe('multi_outcome')
  })

  it('multi_strike: N mercati col primo outcome numerico', () => {
    const ev = makeEvent({
      markets: [
        makeMarket({ id: 'm1', outcomes: '["50000","Below"]' }),
        makeMarket({ id: 'm2', outcomes: '["75000","Below"]' }),
      ],
    })
    expect(classifyEvent(ev)).toBe('multi_strike')
  })
})

describe('mapGammaMarket', () => {
  it('parsa outcomePrices in yesPrice/noPrice', () => {
    const m = mapGammaMarket(makeMarket({ outcomePrices: '["0.72","0.28"]' }))
    expect(m.yesPrice).toBeCloseTo(0.72)
    expect(m.noPrice).toBeCloseTo(0.28)
  })

  it('parsa clobTokenIds come tuple [yes, no]', () => {
    const m = mapGammaMarket(makeMarket({ clobTokenIds: '["abc","xyz"]' }))
    expect(m.clobTokenIds).toEqual(['abc', 'xyz'])
  })

  it('clobTokenIds null se JSON malformato', () => {
    const m = mapGammaMarket(makeMarket({ clobTokenIds: 'not-json' }))
    expect(m.clobTokenIds).toBeNull()
  })

  it('volume e liquidity convertiti da string a number', () => {
    const m = mapGammaMarket(makeMarket({ volume: '12345.67', liquidity: '999.5' }))
    expect(m.volume).toBeCloseTo(12345.67)
    expect(m.liquidity).toBeCloseTo(999.5)
  })

  it('endDate convertito a Date', () => {
    const m = mapGammaMarket(makeMarket({ endDate: '2027-06-15T12:00:00Z' }))
    expect(m.endDate).toBeInstanceOf(Date)
    expect(m.endDate.getUTCFullYear()).toBe(2027)
  })
})

describe('mapGammaEvent', () => {
  it('mappa correttamente i campi base + classifica kind', () => {
    const ev = mapGammaEvent(makeEvent({ slug: 'will-trump-win-2028' }))
    expect(ev.id).toBe('e1')
    expect(ev.title).toBe('Will X happen?')
    expect(ev.tags).toEqual(['politics'])
    expect(ev.markets).toHaveLength(1)
    expect(ev.kind).toBe('binary')
    expect(ev.endDate).toBeInstanceOf(Date)
    expect(ev.totalVolume).toBe(5000)
    expect(ev.volume24hr).toBe(250)
  })
})
