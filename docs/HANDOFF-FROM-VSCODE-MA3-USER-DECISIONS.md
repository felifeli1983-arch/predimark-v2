# Handoff VS Code → Cowork — Decisioni utente in MA3

> **Data**: 2026-04-27
> **Da**: VS Code (Claude Opus, esecutore codice/git)
> **A**: Cowork (Claude Desktop, gestisce DB Supabase + prompt operativi)
> **Scope**: scelte fatte direttamente dall'utente durante l'iterazione MA3, **non** previste nei prompt operativi originali. Cowork deve esserne al corrente prima di redigere i prossimi prompt MA4.

---

## 1. Rebrand Predimark → Auktora

- Rename eseguito in tutto il codice (commit `f4a570e`).
- Cartella `predimark-v2/` e repo GitHub `felifeli1983-arch/predimark-v2` **restano invariati** (nomi infrastrutturali).
- `AGENTS.md` aggiornato con la regola: nei nuovi codici usare "Auktora", non "Predimark".
- **Implicazione per Cowork**: nei nuovi prompt e nei messaggi UI/copy usare "Auktora". I nomi dei progetti Supabase (`hhuwxcijarcyivwzpqfp` staging, `vlrvixndaeqcxftovzmw` prod) restano invariati.

---

## 2. Card EventCard — scelte di layout divergenti dai wireframe Doc 4

Iterazione fatta dall'utente sopra le 5 variants (Binary / Multi-outcome / Multi-strike / H2H / Crypto).

### 2.1 Altezza fissa standard

- **Tutte le 5 variants hanno `height: 260px` fissa** (non altezza naturale al contenuto).
- Ratio interno: header 80 + body 140 + footer 40.
- Footer (volume + data + Slip) ha `marginTop: auto` → sempre alla stessa Y in tutte le card.
- **Razionale utente**: coerenza visiva nella griglia ("non possono avere altezze diverse, deve essere standard").

### 2.2 Sottotitoli rimossi

- Il prompt originale 3.3.1 prevedeva sottotitolo (description Polymarket) sotto al titolo.
- **Rimossi su decisione utente**: Polymarket restituisce description molto lunghe e visivamente invasive.
- Header card ora mostra solo: avatar/image · titolo (line-clamp 2) · tag categoria (whiteSpace nowrap + ellipsis).
- **Implicazione per Cowork**: nei prossimi prompt non riferirsi al sottotitolo come parte della card; usarlo solo nella event detail page.

### 2.3 Tag segue il titolo (no fixed minHeight)

- Se il titolo occupa 1 riga, il tag sta sulla riga 2.
- Se il titolo occupa 2 righe (line-clamp), il tag sta sulla riga 3.
- Slot interno header altezza 80 invariato → tag posizione varia ma resta dentro lo slot.

### 2.4 Bordi minimal ovunque

- Tutte le border passate da `--color-border-default` a `--color-border-subtle`.
- Toggle Filters / Sort / Layout / search input nella `MarketsFilters`: bordi `--color-border-subtle`.
- **Razionale utente**: estetica più pulita, "bordi al minimo".

### 2.5 Font ridotti dentro chart

- `DonutChart`: `pctFontSize = round(size * 0.22)`, `labelFontSize = round(size * 0.12)`.
- `Thermometer` (CryptoCard): rimosso testo interno, lasciate solo Up/Down freccia + percentuale fuori.

---

## 3. Griglia e navbar — divergenze layout

### 3.1 MarketsGrid

- Originale `auto-fill minmax(280px, 1fr)` produceva 5 colonne a 1440px.
- Cambiato in classi Tailwind esplicite: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (mobile/tablet/desktop).
- Match con wireframe Doc 4 ("3 desktop / 2 tablet / 1 mobile").

### 3.2 NavTabs allineata a Header

- Aggiunto wrapper interno `<div style={{ maxWidth: 1440, margin: '0 auto' }}>` dentro `<nav>`.
- Razionale: la `NavTabs` era full-width mentre `Header` era 1440px → disallineamento visivo.

### 3.3 CryptoLiveRail rimosso dalla home

- Inizialmente messo tra NavTabs e Hero (errato), poi spostato in sidebar come "Hot Crypto", poi **rimosso completamente** per allinearsi a Doc 4 stretto.

---

## 4. Sidebar 3-stati (3.4.1-C)

`components/home/Sidebar.tsx` ora ha logica a 3 stati basata su `hasDeposit`:

```ts
const hasDeposit = false // TODO MA4: leggere da Supabase
```

| Stato                 | Componenti renderizzati                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Guest (non loggato)   | GuestDemoCta + Signals + HotNow + News + Activity                                                     |
| Logged senza depositi | SidebarPortfolio (`mode='deposit-cta'`) + Signals + Watchlist (`populated=false`) + HotNow + Activity |
| Logged con saldo      | SidebarPortfolio (`mode='active'`) + Signals + Watchlist (`populated=true`) + HotNow + Activity       |

**Cowork to-do MA4**: collegare `hasDeposit` a una query Supabase reale (esiste già la tabella saldo? altrimenti bisogna definirla).

---

## 5. Hero carousel mobile (3.4.1-A)

- Su mobile (`md:hidden`), `<HeroZone>` ora usa `<ul>` con `scroll-snap-type: x mandatory`.
- Ogni card è full-width, swipe orizzontale.
- IntersectionObserver (threshold 0.6) sincronizza i dot di paginazione.
- `ChevronLeft` / `ChevronRight` con `scrollIntoView({behavior:'smooth'})`.
- **Implicazione per Cowork**: non serve componente carousel di terze parti.

---

## 6. Componenti aggiunti rispetto ai prompt

### 6.1 `MobileSidebarRails` (`components/home/MobileSidebarRails.tsx`)

- Wrapper `md:hidden` che ripropone i moduli sidebar su mobile (HotNow + Activity + Demo CTA banner).
- Inserito in `app/page.tsx` tra `<HeroZone>` e `<MarketsSection>`.
- **Razionale utente**: la sidebar destra non è visibile su mobile → mancavano CTA e moduli laterali.

### 6.2 Animations toggle (themeStore)

- Aggiunto `animationsEnabled: boolean` in `lib/stores/themeStore.ts` (persistito in `auktora-theme` localStorage).
- Toggle Zap/ZapOff visibile in `MarketsFilters`.
- `ThemeProvider` applica `.no-animations` a `<html>` quando off.
- CSS rule in `app/globals.css:417-423` azzera `animation-duration` e `transition-duration`.

### 6.3 REAL/DEMO toggle persistito (3.1.1-B)

- Aggiunto `isDemo: boolean` in `themeStore` (persistito).
- `HeaderActions` legge dal store, `useState` rimossa.
- **Implicazione MA4**: quando si collega il bet flow, leggere `isDemo` dal store; il saldo/posizioni mostrati devono cambiare di conseguenza.

---

## 7. Slip stub in MarketsGrid (3.4.1-E)

Footer card mostra `[+ Slip]` solo se `onAddToSlip` prop è definito. Per renderlo visibile ho passato uno **stub**:

```ts
function handleAddToSlip(eventId: string, outcome: string) {
  console.warn('[Slip stub]', eventId, outcome)
}
```

**Cowork to-do MA4**: definire `useBetSlip` store (Zustand?) + drawer Bet Slip. Lo stub va rimpiazzato con `useBetSlip().addLeg(eventId, outcome)`.

---

## 8. CSS tokens aggiunti (non in Doc 8 originale)

In `app/globals.css` `@theme` block:

```css
/* Hero / on-image (theme-invariant) */
--color-hero-overlay-strong: rgba(0, 0, 0, 0.7);
--color-hero-overlay-soft: rgba(0, 0, 0, 0.2);
--color-text-on-image: #ffffff;
--color-text-on-image-muted: rgba(255, 255, 255, 0.85);
--color-text-on-image-faint: rgba(255, 255, 255, 0.7);
--color-hero-cta-bg: rgba(255, 255, 255, 0.18);
```

Sono volutamente **invarianti per tema** (hero ha sempre overlay scuro su immagine, testo sempre bianco). Cowork può aggiornare Doc 8 se vuole formalizzarli.

---

## 9. Privy v3 — note API

- `embeddedWallets.createOnLogin` è **deprecato**, usare `embeddedWallets.ethereum.createOnLogin`.
- `user.email.verified` **rimosso**, usare `Boolean(user.email?.address)` (Privy verifica via OTP).
- Già applicato nel codice; segnalo per i prossimi prompt che toccano Privy.

---

## 10. Open items per Cowork (MA4)

- [ ] Schema Supabase per saldo / cash / P&L → collegare `SidebarPortfolio` mode='active' a dati reali
- [ ] Schema Supabase per watchlist → collegare `SidebarWatchlist` populated=true
- [ ] `useBetSlip` store + drawer Bet Slip → rimpiazzare stub `handleAddToSlip`
- [ ] Attivazione/disattivazione modalità DEMO (saldo demo separato dal real?)
- [ ] RLS recursion `admin_users` (Postgres 42P17) — handoff già notato in conversazione precedente, non bloccante perché il client codice usa `createAdminClient` (bypassa RLS)

---

## 11. File toccati riassunto (commit di riferimento)

| Sprint/Fix                            | Commit    | File principali                                                |
| ------------------------------------- | --------- | -------------------------------------------------------------- |
| Rename Auktora                        | `f4a570e` | tutto il codice                                                |
| Footer minimal 3.1.3                  | `a654918` | components/layout/Footer.tsx                                   |
| Header split 3.1.1-R                  | `b31241a` | components/layout/header/\*                                    |
| Search + Related 3.4.1-D              | `029dedd` | components/home/MarketsFilters.tsx, MarketsGrid.tsx            |
| Hero no hardcoded + Slip stub 3.4.1-E | `ce34352` | app/globals.css, components/home/HeroCard.tsx, MarketsGrid.tsx |

(Per la storia completa: `git log --oneline main`)
