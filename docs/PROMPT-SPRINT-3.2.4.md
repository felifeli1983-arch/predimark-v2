# PROMPT — Sprint 3.2.4 — WebSocket RTDS singleton

> Copia e incolla questo prompt in Claude in VS Code.
> **Dipendenza**: Sprint 3.2.3 deve essere completato (SingletonWS.ts già presente)

---

## Obiettivo

Aggiungere il secondo WebSocket — il RTDS Polymarket — per activity feed, prezzi crypto live e commenti. Estende l'infrastruttura già creata in 3.2.3 seguendo gli stessi pattern.

---

## Riferimenti obbligatori da leggere prima di scrivere codice

- `lib/ws/SingletonWS.ts` — capire il pattern già implementato in 3.2.3
- `lib/ws/clob.ts` — capire lo stile del wrapper già esistente
- `docs/05-TECH-STACK-AND-ARCHITETTURA.md` — sezione WebSocket, topic RTDS

---

## Cosa costruire

```
lib/ws/
  rtds.ts                    ← wrapper RTDS: subscribe per topic (activity, crypto_prices, chainlink, comments)
  hooks/
    useCryptoLivePrice.ts    ← { price, change24h, symbol } — sorgente Binance o Chainlink
    useLiveActivity.ts       ← feed ultimi N trade (per sidebar Activity e live betting feed crypto card)
```

---

## Regole architetturali

- Riusa `SingletonWS` da 3.2.3 — non riscriverlo
- Stesso pattern subscribe/unsubscribe del CLOB
- Ogni file max 150 righe (AGENTS.md)
- Solo client-side

---

## Endpoint RTDS

URL: `wss://rpc.polymarket.com`

Topic `activity` — feed di trade recenti: `{ user, side, amount, market, outcome, timestamp }`
Topic `crypto_prices` — prezzi Binance: `{ symbol, price, change24h }` (es. `btcusdt`)
Topic `crypto_prices_chainlink` — prezzi Chainlink: stessa struttura ma fonte diversa

**Regola sorgente prezzo** (da Doc 4 e V1):

- Round 5m e 15m → Chainlink (più affidabile per round brevi)
- Round 1h e 1d → Binance

---

## Hook `useCryptoLivePrice`

Firma: `useCryptoLivePrice(symbol: string, source: 'binance' | 'chainlink')`

Ritorna: `{ price: number | null, change24h: number | null, loading: boolean }`

---

## Hook `useLiveActivity`

Firma: `useLiveActivity(options?: { limit?: number })`

Ritorna: array degli ultimi `limit` (default 20) trade, aggiornato in real-time.

---

## Acceptance criteria

- [ ] `npm run validate` passa
- [ ] `npm run build` exit 0
- [ ] Hook `useCryptoLivePrice('btcusdt', 'binance')` riceve aggiornamenti live
- [ ] Hook `useLiveActivity()` ritorna feed aggiornato
- [ ] Connessione RTDS è **separata** dalla connessione CLOB (2 WS distinti nei DevTools)
- [ ] Nessun duplicate connection anche se hook usato in più componenti
- [ ] Commit: `git commit -m "feat: WebSocket RTDS singleton — activity feed + crypto live prices (3.2.4)" && git push origin main`

---

## Note

- Non costruire ancora l'UI — arriverà in 3.3.4 (Crypto card) e 3.4.1 (Sidebar activity)
- Il "live betting feed" della Crypto card (la cifra che cambia velocemente) usa `useLiveActivity` filtrato per `marketId`
- Non aggiungere test — stesso motivo di 3.2.3
