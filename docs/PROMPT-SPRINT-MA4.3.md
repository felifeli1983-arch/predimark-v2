# PROMPT — Sprint MA4.3 — Trade Widget single-market (DEMO mode)

> **Quando eseguire**: dopo MA4.2 (watchlist functional)
> **Priorità**: ALTA — primo trade reale (anche se DEMO) end-to-end
> **Autore prompt**: VS Code Claude (modalità autonoma)
> **DB pre-check**: schema balances/positions/trades verificato, RLS in place

---

## Obiettivo

Trasformare lo stub `[Trade stub MA4.3]` in un Trade Widget **single-market funzionante in modalità DEMO**:

- Sidebar destra desktop / bottom sheet mobile sull'event page
- Pre-fill da query param `?market=X&side=Y` (link da home cards)
- Modalità Mercato funzionante: insert in `trades`, upsert in `positions`, decrement `balances.demo_balance`
- Modalità Limite: UI presente ma submit disabilitato (rinviato MA4.4)
- Modal conferma prima del submit
- Toast feedback success/error
- Banner saldo + banner DEMO mode

**NON in MA4.3**: Limit order submit, Polymarket CLOB integration, Privy signing, Sell flow, Banner Segnale (MA5).

---

## Riferimenti Doc letti

- `docs/04-WIREFRAMES-pagina2-evento-v3.md:128-356` — TRADE WIDGET UNIFICATO, Mercato/Limite, quick amounts dinamici, stato saldo
- `docs/07-API-DESIGN.md:749-799` — `POST /api/v1/trades/submit` body/response/errors
- `docs/06-DATABASE-SCHEMA.md` — schema trades, positions, balances (verificato in DB)
- `docs/09-ROADMAP-AND-SPRINT-PLAN-v2.md:712-731` — sprint 4.2.1 demo + 4.4 real

---

## Architettura

### Server: `app/api/v1/trades/submit/route.ts`

```ts
// POST /api/v1/trades/submit
// Auth: required (requireUserId helper esistente)
// Body:
// {
//   polymarketMarketId: string,    // string Gamma (resolve a markets.id)
//   polymarketEventId: string,     // per upsert markets se non esiste
//   slug: string,
//   title: string,
//   cardKind: string,
//   category: string,
//   side: string,                  // 'yes' | 'no' | team name | 'up' | 'down'
//   amountUsdc: number,            // > 0
//   pricePerShare: number,         // 0 < x < 1 (snapshot prezzo client)
//   isDemo: boolean,               // true per MA4.3
// }

// Server logic (atomic via TX o sequential):
// 1. requireUserId → user.id interno
// 2. Upsert markets (admin client, onConflict polymarket_market_id)
// 3. Validazione:
//    - amountUsdc > 0 (400 INVALID_AMOUNT)
//    - 0 < pricePerShare < 1 (400 INVALID_PRICE)
//    - SELECT balances WHERE user_id → demo_balance >= amountUsdc (403 INSUFFICIENT_BALANCE)
// 4. Calcola: shares = amountUsdc / pricePerShare
// 5. INSERT trades { user_id, market_id, trade_type='open', side, shares, price, total_amount=amountUsdc, source='manual', is_demo=true }
// 6. UPSERT positions:
//    - cerca riga esistente per (user_id, market_id, side, is_demo, is_open=true)
//    - se exists: aggiorna shares += new shares, ricalcola avg_price, total_cost += amountUsdc
//    - else: insert nuova
// 7. UPSERT balances:
//    - SELECT current
//    - UPDATE demo_balance -= amountUsdc, demo_volume_total += amountUsdc
//    - se balances row non esiste, INSERT con default demo_balance - amountUsdc
// 8. Return { tradeId, positionId, sharesAcquired, newDemoBalance }

// Errori standardizzati (vedi Doc 07): INVALID_AMOUNT, INVALID_PRICE,
// INSUFFICIENT_BALANCE, MARKET_NOT_FOUND, INTERNAL_ERROR
```

### Client store: `lib/stores/useTradeWidget.ts`

Zustand non-persisted (stato ephemeral del widget):

```ts
interface TradeDraft {
  polymarketMarketId: string
  polymarketEventId: string
  slug: string
  title: string
  cardKind: string
  category: string
  side: string
  pricePerShare: number // snapshot al pre-fill
}

interface TradeWidgetState {
  draft: TradeDraft | null
  /** Modalità attiva: 'market' funzionale, 'limit' UI-only */
  mode: 'market' | 'limit'
  /** Importo USDC scelto in modalità Mercato */
  amountUsdc: number
  /** Limite — placeholder per MA4.4 */
  limitPriceCents: number
  limitShares: number
  /** Widget visibility (mobile bottom sheet) */
  isOpen: boolean
}
```

Actions: `setDraft`, `setMode`, `setAmountUsdc`, `incrementAmount`, `setLimitPrice`, `setLimitShares`, `open`, `close`, `clear`.

### Client hook: `lib/hooks/useTradeSubmit.ts`

```ts
// orchestra Privy token + balance fetch + submit + toast feedback
export function useTradeSubmit() {
  const { getAccessToken } = usePrivy()
  return {
    submit: async (draft, amountUsdc) => Promise<TradeSubmitResult>,
  }
}
```

### Componenti UI

#### `components/trade/TradeWidget.tsx` — shell

- `lg:`: sticky sidebar destra dentro PageContainer
- `<lg:`: bottom sheet (overlay + slide up) controllato da `isOpen`
- Header con toggle Mercato/Limite + identità mercato (titolo evento + chip side)
- Body: `<TradeMarketTab>` o `<TradeLimitTab>`
- Footer: saldo USDC visibile + `<TradeConfirmModal>` trigger

#### `components/trade/TradeMarketTab.tsx`

- Importo USDC con `[-]`/`[+]` ai lati + input editabile
- Quick amounts statici: `[+$1] [+$5] [+$10] [+$100] [Max]`
- Calcolo live "Per vincere $X.XX" = amountUsdc / pricePerShare
- "Prezzo medio NN¢" = pricePerShare \* 100

#### `components/trade/TradeLimitTab.tsx`

- Input prezzo limit (cents)
- Input azioni
- Quick amounts dinamici (placeholder per MA4.4: usa preset statici)
- Toggle scadenza (UI presente ma non submit)
- Bottone "Trading" disabilitato + tooltip "Limit orders coming MA4.4"

#### `components/trade/TradeConfirmModal.tsx`

- Riassunto: titolo · side · amount · payout potenziale · saldo dopo
- Bottone "Conferma" → call submit → toast → close
- Bottone "Annulla" → close modal

#### `components/trade/TradeBalanceBadge.tsx`

- Badge saldo USDC (real/demo a seconda di `themeStore.isDemo`)
- Click → naviga `/me/wallet` (futuro) o `/me/positions`

### Mount nell'event page

`EventPageShell.tsx`:

- Sostituire `EventSidebarStub` con il vero `<TradeWidget>` come slot sidebar
- Mobile: il widget apre come bottom sheet quando l'utente clicca un bottone outcome (`onTrade(marketId, side)` ora setta draft + `open()`)

`EventProbabilities.tsx`:

- Già ha `onTrade` callback. Sostituire stub `console.warn` con: setta draft nel widget store + `open()` (mobile) o focus widget desktop

### Pre-fill da query param

In `EventPageShell.tsx` (o nuova `EventTradeBoot.tsx` mounted client-side):

- `useSearchParams()` → `market`, `side`
- Se entrambi presenti → trova market in `event.markets` → setta draft → open() (mobile) / focus
- One-shot: dopo il pre-fill, replaceState per pulire l'URL (no redirect)

---

## File da creare

### Nuovi

- `app/api/v1/trades/submit/route.ts` (POST endpoint)
- `lib/api/trades-client.ts` (fetch helpers)
- `lib/stores/useTradeWidget.ts` (Zustand)
- `lib/hooks/useTradeSubmit.ts` (orchestra Privy + API + toast)
- `components/trade/TradeWidget.tsx`
- `components/trade/TradeMarketTab.tsx`
- `components/trade/TradeLimitTab.tsx`
- `components/trade/TradeConfirmModal.tsx`
- `components/trade/TradeBalanceBadge.tsx`
- `components/event/EventTradeBoot.tsx` (pre-fill da query param)
- `lib/stores/__tests__/useTradeWidget.test.ts`

### Modificati

- `components/event/EventPageShell.tsx` — sostituisci EventSidebarStub con TradeWidget
- `components/event/EventProbabilities.tsx` — onTrade ora setta draft widget + open
- `components/event/OutcomeRowFull.tsx` — idem
- `components/event/EventSidebarStub.tsx` — rimuovi TradeWidgetStub interno (resta solo Segnale + Mercati correlati)
- `app/globals.css` — classe `.trade-widget` responsive (sidebar lg+ / bottom sheet mobile)

---

## Acceptance criteria

- [ ] `POST /api/v1/trades/submit` con DEMO mode funzionante (auth + validation + atomic-ish update)
- [ ] `useTradeWidget` Zustand store (draft, mode, amountUsdc, isOpen)
- [ ] `<TradeWidget>` responsive (sidebar lg+ / bottom sheet <lg)
- [ ] Modalità Mercato: amount input + quick amounts + payout live + submit
- [ ] Modalità Limite: UI presente, submit disabilitato (tooltip "MA4.4")
- [ ] `<TradeConfirmModal>` con riassunto + Conferma/Annulla
- [ ] Toast feedback success ("Trade eseguito · $X investiti, Y shares") / error
- [ ] Saldo USDC visibile (real/demo dipende da `themeStore.isDemo`)
- [ ] Pre-fill da query param `?market=X&side=Y` funziona (apre widget pre-compilato)
- [ ] Click bottoni outcome su event page → setta draft widget + apre (mobile)
- [ ] Test useTradeWidget store
- [ ] Validate verde + build pulito

---

## Post-sprint audit

A fine sprint:

1. Verifica AC nel codice (file:riga)
2. Test manuale: login + DEMO mode → click outcome → conferma → riapri widget e vedi saldo aggiornato
3. SQL: `SELECT * FROM trades WHERE user_id = ... ORDER BY executed_at DESC LIMIT 5` mostra il trade
4. SQL: `SELECT * FROM positions WHERE user_id = ... AND is_open = true` mostra la posizione aperta
5. SQL: `SELECT demo_balance FROM balances WHERE user_id = ...` mostra il saldo decrementato

---

## TODO MA4.4 e oltre

- Limit order submit (DB-side per ora, no Polymarket)
- Sell flow (POST /api/v1/trades/sell)
- Polymarket CLOB integration (Edge Function submit-trade per real mode)
- Privy batch sign per real trades
- `/me/positions` page con position list + sell button
- Banner Segnale Predimark nel widget (MA5)
