import { describe, it, expect } from 'vitest'
import { formatPusdBalance } from '../pusd'

describe('polymarket/pusd', () => {
  it('formatPusdBalance — zero', () => {
    expect(formatPusdBalance(BigInt(0))).toBe(0)
  })

  it('formatPusdBalance — 1 pUSD = 1_000_000 base units', () => {
    expect(formatPusdBalance(BigInt(1_000_000))).toBe(1)
  })

  it('formatPusdBalance — 1234.567890 pUSD', () => {
    expect(formatPusdBalance(BigInt(1_234_567_890))).toBeCloseTo(1234.56789, 6)
  })

  it('formatPusdBalance — sub-cent 0.000001', () => {
    expect(formatPusdBalance(BigInt(1))).toBeCloseTo(0.000001, 7)
  })
})
