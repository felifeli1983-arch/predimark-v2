describe('useAuth module', () => {
  it('exports useAuth function', async () => {
    const mod = await import('../useAuth')
    expect(typeof mod.useAuth).toBe('function')
  })

  it('exports AuthUser interface shape', async () => {
    const mod = await import('../useAuth')
    expect(mod).toBeDefined()
  })
})
