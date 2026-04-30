/**
 * Mapping codici errore Polymarket → messaggi user-friendly italiano.
 * Doc Orders Overview "Error Messages" — sono i codici esatti che il
 * CLOB ritorna nel campo `errorMsg` quando `success=false`.
 *
 * Use case: TradeConfirmModal mostra il messaggio human-readable invece
 * del codice opaco al fallimento del trade.
 */

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_ORDER_MIN_TICK_SIZE:
    'Prezzo non valido per questo mercato — usa un tick di 0.01 / 0.001 a seconda del market.',
  INVALID_ORDER_MIN_SIZE: 'Importo troppo basso — sotto il minimo accettato dal market.',
  INVALID_ORDER_DUPLICATED:
    'Hai già piazzato un ordine identico. Modifica prezzo o quantità.',
  INVALID_ORDER_NOT_ENOUGH_BALANCE:
    'Saldo pUSD o token insufficiente. Controlla il wallet o le allowance.',
  INVALID_ORDER_EXPIRATION: 'La scadenza GTD è nel passato — scegli una data futura.',
  INVALID_ORDER_ERROR: 'Errore interno Polymarket — riprova tra qualche secondo.',
  INVALID_POST_ONLY_ORDER_TYPE:
    'Post-only non compatibile con order type FOK/FAK (sono market orders).',
  INVALID_POST_ONLY_ORDER:
    'L\'ordine post-only attraverserebbe lo spread → rifiutato. Riduci il prezzo.',
  EXECUTION_ERROR: 'Errore esecuzione trade — riprova.',
  ORDER_DELAYED:
    'Ordine in coda con delay 1s (sport markets). Si processerà a breve.',
  DELAYING_ORDER_ERROR: 'Errore interno mentre Polymarket gestiva il delay.',
  FOK_ORDER_NOT_FILLED_ERROR:
    'Liquidità insufficiente per fillare l\'ordine FOK in un colpo. Prova FAK o riduci size.',
  MARKET_NOT_READY:
    'Il mercato non sta ancora accettando ordini (es. sport pre-match).',
}

/**
 * Traduce un errore CLOB in messaggio italiano user-friendly.
 * Se il codice non è mappato, ritorna il messaggio raw (così l'info
 * tecnica non viene persa per debug).
 */
export function translateOrderError(rawMessage: string | undefined | null): string {
  if (!rawMessage) return 'Errore sconosciuto durante il trade.'
  const trimmed = rawMessage.trim()
  // Match exact code (es. "INVALID_ORDER_MIN_SIZE")
  if (ERROR_MESSAGES[trimmed]) return ERROR_MESSAGES[trimmed]!
  // Match code embedded in message (es. "Server: INVALID_ORDER_MIN_SIZE: details...")
  for (const code of Object.keys(ERROR_MESSAGES)) {
    if (trimmed.includes(code)) return ERROR_MESSAGES[code]!
  }
  return trimmed
}
