import { describe, it, expect, beforeEach } from 'vitest'
import { useTradeWidget, type TradeDraft } from '../useTradeWidget'

const mockDraft: TradeDraft = {
  polymarketMarketId: 'mkt-1',
  polymarketEventId: 'evt-1',
  slug: 'eurovision-2026',
  title: 'Eurovision 2026',
  cardKind: 'multi_outcome',
  category: 'culture',
  side: 'yes',
  pricePerShare: 0.36,
  outcomeLabel: 'Finland',
  tokenId: null,
  clobTokenIds: null,
  conditionId: '',
}

describe('useTradeWidget store', () => {
  beforeEach(() => {
    useTradeWidget.getState().clear()
  })

  it('setDraft popola il draft + reset amount default', () => {
    useTradeWidget.getState().setDraft(mockDraft)
    const state = useTradeWidget.getState()
    expect(state.draft).toEqual(mockDraft)
    expect(state.amountUsdc).toBe(5)
    expect(state.limitPriceCents).toBe(36) // round(0.36 * 100)
  })

  it('setDraft con prezzo molto basso clampa limitPrice a min 1', () => {
    useTradeWidget.getState().setDraft({ ...mockDraft, pricePerShare: 0.001 })
    expect(useTradeWidget.getState().limitPriceCents).toBe(1)
  })

  it('setMode cambia mode market <-> limit', () => {
    useTradeWidget.getState().setMode('limit')
    expect(useTradeWidget.getState().mode).toBe('limit')
    useTradeWidget.getState().setMode('market')
    expect(useTradeWidget.getState().mode).toBe('market')
  })

  it('setAmountUsdc clamp a [1, 100000]', () => {
    useTradeWidget.getState().setAmountUsdc(500)
    expect(useTradeWidget.getState().amountUsdc).toBe(500)
    useTradeWidget.getState().setAmountUsdc(0)
    expect(useTradeWidget.getState().amountUsdc).toBe(1)
    useTradeWidget.getState().setAmountUsdc(999999)
    expect(useTradeWidget.getState().amountUsdc).toBe(100000)
  })

  it('incrementAmount aggiunge/sottrae con clamp', () => {
    useTradeWidget.getState().setAmountUsdc(10)
    useTradeWidget.getState().incrementAmount(5)
    expect(useTradeWidget.getState().amountUsdc).toBe(15)
    useTradeWidget.getState().incrementAmount(-100)
    expect(useTradeWidget.getState().amountUsdc).toBe(1) // clamp
  })

  it('setLimitPrice clamp [1, 99]', () => {
    useTradeWidget.getState().setLimitPrice(50)
    expect(useTradeWidget.getState().limitPriceCents).toBe(50)
    useTradeWidget.getState().setLimitPrice(0)
    expect(useTradeWidget.getState().limitPriceCents).toBe(1)
    useTradeWidget.getState().setLimitPrice(150)
    expect(useTradeWidget.getState().limitPriceCents).toBe(99)
  })

  it('setLimitShares clamp non-negativo', () => {
    useTradeWidget.getState().setLimitShares(100)
    expect(useTradeWidget.getState().limitShares).toBe(100)
    useTradeWidget.getState().setLimitShares(-50)
    expect(useTradeWidget.getState().limitShares).toBe(0)
  })

  it('open / close / clear', () => {
    expect(useTradeWidget.getState().isOpen).toBe(false)
    useTradeWidget.getState().open()
    expect(useTradeWidget.getState().isOpen).toBe(true)
    useTradeWidget.getState().close()
    expect(useTradeWidget.getState().isOpen).toBe(false)

    useTradeWidget.getState().setDraft(mockDraft)
    useTradeWidget.getState().setAmountUsdc(50)
    useTradeWidget.getState().clear()
    const cleared = useTradeWidget.getState()
    expect(cleared.draft).toBeNull()
    expect(cleared.amountUsdc).toBe(5)
    expect(cleared.isOpen).toBe(false)
  })
})
