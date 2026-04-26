# Predimark V2 — Wireframes — Pagina 5 (Leaderboard)

> **Documento 4 di 10** — UX Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Pagina 5 (Leaderboard) completa
> Predecessori: Pagina 1 (Home) v2, Pagina 2 (Pagina evento) v3, Pagina 3 (Profilo /me) v1, Pagina 4 (Profilo creator) v1

---

## Cos'è questo documento

Questo documento descrive la **Pagina Leaderboard** (`/leaderboard`) di Predimark V2 — la classifica dei trader sulla piattaforma.

Adottiamo un'**architettura di classifica adattiva**:
- **Al lancio**: 1 classifica unificata (Verified Creators + Top Traders Polymarket mescolati con badge distintivi)
- **Quando il programma Verified matura (50+ creator)**: l'admin può attivare le 2 tab separate

Il filtro "Solo Verified / Solo External / Tutti" è sempre disponibile dal day 1 per chi vuole già da subito navigare per categoria.

---

## DECISIONE ARCHITETTURALE: CLASSIFICA ADATTIVA

### Modalità lancio (default)

```
LEADERBOARD UNIFICATA
├── 1 sola tabella che mescola Verified + External
├── Distinzione visiva con badge ✓ Verified vs ⚠ External
└── Filtro toggle "Tutti / Solo Verified / Solo External" sempre visibile
```

### Modalità maturità (admin attiva quando 50+ Verified)

```
LEADERBOARD A 2 TAB
├── Tab 1: Verified Creators (default)
└── Tab 2: Top Traders Polymarket
```

L'admin gestisce il toggle dal pannello `/admin/settings/leaderboard-mode`. Cambia in tempo reale per tutti gli utenti senza richiedere deploy.

---

## DESCRIZIONE COMPLETA — MODALITÀ LANCIO

### Layout Desktop (>1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER GLOBALE                                                        │
├──────────────────────────────────────────────────────────────────────┤
│ NAV TABS GLOBALI                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ HERO LEADERBOARD                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Leaderboard                                                    │ │
│ │  Scopri i migliori trader su Predimark e Polymarket             │ │
│ │                                                                  │ │
│ │  $2.4M Volume tradato oggi · 1,247 trader attivi                │ │
│ │  12 Verified Creators · 1,235 Top Traders Polymarket            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ FILTRI                                                                │
│                                                                       │
│ Periodo: [Oggi] [✓ 7 giorni] [30 giorni] [All-time]                  │
│                                                                       │
│ Sort by: [✓ Volume] [Profit] [ROI %] [Win rate] [Sharpe]             │
│                                                                       │
│ Categoria: [✓ Tutti] [Crypto] [Sport] [Politica] [Cultura] [News]    │
│                                                                       │
│ Tipo trader: [✓ Tutti] [Solo Verified ✓] [Solo External ⚠]           │
│                                                                       │
│ Volume min: [$1,000 ▼]                                                │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ POSIZIONE DELL'UTENTE LOGGATO (sticky, sempre visibile)              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⭐ La tua posizione                                              │ │
│ │ #487  [foto] Tu           $3,240 vol   +$184    +5.7%   58%     │ │
│ │       (loggato come @feliciano)                                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ TABELLA LEADERBOARD                                                  │
│ ┌────┬──────────────────────┬─────────┬─────────┬────────┬────────┐ │
│ │ #  │ Trader               │ Volume  │ Profit  │ ROI    │ WR     │ │
│ ├────┼──────────────────────┼─────────┼─────────┼────────┼────────┤ │
│ │ 1  │ [icon] 0x9d84...0306 │ $234k   │ +$12.3k │ +5.2%  │ 52%    │ │
│ │    │ ⚠ External "WhaleAI" │         │         │        │ [Copy⚠]│ │
│ ├────┼──────────────────────┼─────────┼─────────┼────────┼────────┤ │
│ │ 2  │ [foto] @theo4        │ $48k    │ +$2.4k  │ +6.2%  │ 64%    │ │
│ │    │ ✓ Verified · Gold 87 │         │         │        │ [Foll.]│ │
│ ├────┼──────────────────────┼─────────┼─────────┼────────┼────────┤ │
│ │ 3  │ [icon] 0x3a72...8f12 │ $187k   │ +$9.1k  │ +4.9%  │ 54%    │ │
│ │    │ ⚠ External           │         │         │        │ [Copy⚠]│ │
│ ├────┼──────────────────────┼─────────┼─────────┼────────┼────────┤ │
│ │ 4  │ [foto] @domah        │ $32k    │ +$1.8k  │ +5.8%  │ 61%    │ │
│ │    │ ✓ Verified · Silver  │         │         │        │ [Foll.]│ │
│ ├────┼──────────────────────┼─────────┼─────────┼────────┼────────┤ │
│ │ 5  │ [icon] 0xab94...cd33 │ $124k   │ +$5.7k  │ +4.6%  │ 51%    │ │
│ │    │ ⚠ External           │         │         │        │ [Copy⚠]│ │
│ ├────┼──────────────────────┼─────────┼─────────┼────────┼────────┤ │
│ │ ... più trader fino a #50                                         │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ [ Carica altri 50 → ]                                                 │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Mobile (<768px)

```
┌─────────────────────────────────────┐
│ HEADER GLOBALE                      │
├─────────────────────────────────────┤
│ Leaderboard                         │
│ $2.4M oggi · 1,247 trader           │
│ 12 Verified · 1,235 External        │
├─────────────────────────────────────┤
│ FILTRI (compatti, 2 righe)          │
│ Periodo: [Oggi][7g][30g][ALL]       │
│ Sort: Volume ▼                      │
│ [⚙ Filtri avanzati]                 │
├─────────────────────────────────────┤
│ ⭐ La tua posizione                  │
│ #487  Tu                             │
│ $3,240 vol · +$184 (+5.7%)          │
├─────────────────────────────────────┤
│ LISTA TRADER (card verticali)       │
│ ┌─────────────────────────────────┐ │
│ │ #1                               │ │
│ │ [icon] 0x9d84...0306            │ │
│ │ ⚠ External "WhaleAI"             │ │
│ │                                  │ │
│ │ Volume: $234k                    │ │
│ │ Profit: +$12.3k (+5.2%) ▲        │ │
│ │ Win rate: 52%                    │ │
│ │                                  │ │
│ │ [ Copy ⚠ ]  [ View profile → ]  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ #2                               │ │
│ │ [foto] @theo4                    │ │
│ │ ✓ Verified Creator · Gold 87     │ │
│ │ ...                              │ │
│ └─────────────────────────────────┘ │
│ [card 3, 4, ...]                    │
│ [ Carica altri 50 → ]               │
└─────────────────────────────────────┘
```

### Filtri avanzati mobile (bottom sheet)

Click su `[⚙ Filtri avanzati]` apre bottom sheet con:

```
┌─────────────────────────────────────┐
│ Filtri avanzati                  [×] │
├─────────────────────────────────────┤
│ Sort by                              │
│ ○ Volume    ● Profit    ○ ROI %     │
│ ○ Win rate  ○ Sharpe ratio*          │
│                                      │
│ Categoria specializzazione          │
│ ☑ Tutti                              │
│ ☐ Crypto  ☐ Sport  ☐ Politica       │
│ ☐ Cultura ☐ News                     │
│                                      │
│ Tipo trader                          │
│ ● Tutti                              │
│ ○ Solo Verified ✓                    │
│ ○ Solo External ⚠                    │
│                                      │
│ Volume minimo                        │
│ [$1,000 ▼]                           │
│                                      │
│ * Sharpe filtra automaticamente      │
│   solo Verified Creators             │
│                                      │
│ [Reset]    [Applica]                 │
└─────────────────────────────────────┘
```

---

## HERO LEADERBOARD

### Contenuto

```
Leaderboard
Scopri i migliori trader su Predimark e Polymarket

$2.4M Volume tradato oggi · 1,247 trader attivi
12 Verified Creators · 1,235 Top Traders Polymarket
```

**Statistiche live**:
- Volume totale tradato nel periodo selezionato (default 7g)
- Numero totale di trader attivi (con almeno 1 trade)
- Breakdown Verified vs External (per trasparenza)

Aggiornamento real-time via WebSocket.

---

## FILTRI

### Periodo (4 opzioni)

```
Periodo: [Oggi] [✓ 7 giorni] [30 giorni] [All-time]
```

- **Oggi**: trade chiusi nelle ultime 24 ore
- **7 giorni** (default): rolling window 7 giorni
- **30 giorni**: rolling window 30 giorni
- **All-time**: dall'inizio dell'attività del trader

Cambio di periodo → ricalcolo classifica server-side, refresh tabella.

### Sort by (5 opzioni)

```
Sort by: [✓ Volume] [Profit] [ROI %] [Win rate] [Sharpe]
```

- **Volume**: USDC totale tradato nel periodo (default)
- **Profit**: P&L cumulato in USD nel periodo
- **ROI %**: P&L / Volume × 100 (return on investment percentuale)
- **Win rate**: % trade vinti (richiede minimo 10 trade chiusi)
- **Sharpe ratio**: rapporto rischio/rendimento (richiede dati Predimark, mostra solo Verified)

### Categoria (specializzazione)

```
Categoria: [✓ Tutti] [Crypto] [Sport] [Politica] [Cultura] [News]
```

Filtra per **specializzazione** del trader. Calcoliamo la specializzazione come "categoria con >40% del volume del trader":
- Es. trader fa 70% trade su crypto → specializzazione = Crypto
- Trader equilibrato (no categoria >40%) → mostrato in "Tutti"

### Tipo trader

```
Tipo trader: [✓ Tutti] [Solo Verified ✓] [Solo External ⚠]
```

- **Tutti** (default): mescolati Verified + External nella stessa lista
- **Solo Verified ✓**: filtra solo i creator opt-in al programma Predimark
- **Solo External ⚠**: filtra solo i top trader esterni Polymarket

Disponibile dal day 1 per dare visibilità al programma anche con pochi Verified.

### Volume minimo

```
Volume min: [$1,000 ▼]
```

Dropdown con opzioni: `$0 / $100 / $1,000 / $10,000 / $100,000`.

Default `$1,000` per escludere account dormienti / spam (ma utente può abbassare se vuole).

### Comportamento speciale del Sort by Sharpe

Quando l'utente seleziona **Sort by Sharpe**, succede questo:

1. Il filtro "Tipo trader" cambia automaticamente a **"Solo Verified ✓"**
2. Banner sopra la tabella appare:
   ```
   ⓘ Sort by Sharpe Ratio · Mostrando solo Verified Creators
     I Top Traders esterni non hanno questo dato (richiede storia trade completa).
     [Cambia sort]
   ```
3. La lista si filtra dinamicamente
4. Se l'utente cambia Sort verso un'altra metrica → torna automaticamente a "Tutti"

Trasparente, niente sorprese.

---

## POSIZIONE DELL'UTENTE LOGGATO (pin riga)

Sopra la tabella, sempre visibile per l'utente loggato:

```
┌────────────────────────────────────────────────────────────────────┐
│ ⭐ La tua posizione                                                 │
│ #487  [foto] Tu (@feliciano)    $3,240 vol   +$184   +5.7%   58%   │
│       Score: Standard 42                       [View my profile →] │
└────────────────────────────────────────────────────────────────────┘
```

**Caratteristiche**:
- Background blu chiaro `#3b82f615` per evidenziare
- Numero posizione `#487` calcolato sull'attuale filtro/sort
- Stesse colonne della tabella (Volume / Profit / ROI / Win rate)
- Bottone "View my profile →" naviga a `/me`
- **Sempre visibile** sopra la tabella, anche se l'utente è in posizione bassa

**Quando l'utente è nelle prime 50** (in tabella):
- Pin riga in cima COME PROMPT (visibile)
- ALTRESÌ riga normale evidenziata in tabella (background giallo soft)

**Quando l'utente non ha trade**:
- Pin riga sostituito con CTA: "Inizia a tradare per entrare in classifica"
- Bottoni: [Esplora mercati →] [Try Demo →]

**Quando l'utente non è loggato**:
- Pin riga sostituito con CTA: "Crea account per vedere la tua posizione"
- Bottone [Sign up →]

---

## TABELLA LEADERBOARD (componente chiave)

### Struttura colonne (desktop)

| # | Posizione (1-50, poi continua a 51+ con load more) |
|---|---|
| Trader | Avatar/icona + Username/Address + Badge verifica + Score (per Verified) |
| Volume | USDC totale tradato nel periodo |
| Profit | P&L cumulato in USD (verde se positivo, rosso se negativo) |
| ROI % | (P&L / Volume) × 100 |
| WR (Win rate) | Percentuale trade vinti |
| Action | Bottone Follow (Verified) o Copy ⚠ (External) |

### Riga Verified Creator

```
#2  [foto avatar]  @theo4               $48k     +$2.4k     +6.2%    64%   [Follow]
                   ✓ Verified · Gold 87
                   Specializ.: Crypto · Sport
```

- Avatar: foto reale del creator (32x32 desktop, 24x24 mobile)
- Nome: `@username`
- Sotto: badge "✓ Verified" blu + Score + Tier (Gold/Silver/Bronze/Rising)
- Specializzazione mostrata sotto in piccolo grigio (max 2 categorie)
- Bottone azione: **[Follow]** outlined

### Riga Top Trader External

```
#1  [icon gradient]  0x9d84...0306      $234k    +$12.3k    +5.2%    52%   [Copy ⚠]
                     ⚠ External · "WhaleAI"
```

- Icona: gradient generato da hash address (no foto)
- Nome: address troncato `0x9d84...0306`
- Sotto: badge "⚠ External" giallo soft + nickname Polymarket se disponibile (es. "WhaleAI")
- Niente specializzazione (non calcolabile per esterni)
- Bottone azione: **[Copy ⚠]** outlined con caution mark

### Click sulla riga → naviga al profilo

- Click su riga Verified → `/creator/[username]` (es. `/creator/theo4`)
- Click su riga External → `/trader/[address]` (es. `/trader/0x9d84...0306`)

### Click sui bottoni azione (NON propaga alla riga)

- **[Follow]**: vedi flusso 5 stati definito in Pagina 4 (creator profile)
- **[Copy ⚠]**: apre dialog speciale con disclaimer (vedi Pagina 4 — External Trader)

### Real-time updates

- WebSocket per refresh classifica ogni 60 secondi
- Animazione smooth quando un trader sale/scende di posizione
- Highlight breve (200ms) sulla cella che cambia valore
- Throttle: max 1 update visibile per riga ogni 5 secondi

### Pagination

- **Top 50** mostrati di default
- Bottone **"Carica altri 50 →"** in fondo
- Carica progressivamente (max ~500 trader totali)
- Oltre 500: "I primi 500 trader sono mostrati. Affina i filtri per cercare più specifici."

---

## STATI DELLA PAGINA

### Default (loaded)
Tabella popolata, real-time updates attivi.

### Loading (primo caricamento)
- Skeleton placeholder per filtri e tabella
- Caricamento progressivo (filtri → header tabella → righe)

### Empty (nessun risultato dai filtri)
```
"Nessun trader corrisponde ai tuoi filtri."
[Reset filtri]
```

### Empty (programma Verified vuoto + filtro "Solo Verified")
```
"Il programma Verified Creator è ancora nuovo!"
"Nessun creator soddisfa i tuoi filtri al momento."

[Diventa il primo Verified Creator →]
[Vedi tutti i trader →]
```

### Error (problema rete/API)
- Banner "Connessione interrotta, riprovo automaticamente..."
- Mostra ultimi dati cached
- Retry silenzioso

---

## MODALITÀ MATURITÀ (2 TAB)

### Quando si attiva

L'admin attiva la modalità 2 tab dal pannello `/admin/settings/leaderboard-mode` quando:
- Verified Creators >= 50
- Filtro auto-suggerito ma admin decide manualmente
- Cambio applicato a tutti gli utenti senza deploy

### Layout 2 tab

```
┌──────────────────────────────────────────────────────────────────────┐
│ HERO LEADERBOARD                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ TABS PRINCIPALI                                                       │
│ [✓ Verified Creators (87)] · Top Traders Polymarket (1,235)          │
├──────────────────────────────────────────────────────────────────────┤
│ FILTRI (gli stessi, ma il filtro "Tipo trader" sparisce)             │
│ Periodo · Sort by · Categoria · Volume min                            │
├──────────────────────────────────────────────────────────────────────┤
│ Tabella                                                               │
└──────────────────────────────────────────────────────────────────────┘
```

### Differenze rispetto alla modalità lancio

- **Tabs principali in cima** (Verified default, External secondario)
- **Niente filtro "Tipo trader"** (è già la tab a discriminare)
- **Tutto il resto** uguale (filtri periodo/sort/categoria/volume min, posizione utente, paginazione)

### Cambio modalità (admin)

Quando l'admin cambia modalità (1 tab ↔ 2 tab):
- Tutti gli utenti ricevono la nuova UX al refresh successivo
- Eventuali filtri salvati nei query params restano validi
- Nessun loss di dati

---

## COMPORTAMENTI INTERATTIVI

### Click su riga trader

Click su qualsiasi riga (NON sui bottoni Follow/Copy):
- Naviga al profilo: `/creator/[username]` o `/trader/[address]`

### Click su bottoni Follow / Copy

Stesso flusso di Pagina 4:
- **Follow**: API `/api/copy/follow`, badge cambia a "✓ Following"
- **Copy ⚠** (External): dialog con caveat, poi setup session keys

### Cambio filtri

Cambio di periodo / sort / categoria / volume min:
- API call refresh tabella
- URL aggiornato con query params (sharable)
- Es: `/leaderboard?period=30d&sort=profit&category=crypto&min_volume=10000`

### Cambio Sort to Sharpe (special case)

Già documentato sopra. Cambio automatico filtro "Solo Verified" + banner esplicativo.

### Real-time updates

- WebSocket connesso al canale `leaderboard:[period]:[sort]:[filters]`
- Updates ogni 60 secondi (no real-time troppo aggressivo per evitare flickering)
- Animazione smooth per cambi posizione (200-300ms)

### Persistenza filtri

- Filtri salvati in URL query params
- URL condivisibile (link diretto a una specifica vista classifica)
- Refresh pagina mantiene filtri

---

## ACCESSIBILITÀ

- Tabella con `<table>`, `<thead>`, `<tbody>` semantici
- Header colonne con `aria-sort` per indicare sort attivo
- Posizioni con `aria-label` descrittivo ("Posizione 487, sei tu")
- Badge ✓ Verified e ⚠ External con `aria-label` esplicito
- Filtri navigabili da tastiera (Tab, frecce, Enter)
- Touch target minimo 44x44px per bottoni Follow/Copy mobile
- Real-time updates con `aria-live="polite"` per non interrompere screen reader

---

## NOTE TECNICHE PER COWORK

### Componenti da costruire

- **LeaderboardHero**: hero con statistiche live
- **LeaderboardFilters**: barra filtri (Periodo / Sort / Categoria / Tipo trader / Volume min)
- **UserPositionPin**: pin riga utente loggato (sticky)
- **LeaderboardTable**: tabella desktop con colonne configurabili
- **LeaderboardCard**: card mobile per ogni trader (verticale)
- **TraderRowVerified**: riga Verified Creator con badge + score
- **TraderRowExternal**: riga External Trader con badge + disclaimer
- **SharpeFilterBanner**: banner che appare quando sort by Sharpe è attivo

### Dati e API

- **Lista trader**: API interna `/api/leaderboard?period=X&sort=Y&category=Z&type=W&min_volume=V&limit=50&offset=O`
- **Dati Verified**: dal nostro DB (con calcoli proprietari Score, Tier, Sharpe, calibration)
- **Dati External**: da Polymarket Data API `/leaderboard` (con cache 60s)
- **Posizione utente**: API interna `/api/leaderboard/me?period=X&sort=Y&filters=...`
- **Statistiche live**: WebSocket `leaderboard:stats`

### Aggregazione e cache

- **Cache classifica**: 60 secondi per filtri standard
- **Calcoli ROI/Win rate**: cached 5 minuti
- **Sharpe ratio**: cached 15 minuti (calcolo pesante)
- **Specializzazione trader**: ricalcolata ogni 24 ore (batch nightly job)

### Performance

- **Server-side rendering** per first paint veloce
- **Virtualizzazione tabella** se >100 righe (top 50 + load more)
- **Lazy load avatar**: foto creator caricate solo on-screen
- **Throttle real-time**: max 1 update visibile per riga ogni 5 secondi

### Logica del trigger 1-tab → 2-tab

Admin pannello `/admin/settings/leaderboard-mode`:
- Toggle "Modalità unificata / Modalità 2 tab"
- Suggerimento automatico quando Verified >= 50 ("Suggested: switch to 2 tab")
- Cambio applicato runtime (no deploy)
- Storico modifiche (audit log)

### Database considerations

Per Cowork: la classifica richiede **query potenti**. Strategie:
- Tabella materialized view aggiornata ogni minuto
- Indexes su (volume, profit, roi, win_rate, sharpe) × (period_oggi, period_7d, period_30d, period_all)
- Partitioning per categoria
- Cache layer Redis per top 100 più frequenti

---

## RIFERIMENTI

- **Documento 1** — Vision & Product
- **Documento 2** — User Stories (US-028..US-030 specifici per leaderboard e copy trading)
- **Documento 3** — Sitemap (/leaderboard documentato)
- **Documento 4** — Pagina 4 (Profilo creator) — i bottoni Follow/Copy seguono lo stesso pattern
- **Documento 5** — Tech stack & Architettura (per ottimizzazioni DB e cache)

---

## PAGINE SUCCESSIVE

Documenti che verranno costruiti nelle prossime sessioni:

- **Pagina 6** — Admin overview `/admin`
- **Pagina 7** — Signup + onboarding flow

**Totale pagine wireframe**: 7 (5 fatte, 2 restano)

---

*Fine Documento 4 — Wireframes — Pagina 5 (Leaderboard)*
*Continua con Pagina 6 (Admin) nella sessione successiva*
