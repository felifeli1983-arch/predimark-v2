import { describe, it, expect } from 'vitest'
import { computeSellPnL, computeCurrentValue, computeUnrealizedPnL } from '../pnl'

describe('computeSellPnL', () => {
  it('profit: sold @ 0.7 vs avg 0.5 su 100 shares → +$20 (+40%)', () => {
    const r = computeSellPnL(0.5, 0.7, 100)
    expect(r.totalReceived).toBeCloseTo(70)
    expect(r.pnl).toBeCloseTo(20)
    expect(r.pnlPct).toBeCloseTo(40)
    expect(r.isWin).toBe(true)
  })

  it('loss: sold @ 0.4 vs avg 0.6 su 50 shares → -$10 (-33.33%)', () => {
    const r = computeSellPnL(0.6, 0.4, 50)
    expect(r.totalReceived).toBeCloseTo(20)
    expect(r.pnl).toBeCloseTo(-10)
    expect(r.pnlPct).toBeCloseTo(-33.333, 2)
    expect(r.isWin).toBe(false)
  })

  it('breakeven: sold = avg → pnl 0, isWin false', () => {
    const r = computeSellPnL(0.5, 0.5, 100)
    expect(r.totalReceived).toBeCloseTo(50)
    expect(r.pnl).toBeCloseTo(0)
    expect(r.pnlPct).toBeCloseTo(0)
    expect(r.isWin).toBe(false)
  })

  it('partial sell: 30 shares su 100 totali, profit pro-quota', () => {
    const r = computeSellPnL(0.5, 0.7, 30)
    expect(r.totalReceived).toBeCloseTo(21)
    expect(r.pnl).toBeCloseTo(6) // (0.7 - 0.5) * 30
  })

  it('avg=0 (edge): pnlPct ritorna 0 invece di NaN', () => {
    const r = computeSellPnL(0, 0.5, 100)
    expect(r.pnlPct).toBe(0)
  })
})

describe('computeCurrentValue', () => {
  it('shares × price', () => {
    expect(computeCurrentValue(100, 0.62)).toBeCloseTo(62)
    expect(computeCurrentValue(50, 0.4)).toBeCloseTo(20)
    expect(computeCurrentValue(0, 0.5)).toBe(0)
  })
})

describe('computeUnrealizedPnL', () => {
  it('open position con prezzo salito', () => {
    const r = computeUnrealizedPnL(0.5, 0.62, 100)
    expect(r.pnl).toBeCloseTo(12) // (0.62 - 0.5) * 100
    expect(r.pnlPct).toBeCloseTo(24)
  })

  it('open position con prezzo sceso', () => {
    const r = computeUnrealizedPnL(0.7, 0.5, 100)
    expect(r.pnl).toBeCloseTo(-20)
    expect(r.pnlPct).toBeCloseTo(-28.571, 2)
  })
})
