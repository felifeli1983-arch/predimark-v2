import { syncUserToSupabase } from '../syncUser'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

describe('syncUserToSupabase', () => {
  it('ritorna { error: null } con dati validi', async () => {
    const result = await syncUserToSupabase({
      privyDid: 'did:privy:test123',
      email: 'test@example.com',
      emailVerified: true,
      walletAddress: '0x1234567890123456789012345678901234567890',
    })
    expect(result.error).toBeNull()
  })

  it('ritorna { error: null } senza wallet (email-only user)', async () => {
    const result = await syncUserToSupabase({
      privyDid: 'did:privy:test456',
      email: 'emailonly@example.com',
    })
    expect(result.error).toBeNull()
  })
})
