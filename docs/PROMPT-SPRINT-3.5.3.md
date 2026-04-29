# PROMPT — Sprint 3.5.3 — Event Page: chart live + CardKind-aware data

> **Priorità**: ALTA — il chart è sempre vuoto, le card sport/crypto non mostrano dati live
> **Base**: dopo commit `a560381` (sync-price-history cron + recorded_at fix)

---

## Problema da risolvere

Quando un utente apre `/event/[slug]`:

1. **Chart sempre vuoto** — la tabella `markets` locale è vuota perché `app/event/[slug]/page.tsx` non fa upsert dei markets Gamma nel DB. Il cron `sync-price-history` cerca `is_active=true` → trova 0 righe → no-op. `price_history` resta vuota.

2. **`PriceHistoryChart` non è CardKind-aware** — per `crypto_up_down` mostrare probabilità "YES" non ha senso: serve il prezzo spot live. Per `h2h_sport` live serve score stub.

3. **`EventHero` identico per tutti i CardKind** — nessun layout speciale per sport H2H (due team affiancati) né per crypto (coin icon + live price).

---

## Fix 1 — Fire-and-forget upsert markets in `app/event/[slug]/page.tsx`

Quando la Server Component carica un evento da Gamma, fare upsert di tutti i suoi markets nel DB locale in modo non-bloccante. Questo popola la tabella `markets` per ogni visita (anche anonima), permettendo al cron `sync-price-history` di trovare i markets attivi.

```ts
// app/event/[slug]/page.tsx — aggiungere dopo mapGammaEvent(raw)

import { createAdminClient } from '@/lib/supabase/admin'
import { resolveOrUpsertMarket } from '@/lib/markets/upsert'

// Fire-and-forget: non await, non blocca la render
void seedMarketsFromEvent(raw, event)
```

Creare la funzione helper nello stesso file (non esportata, solo locale):

```ts
async function seedMarketsFromEvent(raw: GammaEvent, event: AuktoraEvent): Promise<void> {
  try {
    const supabase = createAdminClient()
    await Promise.allSettled(
      event.markets.map((m, i) =>
        resolveOrUpsertMarket(supabase, {
          polymarketMarketId: m.id,
          polymarketEventId: event.id,
          slug: m.slug,
          title: m.question,
          cardKind: event.kind,
          category: event.tags[0] ?? 'general',
          image: event.image,
          currentYesPrice: m.yesPrice,
          clobTokenIds: m.clobTokenIds,
          // is_active: market aperto e non chiuso
        })
      )
    )
  } catch {
    // silenzioso — non deve bloccare la pagina
  }
}
```

Nota: `resolveOrUpsertMarket` non ha il campo `is_active` nel payload attuale. Aggiungere supporto:

- In `lib/markets/upsert.ts`: aggiungere `isActive?: boolean` a `MarketUpsertPayload`
- Nel upsert: settare `is_active: payload.isActive ?? true`
- La colonna `is_active` esiste già in `database.types.ts`

---

## Fix 2 — `PriceHistoryChart` CardKind-aware

Accettare `cardKind` come prop aggiuntivo e rendere il comportamento dipendente:

```ts
interface Props {
  marketId: string
  cardKind?: CardKind
  /** clobTokenId per live midpoint (crypto_up_down) */
  assetId?: string | null
}
```

**Comportamento per CardKind:**

- **`binary`** (default), **`multi_outcome`**, **`multi_strike`**: comportamento attuale — history chart da `price_history` DB
- **`crypto_up_down`**: NON mostrare history chart. Mostrare invece:
  - Prezzo spot live da `useLiveMidpoint(assetId)` in formato grande
  - Variazione % dalla sessione (già in `useLiveMidpoint`)
  - Label "Prezzo spot live · CLOB"
  - Se assetId null → skeleton con "Connessione WebSocket..."
- **`h2h_sport`**:
  - Se `event.active` → mostrare box "Score live · disponibile in MA6" (stub)
  - Se non attivo → history chart normale

**In `EventPageShell.tsx`**, passare le props aggiuntive:

```tsx
{
  event.markets[0] && (
    <PriceHistoryChart
      marketId={event.markets[0].id}
      cardKind={event.kind}
      assetId={event.markets[0].clobTokenIds?.[0] ?? null}
    />
  )
}
```

---

## Fix 3 — `EventHero` CardKind-aware per h2h_sport e crypto_up_down

### H2H Sport (`h2h_sport`)

Se `event.kind === 'h2h_sport'` e ci sono esattamente 2 markets (o 2 outcomes), mostrare layout "due team":

```
[Logo/Icona Team A]  VS  [Logo/Icona Team B]
   [Nome team A]         [Nome team B]
   [probabilità]         [probabilità]
```

Usare `event.markets[0].outcomes[0]` e `event.markets[0].outcomes[1]` (o i primi 2 markets).
Se `event.active`: mostrare badge LIVE (già presente).
Score: stub `–` (dati live in MA6).

### Crypto Up/Down (`crypto_up_down`)

Hero con layout orizzontale:

- Icona evento (già presente `event.icon`)
- Titolo evento
- Live price da `useLiveMidpoint` (se disponibile) con variazione % colorata
- Countdown scadenza via `useCountdown(event.endDate)` (già in `lib/hooks/useCountdown.ts`)

---

## Fix 4 — `EventSidebarStub` — sezioni inline mobile

In `EventSidebarStub.tsx`, le sezioni "Segnale Predimark" e "Mercati correlati" devono essere visibili inline su mobile (già ha `layout="inline"` prop in `EventPageShell`). Verificare che siano renderizzate correttamente.

---

## Struttura file da modificare

```
app/event/[slug]/page.tsx              ← aggiunge seedMarketsFromEvent (fire-and-forget)
lib/markets/upsert.ts                  ← aggiunge isActive al payload
components/event/PriceHistoryChart.tsx ← CardKind-aware (crypto live, sport score stub)
components/event/EventHero.tsx         ← layout speciale h2h_sport + crypto_up_down
components/event/EventPageShell.tsx    ← passa cardKind + assetId a PriceHistoryChart
```

---

## Regole architetturali

- Nessun colore hardcoded — solo CSS vars
- `next/image` per loghi team/icone
- `page.tsx` rimane Server Component — `seedMarketsFromEvent` usa `createAdminClient()` server-side
- `PriceHistoryChart` è Client Component — può usare hook WebSocket
- `EventHero` è già Client Component (`useState`) — ok per `useLiveMidpoint` e `useCountdown`
- `void` su promise non-bloccanti nel Server Component
- Max 300 righe per componente — splittare se necessario

---

## Acceptance criteria

- [ ] Aprire un evento qualunque: dopo la prima visita, il market appare nella tabella `markets` del DB
- [ ] Dopo il primo run del cron `sync-price-history`, `price_history` ha righe per quel market
- [ ] Chart visibile con dati reali per eventi binary con history disponibile
- [ ] `crypto_up_down`: sezione chart mostra prezzo spot live via WebSocket (o skeleton se WS non connesso)
- [ ] `h2h_sport` live: sezione chart mostra badge "Score live · MA6"
- [ ] `h2h_sport` non-live: mostra history chart normale
- [ ] `EventHero` per h2h_sport mostra due team affiancati con probabilità
- [ ] `EventHero` per crypto_up_down mostra countdown scadenza
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "feat: Event page CardKind-aware chart + market seed (3.5.3)" && git push origin main`
