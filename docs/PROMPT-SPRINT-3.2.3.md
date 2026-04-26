# PROMPT — Sprint 3.2.3 — WebSocket CLOB singleton

> Copia e incolla questo prompt in Claude in VS Code.

---

## Obiettivo

Costruire il layer WebSocket per i prezzi live del CLOB Polymarket. Questo sprint sblocca la Crypto Up/Down card (3.3.4) e i prezzi live nell'orderbook della pagina evento. **Nessuna UI in questo sprint** — solo infrastruttura WS.

---

## Riferimenti obbligatori da leggere prima di scrivere codice

- `docs/05-TECH-STACK-AND-ARCHITETTURA.md` — sezione "WebSocket", pattern Singleton Manager
- `lib/polymarket/client.ts` — capire lo stile già in uso nel layer Polymarket
- `lib/polymarket/types.ts` — tipi GammaMarket già definiti

---

## Cosa costruire

```
lib/ws/
  SingletonWS.ts      ← manager generico: 1 connessione per URL, auto-reconnect
  clob.ts             ← wrapper CLOB specifico: subscribe/unsubscribe per topic
  hooks/
    useLiveMidpoint.ts   ← hook React che ritorna { midpoint, change } per marketId
    useLiveOrderbook.ts  ← hook React che ritorna { bids, asks } per marketId
```

---

## Regole architetturali

- **1 connessione per URL** — mai aprire 2 WebSocket allo stesso endpoint
- **Singleton via module-level variable** — non Context, non Zustand
- **Subscribe/unsubscribe reference counting** — la connessione si chiude solo quando 0 subscriber
- **Auto-reconnect** con exponential backoff (max 30s)
- **Solo client-side** — niente `typeof window === 'undefined'` leaks; i file WS non devono essere importati in Server Components
- **Ogni file max 150 righe** (vedi AGENTS.md)

---

## Endpoint CLOB WebSocket

URL: `wss://ws-subscriptions-clob.polymarket.com/ws/market`

Topic per prezzi live: `price_change` — payload include `asset_id` (clobTokenId), `price`, `side`
Topic per orderbook: `book` — payload include `asset_id`, `bids`, `asks`

Come autenticarsi: nessuna auth per dati pubblici (read-only). Solo i POST ordini richiedono firma.

I `clobTokenIds` dei mercati sono già presenti in `AuktoraMarket.clobTokenIds` (da mappers.ts).

---

## Acceptance criteria

- [ ] `npm run validate` passa
- [ ] `npm run build` exit 0
- [ ] Hook `useLiveMidpoint('TOKEN_ID')` ritorna dati aggiornati ogni volta che il WS riceve `price_change` per quel token
- [ ] Hook `useLiveOrderbook('TOKEN_ID')` ritorna bids/asks aggiornati
- [ ] Una sola connessione WS attiva per endpoint (verifica nei DevTools Network → WS tab)
- [ ] Disconnect automatico quando l'ultimo subscriber fa unmount
- [ ] Reconnect automatico se la connessione cade
- [ ] Commit: `git commit -m "feat: WebSocket CLOB singleton — live prices + orderbook hooks (3.2.3)" && git push origin main`

---

## Note

- Non costruire ancora l'UI che usa questi hook — arriverà in 3.3.4 (Crypto card) e 3.5.2 (pagina evento)
- Non aggiungere test per il WS in questo sprint — testarei manualmente con un componente temporaneo
- Non installare librerie nuove — WebSocket nativo del browser è sufficiente
- Il tipo `clobTokenIds` in `AuktoraMarket` è `[string, string] | null`: index 0 = Yes token, index 1 = No token
