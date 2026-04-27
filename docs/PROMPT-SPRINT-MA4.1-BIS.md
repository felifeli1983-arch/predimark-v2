# PROMPT — Sprint MA4.1-BIS — Rollback Bet Slip + Polymarket-style cards + Watchlist UI

> **Quando eseguire**: subito dopo MA4.1 (chiude e supera quello sprint)
> **Priorità**: ALTA — l'utente ha deciso di abbandonare il Bet Slip multi-leg
> **Autore prompt**: VS Code Claude (modalità autonoma)
> **DB pre-check**: nessuna migration in questo sprint. La tabella `watchlist` esiste già in staging.

---

## Obiettivo

Rivedere la decisione MA4.1 dopo conferma utente: **rimuovere Bet Slip multi-leg**, allineare le card alla UX Polymarket (Sì/No mini ovunque, click navigation a event page), aggiungere **stellina watchlist** come unico tasto persistente sulle card.

Il trading reale resta single-market sulla event page (rinviato a MA4.3 quando arriva il Trade Widget funzionante).

---

## Riferimenti

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — wireframe home cards (Doc dice solo "+", divergenza intenzionale per allinearsi a Polymarket)
- `feedback_no_betslip.md` — memoria utente che documenta la decisione
- `docs/AUDIT-SPRINT-1.1.1-TO-CURRENT.md` — verifica `watchlist` table già esistente
- Polymarket reference (screenshot utente):
  - Multi-outcome con Sì/No mini per row
  - Multi-strike con Sì/No mini per row
  - Stellina watchlist accanto al outcome name (Multi/Strike) o accanto al bookmark (Binary/H2H/Crypto)

---

## Cosa rimuovere

### File da cancellare

- `lib/stores/useBetSlip.ts`
- `lib/stores/__tests__/useBetSlip.test.ts`
- `components/slip/BetSlipDrawer.tsx`
- `components/slip/SlipLegRow.tsx`
- `components/slip/BetSlipFAB.tsx`
- `components/slip/` (cartella intera vuota → rimuovere)

### Modifiche revert

- `app/layout.tsx`: rimuovere import `BetSlipDrawer` + `BetSlipFAB`, rimuovere mount globali
- `app/globals.css`: rimuovere classe `.bet-slip-drawer` + keyframes
- `components/markets/EventCard.tsx`: rimuovere `onAddToSlip` prop entirely
- `components/markets/EventCardFooter.tsx`: rimuovere bottone "+ Slip" (resta solo Vol + Closes)
- `components/markets/cards/*.tsx` (5 file): rimuovere prop `onAddToSlip`, rimuovere helper `addLeg`
- `components/home/MarketsGrid.tsx`: rimuovere import `betSlipActions`
- `components/event/EventPageShell.tsx`: rimuovere import `betSlipActions`
- `components/event/EventProbabilities.tsx`: rimuovere prop `onAddToSlip`, rimuovere helper `add()`. I bottoni body diventano stub `console.warn('[Trade stub MA4.3]')`
- `components/event/OutcomeRowFull.tsx`: idem
- `components/layout/BottomNav.tsx`: voce "Slip" → "Watchlist" (Link a `/me/watchlist`)

---

## Cosa aggiungere/modificare

### Cards Polymarket-style — bottoni outcome navigano a event page

Per ogni bottone Sì/No/Yes/No/Up/Down/Team su una card della home:

- Sostituire `onClick` handler che chiama `addLeg(...)` con `router.push('/event/[slug]?market=<id>&side=<side>')`
- L'evento bubbling al Link wrapper deve essere bloccato (`e.preventDefault()` + `e.stopPropagation()`)
- Pattern usato: `useRouter()` da `next/navigation` dentro ogni card (sono già `'use client'`)

### MultiOutcomeCard — Sì/No mini SEMPRE per ogni row

Rimuovere logica `isDateOutcomes` + `looksLikeDate` heuristic. Ogni row top-3 ha sempre `[Sì][No]` mini buttons + stellina ☆ a sinistra.

### MultiStrikeCard — aggiungere Sì/No mini per ogni row

Oggi le row sono cliccabili (apertura singola). Sostituire con: stellina ☆ a sinistra + label strike + barra % + bottoni `[Sì][No]` mini.

### Cards Binary/H2H/Crypto — stellina ☆ in alto-destra

Già hanno EventCardHeader con bookmark icon → aggiungere stellina ☆ accanto al bookmark per coerenza visiva (stesso pattern delle cards multi/strike che hanno la stellina a sinistra di ogni row).

### Stellina = nuovo componente `<StarToggle>`

```tsx
// components/markets/StarToggle.tsx
interface Props {
  isFavorite: boolean
  onToggle: () => void
  size?: number
}
```

In MA4.1-BIS è **solo placeholder UI**: `isFavorite=false` hardcoded, `onToggle` è stub `console.warn`. La logica reale (Zustand store + DB) arriva in MA4.2 (Watchlist).

### BottomNav — Slip → Watchlist

Voce "Slip" diventa Link a `/me/watchlist` con icona Star. Niente più drawer, niente badge counter.

---

## Acceptance criteria

- [ ] `lib/stores/useBetSlip.ts`, `components/slip/*` cancellati
- [ ] `app/layout.tsx` non monta più BetSlipDrawer/FAB
- [ ] `app/globals.css` non ha più `.bet-slip-drawer` + keyframes
- [ ] EventCardFooter: rimosso bottone "+ Slip"
- [ ] 5 card variants: rimossi import + prop `onAddToSlip`
- [ ] Bottoni outcome (Yes/No/Sì/No/Up/Down/Team) navigano via `router.push('/event/[slug]?market=X&side=Y')`
- [ ] MultiOutcomeCard: Sì/No mini per ogni row top-3 (sempre, senza heuristic)
- [ ] MultiStrikeCard: Sì/No mini per ogni row top-4 (nuovo)
- [ ] Stellina `<StarToggle>` placeholder presente:
  - A sinistra di ogni row su Multi/Strike
  - In alto-destra su Binary/H2H/Crypto (accanto a bookmark)
- [ ] BottomNav: Slip tab → Watchlist (Link `/me/watchlist`, icona Star)
- [ ] EventPageShell + EventProbabilities + OutcomeRowFull: stub `console.warn` per Trade (rinviato MA4.3)
- [ ] `npm run validate` passa
- [ ] `npm run build` pulito
- [ ] HANDOFF-LOG aggiornato con divergenza Doc

---

## Post-sprint audit

A fine sprint: rilettura screenshot Polymarket di riferimento + Doc 04 home, confronto con codice, mini-report ✅/⚠️/❌.

Documentare in HANDOFF-LOG.md la doppia divergenza dal Doc:

1. Rimosso Bet Slip multi-leg (Doc 04 home descrive Bet Slip Drawer)
2. Sì/No SEMPRE su Multi-outcome/Strike (Doc dice solo per date)

---

## TODO MA4.2 (post-bis)

- `useWatchlist` Zustand store (optimistic update)
- API `POST/DELETE /api/v1/watchlist`
- StarToggle wiring reale a watchlist DB table
- `/me/watchlist` page (lista markets seguiti)

## TODO MA4.3

- Trade Widget single-market funzionante su event page
- Event page legge `?market=X&side=Y` query param e pre-compila widget
- Submit DEMO mode (insert in `trades`, update `positions`, decrement `balances.demo_balance`)
