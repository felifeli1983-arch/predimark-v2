# Predimark V2 — Wireframes — Pagina 3 (Profilo `/me`)

> **Documento 4 di 10** — UX Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Pagina 3 (Profilo /me) completa
> Predecessori: Pagina 1 (Home) v2, Pagina 2 (Pagina evento) v3

---

## Cos'è questo documento

Questo documento descrive la **Pagina Profilo** (`/me`) di Predimark V2 — il dashboard personale dell'utente loggato, dove gestisce saldo, posizioni, statistiche, watchlist, settings.

La pagina `/me` ha **un layout overview** + **N sub-pagine dedicate** per deep dive in ogni funzione.

**Regola architetturale fondamentale**: la modalità **Demo** ha sub-pagine **separate** sotto `/me/demo/*` (NON mescolate con dati real). Lo switch globale REAL/DEMO nell'header redireziona tra le 2 sezioni quando l'utente lo cambia.

---

## STRUTTURA DELLA SEZIONE /me

```
/me                       Overview (dashboard finanziario)
├── /me/positions         Tutte le posizioni aperte
├── /me/history           Storico trade chiusi
├── /me/watchlist         Mercati seguiti
├── /me/stats             Statistiche dettagliate (calibration, performance)
├── /me/following         Creator che segue
├── /me/sessions          Session keys copy trading
├── /me/referrals         Programma referral
├── /me/achievements      Badge sbloccati
├── /me/transactions      Depositi e prelievi storia
├── /me/notifications     Storico notifiche ricevute
└── /me/settings          Settings (sub-routes)
    ├── /me/settings/profile         Profilo (nome pubblico, avatar, bio)
    ├── /me/settings/security        Password, 2FA, esporta chiave Privy
    ├── /me/settings/notifications   Configurazione canali
    ├── /me/settings/telegram        Bot Telegram connection
    ├── /me/settings/premium         Telegram Premium subscription
    ├── /me/settings/language        Lingua interfaccia
    └── /me/settings/data            Export dati GDPR

/me/demo                  Demo Mode overview (specchio /me ma paper money)
├── /me/demo/positions    Posizioni demo
├── /me/demo/history      Storico demo
├── /me/demo/stats        Stats demo
└── /me/demo/reset        Reset balance demo (con conferma)
```

**Switch globale REAL/DEMO nell'header**:
- Click su REAL → redirect a `/me`
- Click su DEMO → redirect a `/me/demo`
- Persiste tra sessioni (Zustand localStorage)

---

## DECISIONI DI STILE PER /me

### Tema visivo
Stesso tema dark+light + palette Predimark senza giallo, ereditato da Pagina 1.

### Colori semantici specifici per /me
- **Verde** `#10b981` (dark) / `#059669` (light): P&L positivo, saldo, win
- **Rosso** `#ef4444` (dark) / `#dc2626` (light): P&L negativo, loss, debito
- **Blu** `#3b82f6`: CTA primario (Deposit, Trade)
- **Grigio**: dati neutri (volume tradato, trade count, ecc.)

### Banner Demo (quando in modalità Demo)
Banner persistente in cima a tutte le pagine `/me/demo/*`:
```
┌──────────────────────────────────────────────────────────┐
│ ⓘ Modalità Demo · Saldo paper money · I tuoi trade non   │
│   sono reali · [Switch to Real Mode]                      │
└──────────────────────────────────────────────────────────┘
```
Background blu chiaro `#3b82f615`, testo blu primario, bottone CTA.

---

## PAGINA OVERVIEW `/me` (HUB DASHBOARD)

### Desktop (>1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER GLOBALE (uguale a Home)                                        │
├──────────────────────────────────────────────────────────────────────┤
│ NAV TABS GLOBALI                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ SUB-NAV /me                                                           │
│ Overview · Positions · History · Watchlist · Stats · Following ·     │
│ More ▼                                                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ HERO FINANZIARIO                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Portfolio totale                  P&L oggi      P&L 24h        │ │
│ │  $1,247.30                         +$23.40       +$87.20        │ │
│ │                                    +1.92% ▲      +7.52% ▲       │ │
│ │                                                                  │ │
│ │  [GRAFICO EQUITY CURVE]                                          │ │
│ │  (linea verde se positivo, rossa se negativo)                    │ │
│ │  Tabs: 1D · 1W · 1M · 3M · 1Y · ALL                              │ │
│ │                                                                  │ │
│ │  [Deposit]  [Withdraw]  [Trade]  [Stats →]                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ POSIZIONI APERTE (preview top 5, con link "Vedi tutte")              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                  │ │
│ │ [foto] Trump 2028 · YES                                          │ │
│ │        Quantità: 100 shares · Avg: $0.50 · Current: $0.62        │ │
│ │        Valore corrente: $62.00 · P&L: +$12.00 (+24%) ▲           │ │
│ │        [Trade] [Sell]                                            │ │
│ │                                                                  │ │
│ │ [foto] BTC up 5m · UP                                            │ │
│ │        Quantità: 50 shares · Avg: $0.51 · Current: $0.49         │ │
│ │        Valore corrente: $24.50 · P&L: -$1.00 (-3.9%) ▼           │ │
│ │        [Trade] [Sell]                                            │ │
│ │                                                                  │ │
│ │ [foto] Lakers vs OKC · Lakers                                    │ │
│ │        ...                                                       │ │
│ │                                                                  │ │
│ │ [Vedi tutte le posizioni →]                                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌──────────────────────────┬─────────────────────────────────────┐  │
│ │ STATISTICHE OGGI         │ WATCHLIST PREVIEW                   │  │
│ │                          │                                     │  │
│ │ Trade oggi: 12           │ [foto] Champions Inter   28% ▲ +2%  │  │
│ │ Win rate: 58%            │ [foto] BTC 100k          78% ▲ +1%  │  │
│ │ Volume tradato: $487     │ [foto] Trump 2028        62% ▲ +2%  │  │
│ │ Avg ROI: +4.2%           │ [foto] Lakers            38% ▼ -3%  │  │
│ │                          │                                     │  │
│ │ [Vedi stats complete →]  │ [Vedi watchlist completa →]         │  │
│ └──────────────────────────┴─────────────────────────────────────┘  │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌──────────────────────────┬─────────────────────────────────────┐  │
│ │ ACHIEVEMENTS RECENTI     │ FOLLOWING (creator che segui)       │  │
│ │                          │                                     │  │
│ │ 🏆 First trade           │ [avatar] @theo4 · +$245 oggi (+12%) │  │
│ │    Sbloccato 3g fa       │ [avatar] @domah · -$89 oggi (-4%)   │  │
│ │ 🏆 5 win streak          │ [avatar] @foo · +$0 oggi            │  │
│ │    Sbloccato 1g fa       │                                     │  │
│ │ 🏆 $100 profit           │ [Vedi tutti →]                      │  │
│ │    Sbloccato oggi        │                                     │  │
│ │                          │                                     │  │
│ │ [Vedi tutti →]           │                                     │  │
│ └──────────────────────────┴─────────────────────────────────────┘  │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ FOOTER GLOBALE                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌─────────────────────────────────────┐
│ HEADER GLOBALE                      │
├─────────────────────────────────────┤
│ ← back · Overview                   │
├─────────────────────────────────────┤
│ SUB-NAV /me (scrollabile)           │
│ Overview · Positions · History ·   │
│ Watchlist · Stats · More ▼          │
├─────────────────────────────────────┤
│                                      │
│ HERO FINANZIARIO                    │
│ Portfolio: $1,247.30                │
│ P&L oggi: +$23.40 (+1.92%) ▲        │
│                                      │
│ [GRAFICO EQUITY CURVE]              │
│ [1D · 1W · 1M · 3M · 1Y · ALL]      │
│                                      │
│ [Deposit] [Withdraw] [Trade]         │
├─────────────────────────────────────┤
│ POSIZIONI APERTE (top 5)            │
│ ┌─────────────────────────────────┐ │
│ │ [foto] Trump 2028 · YES         │ │
│ │ 100 shares · $62.00             │ │
│ │ +$12.00 (+24%) ▲                │ │
│ │ [Trade] [Sell]                  │ │
│ └─────────────────────────────────┘ │
│ [card 2, 3, 4, 5...]                │
│ [Vedi tutte →]                      │
├─────────────────────────────────────┤
│ STATISTICHE OGGI                    │
│ Trade: 12 · Win rate: 58%           │
│ Volume: $487 · ROI: +4.2%           │
│ [Vedi complete →]                   │
├─────────────────────────────────────┤
│ WATCHLIST PREVIEW                   │
│ [3-5 mercati con prezzo + delta]    │
│ [Vedi completa →]                   │
├─────────────────────────────────────┤
│ ACHIEVEMENTS RECENTI                │
│ FOLLOWING                           │
├─────────────────────────────────────┤
│ Bottom navigation 5 voci             │
└─────────────────────────────────────┘
```

### Hero finanziario (componente chiave)

```
┌──────────────────────────────────────────┐
│ Portfolio totale                          │
│ $1,247.30                                 │ ← font enorme (32-48px)
│                                            │
│ P&L oggi: +$23.40 (+1.92%) ▲              │ ← verde se positivo
│ P&L 24h: +$87.20 (+7.52%) ▲                │
│                                            │
│ [GRAFICO EQUITY CURVE — linea]            │
│ Asse Y: valore portfolio in $              │
│ Asse X: timeline                           │
│ Punti hover: tooltip con valore esatto     │
│                                            │
│ Tabs timeframe: [1D] [1W] [1M] [3M] [1Y]   │
│ [ALL]                                       │
│                                            │
│ [Deposit] [Withdraw] [Trade] [Stats →]    │
└──────────────────────────────────────────┘
```

**Caratteristiche del grafico equity**:
- Linea **verde** se valore corrente > valore inizio periodo
- Linea **rossa** se valore corrente < valore inizio periodo
- Colore di sfondo gradient morbido (verde tenue / rosso tenue) sotto la linea
- Animazione smooth quando cambia timeframe (200-300ms)
- Click su un punto del grafico → tooltip con valore + data esatta
- **Loading state**: skeleton placeholder finché non carica

**Quick actions**:
- **Deposit** (CTA blu primario): apre modal/page MoonPay onramp
- **Withdraw**: apre modal/page off-ramp
- **Trade**: redirect a Home con scroll alle hero card
- **Stats →**: redirect a `/me/stats`

### Card posizioni aperte (preview)

Ogni card mostra:
- **Foto evento** + nome mercato + side (YES/NO/UP/DOWN/Team)
- **Quantità** shares possedute
- **Prezzo medio acquisto** (Avg)
- **Prezzo corrente** (Current — live via WebSocket)
- **Valore corrente** = quantità × prezzo corrente
- **P&L** in $ e % (verde se positivo, rosso se negativo)
- **Bottoni inline**: Trade (per aggiungere alla posizione), Sell (per vendere shares)
- Click sulla card → naviga alla pagina evento del market

### Card stats oggi

Riepilogo rapido performance del giorno:
- **Trade oggi**: numero di trade chiusi nelle ultime 24h
- **Win rate**: percentuale di trade vincenti oggi
- **Volume tradato**: somma USDC di tutti i trade oggi
- **Avg ROI**: ROI medio dei trade oggi

### Card watchlist preview

Top 5 mercati seguiti con price change:
- Foto + nome mercato compatto
- Probabilità corrente + delta (verde/rosso)
- Click → naviga alla pagina evento

### Card achievements recenti

Top 3 badge sbloccati di recente:
- Icona trofeo + nome badge
- "Sbloccato Xg fa"
- Click → naviga a `/me/achievements` per dettagli

### Card following

Top 3 creator seguiti con loro performance del giorno:
- Avatar + nome creator
- "+$X oggi (+Y%)" o "−$X oggi (−Y%)"
- Click → naviga a `/creator/[username]`

---

## SUB-PAGINA `/me/positions`

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ SUB-NAV /me                                                           │
│ Overview · [Positions] · History · Watchlist · Stats · More ▼        │
├──────────────────────────────────────────────────────────────────────┤
│ HEADER POSIZIONI                                                     │
│ Posizioni aperte (12)              [Filter ⚙] [Sort ▼]               │
│ Valore totale: $832.40 · P&L totale: +$48.20 (+6.15%) ▲             │
├──────────────────────────────────────────────────────────────────────┤
│ FILTRI                                                                │
│ [All] [In profitto] [In perdita] [Crypto] [Sport] [Politica] ...     │
├──────────────────────────────────────────────────────────────────────┤
│ LISTA POSIZIONI (lista verticale completa)                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [foto] Trump 2028 · YES                          P&L: +$12.00   │ │
│ │        Politics · Elections                       (+24%) ▲      │ │
│ │        100 shares @ $0.50 → $0.62                                │ │
│ │        Valore corrente: $62.00                                   │ │
│ │        Aperta 3 giorni fa                                        │ │
│ │        [Trade] [Sell] [Set alert]                                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [foto] BTC su o giù 5m · UP                       P&L: -$1.00   │ │
│ │        Crypto · Bitcoin                            (-3.9%) ▼     │ │
│ │        50 shares @ $0.51 → $0.49                                 │ │
│ │        Round termina in 02:42                                    │ │
│ │        [Trade] [Sell]                                            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ...                                                                   │
└──────────────────────────────────────────────────────────────────────┘
```

### Caratteristiche

- **Header con totale**: valore totale + P&L aggregato di TUTTE le posizioni aperte
- **Filtri**: tutti / in profitto / in perdita / per categoria
- **Sort**: più recenti / P&L assoluto / P&L percentuale / valore corrente / chiude prima
- **Lista verticale completa** (NON paginata, scroll infinito o "load more")
- **Real-time updates** via WebSocket per prezzi correnti e P&L
- **Card cliccabile** → naviga al market dell'outcome

---

## SUB-PAGINA `/me/history`

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ SUB-NAV /me                                                           │
│ Overview · Positions · [History] · Watchlist · Stats · More ▼        │
├──────────────────────────────────────────────────────────────────────┤
│ HEADER HISTORY                                                        │
│ Storico trade (487)                [Filter ⚙] [Sort ▼] [Export ↓]    │
│ Profit totale: +$345.20 · Win rate: 62%                              │
├──────────────────────────────────────────────────────────────────────┤
│ FILTRI                                                                │
│ [Tutti] [Vinti] [Persi] [Per categoria ▼] [Periodo: ultimo mese ▼]  │
├──────────────────────────────────────────────────────────────────────┤
│ LISTA TRADE CHIUSI                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✓ WIN                                          P&L: +$28.30      │ │
│ │ Trump 2024 · YES                                                  │ │
│ │ 50 shares @ $0.43 → resolved $1.00                               │ │
│ │ Hold time: 12 giorni                                              │ │
│ │ Closed: 5 nov 2024, 11:23pm                                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✗ LOSS                                         P&L: -$24.50      │ │
│ │ Lakers vs Boston · Boston                                        │ │
│ │ 50 shares @ $0.49 → resolved $0.00                               │ │
│ │ Hold time: 3 ore                                                  │ │
│ │ Closed: 4 nov 2024, 10:12pm                                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ...                                                                   │
└──────────────────────────────────────────────────────────────────────┘
```

### Caratteristiche

- **Header con totale**: profit cumulato + win rate
- **Filtri**: tutti / vinti / persi / per categoria / per periodo
- **Sort**: più recenti / più vecchi / P&L assoluto / hold time
- **Export ↓**: scarica CSV con tutti i trade (per analisi esterna o tasse)
- **Card per trade chiuso**:
  - Badge ✓ WIN (verde) o ✗ LOSS (rosso)
  - Nome mercato + side
  - Quantità + prezzo entrata + prezzo risoluzione
  - Hold time (quanto è durata la posizione)
  - Data chiusura
- **Pagination o infinite scroll** (centinaia/migliaia di trade per utenti attivi)

---

## SUB-PAGINA `/me/watchlist`

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ SUB-NAV /me                                                           │
│ Overview · Positions · History · [Watchlist] · Stats · More ▼        │
├──────────────────────────────────────────────────────────────────────┤
│ HEADER WATCHLIST                                                      │
│ Mercati seguiti (24)              [Filter ⚙] [Sort ▼]                │
├──────────────────────────────────────────────────────────────────────┤
│ FILTRI                                                                │
│ [Tutti] [Crypto] [Sport] [Politica] [In movimento >5%]               │
├──────────────────────────────────────────────────────────────────────┤
│ GRID O LISTA MERCATI (utente sceglie con toggle [⊞|≡])               │
│                                                                       │
│ Ogni mercato è una EventCard come in Home                            │
│ Con bookmark filled (perché è in watchlist)                          │
│ + bottone "Remove from watchlist"                                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Caratteristiche

- Stessa EventCard di Home (5 varianti CardKind)
- Bookmark **filled** (icona piena) per indicare "già in watchlist"
- Hover/long-press → mostra "Rimuovi da watchlist"
- Real-time updates di prezzi
- Toggle layout grid/lista
- **Notifiche push opzionali** per ogni mercato in watchlist (settabile da settings)

---

## SUB-PAGINA `/me/stats`

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ SUB-NAV /me                                                           │
│ Overview · Positions · History · Watchlist · [Stats] · More ▼        │
├──────────────────────────────────────────────────────────────────────┤
│ HEADER STATS                                                          │
│ Le tue statistiche                          [Periodo: 30 giorni ▼]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ METRICHE PRINCIPALI (cards)                                          │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐        │
│ │ P&L totale   │ Win rate     │ ROI medio    │ Trade count  │        │
│ │ +$345.20     │ 62%          │ +4.8%        │ 487          │        │
│ │ +28.5% ▲     │ 287/487      │ vs +2.1% mkt │ ↑ 23 oggi    │        │
│ └──────────────┴──────────────┴──────────────┴──────────────┘        │
│                                                                       │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐        │
│ │ Volume tot   │ Drawdown max │ Sharpe ratio │ Best trade   │        │
│ │ $12,450      │ -$87.30      │ 1.84         │ +$245 (Trump)│        │
│ │              │ (-7.0%)      │              │              │        │
│ └──────────────┴──────────────┴──────────────┴──────────────┘        │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ GRAFICI                                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ EQUITY CURVE (grande)                                            │ │
│ │ [linea verde/rossa, asse Y valore portfolio, asse X timeline]    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ P&L PER CATEGORIA (bar chart)                                    │ │
│ │ Crypto:    +$120 ████████                                        │ │
│ │ Sport:     +$80  █████                                           │ │
│ │ Politica:  +$70  ████                                            │ │
│ │ Cultura:   +$45  ███                                             │ │
│ │ News:      -$10  ▏                                               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CALIBRATION CURVE (Predimark exclusive)                          │ │
│ │ [grafico calibration: predicted prob vs actual outcome]          │ │
│ │ La tua linea vs linea perfetta (diagonale)                       │ │
│ │ Sei sopra/sotto la diagonale = sovrastimi/sottostimi             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ TOP/WORST TRADE                                                       │
│ ┌──────────────────────────┬─────────────────────────────────────┐  │
│ │ TOP 3 BEST TRADE         │ TOP 3 WORST TRADE                   │  │
│ │ 1. Trump 2024 +$245      │ 1. Lakers vs Boston -$87            │  │
│ │ 2. BTC 100k +$120        │ 2. Champions Inter -$45             │  │
│ │ 3. Champions Real +$80   │ 3. ETH 5k -$30                      │  │
│ └──────────────────────────┴─────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Caratteristiche

- **Periodo selezionabile**: ultimi 7g / 30g / 90g / 1y / all-time
- **8 metriche cards**: P&L totale, Win rate, ROI medio (vs market avg), Trade count, Volume tot, Drawdown max, Sharpe ratio, Best trade
- **3 grafici principali**:
  1. **Equity curve** dettagliata
  2. **P&L per categoria** (bar chart)
  3. **Calibration curve** — questa è UNICA Predimark, usa il framework Becker che hai nei codici di riferimento. Mostra se l'utente "sovrastima" o "sottostima" le probabilità (utile per capire bias personali)
- **Top/Worst trade**: 3 best + 3 worst per insight rapidi

### Calibration curve (differenziatore Predimark)

```
Calibration Curve - I tuoi trade

100% │                                    ✓ ← linea perfetta
     │                              ✓     /
 80% │                        ✓     /
     │                  ✓          /
 60% │            ✓            /
     │      ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪/  ← la tua linea
 40% │  ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪/  (è sotto la diagonale = sovrastimi prob)
     │/
 20% │
     │
   0%└─────────────────────────────────────
       0% 20% 40% 60% 80% 100%
       Probabilità che hai stimato comprando

Brier score: 0.18 (più basso = meglio)
ECE (Expected Calibration Error): 8.4%
```

**Insight**: se la tua linea è sotto la diagonale, **sovrastimi le probabilità** (compri Yes troppo facilmente). Se è sopra, **le sottostimi**.

Questo è dato pratico per migliorare le decisioni di trading. Polymarket non offre niente di simile.

---

## SUB-PAGINE MINORI (descrizione sintetica)

### `/me/following`
Lista creator seguiti con loro performance recente. Click su uno → naviga al profilo creator. Bottone "Unfollow" inline.

### `/me/sessions`
Lista session keys copy trading attive:
- Per ogni session: creator + livello (Manuale/24h/7g/30g/Indefinito) + stato (attiva/scaduta)
- Bottone "Revoca" istantaneo (chiude la session immediatamente)
- Storico session passate

### `/me/referrals`
Programma referral:
- Link referral personale (con bottone copy)
- Lista referrati con loro volume e payout dovuto
- Storico payout ricevuti
- Spiegazione "Come funziona" (20% revenue share per 6 mesi)

### `/me/achievements`
Griglia badge sbloccati + locked:
- Sbloccati: colorati con descrizione
- Locked: silhouette grigia con "Sblocca facendo X"
- Categorie: Trading / Social / Streaks / Volumes / Special

### `/me/transactions`
Storico depositi e prelievi:
- Ogni transazione: tipo (deposit/withdraw), importo, data, status (pending/completed/failed), tx hash on-chain
- Filtri per tipo e periodo

### `/me/notifications`
Storico notifiche ricevute (email + push + in-app):
- Lista cronologica
- Marca come letto
- Filtri per tipo

### `/me/settings/*`
7 sub-pagine settings (descritte nel Documento 3 — Sitemap):
- profile / security / notifications / telegram / premium / language / data

---

## STATI DELLE PAGINE /me

### Default (utente loggato con saldo e attività)
Layout completo con dati real-time.

### Loading (primo caricamento)
- Skeleton placeholder per hero, posizioni, stats, watchlist
- Caricamento progressivo sezione per sezione

### Empty state (utente nuovo, niente attività)
Per ogni sezione vuota mostra **empty state custom**:

**Posizioni vuote**:
```
[Icona]
"Nessuna posizione aperta"
Inizia a tradare per vedere le tue posizioni qui.
[Esplora mercati →]
```

**History vuoto**:
```
"Nessun trade chiuso"
Quando i tuoi trade si risolvono, appariranno qui.
```

**Watchlist vuota**:
```
"Nessun mercato seguito"
Aggiungi mercati alla watchlist con il bookmark per tenerli d'occhio.
[Esplora mercati →]
```

**Stats vuote**:
```
"Statistiche non disponibili"
Servono almeno 5 trade chiusi per generare statistiche significative.
[Inizia a tradare →]
```

### Error (problema rete/API)
Banner non bloccante "Connessione interrotta" + dati cached.

### Modalità Demo (attiva)
- L'utente è su `/me/demo/*` invece di `/me/*`
- Banner blu persistente in cima
- Dati paper money
- Stesso layout, dati separati
- `/me/demo/reset` permette reset balance demo a $10k iniziali (con dialog conferma)

---

## COMPORTAMENTI INTERATTIVI

### Real-time updates

Aggiornamenti via WebSocket per:
- **Prezzi correnti posizioni**: WS CLOB `price_change`
- **P&L**: ricalcolato live in base a prezzi
- **Saldo**: aggiornato dopo ogni trade (via WS o polling)
- **Watchlist**: prezzi mercati seguiti
- **Following performance**: P&L creator seguiti

### Switch REAL/DEMO

Quando l'utente clicca lo switch nell'header globale:
- Se è su `/me/*` → redirect a `/me/demo/*` (stessa sub-page)
- Se è su `/me/demo/*` → redirect a `/me/*`
- Se è su altra pagina (es. Home) → redirect alla home con switch attivato

Esempio: utente su `/me/positions` clicca DEMO → finisce su `/me/demo/positions`.

### Notifiche push opzionali per watchlist

Per ogni mercato in watchlist, l'utente può abilitare notifiche push per:
- Movimento prezzo > X% in 1h/24h
- Nuovo segnale Predimark sul mercato
- Mercato chiude tra 24h
- Mercato risolto

Configurabile da `/me/settings/notifications`.

---

## ACCESSIBILITÀ

- Tutti i bottoni e link con `aria-label` chiari
- Equity curve chart con descrizione testuale per screen reader
- Tabelle posizioni e history con `<table>` semantico
- Navigation tra sub-pagine completa da tastiera
- Touch target minimo 44x44px su mobile
- Empty state con CTA chiari e action

---

## NOTE TECNICHE PER COWORK

### Componenti da costruire

- **DashboardHero**: hero finanziario con saldo + equity curve
- **PositionCard**: card per posizione aperta (preview e lista completa)
- **TradeHistoryCard**: card per trade chiuso (con badge WIN/LOSS)
- **StatsCard**: card metrica (P&L, Win rate, ROI, ecc.)
- **EquityCurveChart**: grafico storia portfolio (riusabile in /me e /me/stats)
- **PnLByCategoryChart**: bar chart P&L per categoria
- **CalibrationCurveChart**: chart calibration (specifico Predimark)
- **EmptyState**: componente per stati vuoti (riusabile in tutte sub-pages)
- **DemoBanner**: banner persistente modalità demo

### Dati e API

- **Posizioni**: API interna `/api/me/positions` + WS per prezzi correnti
- **History**: API interna `/api/me/history?period=X&filter=Y`
- **Stats**: API interna `/api/me/stats?period=X` (calcoli aggregati)
- **Equity curve**: API interna `/api/me/equity-curve?period=X`
- **Calibration**: API interna `/api/me/calibration` (calcolo nostro proprietario)
- **Watchlist**: API interna `/api/me/watchlist`
- **Demo data**: separate API `/api/me/demo/*` (dati isolati in DB demo separato)

### Performance

- **Lazy loading sub-pagine**: ogni sub-page lazy import
- **Cache statistiche**: stats aggregate cachate 5 minuti (non servono real-time)
- **Pagination o infinite scroll** per liste lunghe (history, transactions)
- **WebSocket throttle**: max 1 update/500ms per posizioni live

### Database considerations

Per Cowork: il DB Supabase deve avere tabelle separate per real e demo data. Esempio:
- `positions_real` / `positions_demo`
- `trades_real` / `trades_demo`
- `transactions_real` (demo non ha transazioni)

Oppure una sola tabella con flag `is_demo` boolean.

---

## RIFERIMENTI

- **Documento 1** — Vision & Product
- **Documento 2** — User Stories (US-016, US-017, US-018, US-019, US-020 specifici per /me)
- **Documento 3** — Sitemap
- **Documento 4** — Pagina 1 (Home), Pagina 2 (Pagina evento)
- **Documento 5** — Tech stack & Architettura
- **Documento 6** — Database schema (per gestione real vs demo)

---

## PAGINE SUCCESSIVE

Documenti che verranno costruiti nelle prossime sessioni:

- **Pagina 4** — Profilo creator `/creator/[username]`
- **Pagina 5** — Admin overview `/admin`
- **Pagina 6** — Signup + onboarding flow

**Totale pagine wireframe**: 6 (3 fatte, 3 restano)

---

*Fine Documento 4 — Wireframes — Pagina 3 (Profilo /me)*
*Continua con Pagina 4 (Profilo creator) nella sessione successiva*
