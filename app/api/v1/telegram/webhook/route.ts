import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isBotEnabled, sendMessage, WELCOME_MESSAGE } from '@/lib/telegram/bot'

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from?: { id: number; username?: string; first_name?: string }
    chat: { id: number; type: string }
    date: number
    text?: string
  }
}

/**
 * POST /api/v1/telegram/webhook — riceve update da Telegram
 *
 * Setup: configurare webhook con curl:
 *   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
 *     -d "url=https://auktora.com/api/v1/telegram/webhook&secret_token=<SECRET>"
 *
 * Telegram include il header X-Telegram-Bot-Api-Secret-Token che verifichiamo.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isBotEnabled()) {
    return NextResponse.json({ ok: false, reason: 'bot_disabled' }, { status: 503 })
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  const providedSecret = request.headers.get('x-telegram-bot-api-secret-token')
  if (expectedSecret && providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, reason: 'invalid_secret' }, { status: 403 })
  }

  let update: TelegramUpdate
  try {
    update = (await request.json()) as TelegramUpdate
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_body' }, { status: 400 })
  }

  const message = update.message
  if (!message?.text) {
    return NextResponse.json({ ok: true })
  }

  const chatId = message.chat.id
  const text = message.text.trim()

  // /start con deep-link code
  if (text.startsWith('/start')) {
    const parts = text.split(/\s+/)
    if (parts.length === 2) {
      // /start CODE — auto-link via deep-link
      await handleLink(chatId, parts[1] ?? '', message.from?.username)
    } else {
      await sendMessage({ chatId, text: WELCOME_MESSAGE })
    }
    return NextResponse.json({ ok: true })
  }

  // /link CODE — manual link
  if (text.startsWith('/link')) {
    const parts = text.split(/\s+/)
    if (parts.length !== 2) {
      await sendMessage({
        chatId,
        text: 'Uso: <code>/link CODE</code>\nIl codice lo trovi su auktora.com → Settings → Connect Telegram',
      })
      return NextResponse.json({ ok: true })
    }
    await handleLink(chatId, parts[1] ?? '', message.from?.username)
    return NextResponse.json({ ok: true })
  }

  // /help
  if (text.startsWith('/help')) {
    await sendMessage({
      chatId,
      text: 'Comandi:\n<code>/link CODE</code> — Linka account Auktora\n<code>/status</code> — Stato account\n<code>/unlink</code> — Scollega',
    })
    return NextResponse.json({ ok: true })
  }

  // /status
  if (text.startsWith('/status')) {
    const supabase = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('telegram_subscriptions' as any) as any)
      .select('user_id, is_linked, is_premium, linked_at')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle()
    if (data?.is_linked) {
      await sendMessage({
        chatId,
        text: `✅ Linkato dal ${new Date(data.linked_at).toLocaleDateString('it-IT')}\nPremium: ${data.is_premium ? '✅ Attivo' : '❌ Non attivo'}`,
      })
    } else {
      await sendMessage({
        chatId,
        text: '❌ Non linkato. Apri auktora.com → Settings → Connect Telegram per ricevere il codice.',
      })
    }
    return NextResponse.json({ ok: true })
  }

  // Default: ignora messaggi non-comandi
  return NextResponse.json({ ok: true })
}

async function handleLink(chatId: number, code: string, username?: string) {
  if (!code || code.length < 4) {
    await sendMessage({ chatId, text: '❌ Codice non valido. Formato atteso: 8 caratteri.' })
    return
  }

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('telegram_subscriptions' as any) as any)
    .select('user_id, link_code_expires_at, is_linked')
    .eq('link_code', code)
    .maybeSingle()

  if (!existing) {
    await sendMessage({
      chatId,
      text: '❌ Codice non trovato. Genera un nuovo codice da auktora.com.',
    })
    return
  }
  if (existing.is_linked) {
    await sendMessage({ chatId, text: '⚠️ Codice già usato.' })
    return
  }
  if (existing.link_code_expires_at && new Date(existing.link_code_expires_at) < new Date()) {
    await sendMessage({ chatId, text: '⏱ Codice scaduto. Genera un nuovo codice (valido 15 min).' })
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('telegram_subscriptions' as any) as any)
    .update({
      telegram_chat_id: String(chatId),
      telegram_username: username ?? null,
      is_linked: true,
      linked_at: new Date().toISOString(),
      link_code: null,
      link_code_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', existing.user_id)

  if (error) {
    console.error('[telegram link]', error)
    await sendMessage({ chatId, text: '❌ Errore link, riprova più tardi.' })
    return
  }

  await sendMessage({
    chatId,
    text: `✅ <b>Account linkato!</b>\n\nRiceverai notifiche per:\n• Trade dei Creator che segui\n• Signal AI nuovi\n• Updates copy trading\n\nDisable: <code>/unlink</code>`,
  })
}
