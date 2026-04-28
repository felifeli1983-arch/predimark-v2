# Predimark V2 — Wireframes — Pagina 6 (Admin overview)

> **Documento 4 di 10** — UX Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Pagina 6 (Admin overview) completa
> Predecessori: Pagine 1-5 completate
> Note: pannello interno, non destinato agli utenti finali

---

## Cos'è questo documento

Questo documento descrive il **Pannello Admin** (`/admin/*`) di Predimark V2 — il pannello operativo interno usato da founder, team e moderatori per gestire il prodotto.

L'admin è la **macchina dietro le quinte** di Predimark. Senza questa, il prodotto non si può gestire.

**A chi è destinato**: solo utenti con ruolo `admin`, `super_admin`, o `moderator` nel JWT. Tutti gli altri vedono 404 su `/admin/*`.

**Approccio del documento**: dato che ci sono 35+ sub-pages, NON descriverò ogni singola pagina in dettaglio. Userò invece:

- **Layout master** comune a tutte le sub-pages
- **Pattern UI ricorrenti** (tabelle, form, modali)
- **8 gruppi tematici** con esempio di sub-page rappresentativa
- **Note tecniche** complete per Cowork

---

## DECISIONI ARCHITETTURALI

### Ruoli admin (3 livelli)

| Ruolo           | Permessi                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Super-admin** | Tutto. Inclusi: cambio ruoli altri admin, feature flags critici, kill switches globali, accesso completo a finance/payouts     |
| **Admin**       | Gestione operativa: users (ban/unban/refund), markets, creators (approve/reject), fees runtime, notifiche broadcast, analytics |
| **Moderator**   | Solo support: users (ban/unban/respond ticket), comments moderation, KYC review, reports                                       |

**Default**: tu (Feliciano) = super-admin. Aggiungi altri admin via `/admin/team`.

### Layout

**Sidebar fissa sinistra** + main content (Stripe-style). Stessa palette colori dark+light di Predimark, ma con **chrome admin distintivo** (background leggermente diverso, header bar scuro/bordeaux per ricordarti che sei in zona admin).

### Audit log

**Dettagliato**: chi / cosa / quando + before value / after value + reason note opzionale. Disponibile in `/admin/audit-log` ricercabile per attore, action type, periodo.

### Feature flags + A/B testing

Entrambi presenti in V1. Sezioni separate:

- `/admin/feature-flags`: kill switch e gradual rollout di feature
- `/admin/ab-tests`: configura test A/B su componenti UI

---

## STRUTTURA COMPLETA `/admin/*`

```
/admin                              Dashboard admin (KPI overview)
│
├── USERS (5 sub-pages)
│   ├── /admin/users                Lista utenti con search/filter
│   ├── /admin/users/[id]           Profilo utente dettagliato
│   ├── /admin/users/banned         Lista utenti banned
│   ├── /admin/users/kyc            KYC review queue
│   └── /admin/users/refunds        Refund requests queue
│
├── MARKETS (4 sub-pages)
│   ├── /admin/markets              Lista mercati attivi
│   ├── /admin/markets/featured     Curate featured (Hot Now / Hero / Top Picks)
│   ├── /admin/markets/hidden       Mercati nascosti dalla home
│   └── /admin/markets/import       Import manuale da Polymarket
│
├── FEES (3 sub-pages)
│   ├── /admin/fees                 Configurazione builder fee runtime
│   ├── /admin/fees/history         Storico cambi fee
│   └── /admin/fees/revenue         Revenue dashboard (real-time)
│
├── CREATOR PROGRAM (5 sub-pages)
│   ├── /admin/creators             Lista Verified Creators
│   ├── /admin/creators/applications Queue applications da review
│   ├── /admin/creators/[id]        Dettaglio creator + edit
│   ├── /admin/creators/payouts     Payout earnings creator
│   └── /admin/creators/suspended   Creator sospesi
│
├── REFERRAL PROGRAM (2 sub-pages)
│   ├── /admin/referrals            Lista referrals attivi
│   └── /admin/referrals/payouts    Payout queue referrer
│
├── SIGNALS / ALGOS (3 sub-pages)
│   ├── /admin/signals              Gestione segnali Predimark pubblicati
│   ├── /admin/signals/performance  Tracking performance (calibration, hit rate)
│   └── /admin/signals/algos        Configurazione algoritmi backtest
│
├── NOTIFICATIONS (3 sub-pages)
│   ├── /admin/notifications/broadcast  Invio annunci a tutti
│   ├── /admin/notifications/templates  Template messaggi notifiche
│   └── /admin/notifications/history    Storico invii
│
├── ANALYTICS (4 sub-pages)
│   ├── /admin/analytics            KPI dashboard principale
│   ├── /admin/analytics/users      Funnel utenti (signup → first trade → retention)
│   ├── /admin/analytics/markets    Top markets per volume/engagement
│   └── /admin/analytics/revenue    Revenue breakdown e proiezioni
│
├── COMPLIANCE (2 sub-pages)
│   ├── /admin/compliance/geo-block Lista paesi bloccati
│   └── /admin/compliance/aml       AML / fraud alerts queue
│
├── AUDIT & LOGS (3 sub-pages)
│   ├── /admin/audit-log            Audit log azioni admin
│   ├── /admin/system-logs          System logs / errori app
│   └── /admin/api-usage            API usage e rate limiting
│
└── SETTINGS (8 sub-pages)
    ├── /admin/settings             Settings overview
    ├── /admin/settings/feature-flags Feature flags runtime
    ├── /admin/settings/ab-tests    A/B tests configuration
    ├── /admin/settings/leaderboard-mode Toggle 1-tab vs 2-tab leaderboard
    ├── /admin/settings/integrations Polymarket API, MoonPay, Telegram bot
    ├── /admin/settings/team        Gestione admin team (super-admin only)
    ├── /admin/settings/payouts     Configurazione metodi payout creator
    └── /admin/settings/branding    Logo, colori, tagline (in caso di rebranding)
```

**Totale**: 36 sub-pages.

---

## LAYOUT MASTER (uguale per tutte le sub-pages)

### Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ TOP BAR ADMIN (background distintivo, es. dark bordeaux)             │
│ [Predimark Admin]  Super-admin: Feliciano · [Switch to user view]    │
│                                              · [Logout]              │
├──────────────────┬───────────────────────────────────────────────────┤
│                  │                                                    │
│  SIDEBAR FISSA   │  MAIN CONTENT                                      │
│  (240px)         │                                                    │
│                  │  Header sub-page                                   │
│  📊 Dashboard    │  ┌───────────────────────────────────────────────┐ │
│                  │  │ Sub-page title         [Action button]        │ │
│  USERS          │  │ Breadcrumb: Admin > Users                     │ │
│  ▸ All users    │  └───────────────────────────────────────────────┘ │
│  ▸ Banned       │                                                    │
│  ▸ KYC review   │  Content area                                      │
│  ▸ Refunds      │  (varia per sub-page)                             │
│                  │                                                    │
│  MARKETS        │                                                    │
│  ▸ All markets  │                                                    │
│  ▸ Featured     │                                                    │
│  ▸ Hidden       │                                                    │
│  ▸ Import       │                                                    │
│                  │                                                    │
│  FEES           │                                                    │
│  CREATORS       │                                                    │
│  REFERRALS      │                                                    │
│  SIGNALS        │                                                    │
│  NOTIFICATIONS  │                                                    │
│  ANALYTICS      │                                                    │
│  COMPLIANCE     │                                                    │
│  AUDIT & LOGS   │                                                    │
│  SETTINGS       │                                                    │
│                  │                                                    │
└──────────────────┴───────────────────────────────────────────────────┘
```

### Mobile

L'admin **non è ottimizzato per mobile** in V1 (decisione pragmatica — l'admin lavora da desktop). Su mobile mostriamo:

- Sidebar collapsible (hamburger menu)
- Layout single-column
- Tabelle scrollabili orizzontalmente
- Form di edit ridotti
- Banner "Per la migliore esperienza, usa l'admin da desktop"

### Sidebar gerarchica

```
SIDEBAR
├── 📊 Dashboard            (sempre in cima)
│
├── USERS [▼]               (sezione collapsible)
│   ▸ All users
│   ▸ Banned
│   ▸ KYC review (3)        (badge con count pending)
│   ▸ Refunds (1)
│
├── MARKETS [▼]
│   ▸ All markets
│   ▸ Featured
│   ▸ Hidden
│   ▸ Import
│
├── FEES [▼]
│   ▸ Configuration
│   ▸ History
│   ▸ Revenue
│
├── CREATORS [▼]
│   ▸ All creators
│   ▸ Applications (5)
│   ▸ Payouts (2)
│   ▸ Suspended
│
├── ...
│
└── SETTINGS [▼]
    ▸ Feature flags
    ▸ A/B tests
    ▸ Team
    ▸ ...
```

**Caratteristiche**:

- Sezioni collapsible (click su nome categoria → espande/chiude)
- Stato attivo della sub-page evidenziato (background colorato + bordo sinistro)
- Badge con count su sezioni con queue (es. "KYC review (3)")
- Sidebar scrollabile se contenuto eccede viewport
- Sidebar collassabile a "icon only" per più spazio (toggle in fondo)

### Top bar admin

```
┌───────────────────────────────────────────────────────────────────────┐
│ [Predimark Admin Logo]                                                 │
│                                                                        │
│ Super-admin: Feliciano                                                 │
│ Last login: 25 apr 2026, 14:30                                         │
│ [Search global ⌕]    [Switch to user view]    [Notifications 🔔 3]   │
│                                              [Profile ▼] [Logout]    │
└───────────────────────────────────────────────────────────────────────┘
```

**Elementi**:

- **Logo "Predimark Admin"**: distintivo dal logo utente
- **Ruolo + nome**: chiaro chi sei
- **Last login**: per security awareness
- **Search global**: cerca tutto (utenti, mercati, creators, log) cross-section
- **Switch to user view**: redirect a Home come se fossi utente normale (per testare)
- **Notifications**: alert admin (es. "5 KYC pending", "Fee revenue unusually high")
- **Profile dropdown**: link a settings personali admin, logout

---

## PATTERN UI RICORRENTI

L'admin ha 5 pattern UI ricorrenti che si ripetono in tutte le sub-pages.

### Pattern 1 — Tabella search + filter + bulk action

Usato in: lista utenti, lista mercati, lista creator, lista referrals, audit log.

```
┌──────────────────────────────────────────────────────────────┐
│ Header                                                        │
│ [🔍 Search]  [Filter ▼]  [Sort ▼]                            │
├──────────────────────────────────────────────────────────────┤
│ Bulk actions: [Select all]  [Export CSV] [Bulk action ▼]     │
├──────────────────────────────────────────────────────────────┤
│ ☐ ID  | Avatar | Name        | Volume   | Status | Actions   │
│ ☐ 1   | [foto] | @theo4      | $48k     | Active | [⋯]      │
│ ☐ 2   | [icon] | 0x9d84..    | $234k    | Active | [⋯]      │
│ ☐ 3   | [foto] | @domah      | $32k     | Banned | [⋯]      │
│ ...                                                          │
├──────────────────────────────────────────────────────────────┤
│ [< Prev] Page 1 of 24 [Next >]    Total: 1,247 records       │
└──────────────────────────────────────────────────────────────┘
```

**Caratteristiche**:

- Search bar con autocomplete
- Filter dropdown multi-select (es. status: active/banned/pending)
- Sort by colonna
- Bulk select con checkbox + actions (export, delete, change status)
- Pagination con "X of Y" e "Total records"
- Click su [⋯] su una riga → context menu (Edit / View details / Delete / etc.)
- Click sulla riga → naviga a sub-page detail

### Pattern 2 — Detail page (drill-down)

Usato in: profilo utente admin, profilo creator admin, dettaglio mercato, dettaglio refund.

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to list                                               │
├──────────────────────────────────────────────────────────────┤
│ HERO                                                          │
│ [Avatar 80x80]  @theo4 (User ID: 12345)                      │
│                  ✓ Verified Creator · Active                  │
│                  Joined: 12 mar 2026                          │
│                                                               │
│ [Edit profile]  [Suspend]  [Ban]  [Send notification]        │
├──────────────────────────────────────────────────────────────┤
│ TABS                                                          │
│ [Overview] · Trades · KYC · Notifications · Audit             │
├──────────────────────────────────────────────────────────────┤
│ TAB CONTENT                                                   │
│ (varia per sub-page)                                          │
└──────────────────────────────────────────────────────────────┘
```

**Caratteristiche**:

- Hero con info principali + actions buttons
- Tabs per organizzare sub-info
- Bottoni azione spesso destruttivi (Suspend, Ban) con conferma + reason note
- Audit log embedded (ultimi 10 cambi su questo utente)

### Pattern 3 — Form configurazione

Usato in: settings, fees, feature flags, signal config.

```
┌──────────────────────────────────────────────────────────────┐
│ Configuration Title                                           │
├──────────────────────────────────────────────────────────────┤
│ Section A                                                     │
│                                                               │
│ Field 1                                                       │
│ [Input field]                                                 │
│ Helper text describing what this does.                        │
│                                                               │
│ Field 2                                                       │
│ [Toggle ON/OFF]                                               │
│ Helper text.                                                  │
│                                                               │
│ Field 3                                                       │
│ [Dropdown ▼]                                                  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ Section B                                                     │
│ ...                                                           │
├──────────────────────────────────────────────────────────────┤
│ Audit info                                                    │
│ Last modified: 25 apr 2026 by Feliciano (super-admin)         │
├──────────────────────────────────────────────────────────────┤
│ Reason for change (opzionale)                                 │
│ [Textarea]                                                    │
│                                                               │
│ [Cancel]   [Save changes]                                    │
└──────────────────────────────────────────────────────────────┘
```

**Caratteristiche**:

- Sezioni logiche con titolo
- Helper text per ogni campo (cosa fa, perché)
- Audit info di chi ha modificato l'ultima volta
- Textarea opzionale per "reason note" (loggata in audit)
- Conferma prima del save per cambi critici (es. "Are you sure you want to change builder fee from 0.5% to 1.5%? This applies immediately to all trades.")

### Pattern 4 — Queue review (approve/reject)

Usato in: KYC review, refund requests, creator applications, fraud alerts.

```
┌──────────────────────────────────────────────────────────────┐
│ Queue: KYC Review (3 pending)                                │
├──────────────────────────────────────────────────────────────┤
│ Card 1                                                        │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Avatar] @user123                                         │ │
│ │ Submitted: 24 apr 2026, 18:43                             │ │
│ │                                                           │ │
│ │ KYC documents:                                            │ │
│ │ - ID front [view]                                         │ │
│ │ - ID back [view]                                          │ │
│ │ - Selfie [view]                                           │ │
│ │ - Address proof [view]                                    │ │
│ │                                                           │ │
│ │ AI fraud check: ✓ Passed (92% confidence)                 │ │
│ │ Geo: Italy (allowed)                                      │ │
│ │                                                           │ │
│ │ Reason note: [textarea]                                   │ │
│ │                                                           │ │
│ │ [Reject]  [Request more info]  [Approve]                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ Card 2                                                        │
│ ...                                                           │
└──────────────────────────────────────────────────────────────┘
```

**Caratteristiche**:

- Card per ogni item in queue
- Info contestuali (documenti, AI check, metadata)
- 3 bottoni azione: Reject (con reason obbligatoria), Request more info (con messaggio), Approve
- Reason note **obbligatoria** per Reject (audit log)
- Notification automatica all'utente dopo decisione

### Pattern 5 — Real-time dashboard / stats

Usato in: admin dashboard, analytics, fee revenue, signal performance.

```
┌──────────────────────────────────────────────────────────────┐
│ Title          [Period: Today ▼] [Refresh ↻] [Export ↓]      │
├──────────────────────────────────────────────────────────────┤
│ KPI CARDS (grid 4)                                            │
│ ┌──────────┬──────────┬──────────┬──────────┐                │
│ │ DAU      │ Volume   │ Revenue  │ Active   │                │
│ │ 1,247    │ $2.4M    │ $12.4k   │ 487      │                │
│ │ +12% ▲   │ +8% ▲    │ +18% ▲   │ +5% ▲    │                │
│ └──────────┴──────────┴──────────┴──────────┘                │
├──────────────────────────────────────────────────────────────┤
│ CHARTS                                                        │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Volume over time (line chart)                            │  │
│ └─────────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Revenue by source (pie chart)                            │  │
│ └─────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│ DATA TABLE (top movers, top users, etc.)                     │
└──────────────────────────────────────────────────────────────┘
```

---

## GRUPPO 1 — DASHBOARD ADMIN (`/admin`)

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ Dashboard                                            [Period: 24h ▼] │
├──────────────────────────────────────────────────────────────────────┤
│ KPI CARDS (grid 4 desktop, 2 mobile)                                  │
│ ┌──────────┬──────────┬──────────┬──────────┐                        │
│ │ DAU      │ Volume   │ Revenue  │ Active   │                        │
│ │ 1,247    │ $2.4M    │ $12.4k   │ 487      │                        │
│ │ +12% ▲   │ +8% ▲    │ +18% ▲   │ +5% ▲    │                        │
│ ├──────────┼──────────┼──────────┼──────────┤                        │
│ │ Signups  │ Trades   │ KYC pend │ Refunds  │                        │
│ │ 47       │ 8,234    │ 3        │ 1        │                        │
│ │ +20% ▲   │ +15% ▲   │ ⚠ 2 old  │ ⚠ urgent │                        │
│ └──────────┴──────────┴──────────┴──────────┘                        │
├──────────────────────────────────────────────────────────────────────┤
│ ALERTS BAR                                                            │
│ ⚠ Builder fee revenue unusual: +35% spike rispetto a media 7g       │
│ ⚠ 3 KYC pending da >48h (review priority)                            │
│ ⚠ MoonPay integration: latency >3s (normal <1s)                      │
├──────────────────────────────────────────────────────────────────────┤
│ CHARTS GRID                                                           │
│ ┌─────────────────────────────┬─────────────────────────────────┐   │
│ │ Volume over time (line)     │ Revenue breakdown (pie)         │   │
│ │ - Today vs yesterday        │ - Builder fees: 78%             │   │
│ │ - Color: tema Predimark     │ - Service fees external: 14%    │   │
│ │                             │ - Telegram premium: 8%          │   │
│ └─────────────────────────────┴─────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│ RECENT ACTIVITY                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Recent admin actions (last 10):                                 │ │
│ │ - 14:25 Feliciano changed builder fee 0.5% → 0.7%              │ │
│ │ - 14:12 Moderator banned user @spam_xyz (reason: bot activity) │ │
│ │ - 13:48 Feliciano approved Verified Creator @newcrater          │ │
│ │ - ...                                                           │ │
│ │ [Vedi audit log completo →]                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Caratteristiche

- **KPI cards**: 8 metriche principali (DAU, Volume, Revenue, Active users, Signups, Trades, KYC pending, Refunds)
- **Period selector**: 24h / 7d / 30d / All-time
- **Alerts bar**: notifiche automatiche di anomalie (revenue spike, latency, queue stuck)
- **Charts**: 2 grafici principali (Volume over time, Revenue breakdown)
- **Recent activity**: ultimi 10 eventi admin importanti

---

## GRUPPO 2 — USERS (5 sub-pages)

### `/admin/users` (lista utenti)

Pattern 1 (tabella search + filter + bulk action):

```
Filtri: [Active] [Banned] [Suspended] [KYC pending] [Verified Creator] [External wallet only]
Search: nome, email, address, ID
Sort: signup date / volume / last activity / status

Colonne: ID | Avatar | Name | Email | Volume | Status | Last activity | Actions

Bulk: Export CSV / Send notification / Bulk ban (super-admin only)
```

### `/admin/users/[id]` (profilo utente admin)

Pattern 2 (detail page) con tabs:

- **Overview**: info utente (KYC status, balance USDC, P&L cumulato, geo, signup date)
- **Trades**: tutti i trade dell'utente con filter
- **KYC**: documenti KYC + status + history review
- **Notifications**: storico notifiche inviate
- **Audit**: audit log specifico per questo utente (modifiche admin)

Bottoni azione:

- **Edit profile** (super-admin only)
- **Suspend** (con reason e durata)
- **Ban permanently** (con reason note obbligatoria)
- **Send notification** (apre modal con template)
- **Refund** (apre form refund manuale)
- **Reset password** (invia email reset)

### `/admin/users/banned`

Lista utenti banned con: reason, banned by (admin name), banned at, ban duration. Bottone "Unban" (richiede reason).

### `/admin/users/kyc` (KYC review queue)

Pattern 4 (queue review):

- Card per ogni KYC pending
- Documenti visualizzabili
- AI fraud check result
- Reason note obbligatoria per reject
- Notification automatica utente

### `/admin/users/refunds` (refund requests)

Pattern 4: queue di richieste refund con:

- Importo richiesto
- Reason utente
- Trade originale di riferimento
- Bottoni: Approve / Reject / Request more info

---

## GRUPPO 3 — MARKETS (4 sub-pages)

### `/admin/markets` (lista mercati attivi)

Pattern 1 con colonne: ID, title, category, volume, status (active/closed/featured/hidden), liquidity, end date.

Actions per row: View on Polymarket / Hide / Feature / Override resolution / Add reward.

### `/admin/markets/featured` (curate)

Drag-and-drop interface per ordinare mercati nelle sezioni Home:

- **Hero carousel** (top 3-5 mercati)
- **Hot Now** tag (top 5-10)
- **Top Picks** sezione
- **Per categoria** featured

L'admin trascina i mercati per riordinare, click "Save" applica live a tutti gli utenti.

### `/admin/markets/hidden`

Mercati nascosti dalla home (per content moderation o errori). Bottone "Restore".

### `/admin/markets/import`

Form per importare manualmente un mercato Polymarket via slug o event ID:

```
URL or ID: [https://polymarket.com/event/will-trump...]
[Fetch data]

Preview:
[Mercato dettagli, outcome, volume, ecc.]

Action:
☐ Featured in hero
☐ Add to Hot Now
☐ Override category: [Politics ▼]
☐ Add Predimark commentary

[Cancel] [Import]
```

---

## GRUPPO 4 — FEES (3 sub-pages)

### `/admin/fees` (configurazione runtime)

Pattern 3 (form configurazione):

```
Builder Fee Configuration

Current builder fee:
[0.5%]  (range 0% - 1%)
Helper: Fee applicata su tutti i trade. Cambia LIVE per tutti gli utenti.

Service fee on profits (External Trader copy trading):
[1.0%]  (range 0% - 5%)
Helper: Fee aggiuntiva su profitti realizzati da copy di trader esterni.

Creator revenue share (DEFAULT globale):
[30%]  (range 0% - 50%)
Helper: % della builder fee che va al Verified Creator copiato. Default applicato se Creator non ha override personalizzato.

Per-Creator override (super-admin only):
[Manage individual Creator overrides →]  (apre `/admin/creators/[id]` con campo `fee_share_override_bps`)
Helper: alcuni Creator strategici possono ricevere % diverso (es. partnership, top performer bonus). NULL = usa default globale.

External Traders revenue share:
[0%]  (read-only, fixed)
Helper: External Traders (no opt-in Auktora) NON ricevono fee — il 100% va ad Auktora. Per modificare lo split su External Traders, contattare team product (cambio strategico, non runtime).

Referral revenue share:
[20%]  (range 0% - 30%)
Helper: % della builder fee che va al referrer per 6 mesi.

Telegram premium price:
[$5/month]  (USD)
Helper: Prezzo subscription Telegram premium (real-time signals).

────────────
Last modified: 25 apr 2026, 14:25 by Feliciano (super-admin)
Previous value: 0.4% → 0.5%

Reason for change (richiesto):
[Textarea]

[Cancel]  [Save changes — applies immediately]
```

**Conferma prima del save**:

```
⚠ Confirm fee change

Builder fee: 0.5% → 0.7%
This change applies IMMEDIATELY to all trades platform-wide.

Estimated impact: +$2.1k revenue/day (based on 7d volume).

[Cancel]  [Confirm change]
```

### `/admin/fees/history`

Log cronologico dei cambi fee con: when, who, before → after, reason.

### `/admin/fees/revenue`

Pattern 5 (dashboard real-time):

- KPI: Revenue today / 7d / 30d
- Chart: revenue cumulativa
- Breakdown: per fee type (builder, service, telegram premium)
- Top revenue generators (top mercati per fee)

---

## GRUPPO 5 — CREATOR PROGRAM (5 sub-pages)

### `/admin/creators` (lista Verified Creators)

Pattern 1 con colonne specifiche: username, score Predimark, tier, followers, copy sessions attive, total earnings, status.

### `/admin/creators/applications` (queue review)

Pattern 4. Card per applicazione con:

- User profile
- Requirements check (tutti i criteri verificati)
- Performance metrics
- Reason note opzionale
- Bottoni: Reject / Request more info / Approve

Notification automatica via email + Telegram dopo decisione.

### `/admin/creators/[id]`

Pattern 2 con tabs:

- Overview: stats creator
- Profile: edit del profilo pubblico (per casi di compliance)
- Followers: lista chi lo segue
- Earnings: storico fee guadagnata
- Audit: audit log specifico

Bottoni: Edit / Suspend (con reason) / Remove from program / Send notification.

### `/admin/creators/payouts`

Queue di payout dovuti ai creator:

- Lista creator con earnings accumulate
- Bottone "Process payouts" (batch settimanale)
- Storico payout processati

### `/admin/creators/suspended`

Creator sospesi temporaneamente. Bottone "Reinstate" con reason.

---

## GRUPPO 6 — REFERRALS (2 sub-pages)

### `/admin/referrals`

Pattern 1: lista referrer attivi con count referrals, volume generato dai referrals, payout dovuto.

### `/admin/referrals/payouts`

Queue payout referrer (calcolo automatico, batch mensile).

---

## GRUPPO 7 — SIGNALS / ALGOS (3 sub-pages)

### `/admin/signals` (gestione segnali pubblicati)

Pattern 1 con colonne: signal ID, market, direction (Buy/Sell/Up/Down), edge %, confidence, published at, status (active/expired/resolved).

Actions:

- View detail
- Override (in caso di errori, super-admin only)
- Republish on Telegram

### `/admin/signals/performance`

Pattern 5 (dashboard):

- Hit rate cumulativo (% segnali che hanno predetto correttamente)
- Calibration curve (quanto siamo calibrati globalmente)
- Edge realized vs claimed
- Performance per algoritmo
- Top winning signals / top losing signals

### `/admin/signals/algos` (configurazione algoritmi)

Form configurazione per ogni algoritmo:

```
Algorithm: Final Period Momentum

Status: [Active ON ▼]

Markets applied to: [Crypto Round 5m, 15m, 1h ▼]

Parameters:
- Lookback period: [120 seconds]
- Edge threshold: [+12%]
- Confidence min: [60%]

Performance (last 30d):
- Total signals: 487
- Hit rate: 64%
- Avg edge realized: +5.2%
- Calibration error: 4.2%

[Save] [Backtest with new params]
```

---

## GRUPPO 8 — NOTIFICATIONS (3 sub-pages)

### `/admin/notifications/broadcast`

Form per inviare annuncio a tutti:

```
Audience:
○ All users
○ Verified Creators only
○ Active in last 7d
○ Specific segment: [filter builder]

Channels:
☑ Push notification
☑ Email
☐ Telegram bot
☐ In-app banner

Title: [Input]
Message: [Textarea]
CTA (opzionale): [Action label] [URL]

Preview:
[Visualizzazione anteprima]

Schedule:
○ Send now
○ Schedule for: [datetime picker]

[Cancel] [Send]
```

### `/admin/notifications/templates`

Library di template messaggi riutilizzabili (welcome, KYC approved, refund processed, ecc.).

### `/admin/notifications/history`

Storico tutti gli invii broadcast e per-user.

---

## GRUPPO 9 — ANALYTICS (4 sub-pages)

### `/admin/analytics` (KPI dashboard principale)

Pattern 5 con vista globale di tutti i KPI principali:

- DAU / WAU / MAU
- Retention curves (D1, D7, D30)
- Funnel signup → first trade → 5 trades → become creator
- Volume / Revenue / Churn
- Geographic distribution
- Device/browser breakdown

### `/admin/analytics/users` (funnel utenti)

Funnel detail con conversion rates step by step:

1. Visit landing → 100%
2. Sign up → 12%
3. KYC complete → 8%
4. First deposit → 5%
5. First trade → 4%
6. Active 7d → 2%

Drill-down per segmento (geo, source, device).

### `/admin/analytics/markets` (top markets)

Top markets per: volume, engagement (comments), holders, growth rate.

### `/admin/analytics/revenue` (revenue dashboard)

Breakdown revenue dettagliato + proiezioni.

---

## GRUPPO 10 — COMPLIANCE (2 sub-pages)

### `/admin/compliance/geo-block`

Lista paesi bloccati (default: Italy + sanctioned countries):

- Country code + name
- Status (blocked/restricted/allowed)
- Restriction type (full block / KYC required / paper trading only)
- Effective date

Bottone "Add country" / "Edit" / "Remove block" (super-admin only).

### `/admin/compliance/aml` (fraud alerts queue)

Pattern 4: alerts AI-generated per attività sospette:

- Wash trading detection
- Multiple accounts same IP
- Sudden volume spike
- Geo anomaly (VPN suspected)

Per ogni alert: review evidence → action (false positive / monitor / suspend / ban).

---

## GRUPPO 11 — AUDIT & LOGS (3 sub-pages)

### `/admin/audit-log` (azioni admin)

Pattern 1 con search + filter:

```
Filtri: actor (admin) / action type / target / date range
Search: free text
Sort: timestamp desc

Colonne:
Timestamp | Actor | Action | Target | Before | After | Reason | Details

Esempio:
14:25:32 | Feliciano | UPDATE_FEE | builder_fee | 0.5% | 0.7% | "Increase due to..." | [Expand]
14:12:18 | Moderator-A | BAN_USER | @spam_xyz | active | banned | "Bot activity..." | [Expand]
13:48:05 | Feliciano | APPROVE_CREATOR | @newcreator | pending | active | "Meets requirements..." | [Expand]
```

Click "Expand" mostra full diff JSON before/after se applicabile.

### `/admin/system-logs`

System errors, API failures, Polymarket API issues, MoonPay errors. Per debug tecnico.

### `/admin/api-usage`

Rate limiting status, top API consumers, latency monitoring.

---

## GRUPPO 12 — SETTINGS (8 sub-pages)

### `/admin/settings` (overview)

Hub con link alle 7 sub-pages settings.

### `/admin/settings/feature-flags`

Lista feature flags con toggle on/off:

```
Feature Flag                     | Status   | % rollout | Last modified
─────────────────────────────────────────────────────────────────────────
new_chart_engine                 | [ON]     | 100%      | 23 apr Feliciano
copy_trading_external_traders    | [ON]     | 100%      | 20 apr Feliciano
demo_mode_enabled                | [ON]     | 100%      | 15 apr Feliciano
ai_signals_premium               | [OFF]    | 0%        | 10 apr Feliciano
referral_v2                      | [PARTIAL]| 25%       | 25 apr Feliciano
new_signup_flow                  | [PARTIAL]| 50%       | 24 apr Feliciano
```

Click su una row → edit toggle, % rollout, target audience.

### `/admin/settings/ab-tests`

A/B test configuration:

```
Test name: home_hero_carousel_size
Status: [Running]
Variants:
- A (control): 3 items in carousel - 50%
- B (variant): 5 items in carousel - 50%

Metric tracked: click-through-rate on hero
Started: 20 apr 2026
Sample size: 12,400 users
Result so far: B leads +8% (statistical significance: 92%)

[End test] [Promote variant B as winner]
```

### `/admin/settings/leaderboard-mode`

Toggle critico per leaderboard:

```
Leaderboard mode

Current: [✓ Unified mode] · 2-tab mode

Statistics:
- Verified Creators: 42 (need 50+ for 2-tab mode)
- Top Traders Polymarket: 1,235

Recommendation: Stay in Unified mode until 50+ Verified.

[Switch to 2-tab mode]
```

### `/admin/settings/integrations`

Configurazione integrazioni esterne:

- Polymarket API (key, rate limits)
- MoonPay (API key, geo enabled)
- Telegram bot (token, webhook URL)
- Privy (project ID)
- SendGrid (email API)

### `/admin/settings/team` (super-admin only)

Lista admin team:

```
Name        | Email             | Role          | Last login | Actions
Feliciano   | f@predimark.com   | Super-admin   | now        | [Edit]
Moderator-A | mod@predimark.com | Moderator     | 3h ago     | [Edit] [Remove]
```

Bottone "Invite team member" → email invitation con role pre-selezionato.

### `/admin/settings/payouts`

Configurazione metodi payout creator (Polygon USDC native, fallback bank wire per >$10k).

### `/admin/settings/branding`

Logo upload, primary color, tagline, favicon (per eventuale rebrand).

---

## NOTE TECNICHE PER COWORK

### Tecnologie

- **Auth**: ruolo admin nel JWT Privy + verifica server-side ad ogni request
- **DB**: tabella `admin_users` con ruoli (super_admin / admin / moderator)
- **Audit log**: tabella dedicata, append-only, con indici su (actor, target, timestamp)
- **Real-time**: WebSocket per dashboard KPI
- **Permissions**: middleware route-based check ruolo + permessi specifici

### Componenti riusabili

- **AdminLayout**: layout master con sidebar e top bar
- **AdminTable**: tabella con search/filter/sort/bulk actions
- **AdminDetailPage**: detail page con hero + tabs
- **AdminForm**: form con validation + audit footer
- **AdminQueueCard**: card per queue review (KYC, refunds, applications)
- **AdminStatsCard**: card KPI con delta arrow
- **AdminAlertsBar**: banner alert automatici dashboard
- **AuditLogEntry**: riga audit log con expand diff

### API endpoints

- `/api/admin/users/*` (CRUD utenti)
- `/api/admin/markets/*`
- `/api/admin/fees/*`
- `/api/admin/creators/*`
- `/api/admin/notifications/broadcast`
- `/api/admin/analytics/*`
- `/api/admin/audit-log` (read-only)
- `/api/admin/settings/*`

Tutti protected da middleware `requireRole(['admin', 'super_admin'])`.

### Security considerations

- **MFA obbligatorio** per super-admin
- **IP allowlist** opzionale per admin
- **Session timeout** 30 minuti inattività
- **Audit log NON modificabile** (no DELETE permesso)
- **Confirmation dialogs** per azioni distruttive (ban, fee change, refund)
- **Rate limiting** su azioni critiche

### Performance

- **Server-side rendering** per security e performance
- **Pagination obbligatoria** su tutte le tabelle
- **Cache aggressiva** per analytics (5 min)
- **Real-time updates** solo per dashboard principale (WebSocket)
- **Lazy load** sub-pages

### Mobile (out of scope V1)

L'admin desktop è priorità V1. Mobile è esperienza ridotta:

- Sidebar collapsible
- Tabelle con scroll orizzontale
- Banner "Per migliore esperienza usa desktop"
- Le funzionalità critiche devono comunque funzionare (es. emergency kill switch)

---

## STATI DELLE PAGINE ADMIN

### Default

Layout master con sub-page content.

### Loading

Skeleton placeholder per tabelle e form.

### Empty (es. nessun KYC pending)

```
"All caught up! 🎉"
"Nessun KYC in attesa di review."
```

### Error

Banner rosso con dettagli errore + retry.

### Permission denied

Se un moderator tenta di accedere a sezione super-admin only:

```
"Access denied"
"This section is for super-admins only."
[Back to dashboard]
```

---

## ACCESSIBILITÀ

- Tutte le tabelle con `<table>` semantico + `aria-sort`
- Form con label espliciti e helper text via `aria-describedby`
- Conferma dialogs con `role="alertdialog"`
- Sidebar navigation con `aria-current="page"` per pagina attiva
- Badge count con `aria-label` ("3 items pending")

---

## RIFERIMENTI

- **Documento 1** — Vision & Product
- **Documento 3** — Sitemap (sezione `/admin/*`)
- **Documento 5** — Tech stack (per security e auth)
- **Documento 6** — Database schema (tabelle admin_users, audit_log, feature_flags)

---

## PAGINE SUCCESSIVE

Documenti che verranno costruiti nelle prossime sessioni:

- **Pagina 7** — Signup + onboarding flow

**Totale pagine wireframe**: 7 (6 fatte, 1 resta)

---

_Fine Documento 4 — Wireframes — Pagina 6 (Admin overview)_
_Continua con Pagina 7 (Signup + onboarding) nella sessione successiva_
