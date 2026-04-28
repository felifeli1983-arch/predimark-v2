# PROMPT — Sprint MA4.4 — Polymarket CLOB V2 Real Mode

> **Quando eseguire**: subito (decisione utente 2026-04-28: partiamo ora, aggiorniamo se SDK cambia)
> **Priorità**: ALTA — sblocca real trading (oggi tutto DEMO)
> **Endpoint**: `https://clob-v2.polymarket.com` (pre-cutover) → `https://clob.polymarket.com` (post-cutover, stessa URL)

---

## Obiettivo

Integrare Polymarket CLOB V2 per real trading manuale (no copy/auto in MA4.4). Lifecycle:

1. User in REAL mode → seleziona market → TradeWidget mostra prezzo live
2. Submit → server Edge Function builds EIP-712 v2 typed data → client signs via Privy embedded wallet → submit to CLOB
3. On fill → INSERT trade + position + UPDATE balance (`usdc_balance` decrementato dell'amount)
4. Sell REAL via CLOB sell order

Out of scope MA4.4: copy trading, signal-driven trades, auto-fill.

---

## Riferimenti Doc letti

- `docs/05:90-103` — CLOB V2 SDK + pUSD + EIP-712 v2 + builderCode
- `docs/05:105-110` — Endpoint Gamma + CLOB + Data + WS RTDS
- `docs/05:157-176` — Edge Function `submit-trade`
- `docs/06:453-507` — Tabella `trades` (real columns: polymarket_order_id, tx_hash, builder_fee, service_fee, source)
- `docs/06:513-543` — Tabella `balances` (usdc_balance, usdc_locked, real_total_pnl, real_volume_total)
- `docs/07:749-816` — POST trades/submit + sell (real mode body/response)
- `docs/07:1913-1961` — Edge Function `submit-trade` flow CLOB V2
- `docs/07:2057-2071` — env `POLYMARKET_BUILDER_CODE`, base URLs

---

## Fasi sprint (deploy incrementale)

### Phase A — Foundation read-only ✅ no rischi

**Goal**: SDK installato + auth headers L1 + endpoint read funzionanti, niente firma né scrittura.

- [ ] `npm i @polymarket/clob-client-v2`
- [ ] `lib/polymarket/client.ts` — wrapper SDK V2 (constructor object: `{ host, chain, signer }`)
- [ ] `lib/polymarket/markets.ts` — `getMidpoint(tokenId)`, `getOrderBook(tokenId)`, `getMarket(conditionId)` (read-only)
- [ ] `app/api/v1/polymarket/health/route.ts` — GET smoke test (Gamma + CLOB)
- [ ] env `.env.example` aggiornato: `POLYMARKET_CLOB_URL`, `POLYMARKET_GAMMA_URL`, `POLYMARKET_BUILDER_CODE`, `POLYMARKET_CHAIN_ID=137`
- [ ] Test integrazione (vitest, hit reale API, skipped in CI senza secret)

**Acceptance**: `curl /api/v1/polymarket/health` → 200 con midpoint di un market live. Niente DB write.

### Phase B — Auth L2 + pUSD onboarding

**Goal**: User può derivare API credentials e wrappare USDC.e → pUSD. Niente order ancora.

- [ ] DB migration: `users` aggiunge `polymarket_api_key/secret/passphrase` (encrypted con pgsodium).
- [ ] `lib/polymarket/auth.ts` — `deriveApiKey(signer)` chiama POST `/auth/api-key` con L1 sig
- [ ] `app/api/v1/polymarket/onboard/route.ts` — POST: client manda L1 sig → server salva creds → ritorna OK
- [ ] `lib/polymarket/pusd.ts` — `getPusdBalance(address)`, `wrapUsdcToPusd(signer, amount)` (Collateral Onramp contract)
- [ ] UI: in `/me/wallet` (NUOVO) bottone "Onboard Polymarket" → flow Privy sign → onboard
- [ ] Geo-block check (US/blocked countries) — Cloudflare header `cf-ipcountry` o IP-API fallback

**Acceptance**: user logga, click "Onboard", vede balance USDC.e + pUSD, può wrappare $X. DB ha api_key cifrata.

### Phase C — Submit Real (manual)

**Goal**: Submit market + limit order REAL end-to-end con persistence DB.

- [ ] Supabase Edge Function `submit-trade`:
  - Input: `{ marketId, side, amountUsdc, orderType, limitPrice?, expiresAt? }`
  - Validate: balance pUSD >= amountUsdc, market open, geo OK
  - Build EIP-712 v2 typed data (Exchange domain v2 + V2 contract addresses)
  - Order struct V2: `salt, maker, signer, tokenId, makerAmount, takerAmount, side (0/1), signatureType (0=EOA, 2=Privy embed), timestamp ms, metadata bytes32, builder bytes32 (POLYMARKET_BUILDER_CODE)`
  - Return typed data al client (NON firma server-side per manual)
- [ ] `lib/polymarket/sign.ts` (client) — Privy embedded wallet `signTypedData_v4(typedData)`
- [ ] `app/api/v1/trades/submit/route.ts` aggiornato — dispatch DEMO vs REAL:
  - REAL → call Edge Function `submit-trade` (build typed data)
  - Client firma via Privy → POST `/api/v1/trades/finalize` con signature
  - Server submits a CLOB POST `/order` con headers L2 + body order signed
  - Insert trades row, upsert positions, decrement `usdc_balance`
- [ ] `app/api/v1/trades/finalize/route.ts` — handler post-signing
- [ ] `lib/trades/submit-real.ts` — orchestrator REAL
- [ ] UI TradeWidget: in REAL mode rimuovi label "DEMO", aggiungi geo-block warning, signing modal
- [ ] Sell real via CLOB `/order` con side='sell' → update position + balance

**Acceptance**: user firma + invia ordine → CLOB risponde con orderID → DB ha trade row con polymarket_order_id. Visibile su `polymarket.com/profile/<address>`.

### Phase D — Edge cases + WS resolution (post-MA4.4)

- WS subscription RTDS per fill notifications
- Settlement on market resolution (cron + Data API)
- Limit order management (cancel, view open orders)
- Refund flow se ordine non si fila (timeout, market closes)

---

## File da creare/modificare

### Nuovi (Phase A)

- `lib/polymarket/client.ts`
- `lib/polymarket/markets.ts`
- `app/api/v1/polymarket/health/route.ts`
- `lib/polymarket/__tests__/client.test.ts`

### Nuovi (Phase B)

- `lib/polymarket/auth.ts`
- `lib/polymarket/pusd.ts`
- `app/api/v1/polymarket/onboard/route.ts`
- `app/me/wallet/page.tsx` + `components/wallet/OnboardCard.tsx`
- Migration `add_polymarket_api_creds_users`

### Nuovi (Phase C)

- `supabase/functions/submit-trade/index.ts`
- `lib/polymarket/sign.ts`
- `lib/polymarket/order.ts` (build EIP-712 typed data)
- `lib/trades/submit-real.ts`
- `app/api/v1/trades/finalize/route.ts`

### Modificati

- `app/api/v1/trades/submit/route.ts` — dispatcher
- `components/trade/TradeWidget.tsx` — REAL mode
- `lib/trades/sell.ts` — sellSharesReal (parallel a sellSharesDemo)
- `app/api/v1/trades/sell/route.ts` — dispatch DEMO vs REAL

---

## Constants V2 (env vars)

```
POLYMARKET_CLOB_URL=https://clob-v2.polymarket.com
POLYMARKET_GAMMA_URL=https://gamma-api.polymarket.com
POLYMARKET_DATA_URL=https://data-api.polymarket.com
POLYMARKET_BUILDER_CODE=0xc520...92475  (da Builder Profile Auktora)
POLYMARKET_CHAIN_ID=137
POLYMARKET_EXCHANGE_STANDARD=0xE111180000d2663C0091e4f400237545B87B996B
POLYMARKET_EXCHANGE_NEGRISK=0xe2222d279d744050d28e00520010520000310F59
POLYMARKET_PUSD_TOKEN=...  (da docs ufficiali V2)
POLYMARKET_COLLATERAL_ONRAMP=...  (per wrap USDC.e → pUSD)
```

---

## Audit post-sprint per fase

Ogni phase termina con:

1. Smoke test E2E manuale dell'AC
2. `npm run validate` verde
3. `npm run build` pulito
4. Commit + push (no merge in main fino a tutto verde)
5. Update HANDOFF-LOG con stato fase + decisioni

Phase A (~2h) → Phase B (~4h, include migration crypto) → Phase C (~6-8h, Edge Function + signing flow) → Phase D follow-up.
