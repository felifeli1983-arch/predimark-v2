# PROMPT — Sprint MA4.2 — Watchlist functional (DB sync + StarToggle reale)

> **Quando eseguire**: dopo MA4.1-BIS (StarToggle placeholder già esistente)
> **Priorità**: ALTA — sblocca la stellina che oggi è solo `console.warn`
> **Autore prompt**: VS Code Claude (modalità autonoma)
> **DB pre-check**: tabella `watchlist` esiste già su staging con RLS, schema verificato

---

## Obiettivo

Rendere funzionante la stellina ☆ delle card collegandola al DB Supabase. Ogni utente loggato può aggiungere/rimuovere mercati dalla propria watchlist; lista visibile in `/me/watchlist`.

---

## Schema DB (staging — già esistente, verificato)

**`watchlist`** (`hhuwxcijarcyivwzpqfp.public.watchlist`):

- `id` UUID PK (gen_random_uuid)
- `user_id` UUID FK → `users.id`
- `market_id` UUID FK → `markets.id`
- `notify_price_change_pct` numeric, nullable
- `notify_signal` boolean, default true
- `notify_resolution` boolean, default true
- `added_at` timestamptz, default now()
- **UNIQUE (user_id, market_id)** — toggle naturale via INSERT...ON CONFLICT

**RLS policies (già attive)**:

- `watchlist_select_own` / `watchlist_insert_own` / `watchlist_delete_own`: matchano `user_id` con `(SELECT id FROM users WHERE auth_id = auth.uid())`

**Problema da risolvere**: il client manda `polymarket_market_id` (stringa Gamma, es. "0x..."), ma watchlist FK punta a `markets.id` (UUID interno). Serve mapping. La tabella `markets` è oggi vuota. RLS markets blocca insert da utenti normali (solo admin).

**Soluzione**: server endpoint usa **admin client** per upsert idempotente in `markets` (resolve `polymarket_market_id` → internal UUID), poi insert in `watchlist` con user client.

---

## Riferimenti Doc letti

- `docs/02-USER-STORIES.md:329-341` — Sub-page Watchlist con notify settings
- `docs/03-SITEMAP.md:91, 322-324` — `/me/watchlist` + endpoint `/api/v1/watchlist*`
- `docs/06-DATABASE-SCHEMA.md:818-841` — schema watchlist (allineato a staging)
- `docs/07-API-DESIGN.md:1347-1382` — spec endpoints GET/POST/DELETE
- `docs/09-ROADMAP-AND-SPRINT-PLAN-v2.md:875` — Sprint 5.3.4 prevedeva la sub-page

---

## Architettura

### Server side

#### `app/api/v1/watchlist/route.ts` — GET + POST

```ts
// GET: ritorna watchlist user con join markets info
// Auth: required
// Response 200: { items: Array<{ market: AuktoraMarket, notify_price_change_pct, ...}> }

// POST: aggiungi market a watchlist (idempotent)
// Auth: required
// Body: {
//   polymarketMarketId: string,
//   polymarketEventId: string,
//   slug: string,
//   title: string,
//   image: string,
//   currentYesPrice?: number,
//   notify_price_change_pct?: number,
//   notify_signal?: boolean,
//   notify_resolution?: boolean,
// }
// Server logic:
//  1. supabaseAdmin.from('markets').upsert({ polymarket_market_id, ... }, { onConflict: 'polymarket_market_id' }) RETURNING id
//  2. supabaseUser.from('watchlist').insert({ user_id: <internal>, market_id, notify_*}).onConflict do nothing
// Response 201: { id: <watchlist row uuid> }
```

#### `app/api/v1/watchlist/[marketId]/route.ts` — DELETE

```ts
// DELETE: rimuove market dalla watchlist
// `marketId` parametro = polymarket_market_id (stringa)
// Auth: required
// Server logic:
//  1. SELECT id FROM markets WHERE polymarket_market_id = $1
//  2. DELETE FROM watchlist WHERE user_id = <internal> AND market_id = <found>
// Response 204
```

### Client side

#### `lib/stores/useWatchlist.ts` — Zustand store

```ts
interface WatchlistStore {
  /** Set di polymarket_market_id seguiti dall'utente. Source of truth in memoria. */
  watched: Set<string>
  /** True dopo il primo fetch GET /api/v1/watchlist */
  hydrated: boolean
  /** Se loggato, fa GET /api/v1/watchlist e popola `watched`. Idempotente. */
  hydrate: () => Promise<void>
  /** Aggiunge optimistic + chiama POST. In caso di errore, rollback. */
  add: (payload: AddWatchlistPayload) => Promise<void>
  /** Rimuove optimistic + chiama DELETE. In caso di errore, rollback. */
  remove: (polymarketMarketId: string) => Promise<void>
  /** Toggle conveniente: chiama add/remove in base allo stato attuale. */
  toggle: (payload: AddWatchlistPayload) => Promise<void>
  /** Selettore reattivo */
  isWatching: (polymarketMarketId: string) => boolean
}

interface AddWatchlistPayload {
  polymarketMarketId: string
  polymarketEventId: string
  slug: string
  title: string
  image: string
  currentYesPrice?: number
}
```

NO persist su localStorage (la source of truth è il DB). Hydrate al mount tramite `<WatchlistHydrator />` montato in `RootLayout` (solo se autenticato).

#### `components/WatchlistHydrator.tsx`

```tsx
'use client'
export function WatchlistHydrator() {
  const { authenticated } = useAuth()
  const hydrate = useWatchlist((s) => s.hydrate)
  useEffect(() => {
    if (authenticated) hydrate()
  }, [authenticated, hydrate])
  return null
}
```

#### `components/markets/StarToggle.tsx` — wiring reale

Rimuovere `watchlistStubToggle`. Il componente ora prende direttamente lo store:

```tsx
export function StarToggle({ payload, ... }: { payload: AddWatchlistPayload, ... }) {
  const isWatching = useWatchlist((s) => s.isWatching(payload.polymarketMarketId))
  const toggle = useWatchlist((s) => s.toggle)
  return (
    <button onClick={() => toggle(payload)} ...>
      <Star fill={isWatching ? 'var(--color-warning)' : 'none'} ... />
    </button>
  )
}
```

I 5 card variants devono passare il payload completo invece di `marketId` semplice. `event.image`, `event.slug`, `event.title` sono già disponibili in `AuktoraEvent`.

#### Page `/me/watchlist`

```tsx
// app/me/watchlist/page.tsx — Server Component
export default async function WatchlistPage() {
  const supabase = await createServerClient()
  const { data: items } = await supabase
    .from('watchlist')
    .select('*, markets(*)')
    .order('added_at', { ascending: false })

  if (!items || items.length === 0) {
    return <EmptyState />
  }

  // Ri-fetch da Polymarket Gamma per ogni market (live data)
  // Per MVP: usa snapshot dal DB
  return <WatchlistGrid items={items} />
}
```

Per MVP: usiamo snapshot dei dati salvati in `markets` table (current_yes_price, ecc.). Live updates via WS arrivano in MA5 quando colleghiamo CLOB live midpoint a watchlist.

---

## File da creare

### Nuovi

- `app/api/v1/watchlist/route.ts` (GET + POST)
- `app/api/v1/watchlist/[marketId]/route.ts` (DELETE)
- `lib/stores/useWatchlist.ts`
- `components/WatchlistHydrator.tsx`
- `app/me/watchlist/page.tsx`
- `lib/stores/__tests__/useWatchlist.test.ts`

### Modificati

- `components/markets/StarToggle.tsx` — wiring reale, accetta payload invece di onToggle
- 5 card variants — passano payload completo a StarToggle
- `app/layout.tsx` — monta `<WatchlistHydrator />`
- (opzionale) `lib/types/database.ts` — types AuktoraMarket DB-side se serve

---

## Acceptance criteria

- [ ] `app/api/v1/watchlist/route.ts` — GET ritorna lista user, POST upsert markets + insert watchlist (idempotent via UNIQUE)
- [ ] `app/api/v1/watchlist/[marketId]/route.ts` — DELETE per polymarket_market_id
- [ ] `useWatchlist` Zustand store con `hydrate`, `add`, `remove`, `toggle`, `isWatching`
- [ ] `<WatchlistHydrator />` monta in RootLayout, hydrate al mount se loggato
- [ ] StarToggle: rimosso `onToggle` prop e `watchlistStubToggle`, ora usa direttamente useWatchlist
- [ ] 5 card variants: passano payload completo (polymarketMarketId, slug, title, image, currentYesPrice)
- [ ] `/me/watchlist` page con lista dei markets seguiti + empty state
- [ ] Optimistic UI: stellina cambia istantaneamente, rollback se API fallisce
- [ ] Test useWatchlist (toggle, optimistic, rollback)
- [ ] `npm run validate` passa
- [ ] `npm run build` pulito

---

## Post-sprint audit

A fine sprint:

1. Verificare ogni AC nel codice (file:riga)
2. Testare manualmente: login → cliccare stellina su una card home → ricaricare → stellina ancora attiva → click di nuovo → rimosso
3. Verificare DB: `SELECT * FROM watchlist WHERE user_id = ...` mostra record
4. Verificare `markets` table popolata con upserts

## TODO MA4.3 e oltre (NON in questo sprint)

- Notify settings UI (modal "Configura notifiche" per ogni leg watchlist)
- Live midpoint update via CLOB WS sui markets in watchlist
- `/me/demo/watchlist` (separazione real/demo)
