import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/copy/execute
 *
 * N4 — Copy trade execution stub.
 *
 * MA6.1 deferred: real execution richiede:
 * - Privy session keys (signature pre-authorization 24h-30d)
 * - Bot relayer atomic batch (esegue copy + creator order in same block per fair price)
 * - Cost basis tracking on-chain (per fee distribution mensile)
 *
 * Per ora ritorna 501 NOT_IMPLEMENTED con doc reference.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  return ERR(
    'NOT_IMPLEMENTED',
    'Copy execution real arriva in MA6.1. Vedi PROMPT-SPRINT-MA6.md per Modalità A (manual confirm) + Modalità B (auto-copy session keys). Per ora /me/following salva config che sarà eseguita appena MA6.1 chiuso.',
    501
  )
}
