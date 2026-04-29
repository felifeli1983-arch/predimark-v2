import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

/**
 * GET /api/v1/users/me/referrals — stats referral del current user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()

  // Trova referral code del user (genera al primo accesso se mancante)
  const { data: existingRefs } = await supabase
    .from('referrals')
    .select('referral_code')
    .eq('referrer_user_id', auth.userId)
    .limit(1)
    .maybeSingle()

  let referralCode = existingRefs?.referral_code
  if (!referralCode) {
    referralCode = generateReferralCode()
    // Inserisci row "owner" per il referral code (referred_user_id null = code owner record)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('referrals') as any).insert({
      referrer_user_id: auth.userId,
      referred_user_id: auth.userId, // self-record per anchor del code
      referral_code: referralCode,
      is_active: false, // self-record non genera revenue
    })
  }

  // Stats: aggrega referrals reali (referred_user_id != referrer)
  const { data: refs } = await supabase
    .from('referrals')
    .select('total_volume_generated, total_payout_to_referrer, is_active')
    .eq('referrer_user_id', auth.userId)
    .neq('referred_user_id', auth.userId)

  const list = refs ?? []
  return NextResponse.json({
    referral_code: referralCode,
    referrals_count: list.length,
    active_referrals: list.filter((r) => r.is_active).length,
    total_volume_generated: list.reduce((s, r) => s + Number(r.total_volume_generated ?? 0), 0),
    total_payout_to_referrer: list.reduce((s, r) => s + Number(r.total_payout_to_referrer ?? 0), 0),
  })
}
