import { NextRequest, NextResponse } from 'next/server'
import { calculateMarketImpact } from '@/lib/polymarket/clob'

/**
 * GET /api/v1/polymarket/market-impact?token_id=...&side=BUY|SELL&amount=10
 *
 * Stima il prezzo medio (fill price) per acquistare/vendere `amount` USDC
 * di un tokenID. Doc Prices&Orderbook: il displayed price è midpoint ma il
 * vero prezzo di esecuzione è bid/ask top — questa route lo restituisce
 * usando `calculateMarketPrice` del SDK V2.
 *
 * Pubblico — no auth (è solo una preview).
 */
export const revalidate = 5

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const tokenId = url.searchParams.get('token_id')
  const sideRaw = (url.searchParams.get('side') ?? 'BUY').toUpperCase()
  const amountRaw = url.searchParams.get('amount')

  if (!tokenId) {
    return NextResponse.json({ fillPrice: null, error: 'token_id richiesto' }, { status: 400 })
  }

  const side: 'BUY' | 'SELL' = sideRaw === 'SELL' ? 'SELL' : 'BUY'
  const amount = Number(amountRaw)
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ fillPrice: null, error: 'amount non valido' }, { status: 400 })
  }

  const fillPrice = await calculateMarketImpact(tokenId, side, amount)
  return NextResponse.json({ fillPrice })
}
