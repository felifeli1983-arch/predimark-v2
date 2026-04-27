import { describe, it, expect, beforeEach } from 'vitest'
import {
  useBetSlip,
  legPayout,
  totalStake,
  totalPayout,
  builderFee,
  BUILDER_FEE_RATE,
  type AddToSlipPayload,
} from '../useBetSlip'

function basePayload(overrides: Partial<AddToSlipPayload> = {}): AddToSlipPayload {
  return {
    eventId: 'evt-1',
    marketId: 'mkt-1',
    outcome: 'yes',
    priceAtAdd: 0.5,
    marketTitle: 'Eurovision 2026',
    outcomeLabel: 'Finland',
    ...overrides,
  }
}

describe('useBetSlip', () => {
  beforeEach(() => {
    // Reset store state tra i test
    useBetSlip.setState({ legs: [], drawerOpen: false })
  })

  it('addLeg aggiunge una nuova leg con stake default e apre drawer', () => {
    useBetSlip.getState().addLeg(basePayload())
    const state = useBetSlip.getState()
    expect(state.legs).toHaveLength(1)
    expect(state.legs[0]?.stake).toBe(10)
    expect(state.legs[0]?.id).toBe('mkt-1:yes')
    expect(state.drawerOpen).toBe(true)
  })

  it('addLeg con stake custom rispetta il valore', () => {
    useBetSlip.getState().addLeg({ ...basePayload(), stake: 50 })
    expect(useBetSlip.getState().legs[0]?.stake).toBe(50)
  })

  it('addLeg con stessa marketId+outcome SOSTITUISCE la leg (dedup)', () => {
    useBetSlip.getState().addLeg({ ...basePayload(), stake: 10 })
    useBetSlip.getState().addLeg({ ...basePayload(), stake: 100 })
    const legs = useBetSlip.getState().legs
    expect(legs).toHaveLength(1)
    expect(legs[0]?.stake).toBe(100)
  })

  it('addLeg con marketId diverso aggiunge come nuova leg', () => {
    useBetSlip.getState().addLeg(basePayload({ marketId: 'mkt-1' }))
    useBetSlip.getState().addLeg(basePayload({ marketId: 'mkt-2' }))
    expect(useBetSlip.getState().legs).toHaveLength(2)
  })

  it('addLeg con outcome diverso sullo stesso market aggiunge come nuova leg', () => {
    useBetSlip.getState().addLeg(basePayload({ outcome: 'yes' }))
    useBetSlip.getState().addLeg(basePayload({ outcome: 'no' }))
    expect(useBetSlip.getState().legs).toHaveLength(2)
  })

  it('addLeg clamp stake a [1, 10000]', () => {
    useBetSlip.getState().addLeg({ ...basePayload(), stake: -50 })
    expect(useBetSlip.getState().legs[0]?.stake).toBe(1)
    useBetSlip.setState({ legs: [], drawerOpen: false })
    useBetSlip.getState().addLeg({ ...basePayload(), stake: 99999 })
    expect(useBetSlip.getState().legs[0]?.stake).toBe(10000)
  })

  it('removeLeg rimuove per id', () => {
    useBetSlip.getState().addLeg(basePayload({ marketId: 'mkt-1' }))
    useBetSlip.getState().addLeg(basePayload({ marketId: 'mkt-2' }))
    useBetSlip.getState().removeLeg('mkt-1:yes')
    const legs = useBetSlip.getState().legs
    expect(legs).toHaveLength(1)
    expect(legs[0]?.marketId).toBe('mkt-2')
  })

  it('updateStake aggiorna lo stake con clamp', () => {
    useBetSlip.getState().addLeg(basePayload())
    useBetSlip.getState().updateStake('mkt-1:yes', 500)
    expect(useBetSlip.getState().legs[0]?.stake).toBe(500)
    useBetSlip.getState().updateStake('mkt-1:yes', 99999)
    expect(useBetSlip.getState().legs[0]?.stake).toBe(10000)
    useBetSlip.getState().updateStake('mkt-1:yes', 0)
    expect(useBetSlip.getState().legs[0]?.stake).toBe(1)
  })

  it('clearSlip svuota legs e chiude drawer', () => {
    useBetSlip.getState().addLeg(basePayload())
    useBetSlip.getState().clearSlip()
    const state = useBetSlip.getState()
    expect(state.legs).toHaveLength(0)
    expect(state.drawerOpen).toBe(false)
  })

  it('openDrawer / closeDrawer / toggleDrawer', () => {
    expect(useBetSlip.getState().drawerOpen).toBe(false)
    useBetSlip.getState().openDrawer()
    expect(useBetSlip.getState().drawerOpen).toBe(true)
    useBetSlip.getState().closeDrawer()
    expect(useBetSlip.getState().drawerOpen).toBe(false)
    useBetSlip.getState().toggleDrawer()
    expect(useBetSlip.getState().drawerOpen).toBe(true)
    useBetSlip.getState().toggleDrawer()
    expect(useBetSlip.getState().drawerOpen).toBe(false)
  })
})

describe('legPayout / totalStake / totalPayout / builderFee', () => {
  beforeEach(() => {
    useBetSlip.setState({ legs: [], drawerOpen: false })
  })

  it('legPayout = stake / priceAtAdd', () => {
    useBetSlip.getState().addLeg({ ...basePayload(), priceAtAdd: 0.5, stake: 10 })
    const leg = useBetSlip.getState().legs[0]!
    expect(legPayout(leg)).toBeCloseTo(20)
  })

  it('legPayout con priceAtAdd 0 ritorna 0 (no division by zero)', () => {
    useBetSlip.getState().addLeg({ ...basePayload(), priceAtAdd: 0, stake: 10 })
    const leg = useBetSlip.getState().legs[0]!
    expect(legPayout(leg)).toBe(0)
  })

  it('totalStake somma stake delle leg', () => {
    useBetSlip.getState().addLeg({ ...basePayload(), marketId: 'm1', stake: 10 })
    useBetSlip.getState().addLeg({ ...basePayload(), marketId: 'm2', stake: 25 })
    expect(totalStake(useBetSlip.getState().legs)).toBe(35)
  })

  it('totalPayout somma payout delle leg', () => {
    useBetSlip.getState().addLeg({ ...basePayload(), marketId: 'm1', stake: 10, priceAtAdd: 0.5 })
    useBetSlip.getState().addLeg({ ...basePayload(), marketId: 'm2', stake: 30, priceAtAdd: 0.6 })
    // 10/0.5 + 30/0.6 = 20 + 50 = 70
    expect(totalPayout(useBetSlip.getState().legs)).toBeCloseTo(70)
  })

  it('builderFee = 0.5% dello stake', () => {
    expect(builderFee(100)).toBeCloseTo(0.5)
    expect(builderFee(1000)).toBeCloseTo(5)
    expect(BUILDER_FEE_RATE).toBe(0.005)
  })
})
