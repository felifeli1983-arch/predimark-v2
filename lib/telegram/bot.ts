/**
 * Helper Telegram Bot API.
 * Bot username: @AuktoraBot (da configurare in BotFather)
 *
 * Env richiesta:
 *   TELEGRAM_BOT_TOKEN — token da @BotFather
 *   TELEGRAM_WEBHOOK_SECRET — random string per verificare update auth
 *   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME — username pubblico bot (es. AuktoraBot)
 */

const TELEGRAM_API = 'https://api.telegram.org'

export function isBotEnabled(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN)
}

export function getBotUsername(): string {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'AuktoraBot'
}

interface SendMessageParams {
  chatId: string | number
  text: string
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disableNotification?: boolean
  inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
}

export async function sendMessage(params: SendMessageParams): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return false

  const body: Record<string, unknown> = {
    chat_id: params.chatId,
    text: params.text,
    parse_mode: params.parseMode ?? 'HTML',
    disable_notification: params.disableNotification ?? false,
  }
  if (params.inlineKeyboard) {
    body.reply_markup = { inline_keyboard: params.inlineKeyboard }
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Genera codice link random 8 char alfanumerici (TG link). */
export function generateLinkCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export const WELCOME_MESSAGE = `
👋 <b>Benvenuto su Auktora Bot!</b>

Ricevi:
• 🔔 Alert quando i tuoi Creator aprono/chiudono posizioni
• 🤖 Signal AI gratuiti su mercati Polymarket
• 💰 Updates copy trading + payout Creator (se sei Creator)

Per linkare il tuo account, manda il codice che hai ricevuto su auktora.com:
<code>/link CODICE</code>

Auktora Pro €5/mese: signal premium + alert push prioritari (in arrivo MA8).
`.trim()
