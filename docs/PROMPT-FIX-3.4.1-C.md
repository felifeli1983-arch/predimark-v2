# PROMPT — Fix 3.4.1-C — Sidebar 3 stati + sezione Latest News

> **Quando eseguire**: prima di Sprint 3.5.1
> **Priorità**: MEDIA — la sidebar mostra contenuto sbagliato per utenti loggati senza depositi

---

## Problema

`Sidebar.tsx` ha solo 2 stati: guest e loggato. Il wireframe (Doc 4) definisce 3 stati distinti:

| Stato | Condizione           | Prima sezione                 | Differenza                       |
| ----- | -------------------- | ----------------------------- | -------------------------------- |
| 1     | Guest                | Demo Mode CTA                 | —                                |
| 2     | Loggato, no depositi | Portfolio con "Deposit >" CTA | Watchlist vuota invece di HotNow |
| 3     | Loggato, ha saldo    | Portfolio con saldo reale     | Watchlist popolata               |

Attualmente stato 2 e stato 3 sono trattati uguale (entrambi → SidebarPortfolio stub).

Inoltre: il wireframe stato 1 (guest) include una sezione **Latest News** con 3 notizie. Non è mai stata creata.

---

## Riferimenti da leggere prima

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — sezione "Sidebar adattiva desktop (25%)" con i 3 stati dettagliati
- `components/home/Sidebar.tsx` — logica attuale
- `lib/hooks/useAuth.ts` — hook disponibile per stato auth
- `components/home/SidebarPortfolio.tsx` — stub attuale

---

## Cosa costruire / modificare

### `components/home/SidebarNews.tsx` (nuovo — stub)

Sezione con 3 placeholder notizie: titolo, variazione % probabilità associata. Dati stub per ora (i dati reali arrivano in MA5). Struttura visiva identica al wireframe:

```
📰 Latest News
1. News A          4%
2. News B         15%
3. News C          1%
```

### `components/home/SidebarWatchlist.tsx` (nuovo — stub)

Due stati:

- **Empty**: "Click the star on any market to add it" + link "Trending >"
- **Populated** (per ora stub): lista 3 mercati con probabilità

### Modifica `components/home/Sidebar.tsx`

Distinguere i 3 stati usando `useAuth` + un flag `hasDeposit` (per ora: `hasDeposit = false` sempre, sarà collegato a dati reali in MA4):

**Stato 1 (guest)**:

```
Demo Mode CTA
Signals Live (SidebarSignals)
Hot Now (SidebarHotNow)
Latest News (SidebarNews) ← nuovo
Recent Activity (SidebarActivity)
```

**Stato 2 (loggato, no depositi — hasDeposit=false)**:

```
Portfolio con CTA Deposit (SidebarPortfolio in modo "deposit-cta")
Signals Live
Watchlist empty (SidebarWatchlist)
Hot Now
Recent Activity
```

**Stato 3 (loggato, ha depositi — hasDeposit=true)**:

```
Portfolio con saldo (SidebarPortfolio in modo "active")
Signals Live
Watchlist popolata (SidebarWatchlist)
Hot Now
Recent Activity
```

`SidebarPortfolio` riceve una prop `mode: 'deposit-cta' | 'active'` per distinguere il rendering.

---

## Acceptance criteria

- [ ] Guest vede Demo CTA, Signals, Hot Now, Latest News, Activity (5 sezioni)
- [ ] Loggato no depositi vede Portfolio Deposit CTA, Signals, Watchlist empty, Hot Now, Activity
- [ ] Loggato con saldo vede Portfolio reale, Signals, Watchlist, Hot Now, Activity
- [ ] `SidebarNews.tsx` e `SidebarWatchlist.tsx` creati (stub OK)
- [ ] `SidebarPortfolio.tsx` accetta prop `mode`
- [ ] Nessun colore hardcoded
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "fix: Sidebar 3 stati + SidebarNews + SidebarWatchlist (3.4.1-C)" && git push origin main`
