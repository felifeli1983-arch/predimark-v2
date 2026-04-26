import { createAdminClient } from '@/lib/supabase/admin'

export type GeoBlockStatus = 'allowed' | 'demo_only' | 'blocked'

export async function resolveGeoBlockStatus(request: Request): Promise<{
  countryCode: string | null
  status: GeoBlockStatus
}> {
  // Cloudflare/Vercel injectano il country code dell'IP
  // In dev/staging locale: header non presente → null → 'allowed'
  const countryCode =
    request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country') ?? null

  // XX/T1 = origin sconosciuta (VPN, Tor, ecc.) — trattata come 'allowed'
  if (!countryCode || countryCode === 'XX' || countryCode === 'T1') {
    return { countryCode, status: 'allowed' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('geo_blocks')
    .select('block_type')
    .eq('country_code', countryCode)
    .maybeSingle()

  if (error || !data) {
    return { countryCode, status: 'allowed' }
  }

  const status: GeoBlockStatus = data.block_type === 'full_block' ? 'blocked' : 'demo_only'

  return { countryCode, status }
}
