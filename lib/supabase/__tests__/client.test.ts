describe('Supabase client', () => {
  it('createBrowserClient initializes without throwing', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })

  it('SUPABASE_URL points to a valid Supabase project', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/)
  })
})
