# PROMPT — Sprint 3.5.1 — Pagina evento `/event/[slug]` — Shell + 5 layout statici

> **Quando eseguire**: dopo aver completato tutti i fix MA3
> **Priorità**: ALTA — primo entry point reale dal click su una EventCard

---

## Obiettivo

Costruire la pagina evento `app/event/[slug]/page.tsx` con dati reali da Polymarket e i 5 layout CardKind. In questo sprint NON si costruisce il Trade Widget reale né il chart storia né l'Order Book — questi arrivano in sprint successivi. L'obiettivo è che il click su una EventCard dalla home porti a una pagina completa, visivamente corretta, con dati reali e placeholder chiari per le sezioni MA4.

---

## Riferimenti da leggere prima

- `docs/04-WIREFRAMES-pagina2-evento-v3.md` — wireframe completo con i 5 layout, Trade Widget, Order Book, comportamenti
- `docs/05-TECH-STACK-AND-ARCHITETTURA.md` — split obbligatori, limiti righe, regole componenti
- `AGENTS.md` — regole architetturali (limiti righe, CSS vars, next/image, no hardcoded colors)
- `lib/polymarket/queries.ts` — `fetchEventBySlug` già disponibile
- `lib/polymarket/mappers.ts` — `AuktoraEvent`, `AuktoraMarket`, `CardKind` già disponibili
- `components/markets/EventCard.tsx` — pattern card esistente da cui la pagina si apre

---

## Struttura file da creare

La pagina evento è complessa — rispettare i limiti di righe tramite split in componenti. Struttura target:

```
app/event/[slug]/page.tsx              ← Server Component, max 80 righe
components/event/
  EventPageShell.tsx                   ← layout 2-col desktop / fullwidth mobile
  EventHero.tsx                        ← hero CardKind-aware (immagine, titolo, meta)
  EventProbabilities.tsx               ← display probabilità CardKind-aware
  EventInfoTabs.tsx                    ← 5 tab: Comments/News/Holders/Rules/Activity
  EventSidebarStub.tsx                 ← sidebar destra con Trade Widget placeholder
  OutcomeRowFull.tsx                   ← riga outcome espandibile (multi-outcome/strike)
```

---

## Comportamento per CardKind

Leggere il wireframe per ogni CardKind. In sintesi:

**Binary**: hero con immagine + titolo + meta. Due numeri grandi (62% Yes verde / 38% No rosso). Due bottoni Buy Yes / Buy No grandi. Sidebar destra con Trade Widget stub.

**Multi-outcome**: hero senza probabilità singola. Lista verticale `OutcomeRowFull` per ogni market (nome + % + volume + bottoni Sì/No). Click sulla riga (non sui bottoni) espande un accordeon con placeholder libro ordini ("Libro ordini — disponibile in MA4"). Click Sì/No → stub console.log con TODO MA4.

**Multi-strike**: identico a multi-outcome ma le soglie sono ordinate dalla più alta alla più bassa. Indicatore "currently" sulla soglia più vicina al prezzo attuale (usare `yesPrice > 0.5` come euristica).

**H2H Sport**: hero con i due team affiancati (logo/icona + nome), score se `event.active` (stub "–" se non disponibile), badge LIVE se attivo. Due bottoni team grandi.

**Crypto Up/Down**: hero con coin icon, prezzo da battere (primo market `yesPrice` come proxy), countdown via `useCountdown` (già esiste in `lib/hooks/useCountdown.ts`). Due bottoni Up/Down.

---

## Sezioni stub (placeholder visibile, dati in MA4)

Queste sezioni devono essere **visualmente presenti** con un box placeholder ordinato — non devono essere vuote o assenti:

- **Chart storia probabilità**: box con altezza 200px, testo "Chart storico — disponibile in Sprint 3.5.2", bordo `--color-border-subtle`
- **Trade Widget** (sidebar desktop): box con altezza adeguata, testo "Trade Widget — disponibile in MA4", bordo `--color-cta` per renderlo evidente
- **Libro ordini** (dentro OutcomeRowFull espansa): placeholder "Libro ordini — disponibile in MA4"
- **Tab Comments**: "Commenti in arrivo"
- **Tab News**: "News in arrivo"
- **Tab Holders**: "Top holder in arrivo"
- **Tab Rules**: mostrare `event.description` se disponibile, altrimenti placeholder
- **Tab Activity**: riusare `SidebarActivity` già esistente (è già live via WebSocket)
- **Segnale Predimark** (sidebar): stub "Segnale algoritmico — disponibile in MA5"
- **Mercati correlati** (sidebar): stub "Mercati correlati — disponibile in MA4"

---

## Layout desktop / mobile

Leggere il wireframe sezione "STRUTTURA COMUNE". In sintesi:

**Breakpoint unico: `md` (768px)** — coerente con home, Sidebar, MobileSidebarRails già esistenti.

**Da `md` in su (≥ 768px) — desktop + tablet landscape:**
Griglia `main (75%) | sidebar (25%)`. Sidebar sticky (`position: sticky; top: 0; max-height: 100vh; overflow-y: auto`). Breadcrumb sopra la griglia: `Home > [prima tag] > [event.title]`. Classe Tailwind: `md:grid md:grid-cols-[75%_25%]` (o equivalente con `lg:` se si preferisce spostare il breakpoint a 1024px — decidere guardando come appare su un iPad 768px).

**Sotto `md` (< 768px) — mobile:**
Fullwidth, nessuna sidebar. Back button in alto (`← Indietro`). Le sezioni sidebar (stub Segnale Predimark, stub Mercati correlati) appaiono inline nel flow della pagina, dopo i bottoni trade e prima dei tab info. Trade Widget è uno stub inline (bottom sheet reale arriva in MA4).

**Pattern da seguire per show/hide:**

- Sidebar desktop: `hidden md:block` (o `hidden md:flex`)
- Back button / sezioni mobile-only: `md:hidden`
- Mai `display` inline su elementi che usano classi responsive (lezione BottomNav/MobileSidebarRails)

---

## Regole architetturali da rispettare

- Nessun colore hardcoded — solo CSS vars
- `next/image` per tutte le immagini (hero, icon coin, loghi team)
- Componenti React max 300 righe — splittare se necessario
- `app/event/[slug]/page.tsx` è Server Component — nessun hook al suo interno
- I componenti client (`'use client'`) sono quelli che usano stato o WebSocket
- Il bottone Buy/Sì/No chiama `console.log('[Trade stub]', eventId, marketId, outcome)` con commento `// TODO MA4: collegare a useBetSlip().addLeg()`
- Nessun `display` inline su elementi con classi responsive Tailwind (lezione BottomNav/MobileSidebarRails)

---

## Acceptance criteria

- [ ] Click su una EventCard dalla home apre `/event/[slug]` con dati reali
- [ ] Tutti e 5 i CardKind renderizzano layout visivamente distinto e corretto
- [ ] Breadcrumb visibile desktop, back button visibile mobile
- [ ] Sidebar sticky desktop con Trade Widget placeholder
- [ ] Info tabs funzionanti (click cambia contenuto), tab Activity mostra feed live
- [ ] Bottoni Buy/Sì/No visibili e cliccabili (stub console.log, no errori)
- [ ] Pagina evento per mercato chiuso/resolved mostra stato "RESOLVED" chiaramente
- [ ] Skeleton/loading state durante fetch (loading.tsx o Suspense)
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "feat: Event page shell — 5 CardKind layouts + stubs (3.5.1)" && git push origin main`
