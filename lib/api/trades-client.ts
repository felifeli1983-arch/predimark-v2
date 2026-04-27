import type { TradeSubmitResponse } from '@/app/api/v1/trades/submit/route'

export interface TradeSubmitPayload {
  polymarketMarketId: string
  polymarketEventId: string
  slug: string
  title: string
  cardKind: string
  category: string
  side: string
  amountUsdc: number
  pricePerShare: number
  isDemo: boolean
}

export class TradeError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
    this.name = 'TradeError'
  }
}

export async function postTradeSubmit(
  token: string,
  payload: TradeSubmitPayload
): Promise<TradeSubmitResponse> {
  const res = await fetch('/api/v1/trades/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let code = 'UNKNOWN'
    let message = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: { code?: string; message?: string } }
      code = body?.error?.code ?? code
      message = body?.error?.message ?? message
    } catch {
      /* ignore */
    }
    throw new TradeError(code, message, res.status)
  }

  return (await res.json()) as TradeSubmitResponse
}

/** GET /api/v1/balances — saldo USDC reale + demo dell'utente */
export interface UserBalance {
  usdcBalance: number
  usdcLocked: number
  demoBalance: number
  demoLocked: number
}

export async function fetchUserBalance(token: string): Promise<UserBalance> {
  const res = await fetch('/api/v1/balances', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new TradeError('BALANCE_FETCH_FAILED', `HTTP ${res.status}`, res.status)
  }
  return (await res.json()) as UserBalance
}
