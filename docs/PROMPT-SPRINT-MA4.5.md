# PROMPT — Sprint MA4.5 — Positions + History + Sell flow DEMO

> **Quando eseguire**: dopo MA4.3.1 (Trade Widget DEMO funzionante)
> **Priorità**: ALTA — sblocca lifecycle completo trade DEMO (open → view → close)
> **Autore prompt**: VS Code Claude (modalità autonoma)
> **Note**: anticipato rispetto a MA4.4 perché Polymarket CLOB V2 (rilasciato
> 2026-04-28) richiede ~1 settimana di stabilizzazione prima di integrare.

---

## Obiettivo

Completare il lifecycle DEMO del trade:

1. **`/me/positions`** — lista posizioni aperte con P&L live, bottone Sell
2. **`/me/history`** — storico trade chiusi con filtri base (period, is_win)
3. **POST /api/v1/trades/sell** — vendita shares DEMO (close totale o parziale)
4. **Hydrator update** — re-fetch balance dopo sell

In MA4.5: solo DEMO. Sell REAL via Polymarket CLOB → MA4.4 (post V2 stabilization).

---

## Riferimenti Doc letti

- `docs/02-USER-STORIES.md:296-302` — US-016: posizione appare immediatamente in /me/positions
- `docs/03-SITEMAP.md:88-89, 266, 284-285` — `/me/positions` + `/me/history` + endpoints
- `docs/06-DATABASE-SCHEMA.md` — schema positions, trades, balances (verificato)
- `docs/07-API-DESIGN.md:357-403` — GET `/users/me/positions` con response shape
- `docs/07-API-DESIGN.md:405-460` — GET `/users/me/trades` history
- `docs/07-API-DESIGN.md:800-816` — POST `/trades/sell` body/response

---

## Architettura

### Server endpoints

#### `GET /api/v1/users/me/positions`

Query: `?is_demo=true|false` (default false), `?per_page=20&page=1`
Auth required → join positions + markets, filter is_demo, sort `-opened_at`.
Response shape: vedi Doc 07 (data array + meta totale_value + totale_pnl + paging).

#### `GET /api/v1/users/me/trades`

Query: `?is_demo`, `?filter[type]=open|close|resolution`, `?filter[period]=today|7d|30d|all`, paging.
Storico chiuso (potenzialmente anche open per "all").

#### `POST /api/v1/trades/sell`

Body:

```json
{
  "positionId": "uuid",
  "sharesToSell": 50,
  "currentPrice": 0.62,
  "isDemo": true
}
```

Server logic:

1. requireUserId
2. Lookup position by id, validate (own + is_open + is_demo match + shares_to_sell ≤ shares)
3. Calc: `totalReceived = sharesToSell * currentPrice`
4. Calc: `pnl = (currentPrice - position.avg_price) * sharesToSell`
5. Calc: `pnl_pct = (currentPrice / position.avg_price - 1) * 100`
6. INSERT trades { trade_type='close', side=position.side, shares=sharesToSell, price=currentPrice, total_amount=totalReceived, pnl, pnl_pct, is_win=(pnl>0), is_demo, source='manual' }
7. UPDATE position: shares -= sharesToSell. Se shares=0 → is_open=false, closed_at=NOW. Else aggiorna current_value.
8. UPDATE balance: demo_balance += totalReceived, demo_total_pnl += pnl

Response 201:

```json
{ "tradeId": "uuid", "newDemoBalance": 9050.0, "pnl": 12.0, "isWin": true }
```

Errori: INVALID_BODY, MISSING_FIELD, POSITION_NOT_FOUND, POSITION_CLOSED, INVALID_SHARES, INTERNAL_ERROR.

### Helper splits (rispettare AGENTS.md ≤100 route, ≤150 lib)

- `lib/positions/queries.ts` — `listOpenPositions(supabase, userId, filters)`
- `lib/positions/close.ts` — `closePositionPartial(supabase, params)` — gestisce shares -= e close
- `lib/trades/queries.ts` — `listTradesHistory(supabase, userId, filters)`
- `lib/trades/sell.ts` — `sellSharesDemo(supabase, userId, body)` — orchestrator
- `lib/trades/pnl.ts` — `computePnL(avgPrice, currentPrice, shares)` (puro)

### Client side

- `lib/api/positions-client.ts` — `fetchOpenPositions(token, opts)`
- `lib/api/trades-client.ts` — aggiungere `fetchTradesHistory`, `postSellTrade`
- `lib/hooks/useSellTrade.ts` — orchestra Privy + API + balance update post-success

### Pages

#### `app/me/positions/page.tsx`

- Server shell + `<PositionsList>` client component
- Client: fetch su mount, segnala `?demo=1` query per switch view
- Empty state: "Nessuna posizione aperta. Apri un trade dalla home →"

#### `app/me/history/page.tsx`

- Idem ma per trade history
- Filter chips: All / Open / Close / Resolution + period (Today / 7d / 30d / All)

### Componenti

- `components/me/PositionsList.tsx` — lista con header summary (Total value + Total P&L)
- `components/me/PositionRow.tsx` — singola posizione: avatar, title, side chip, shares, avg/current, P&L colored, **bottone Sell**
- `components/me/SellConfirmModal.tsx` — modal con shares input (slider 1-100% o number), preview totalReceived + P&L stimato + bottoni Annulla/Conferma
- `components/me/TradesHistoryList.tsx` — lista trade chiusi con filter chip
- `components/me/TradeHistoryRow.tsx` — singola riga trade: market, type, side, shares, price, P&L (se close), timestamp

### Subnav `/me/*`

Aggiunta linkbar in `app/me/layout.tsx` (NUOVO) con tabs: Watchlist · Positions · History (+ futuri /me/stats /me/settings).

---

## File da creare/modificare

### Nuovi

- `app/me/layout.tsx` — subnav + container
- `app/me/positions/page.tsx`
- `app/me/history/page.tsx`
- `app/api/v1/users/me/positions/route.ts`
- `app/api/v1/users/me/trades/route.ts`
- `app/api/v1/trades/sell/route.ts`
- `lib/positions/queries.ts`
- `lib/positions/close.ts`
- `lib/trades/queries.ts`
- `lib/trades/sell.ts`
- `lib/trades/pnl.ts`
- `lib/api/positions-client.ts`
- `lib/hooks/useSellTrade.ts`
- `components/me/PositionsList.tsx`
- `components/me/PositionRow.tsx`
- `components/me/SellConfirmModal.tsx`
- `components/me/TradesHistoryList.tsx`
- `components/me/TradeHistoryRow.tsx`
- `lib/trades/__tests__/pnl.test.ts`

### Modificati

- `lib/api/trades-client.ts` — aggiungi sell + history fetch
- `lib/stores/useBalance.ts` — `setDemoBalanceAfterSell` helper
- `app/me/watchlist/page.tsx` — wrap nel nuovo layout (usa subnav)

---

## Acceptance criteria

- [ ] `GET /api/v1/users/me/positions` con filter is_demo + paging
- [ ] `GET /api/v1/users/me/trades` con filter type+period+is_demo + paging
- [ ] `POST /api/v1/trades/sell` con full validation + atomic-ish flow
- [ ] `/me/positions` page con lista, summary, bottone Sell + modal
- [ ] `/me/history` page con filter chip (All/Open/Close/Period) + lista
- [ ] Sub-nav `/me/*` con 3 tab (Watchlist/Positions/History)
- [ ] Sell DEMO end-to-end: position → modal → submit → balance update + history list aggiornato
- [ ] Test `lib/trades/pnl.ts` (puro): pnl + pnl_pct corretti per profit/loss/breakeven
- [ ] Validate verde + build pulito

---

## Post-sprint audit

A fine sprint: rilettura prompt, verifica AC nel codice (file:riga), test manuale sell DEMO end-to-end con SQL check su `trades` (close row) + `positions` (is_open false) + `balances` (demo_balance + demo_total_pnl aggiornati).

## TODO MA4.4 (post-V2 stabilization)

- Limit order submit DB-side (mock fino a CLOB)
- `@polymarket/clob-client-v2` integration (real mode)
- Edge Function `submit-trade` con EIP-712 v2 + builderCode
- Sell REAL flow via CLOB
- pUSD wrap helper
