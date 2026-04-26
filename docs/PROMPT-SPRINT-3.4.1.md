# PROMPT — Sprint 3.4.1 — Home page layout completo

> Copia e incolla questo prompt in Claude in VS Code.
> **Dipendenze**: Sprint 3.3.1-3.3.4 completati (tutte e 5 le varianti EventCard esistono)

---

## Obiettivo

Trasformare lo smoke test attuale di `app/page.tsx` nella vera Home page di Auktora, con tutti gli elementi descritti nel wireframe: Hero zone, Nav tabs, Sidebar adattiva, Filtri, griglia mercati completa. È la pagina più importante dell'app.

---

## Riferimenti obbligatori da leggere prima di scrivere codice

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — leggere **tutto** questo documento, è la fonte primaria
- `app/page.tsx` — stato attuale (smoke test da trasformare)
- `components/markets/EventCard.tsx` — componente già pronto
- `lib/polymarket/queries.ts` — fetchFeaturedEvents, fetchEvents, searchEvents disponibili
- `docs/05-TECH-STACK-AND-ARCHITETTURA.md` — pattern ISR e cache

---

## Struttura da creare

```
app/
  page.tsx                        ← Server Component, max 80 righe JSX

components/home/
  NavTabs.tsx                     ← barra categorie scrollabile sotto header
  HeroZone.tsx                    ← Hero big + Hero 2 + Hero 3 (desktop) / carousel (mobile)
  HeroCard.tsx                    ← singola hero card con mood color tematico
  Sidebar.tsx                     ← sidebar adattiva (3 stati: guest/no-deposit/active)
  SidebarSignals.tsx              ← sezione Signals
  SidebarActivity.tsx             ← sezione Activity feed
  SidebarHotNow.tsx               ← sezione Hot Now (tag cloud)
  SidebarPortfolio.tsx            ← sezione Portfolio (stato loggato)
  MarketsGrid.tsx                 ← griglia EventCard con filtri e ordinamento
  MarketsFilters.tsx              ← barra filtri + sort + toggle layout
  CryptoLiveRail.tsx              ← rail orizzontale 6 coin con prezzi live
```

---

## Comportamento per stato utente

La pagina è un Server Component. Lo stato utente (guest/logged-no-deposit/logged-active) si determina lato server via il JWT Privy dalla sessione, oppure lato client per la sidebar adattiva.

Strategia consigliata:

- `app/page.tsx` (Server Component): fetch eventi + fetch dati statici
- `components/home/Sidebar.tsx` (Client Component): legge lo stato utente dal hook `useSession` per renderizzare la sezione corretta

---

## Nav tabs

Voci: `LIVE · All · For You · Politics · Sports · Crypto · Esports · Mentions · Creators · Pop Culture · Business · Science · Geopolitics`

- La voce attiva filtra la griglia (stato in URL: `?category=sports`)
- `●LIVE` è sempre la prima voce con pallino rosso pulsante
- Scrollabile orizzontalmente su mobile

---

## Hero zone (Desktop: 60%+40% / Mobile: carousel)

- Le hero sono gli eventi con più volume nelle ultime 24h (`fetchFeaturedEvents` già funzionante)
- Ogni `HeroCard` riceve una prop `theme` per il mood color (determina il colore di sfondo tematico)
- Il `theme` si assegna in base ai tag dell'evento: `sport → 'sport'`, `politics → 'politics'`, ecc.
- Vedi Doc 4 per la tabella completa mood color per categoria

---

## CryptoLiveRail

Rail orizzontale con 6 coin: BTC ETH SOL XRP DOGE BNB. Per ogni coin mostra: simbolo, prezzo live (da `useCryptoLivePrice`), variazione 24h colorata verde/rosso.

---

## MarketsGrid + Filtri

- Server Component per il primo render (dati da ISR)
- Filtri (sort, categoria, sub-filtri) aggiornano la URL via `router.push` — Next.js App Router gestisce il refetch
- `Sort by`: Volume24h (default), Newest, Closing soon
- Toggle Grid/List (stato locale, non in URL)
- Sub-filtri Related: tag dinamici basati sulla categoria attiva

---

## Regole architetturali

- `app/page.tsx` max 80 righe JSX — tutto il resto in componenti `components/home/`
- Ogni componente max 300 righe
- Sidebar è sticky durante scroll (CSS `position: sticky; top: X`)
- Nessun colore hardcoded — mood color via CSS vars o classi dinamiche
- **Niente `display` inline su elementi responsive** (regola AGENTS.md)

---

## Acceptance criteria

- [ ] `npm run validate` passa
- [ ] `npm run build` exit 0
- [ ] Home mostra Hero zone (3 hero desktop, carousel mobile)
- [ ] Nav tabs funzionanti — click su categoria filtra la griglia
- [ ] CryptoLiveRail mostra prezzi live per i 6 coin
- [ ] Sidebar adattiva: guest vede Demo Mode in cima, loggato vede Portfolio
- [ ] Griglia mercati con sort funzionante
- [ ] Layout 3 colonne desktop, 1 colonna mobile
- [ ] Sidebar sticky durante scroll
- [ ] Commit: `git commit -m "feat: Home page layout completo — Hero, NavTabs, Sidebar, CryptoRail, MarketsGrid (3.4.1)" && git push origin main`

---

## Note

- I dati della sidebar (Portfolio, Signals, Watchlist) in questo sprint possono essere stub o placeholder — le sezioni con dati reali arrivano in MA4-MA5. L'importante è la struttura visiva e la logica adattiva per stato utente.
- Il BetSlip drawer fluttuante (quando ha contenuti) arriva in MA4 — per ora il bottone `[+ Slip]` funziona già ma il drawer completo no.
- Non implementare infinite scroll — carica i primi 20 eventi, aggiungi bottone "Carica altri" manuale.
