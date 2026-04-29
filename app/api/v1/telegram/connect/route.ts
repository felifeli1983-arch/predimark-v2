import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateLinkCode, getBotUsername, isBotEnabled } from '@/lib/telegram/bot'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

const LINK_CODE_TTL_MIN = 15

/**
 * POST /api/v1/telegram/connect
 * Genera link_code per user. User apre Telegram, manda /link CODE al bot, viene linkato.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isBotEnabled()) {
    return ERR('BOT_DISABLED', 'Telegram bot non configurato (TELEGRAM_BOT_TOKEN missing)', 503)
  }

  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const code = generateLinkCode()
  const expires = new Date(Date.now() + LINK_CODE_TTL_MIN * 60 * 1000).toISOString()

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('telegram_subscriptions' as any) as any).upsert({
    user_id: auth.userId,
    telegram_chat_id: `pending-${auth.userId}`,
    link_code: code,
    link_code_expires_at: expires,
    is_linked: false,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[telegram connect]', error)
    return ERR('INTERNAL_ERROR', 'Errore generazione link code', 500)
  }

  const botUsername = getBotUsername()
  return NextResponse.json({
    code,
    expires_at: expires,
    bot_url: `https://t.me/${botUsername}?start=${code}`,
    bot_username: botUsername,
    instructions: `Apri ${botUsername} e manda /link ${code} (oppure click sul link sotto). Codice valido ${LINK_CODE_TTL_MIN} minuti.`,
  })
}

/**
 * GET /api/v1/telegram/connect — status link corrente
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('telegram_subscriptions' as any) as any)
    .select('telegram_chat_id, telegram_username, is_linked, linked_at, is_premium, premium_until')
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (error) return ERR('INTERNAL_ERROR', error.message, 500)
  if (!data) return NextResponse.json({ is_linked: false, is_premium: false })

  return NextResponse.json(data)
}
