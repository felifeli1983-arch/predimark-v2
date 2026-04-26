# Predimark V2 — Wireframes

> **Documento 4 di 10** — UX Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v2 — Pagina 1 (Home) finalizzata, altre pagine in sessioni successive

---

## Cos'è questo documento

Questo documento descrive **come appaiono visivamente** le pagine principali di Predimark V2. Non è un design Figma, è un **wireframe testuale dettagliato** che Cowork e i designer possono usare per costruire l'UI corretta.

Per ogni pagina principale descriviamo:

- Layout desktop (>1024px) e mobile (<768px)
- Posizione e gerarchia degli elementi
- Comportamenti interattivi
- Stati possibili (default, loading, error, empty, geo-blocked, demo, non loggato)
- Componenti riutilizzabili
- Riferimenti incrociati a user stories e sitemap

**Pagine documentate in questo file:**

- Pagina 1 — Home (`/`) ✅ completa v2
- Pagine 2-8 — In sessioni successive

---

## DECISIONI DI STILE GLOBALI (applicabili a tutte le pagine)

### Direzione visiva

Predimark V2 prende ispirazione dal **concept design Dribbble** stile "magazine moderno con sidebar task-oriented", combinato con **identità propria** che lo differenzia da Polymarket reale e da altri builder.

**Cosa NON facciamo**:

- Niente copia 1:1 di Polymarket reale
- Niente giallo Binance (esclusione esplicita)
- Niente UI minimalista austera (vogliamo personalità)

**Cosa facciamo**:

- Color blocking tematico per categoria
- Sidebar adattiva basata su stato utente
- Card grandi con donut probability prominenti
- Sezioni "task-oriented" che invitano azione (non solo info)

### Tema colori

**Dark mode** (default per crypto-native):
| Ruolo | Hex | Esempio uso |
|---|---|---|
| Background primario | `#0a0e1a` | Sfondo pagine |
| Background card | `#141a2a` | EventCard, drawer |
| Background card hover | `#1a2138` | Card hover state |
| Border subtle | `#252b3d` | Bordi card, divider |
| Testo primario | `#ffffff` | Titoli, valori importanti |
| Testo secondario | `#9ca3af` | Sottotitoli, label |
| Testo terziario | `#6b7280` | Footer, info minori |
| Verde Yes/Up/Buy | `#10b981` | Bottoni Yes, Up, profitto |
| Verde background | `#10b98120` | Background card Yes |
| Rosso No/Down/Sell | `#ef4444` | Bottoni No, Down, perdita |
| Rosso background | `#ef444420` | Background card No |
| Blu CTA primario | `#3b82f6` | Bottoni "Deposita", link, badge |
| Live indicator | `#dc2626` | ●LIVE pallino pulsante |
| Hot indicator | `#f97316` | 🔥 emoji per hot topics |

**Light mode**:
| Ruolo | Hex |
|---|---|
| Background primario | `#ffffff` |
| Background card | `#f9fafb` |
| Background card hover | `#f3f4f6` |
| Border subtle | `#e5e7eb` |
| Testo primario | `#0a0e1a` |
| Testo secondario | `#4b5563` |
| Testo terziario | `#9ca3af` |
| Verde Yes/Up/Buy | `#059669` |
| Verde background | `#d1fae5` |
| Rosso No/Down/Sell | `#dc2626` |
| Rosso background | `#fee2e2` |
| Blu CTA primario | `#3b82f6` |
| Live indicator | `#dc2626` |
| Hot indicator | `#ea580c` |

### Regole d'uso colori (UNIFORMITÀ ASSOLUTA)

**Uso semantico stretto**:

- 🟢 **Verde = SOLO** Yes / Up / Win / Profit positivo / Buy
- 🔴 **Rosso = SOLO** No / Down / Loss / Profit negativo / Sell
- 🔵 **Blu = SOLO** CTA primario, link, badge informativi
- ⚪ **Grigio = SOLO** neutri, no semantica
- ⚫ **Niente giallo** (esclusione esplicita perché ricorda Binance)
- 🔴 **Live indicator** sempre rosso pulsante (mai verde, mai blu)
- 🟠 **Hot indicator** sempre arancione (mai rosso, per non confondere con "down")

### Color blocking tematico (NUOVO — per Hero card)

Per dare identità visiva forte e differenziare la home da Polymarket, le **Hero card** usano un mood color basato sulla categoria del mercato in primo piano:

| Tema mercato      | Color hero                | Atmosfera           |
| ----------------- | ------------------------- | ------------------- |
| Sport             | Blu acceso `#3b82f6`      | Energetico, action  |
| Politica/Elezioni | Rosso dignitoso `#dc2626` | Serio, formale      |
| Crypto            | Arancione `#f97316`       | Trading, adrenalina |
| Cultura/Pop       | Viola `#8b5cf6`           | Creativo, fresh     |
| News/World        | Verde acqua `#0d9488`     | Calmo, informativo  |
| Geopolitica       | Blu scuro `#1e40af`       | Strategico, denso   |
| Economia/Finanza  | Verde scuro `#15803d`     | Stabilità, fiducia  |
| Tech              | Viola scuro `#5b21b6`     | Innovazione         |

**Importante**: il color blocking si applica **solo alle Hero card** della home. La UI generale (header, navigation, card normali, sidebar) usa la palette base dark/light. Questo crea contrasto visivo forte: hero "tematica e colorata", resto "neutro e pulito".

### Tipografia

- Font sans-serif moderno (TBD, candidati: Inter, Geist, System UI)
- **Sizes**: 12px (caption), 14px (body), 16px (default), 18-20px (titoli card), 24-32px (headings hero)
- **Line-height generoso** per leggibilità mobile
- **Numeri tabulari** (font-variant-numeric: tabular-nums) per percentuali/saldi/prezzi

### Spaziature

- Sistema 4px-based (4, 8, 12, 16, 24, 32, 48, 64)
- Padding card mobile: 12-16px
- Gap tra card mobile: 12px (per consentire "peek" della successiva)
- Gap rail desktop: 16-24px

### Iconografia

- **Lucide React** (zero emoji nelle UI di Predimark, regola assoluta tranne per indicatori semantici tipo 🔥 Hot)
- Icone outline per default
- Icone filled per stati attivi (es. bookmark filled = già in watchlist)

### Animazioni

- Transizioni 150-300ms con easing naturale
- Live indicators (●LIVE) pulsano lentamente (2s loop)
- Termometri probabilità si animano quando cambia il valore (200ms ease-out)
- Live betting feed crypto round: fade-in 200ms / fade-out 300ms
- **Toggle "Animations" disponibile** in settings utente per disabilitare tutte le animazioni (accessibility + performance)

---

## I 5 CARDKIND DI PREDIMARK

Ricapitolo qui i 5 tipi di card che useremo in tutta l'app.

| #   | CardKind           | Quando si usa                      | Esempio                                                   |
| --- | ------------------ | ---------------------------------- | --------------------------------------------------------- |
| 1   | **Binary**         | Domanda Yes/No semplice            | "Will Trump win 2028?"                                    |
| 2   | **Multi-outcome**  | N candidati esclusivi (anche date) | "Champions winner" o "Quando finisce la guerra entro...?" |
| 3   | **Multi-strike**   | N soglie prezzo                    | "BTC max May ≥$100k, ≥$110k..."                           |
| 4   | **H2H Sport**      | Sport con team affiancati          | "Lakers vs OKC"                                           |
| 5   | **Crypto Up/Down** | Round breve crypto                 | "BTC su o giù 5m"                                         |

I mercati con date come outcome (es. "Quando finisce X entro... 30 aprile / 31 maggio") sono trattati come **Multi-outcome** standard. La differenza è solo nel contenuto degli outcome (date invece di nomi).

---

## I 2 PATTERN DI REFRESH DELLE CARD

### Pattern 1 — Auto-refresh serie (occorrenze ricorrenti)

**Si applica a**: Crypto Up/Down round, eventi sport ricorrenti, mercati settimanali.

**Comportamento**: la card mostra solo l'occorrenza attiva. Quando si risolve, la card cambia identità all'occorrenza successiva.

### Pattern 2 — Promozione outcome interno

**Si applica a**: Multi-outcome con date come outcome, multi-strike con soglie prezzo.

**Comportamento**: la card resta lo stesso evento. La lista degli outcome si aggiorna: outcome risolti scompaiono, gli altri si riordinano.

### Tabella riassuntiva

| CardKind                          | Pattern refresh | "Scadenza" mostrata                      |
| --------------------------------- | --------------- | ---------------------------------------- |
| Binary                            | Nessuno         | "Closes [data]" o countdown <24h         |
| Multi-outcome (nominali)          | Nessuno         | "Closes [data]"                          |
| Multi-outcome (date come outcome) | Pattern 2       | NIENTE data footer, date dentro outcome  |
| Multi-strike                      | Pattern 2       | NIENTE data footer, soglie con prob      |
| H2H Sport                         | Nessuno         | "Live · HT" / "Game ends ~9pm" / "Final" |
| Crypto Up/Down                    | Pattern 1       | Countdown "Round ends in MM:SS"          |

---

## PAGINA 1 — Home (`/`)

**User stories di riferimento**: US-001, US-002, US-003, US-009, US-010, US-011, US-039 (geo-block)

**Obiettivo della pagina**: massimizzare discovery dei mercati interessanti, far percepire l'app come "viva e dinamica" tramite indicatori real-time, fornire CTA chiari per signup/demo se non loggato, mostrare valore unico Predimark (segnali, demo, copy trading).

### Struttura globale Home

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                   │
├─────────────────────────────────────────────────────────┤
│ NAV TABS (categorie scrollabili)                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ HERO ZONE (60% sx + 40% dx)     SIDEBAR ADATTIVA (25%) │
│   ┌─Hero big────┐  ┌Hero2─┐    ┌─Sezione 1─┐           │
│   │             │  │      │    │ Sezione 2 │           │
│   └─────────────┘  ├─Hero3┤    │ Sezione 3 │           │
│                    │      │    │ ...       │           │
│                    └──────┘    └───────────┘           │
│                                                          │
│ FILTRI + Sub-filtri Related                             │
│                                                          │
│ TUTTI I MERCATI (grid 3-4 col / 1 mobile)               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ FOOTER                                                   │
└─────────────────────────────────────────────────────────┘
```

---

### Layout Desktop (>1024px)

#### Header desktop ricco

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Logo Predimark]  Markets · Signals · Leaderboard · News · Creator   │
│  [search lunga centrale]                                              │
│  Portfolio $0  Cash $0  [Deposit]  [🎁] [🔔] [REAL/DEMO] [Profile▼] │
└──────────────────────────────────────────────────────────────────────┘
```

- **Logo Predimark** sx, click → `/`
- **Nav primary**: Markets · Signals · Leaderboard · News · Creator
- **Search globale** centrale (placeholder localizzato)
- **Portfolio + Cash** mostrati come info di stato (esempio: "Portfolio $124.50 | Cash $50.00")
- **Bottone Deposit** prominente blu (CTA primaria sempre visibile per chi ha saldo basso)
- **Icone**: Gift (referral), Notifiche (campanella con badge), Switch REAL/DEMO, Profile dropdown
- Sticky in cima durante scroll

#### Nav tabs (sotto header)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ●LIVE  All  For You  Politics  Sports  Crypto  Esports  Mentions    │
│ Creators  Pop Culture  Business  Science  Geopolitics  ...  → Help  │
└──────────────────────────────────────────────────────────────────────┘
```

- Indicatore **●LIVE** in primissima posizione (rosso pulsante)
- Voci scrollabili orizzontalmente
- Stato attivo evidenziato (sottolineato + colore primario)
- "Get the App" e "Help" all'estrema destra

#### Hero zone desktop (60% sx + 40% dx)

```
┌──────────────────────────────────────────┬───────────────┐
│                                          │               │
│  HERO BIG (mood color: blu sport)        │  HERO 2       │
│  ┌────────────────────────────────────┐  │  (viola pop)  │
│  │ NFL Playoffs                       │  │ "New Year's"  │
│  │ Super Wildcard Weekend is here!    │  │ predictions"  │
│  │                                    │  │ [Markets >]   │
│  │ [illustrazione NFL grande]         │  │               │
│  │                                    │  ├───────────────┤
│  │ [Games >]                          │  │  HERO 3       │
│  │                                    │  │  (rosso poli) │
│  └────────────────────────────────────┘  │ "Trump Admin" │
│                                          │ Track promises│
│         ●○○○ pagination dots             │ [Dashboard >] │
│         ← Iran Meeting    Sports →       │               │
│                                          └───────────────┘
└──────────────────────────────────────────────────────────┘
```

**Hero Big** (sinistra, 60%):

- Mood color tematico (blu sport, rosso politica, arancio crypto, ecc.)
- Titolo grande tipografia bold
- Sottotitolo descrittivo
- Illustrazione/foto contestuale grande
- CTA "Games >" o "Markets >" o "Dashboard >"
- Pagination dots in basso (5 hero alternate)
- Frecce sinistra/destra per navigare tra hero

**Hero 2 e Hero 3** (destra, 40%, impilate):

- Stesso pattern ma più piccole
- Mood color tematico diverso da Hero Big (varietà visiva)
- CTA dedicate

**Cosa contengono le hero**:

- Hero Big: evento più importante del giorno (algoritmico: volume + movimento + liquidità + tempo)
- Hero 2: tema editoriale rilevante (es. "New Year predictions", "AI race")
- Hero 3: dashboard/dossier curato (es. "Trump Admin tracker", "Crypto big movements")

#### Sidebar adattiva desktop (25%)

La sidebar ha **5 sezioni**, ma l'**ordine cambia** in base allo stato utente.

**Stato 1: NON loggato (visitatore)**

```
┌────────────────────────┐
│ 🎮 Demo Mode           │  ← prima posizione: incentivo a provare
│ Try Predimark with     │
│ $10k paper money       │
│ [Try Demo >]           │
├────────────────────────┤
│ 🎯 Signals Live        │  ← differenziatore unico Predimark
│ Edge +14% on BTC Up    │
│ Confidence 72%         │
│ [View Signal >]        │
├────────────────────────┤
│ 🔥 Hot Now             │
│ [tag cloud]            │
│ Trump · Iran · BTC     │
│ Lakers · GPT-5 · NFL   │
├────────────────────────┤
│ 📰 Latest News         │
│ 1. News A          4%  │
│ 2. News B         15%  │
│ 3. News C          1%  │
├────────────────────────┤
│ ⚡ Recent Activity     │
│ [feed live trades]     │
└────────────────────────┘
```

**Stato 2: LOGGATO senza depositi**

```
┌────────────────────────┐
│ 💰 Portfolio           │  ← prima: Deposit cash CTA
│ Deposit some cash to   │
│ start betting          │
│ [Deposit >]            │
├────────────────────────┤
│ 🎯 Signals Live        │
│ ...                    │
├────────────────────────┤
│ ⭐ Watchlist           │
│ Click the star on any  │
│ market to add it       │
│ [Trending >]           │
├────────────────────────┤
│ 🔥 Hot Now             │
│ ...                    │
├────────────────────────┤
│ ⚡ Recent Activity     │
│ ...                    │
└────────────────────────┘
```

**Stato 3: LOGGATO con saldo e attività**

```
┌────────────────────────┐
│ 💰 Portfolio           │
│ Total: $124.50         │
│ Today P&L: +$8.30      │
│ [Manage >]             │
├────────────────────────┤
│ 🎯 Signals Live        │
│ Edge on your watchlist │
│ ...                    │
├────────────────────────┤
│ ⭐ Watchlist           │
│ Trump 2028   62% +2%   │
│ BTC 100k     78% +1%   │
│ Lakers       38% -3%   │
├────────────────────────┤
│ 🔥 Hot Now             │
│ ...                    │
├────────────────────────┤
│ ⚡ Recent Activity     │
│ Creators you follow:   │
│ @theo4 bought Yes...   │
│ @domah sold No...      │
└────────────────────────┘
```

**Caratteristiche della sidebar**:

- **Ordine adattivo** in base allo stato utente
- **5 sezioni** sempre presenti (Portfolio/Demo, Signals, Watchlist/Hot, News/Hot, Activity)
- **Sticky scroll**: la sidebar resta visibile mentre l'utente scrolla la home
- **CTA prominenti** in ogni sezione (non solo info, ma azione)
- **Real-time updates** via WebSocket per Watchlist, Activity, Signals

#### Filtri e sub-filtri (sotto Hero zone)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [⚙ Filters] [🔍 Search markets...]    [⚡Animations] [Sort: Newest▼] [⊞|≡]│
├──────────────────────────────────────────────────────────────────────┤
│ All · Wildfire · Breaking · Trump · Iran · GPT-5 · NFL · Mentions  →│
└──────────────────────────────────────────────────────────────────────┘
```

- **Bottone Filters avanzati** (icona slider) → apre drawer con tutti i filtri possibili
- **Search markets** specifico (diverso dal Search globale dell'header)
- **Toggle Animations** — per disabilitare le animazioni (accessibility)
- **Sort dropdown**: Newest / Volume / Trending / Closing soon / Edge highest
- **Toggle layout** Grid/List
- **Sub-filtri Related** scrollabili: tag specifici dinamici basati sulla nav attiva

#### Tutti i mercati (grid)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ EventCard 1    │  │ EventCard 2    │  │ EventCard 3    │         │
│  │ [foto+title]   │  │ [foto+title]   │  │ [foto+title]   │         │
│  │ [donut prob]   │  │ [lista candid] │  │ [donut prob]   │         │
│  │ [Yes/No btn]   │  │                │  │ [Yes/No btn]   │         │
│  │ $XM Vol [+ Slip]│ │ $XM Vol [+Slip]│  │ $XM Vol [+Slip]│         │
│  └────────────────┘  └────────────────┘  └────────────────┘         │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ Card 4         │  │ Card 5         │  │ Card 6         │         │
│  │ ...            │  │ ...            │  │ ...            │         │
│  └────────────────┘  └────────────────┘  └────────────────┘         │
│                                                                       │
│            [Carica altri / Infinite scroll]                          │
└──────────────────────────────────────────────────────────────────────┘
```

- Grid **3 colonne** desktop (varia da 4 colonne su schermi grandi a 2 su tablet)
- **Donut probability** prominente in ogni card (non piccolo come Polymarket reale)
- **Bottone "+ Slip"** in ogni card per aggiungere al Bet Slip
- Card binary mostrano i 2 bottoni Yes/No grossi
- Card multi-outcome mostrano top 3 candidati con barra
- Card crypto round mostrano il termometro + live betting feed
- Card hover: bordo blu evidenziato (feedback visivo)
- **Bet Slip drawer fluttuante** appare a destra quando ha contenuti

---

### Layout Mobile (<768px)

#### Header mobile (compatto)

```
┌─────────────────────────────────────┐
│ [☰] Logo  [REAL]  [🔔]  [👤]        │
└─────────────────────────────────────┘
```

- Hamburger menu sx (apre drawer "Altro" con tutto il resto)
- Logo centrale
- Switch REAL/DEMO compatto (badge colorato)
- Notifiche (campanella)
- Profile (avatar) o "Accedi" se non loggato

#### Nav tabs mobile

```
┌─────────────────────────────────────┐
│ ●LIVE  All  For You  Politics ... → │
└─────────────────────────────────────┘
```

Scrollabile orizzontalmente con touch swipe.

#### Hero zone mobile

Mobile NON ha la divisione 60%/40% del desktop. Le hero diventano un **carousel singolo**:

```
┌─────────────────────────────────────┐
│  ◀  HERO CARD attiva (full width)   ▶│
│     [mood color tematico]            │
│     Titolo grande                    │
│     Sottotitolo                      │
│     [illustrazione]                  │
│     [CTA >]                          │
│                                       │
│     ●○○○○ pagination                  │
└─────────────────────────────────────┘
```

5-6 hero swipeabili. Stesso color blocking tematico del desktop.

#### Sidebar adattiva inline (mobile)

Mobile NON ha sidebar fissa (no spazio). Le sezioni della sidebar diventano **rail/sezioni inline** dopo il rail "Top Movers":

```
┌─────────────────────────────────────┐
│ 🎯 Signals Live (1-2 in evidenza)   │
│ [card segnale 1] [card segnale 2] →│
├─────────────────────────────────────┤
│ 🔥 Hot Now                          │
│ [tag cloud orizzontale scrollabile] │
├─────────────────────────────────────┤
│ ⚡ Recent Activity                  │
│ [feed live ultimi 5 trade]          │
└─────────────────────────────────────┘
```

Mostriamo solo **2-3 sezioni più prioritarie** per stato utente (non tutte le 5).

#### Filtri mobile

```
┌─────────────────────────────────────┐
│ [🔍 Search...]      [⚙] [🔖]      │
├─────────────────────────────────────┤
│ All · Trump · Iran · GPT · NFL  → │
└─────────────────────────────────────┘
```

Filtri avanzati aprono **bottom sheet** invece di drawer laterale.

#### Tutti i mercati mobile (1 colonna, peek successiva)

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ EventCard 1 (full width)        │ │
│ │ [foto+title compatti]           │ │
│ │ [donut o lista]                 │ │
│ │ [Yes/No btn]                    │ │
│ │ $XM Vol · Closes ... [+ Slip]  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ EventCard 2                     │ ← peek visibile
│ └─────────────────────────────────┘ │
│ ...                                  │
└─────────────────────────────────────┘
```

Card compatte per **peek della successiva** (engagement scroll).

#### Bottom navigation mobile (sticky)

```
┌─────────────────────────────────────┐
│ [🏠]  [🔍]  [⚡]  [🛒3]  [⋯]        │
│ Home  Cerca Sgnl Slip   Altro       │
└─────────────────────────────────────┘
```

- 5 voci sempre visibili
- **Bet Slip** badge numero se ha contenuti
- **Altro** apre drawer con: Profile, Watchlist, Following, Sessions, Achievements, Settings, Classifica, Creator program, About, Pricing, Help, Legal, accedi/registrati

---

## COMPONENTE: EventCard (5 varianti)

### Struttura comune

```
┌──────────────────────────────────────────────┐
│ HEADER                                        │
│ [📷]  Titolo evento              [badge][🔖] │
│       Categoria · Tag                         │
├──────────────────────────────────────────────┤
│ CONTENUTO SPECIFICO PER CARDKIND             │
├──────────────────────────────────────────────┤
│ FOOTER                                        │
│ $XXM Vol · [scadenza]    [+ Slip]           │
└──────────────────────────────────────────────┘
```

**Elementi sempre presenti**:

- Foto evento (avatar 32-48px)
- Titolo (1-2 righe max)
- Categoria + tag
- Bookmark toggle
- Volume in $
- Bottone "+" per Bet Slip
- Click intera card → `/event/[slug]`

**Elementi condizionali**:

- Badge "● LIVE" / "● HOT" / "● NEW"
- Badge "Signal Active" (se motore Predimark ha segnale forte)
- Foto stacked (es. 2 bandiere per Iran+USA)

### Variante 1 — Binary

```
┌──────────────────────────────────────────────┐
│ [📷 Trump]  Will Trump win in 2028?    [🔖] │
│             Politics · Elections              │
├──────────────────────────────────────────────┤
│              [DONUT GRANDE] 62% Yes          │
│                                                │
│        ┌──────────┐    ┌──────────┐           │
│        │   Yes    │    │   No     │           │
│        │   62%    │    │   38%    │           │
│        └──────────┘    └──────────┘           │
├──────────────────────────────────────────────┤
│ $24.5M Vol · Closes Nov 5, 2028  [+ Slip]   │
└──────────────────────────────────────────────┘
```

### Variante 2a — Multi-outcome (nominali)

```
┌──────────────────────────────────────────────┐
│ [📷]  Champions League Winner          [🔖] │
│       Sport · Soccer                          │
├──────────────────────────────────────────────┤
│  Real Madrid     ▓▓▓▓▓░░░░  28%   →         │
│  Manchester City ▓▓▓▓░░░░░  22%   →         │
│  Inter           ▓▓▓░░░░░░  15%   →         │
│  + 8 altri →                                  │
├──────────────────────────────────────────────┤
│ $89M Vol · Closes June 1, 2026   [+ Slip]   │
└──────────────────────────────────────────────┘
```

### Variante 2b — Multi-outcome (date come outcome)

```
┌──────────────────────────────────────────────┐
│ [🇺🇸🇮🇷] Pace USA-Iran entro...?        [🔖] │
│         Geopolitics · Diplomacy                │
├──────────────────────────────────────────────┤
│  30 giugno  ▓▓▓▓▓░░░░░  46%  [Sì] [No]       │
│  31 maggio  ▓▓▓░░░░░░░  30%  [Sì] [No]       │
│  31 luglio  ▓░░░░░░░░░  10%  [Sì] [No]       │
│  + 2 altri →                                  │
├──────────────────────────────────────────────┤
│ $53M Vol · 5 markets             [+ Slip]    │
└──────────────────────────────────────────────┘
```

**Niente data nel footer** (Pattern 2 di refresh).

### Variante 3 — Multi-strike

```
┌──────────────────────────────────────────────┐
│ [₿]  BTC max price in May 2026         [🔖] │
│      Crypto · Price target                    │
├──────────────────────────────────────────────┤
│  ≥ $130k    ░░░░░░░░░░  3%                   │
│  ≥ $120k    ▓░░░░░░░░░  8%                   │
│  ≥ $110k    ▓▓▓▓░░░░░░ 32%   ← currently    │
│  ≥ $100k    ▓▓▓▓▓▓▓▓░░ 78%                  │
│  + 2 altri →                                  │
├──────────────────────────────────────────────┤
│ $4.2M Vol · 6 markets            [+ Slip]    │
└──────────────────────────────────────────────┘
```

### Variante 4 — H2H Sport

```
┌──────────────────────────────────────────────┐
│ [🏀]  Lakers vs OKC                  ●LIVE  │
│       NBA · Western Conference                │
├──────────────────────────────────────────────┤
│   Q3   12:42                                  │
│                                                │
│   Lakers   92    │    87   OKC                │
│   62%             │           38%              │
│                                                │
│   ┌──────────┐    ┌──────────┐                │
│   │ Lakers   │    │   OKC    │                │
│   └──────────┘    └──────────┘                │
├──────────────────────────────────────────────┤
│ $15M Vol · Game ends ~9pm ET  [+ Slip]       │
└──────────────────────────────────────────────┘
```

3 bottoni se c'è il pareggio (soccer): Team1 / DRAW / Team2.

### Variante 5 — Crypto Up/Down

```
┌──────────────────────────────────────────────┐
│ [₿]  BTC su o giù 5m                 ●LIVE  │
│      Crypto · Bitcoin                         │
├──────────────────────────────────────────────┤
│  Battere: $108.234,56                        │
│  Live:    $108.290,12  ↗ +$55,56            │
│                                                │
│                     [TERMOMETRO] 51% Up      │
│                                                │
│   ┌──────────┐    ┌──────────┐                │
│   │   Up     │    │   Down   │                │
│   │  +$2 ↗   │    │  +$10 ↘  │ ← live feed   │
│   └──────────┘    └──────────┘   (cifra che  │
│                                   cambia in   │
│                                   continuazione│
│                                   via WS)     │
│                                                │
│   ⏱  Round termina in 03:42                 │
├──────────────────────────────────────────────┤
│ $850k Vol · Round 4521         [+ Slip]      │
└──────────────────────────────────────────────┘
```

**Live betting feed**: SOLO sui crypto round. Una singola cifra che cambia rapidamente in base ai trade reali via WebSocket. Animation fade-in 200ms / fade-out 300ms.

---

## COMPONENTE: Bet Slip Drawer

```
┌──────────────────────────────────────────┐
│ Bet Slip — 3 markets selezionati  [×]    │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ Trump win 2028? · Yes                │ │
│ │ Importo: [$50]   Payout: $80.65      │ │
│ │ [×] rimuovi                          │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ BTC su o giù 5m · Up                 │ │
│ │ Importo: [$10]   Payout: $19.60      │ │
│ │ [×] rimuovi                          │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ Lakers vs OKC · Lakers               │ │
│ │ Importo: [$25]   Payout: $40.30      │ │
│ │ [×] rimuovi                          │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ Stake totale: $85                          │
│ Payout totale (max): $140.55               │
│ Profit potenziale: $55.55                  │
│ Builder fee Predimark: $0.43               │
├──────────────────────────────────────────┤
│  [ Piazza tutte le predizioni ]            │
└──────────────────────────────────────────┘
```

**Comportamento**:

- Click "+" su qualunque card → aggiunge al drawer
- Persistenza tra navigazioni (Zustand persist)
- **Click finale**: batch sign Privy (1 firma per N ordini)
- Toast success/error per ogni ordine
- Drawer si svuota e chiude dopo successo totale

---

## STATI DELLA HOME

### Default (loggato, dati live)

Layout completo con dati real-time via WebSocket.

### Loading (primo caricamento)

- Skeleton placeholder per ogni rail
- Skeleton per hero
- Caricamento progressivo

### Empty (filtri restrittivi)

"Nessun mercato corrisponde ai tuoi filtri." [Reset]

### Error (problema rete/API)

Banner non bloccante "Connessione interrotta, riprovo automaticamente..." + dati cached.

### Geo-blocked

- Banner persistente "Trading not available in your region. Demo and signals fully accessible."
- Bottoni Trade tooltip "Available in Demo only"
- CTA "Try Demo Mode"

### Non loggato (visitatore)

- Header diverso (Accedi/Registrati invece di Profile)
- Sidebar con Demo Mode in cima
- Banner blu "Come funziona — crea account in 30 secondi"
- Click bottoni Trade → dialog "Crea account o Demo"
- Bet Slip disabilitato

### Modalità Demo

- Banner persistente "Modalità Demo — i tuoi soldi non sono in gioco"
- Switch DEMO prominente
- Tutto funzionante con paper money

---

## COMPORTAMENTI INTERATTIVI

### Real-time updates (via WebSocket)

- Termometri probabilità → CLOB `price_change`
- Live betting feed crypto round → RTDS `activity`
- Score live sport → Sport WS
- Volume cards → polling 15s
- Auto-refresh card → triggered da risoluzione mercato
- Sidebar Activity feed → RTDS `activity` filtrato per creator seguiti

### Performance

- Card virtualizzate (solo visibili in DOM)
- Lazy loading immagini
- Throttle WS updates (max 1 update/200ms per card)
- Animation con transform + opacity (GPU-accelerated)

### Persistenza

- Filtri attivi in URL (sharable)
- Bet Slip in localStorage (Zustand persist)
- Tema dark/light in localStorage
- Switch REAL/DEMO in localStorage
- Toggle Animations in localStorage

---

## ACCESSIBILITÀ

- Bottoni e link con `aria-label` chiari
- Contrasto WCAG AA (4.5:1) garantito in entrambi i temi
- Navigazione completa da tastiera
- Screen reader friendly: announcement aggiornamenti live
- Touch target minimo 44x44px su mobile
- Toggle "Animations" per disabilitare animazioni (accessibility + performance)
- Font scaling rispettato (no fixed px solo su body)

---

## NOTE TECNICHE PER COWORK

Quando costruirai la Home, ricorda:

- **EventCard polimorfo** (5 varianti) — `<EventCard kind="binary" data={...} />` con switch interno
- **Card via WebSocket**, NON polling
- **Pattern 1 e Pattern 2 di refresh** sono diversi — applicali correttamente
- **Live betting feed solo su crypto round** — non implementare su altri tipi
- **Bet Slip drawer** usa Zustand store separato (riferimento V1 esistente)
- **Foto eventi**: `next/image` con priority above-the-fold
- **Filtri**: stato in URL via query params
- **Sub-filtri Related dinamici**: Gamma API endpoint `/tags?related-to-tag=X`
- **Sidebar adattiva**: condizionale su stato utente, non statica
- **Color blocking hero**: prop `theme="sport|politics|crypto|culture|news|geopolitics|economy|tech"` sulla HeroCard
- **Toggle Animations**: prop globale via Zustand, applicata via CSS class su `<body>`

---

## RIFERIMENTI

- **Documento 1** — Vision & Product
- **Documento 2** — User Stories (US-001..US-011)
- **Documento 3** — Sitemap
- **Documento 5** — Tech stack & Architettura
- **Documento 8** — Design System (formalizzazione design tokens)

---

## PAGINE SUCCESSIVE

Documenti che verranno costruiti nelle prossime sessioni:

- **Pagina 2** — Pagina evento `/event/[slug]` (5 layout dedicati)
- **Pagina 3** — Pagina mercato deep view `/market/[id]`
- **Pagina 4** — Profilo `/me` (dashboard + posizioni + history)
- **Pagina 5** — Trade widget (modal e inline)
- **Pagina 6** — Profilo creator `/creator/[username]`
- **Pagina 7** — Admin overview `/admin`
- **Pagina 8** — Signup + onboarding flow

---

_Fine Documento 4 — Wireframes — Pagina 1 (Home) versione 2_
_Continua con Pagina 2 nella sessione successiva_
