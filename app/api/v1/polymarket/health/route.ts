import { NextResponse } from 'next/server'
import { CLOB_URL, CLOB_CHAIN, BUILDER_CODE, getMidpoint } from '@/lib/polymarket/clob'

/**
 * GET /api/v1/polymarket/health
 *
 * Smoke test CLOB V2: verifica che il client SDK sia online interrogando
 * il midpoint di un tokenId noto (passato come ?token_id=...).
 *
 * Usage:
 *   /api/v1/polymarket/health  → status base + env config
 *   /api/v1/polymarket/health?token_id=<tokenId>  → testa anche getMidpoint
 *
 * MA4.4 Phase A — read-only, no auth, no signing.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url)
  const tokenId = url.searchParams.get('token_id')

  const config = {
    clobUrl: CLOB_URL,
    chain: CLOB_CHAIN,
    builderCodeConfigured: Boolean(BUILDER_CODE),
  }

  if (!tokenId) {
    return NextResponse.json({ ok: true, config })
  }

  try {
    const mid = await getMidpoint(tokenId)
    return NextResponse.json({ ok: true, config, midpoint: mid, tokenId })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        config,
        error: err instanceof Error ? err.message : 'Errore sconosciuto',
      },
      { status: 502 }
    )
  }
}
