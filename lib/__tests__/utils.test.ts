describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatUSDC(1234.56)).toBe('$1,234.56')
  })

  it('formats zero', () => {
    expect(formatUSDC(0)).toBe('$0.00')
  })

  it('formats negative numbers', () => {
    expect(formatUSDC(-99.5)).toBe('-$99.50')
  })
})

function formatUSDC(amount: number): string {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount < 0 ? `-$${formatted}` : `$${formatted}`
}
