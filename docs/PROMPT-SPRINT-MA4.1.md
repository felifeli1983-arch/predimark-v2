# PROMPT — Sprint MA4.1 — Bet Slip foundation (client-side store + drawer)

> **Quando eseguire**: subito dopo MA3 chiuso
> **Priorità**: ALTA — sblocca onAddToSlip/onTrade stub in MarketsGrid + EventPageShell
> **Autore prompt**: VS Code Claude (modalità autonoma da MA4)
> **DB pre-check**: NESSUNA migration in questo sprint. Slip è pure client-side.

---

## Obiettivo

Costruire la fondazione del Bet Slip: store Zustand persistito in localStorage + drawer UI (bottom sheet mobile + side panel desktop) + wiring degli stub `onAddToSlip` (MarketsGrid) e del trade-stub (EventPageShell).

In **questo** sprint NON si esegue il trade reale (insert in `trades`, update `positions`, decrement `balances`) — quello è MA4.2. L'utente può aggiungere legs allo slip, vederli in drawer, regolare amount, rimuoverli, svuotare. Il bottone "Conferma" è uno stub che logga + svuota lo slip (TODO MA4.2).

---

## Riferimenti da leggere

- `docs/04-WIREFRAMES-pagina2-evento-v3.md` — sezione "TRADE WIDGET UNIFICATO"
- `docs/05-TECH-STACK-AND-ARCHITETTURA.md` — split TradeWidget
- `docs/06-DATABASE-SCHEMA.md` — solo per riferimento (non si tocca DB qui)
- `lib/stores/themeStore.ts` — pattern Zustand + persist da seguire
- `components/markets/EventCard.tsx` — onAddToSlip prop esistente
- `components/home/MarketsGrid.tsx:18-21` — stub `handleAddToSlip` attuale
- `components/event/EventPageShell.tsx:15-18` — stub `handleTradeStub` attuale
- `components/layout/BottomNav.tsx` — già ha tab "Slip" (no badge counter ora)

---

## Architettura

### `lib/stores/useBetSlip.ts` (nuovo)

Zustand con `persist` middleware su localStorage `auktora-slip`.

```ts
interface SlipLeg {
  /** Univoco: marketId-outcome */
  id: string
  eventId: string
  marketId: string
  outcome: string // 'yes' | 'no' | nome team / strike
  /** Snapshot del prezzo quando è stato aggiunto (per detect price drift) */
  priceAtAdd: number // 0-1
  /** Importo USDC che l'utente vuole spendere su questa leg */
  stake: number
  /** Etichetta human-readable per drawer */
  marketTitle: string
  outcomeLabel: string
  addedAt: number // Date.now()
}

interface BetSlipStore {
  legs: SlipLeg[]
  /** Drawer visibile? Aperto via BottomNav o dopo addLeg */
  drawerOpen: boolean
  // Actions
  addLeg: (leg: Omit<SlipLeg, 'id' | 'addedAt'> & { stake?: number }) => void
  removeLeg: (id: string) => void
  updateStake: (id: string, stake: number) => void
  clearSlip: () => void
  openDrawer: () => void
  closeDrawer: () => void
  // Derived (computed via selectors per evitare re-render)
}
```

Regole:

- `addLeg`: se esiste già una leg con stessa `marketId+outcome`, NON duplicare → aggiorna stake (additivo o sostitutivo? sostitutivo, è più sicuro). Stake default 10 USDC.
- `addLeg` apre automaticamente il drawer (toast UX).
- Persist: salva tutto tranne `drawerOpen` (state UI volatile).
- Validazione amount: stake clamp [1, 10000].

### `components/slip/BetSlipDrawer.tsx`

Drawer responsive:

- **Mobile** (<lg, <1024px): bottom sheet con scroll-snap, max-height 80vh
- **Desktop** (≥lg): pannello che entra da destra, position fixed, width 380px, top 64 (sotto header), bottom 0

Backdrop semi-trasparente cliccabile → chiude.

Header drawer:

- Titolo "Slip ({legs.length})"
- Bottone close (X)

Body:

- Se `legs.length === 0`: empty state "Nessuna leg" + "Aggiungi un mercato dalla home"
- Altrimenti: lista `<SlipLegRow>`

Footer:

- Total stake summary
- Bottone "Svuota" (clear) + "Conferma" (stub MA4.2)

### `components/slip/SlipLegRow.tsx`

Riga per ogni leg:

- Avatar / icona market (placeholder)
- Title + outcome chip
- Prezzo at-add (per drift detection futura)
- Input amount stake (number, min 1, max 10000, step 1)
- Bottone X per rimuovere

### `components/slip/SlipFAB.tsx` (Floating Action Button su mobile)

Quando `legs.length > 0` e drawer chiuso, FAB in basso-destra mostra il counter. Click → apre drawer. Solo mobile (`lg:hidden`).

### Wiring

**`MarketsGrid.tsx`**: rimpiazza `handleAddToSlip` stub con:

```ts
import { useBetSlip } from '@/lib/stores/useBetSlip'
// ...
function handleAddToSlip(
  eventId: string,
  outcome: string,
  ctx: { marketId; marketTitle; outcomeLabel; priceAtAdd }
) {
  useBetSlip
    .getState()
    .addLeg({ eventId, marketId, outcome, marketTitle, outcomeLabel, priceAtAdd })
}
```

⚠️ Adattare la signature di `EventCard.onAddToSlip` per passare i metadata necessari (marketTitle/outcomeLabel/priceAtAdd) — oggi è solo `(eventId, outcome)`. Aggiornare anche le 5 card variants per chiamare con il payload completo.

**`EventPageShell.tsx`**: stesso pattern in `handleTradeStub`.

**`BottomNav`**: la voce "Slip" esistente apre il drawer via `useBetSlip().openDrawer()`. Aggiungere badge counter accanto al label se `legs.length > 0`.

---

## File da creare/modificare

### Nuovi

- `lib/stores/useBetSlip.ts`
- `components/slip/BetSlipDrawer.tsx`
- `components/slip/SlipLegRow.tsx`
- `components/slip/SlipFAB.tsx`
- `lib/stores/__tests__/useBetSlip.test.ts`

### Modificati

- `components/markets/EventCard.tsx` — interface `onAddToSlip` con payload completo
- `components/markets/cards/*.tsx` (5 file) — chiamare con payload
- `components/home/MarketsGrid.tsx` — wire reale
- `components/event/EventPageShell.tsx` — wire reale
- `components/event/EventProbabilities.tsx` — wire reale (oggi chiama `onTrade` con outcome string)
- `components/event/OutcomeRowFull.tsx` — idem
- `components/layout/BottomNav.tsx` — slip count badge + onClick → openDrawer
- `app/layout.tsx` — montare `<BetSlipDrawer />` globale

---

## Acceptance criteria

- [ ] Zustand store `useBetSlip` con persist `auktora-slip` su localStorage
- [ ] addLeg dedupes per `marketId+outcome` (stake sostituito)
- [ ] addLeg apre il drawer automaticamente
- [ ] BetSlipDrawer responsive: bottom sheet <lg, side panel ≥lg
- [ ] SlipLegRow: input amount con clamp [1, 10000]
- [ ] SlipFAB visibile solo mobile, solo se `legs.length > 0`, drawer chiuso
- [ ] BottomNav Slip tab apre drawer + mostra badge counter
- [ ] MarketsGrid + tutte le 5 EventCard variants chiamano addLeg con payload
- [ ] EventPageShell + EventProbabilities + OutcomeRowFull chiamano addLeg con payload
- [ ] Bottone "Conferma" stub: console.warn + clearSlip + close drawer (TODO MA4.2)
- [ ] Bottone "Svuota": clearSlip + close drawer
- [ ] Test unit `useBetSlip.test.ts`: addLeg, dedup, removeLeg, updateStake, clearSlip
- [ ] Nessuna migration DB
- [ ] `npm run validate` passa
- [ ] `npm run build` pulito

## Post-sprint audit

A fine sprint: rilettura prompt + Doc 4 (sezione TRADE WIDGET) + Doc 5 (sezione split slip), confronto con codice, mini-report ✅/⚠️/❌. Documentare in HANDOFF-LOG.md le scelte divergenti rispetto al wireframe (es. drawer invece di sidebar trasformata, nessuna persistenza DB).
