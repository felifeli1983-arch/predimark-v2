# Predimark V2 — Wireframes — Pagina 2 (Pagina evento)

> **Documento 4 di 10** — UX Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v3 — Pagina 2 (Pagina evento) completa con espansione inline + libro ordini + navigation round
> Predecessore: Pagina 1 (Home) v2
> **Decisione architetturale**: Pagina 3 (Mercato deep view) ELIMINATA — la sua funzionalità è inclusa qui tramite espansione inline accordion. Il numero totale di pagine wireframe scende da 8 a 7.

---

## Cos'è questo documento

Questo documento descrive la **Pagina evento** (`/event/[slug]`) di Predimark V2 — la pagina che si apre quando l'utente clicca su una EventCard nella home, nei filtri, nella search, o arriva via link diretto (notifica, Telegram, condivisione).

La pagina evento ha **5 layout dedicati** in base al CardKind del mercato:
1. Binary
2. Multi-outcome (con sotto-tipo "date come outcome")
3. Multi-strike
4. H2H Sport
5. Crypto Up/Down

Più un **Hub Sport** intermedio che permette di esplorare gli eventi sport per lega.

E un **Trade Widget unificato** che funziona uguale per tutti i CardKind, con 2 modalità (Mercato + Limite) e logica di payout dinamico.

---

## STRUTTURA COMUNE A TUTTE LE PAGINE EVENTO

Indipendentemente dal CardKind, ogni pagina evento ha questa struttura globale:

### Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER GLOBALE (uguale a Home)                                        │
├──────────────────────────────────────────────────────────────────────┤
│ NAV TABS GLOBALI                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ BREADCRUMB                                                            │
│ Home > Categoria > Tag > Evento                                       │
├────────────────────────────────────┬─────────────────────────────────┤
│                                    │                                  │
│  MAIN CONTENT (75%)                │  SIDEBAR FISSA (25%)             │
│                                    │  sticky + scroll interno         │
│  - Hero evento                     │  ┌─────────────────────────┐    │
│  - Chart prob storia               │  │ TRADE WIDGET            │    │
│  - Outcome list / score / ecc.     │  │ (Mercato/Limite tabs)   │    │
│    (varia per CardKind)            │  │                         │    │
│  - Sezioni specifiche CardKind     │  ├─────────────────────────┤    │
│  - Tabs info in basso              │  │ 🎯 SEGNALE PREDIMARK    │    │
│    (Comments/News/Holders/         │  ├─────────────────────────┤    │
│     Rules/Activity)                │  │ 🔥 SENTIMENT            │    │
│                                    │  ├─────────────────────────┤    │
│                                    │  │ ⭐ MERCATI CORRELATI    │    │
│                                    │  └─────────────────────────┘    │
└────────────────────────────────────┴─────────────────────────────────┘
```

### Mobile

```
┌─────────────────────────────────────┐
│ HEADER GLOBALE                      │
├─────────────────────────────────────┤
│ ← back · breadcrumb compatto        │
├─────────────────────────────────────┤
│                                      │
│ MAIN CONTENT (full width)            │
│                                      │
│  - Hero evento                       │
│  - Chart prob storia                 │
│  - Outcome list / score / ecc.       │
│  - Bottoni inline per trade          │
│  - Sezioni specifiche CardKind       │
│  - 🎯 Segnale Predimark              │
│  - 🔥 Sentiment                      │
│  - ⭐ Mercati correlati (collapse)   │
│  - Tabs info                         │
│                                      │
├─────────────────────────────────────┤
│ Bottom navigation 5 voci             │
└─────────────────────────────────────┘

[Click su un bottone Yes/No/Up/Down/Team]
              ↓
┌─────────────────────────────────────┐
│ Pagina dietro oscurata               │
├─────────────────────────────────────┤
│ ▬ drag handle                        │
│ TRADE WIDGET (bottom sheet)          │
│ [Mercato/Limite tabs]                │
│ ...                                  │
│ [Trading button]                     │
└─────────────────────────────────────┘
```

### Comportamento sidebar desktop (CSS sticky)

Tecnicamente la sidebar usa `position: sticky; top: 0; max-height: 100vh; overflow-y: auto`. Pattern standard.

L'utente può scrollare la pagina (chart, comments, etc.) e la sidebar rimane visibile. Se le 4 sezioni (Trade Widget + Segnale + Sentiment + Correlati) non entrano nell'altezza viewport, la sidebar ha scroll interno indipendente.

### Tabs info in basso (uguali per tutti i CardKind)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Comments] [News] [Holders] [Rules] [Activity]                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Contenuto del tab attivo                                              │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

| Tab | Contenuto |
|---|---|
| **Comments** | Feed commenti utenti (real-time, tipo Reddit/Twitter). Like, reply, segnala. |
| **News** | Notizie collegate al mercato (Reuters, WSJ, NYT, ecc.). Click apre la news. |
| **Holders** | Top 20 trader con posizione aperta. Avatar, address, posizione, P&L pubblico. |
| **Rules** | Regole di risoluzione (resolver, criteri, fonte ufficiale). Testo statico. |
| **Activity** | Feed live trade recenti via WebSocket. Animation fade-in/out. |

---

## TRADE WIDGET UNIFICATO (componente comune)

Il widget è **lo stesso** per tutti i CardKind. Cambia solo l'identità mercato che mostra (chip outcome selezionato).

Posizionamento:
- **Desktop**: sidebar fissa destra in cima, sempre visibile
- **Mobile**: bottom sheet che sale dal basso quando l'utente clicca un bottone Yes/No/Up/Down/Team

### Struttura del widget

```
┌─────────────────────────────────────────┐
│ HEADER WIDGET                            │
│ [Compra ▼]              [Mercato ⇄]    │  ← 2 toggle
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ IDENTITÀ MERCATO                         │
│ [icon] Titolo evento                    │
│        [chip outcome selezionato]       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ CONTENUTO MODALITÀ ATTIVA                │
│ (varia: Mercato vs Limite)              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ INFO CONTESTUALE                         │
│ Saldo USDC                              │
│ Banner Segnale Predimark (se attivo)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │            Trading                │  │  ← CTA blu enorme
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Toggle 1 — Compra/Vendi

Dropdown in alto sinistra:
- **Compra** (default): l'utente apre nuova posizione
- **Vendi**: l'utente liquida posizione esistente (visibile solo se ha posizione attiva)

### Toggle 2 — Mercato/Limite

Dropdown in alto destra (default Mercato):
- **Mercato**: ordine eseguito subito al miglior prezzo disponibile
- **Limite**: ordine eseguito solo quando il mercato raggiunge il prezzo target

### Identità mercato

Riga sempre visibile per dare contesto:
- **Icona mercato** (logo BTC, foto evento, logo team, bandiere paese)
- **Titolo evento** (1 riga, tronca con `...` se lungo)
- **Chip outcome selezionato** sotto:
  - Per Binary: "Yes ⟲" o "No ⟲"
  - Per Multi-outcome: "[outcome name] [Yes/No] ⟲" (es. "30 aprile / No")
  - Per Multi-strike: "[strike threshold] [Yes/No] ⟲"
  - Per H2H Sport: "[team name] ⟲" o "[market type] [side] ⟲" (es. "Spread DET -2.5")
  - Per Crypto Round: "Up ⟲" o "Down ⟲"

L'icona `⟲` permette di **switchare side** rapidamente senza chiudere e riaprire il widget.

### Modalità Mercato (default)

```
┌─────────────────────────────────────────┐
│      -    $5    +                       │  ← importo USDC grande
│                                          │
│   Per vincere 💵 $9.42                  │  ← payout calcolato live
│   Prezzo medio 53¢                      │
│                                          │
│   [+$1] [+$5] [+$10] [+$100] [Max]      │  ← quick amounts statici
└─────────────────────────────────────────┘
```

**Caratteristiche**:
- Importo USDC al centro, grande, con bottoni `-` e `+` ai lati
- Tap su importo apre tastiera numerica (mobile) o input editabile (desktop)
- "Per vincere" calcolato live in base a importo + prezzo medio mercato
- Quick amounts standard: `+$1` `+$5` `+$10` `+$100` `Max` (Max = saldo disponibile)
- Esecuzione: ordine market, eseguito al miglior prezzo CLOB disponibile

### Modalità Limite

```
┌─────────────────────────────────────────┐
│ Prezzo limit       [- 50¢ +]            │  ← prezzo share target
│                                          │
│ Azioni             [    0    ]          │  ← numero azioni
│   [-100] [-10] [+10] [+100] [+1000]     │  ← quick adjust DINAMICO
│                                          │
│ Imposta scadenza            [toggle ON] │
│                                          │
│ [5m] [1h] [12h] [24h] [Fine giornata]   │  ← chip preset scadenza
│ [Personalizz...]                         │  ← se ON
│                                          │
│ Totale                          $0      │  ← USDC = prezzo × azioni
│ Per vincere ⓘ                  $0      │  ← payout = $1 × azioni
└─────────────────────────────────────────┘
```

**Caratteristiche**:
- **Prezzo limit**: prezzo share desiderato (in centesimi, da 1¢ a 99¢). Tap su numero apre keypad.
- **Azioni**: quante share vuoi comprare. Tap su numero apre keypad.
- **Quick amounts dinamici**: cambiano in base al prezzo limit. Logica:
  - Se prezzo basso (es. 50¢): mostra `-100 -10 +10 +100 +1000` (servono molte azioni)
  - Se prezzo alto (es. 97¢): mostra `-100 -10 +10 +100 +200` (servono meno azioni)
  - L'ultimo valore viola/blu evidenzia "buy big" calibrato al prezzo
- **Imposta scadenza** (toggle):
  - **OFF**: ordine GTC (Good Till Cancelled), resta nel book finché non eseguito o cancellato manualmente
  - **ON**: ordine GTD (Good Till Date), valido fino alla scadenza scelta, poi auto-cancellato dal sistema
- **Preset scadenza** (visibili solo se toggle ON):
  - `5m` — ordine valido per 5 minuti (ottimo per crypto round veloci)
  - `1h` — 1 ora
  - `12h` — 12 ore
  - `24h` — 24 ore (1 giorno)
  - `Fine giornata` — fino a mezzanotte UTC del giorno corrente
  - `Personalizz...` — apre date/time picker nativo del device (mobile: iOS/Android picker; desktop: input datetime-local)
- **Default contestuale del toggle scadenza** (in base al CardKind del mercato):
  - **Crypto round 5m**: toggle ON, preset `5m` selezionato (allineato al round)
  - **Crypto round 15m**: toggle ON, preset `1h` selezionato
  - **Crypto round 1h**: toggle ON, preset `1h` selezionato
  - **Crypto round 1d**: toggle ON, preset `24h` selezionato
  - **Sport in corso (LIVE)**: toggle ON, preset `Fine giornata` selezionato
  - **Sport pre-match**: toggle OFF (GTC) - rimane nel book fino a inizio partita
  - **Mercati lunghi (binary settimanali, multi-outcome con date future)**: toggle OFF (GTC) di default
  - **Tutti gli altri**: toggle OFF (GTC) di default
- **Totale** in fondo: prezzo × azioni (USDC che spenderai se eseguito al limit)
- **Per vincere**: payout massimo = $1 × azioni - fee (con tooltip ⓘ)

#### Stile dei chip preset scadenza

- **Selezionato**: sfondo blu pieno (`#3b82f6`), testo bianco
- **Non selezionato**: outlined (bordo grigio chiaro), testo grigio scuro
- **Hover/tap**: leggera elevazione + bordo blu
- **Disabilitato** (es. preset `5m` su mercato che chiude tra 1 minuto): grigio chiaro, non cliccabile, tooltip "Il mercato chiude prima di questa scadenza"
- Layout: chip orizzontali scrollabili su mobile (tutti visibili su desktop)

### Info contestuale (sopra il bottone Trading)

Sempre visibile in entrambe le modalità:

**Saldo USDC disponibile**:
```
Saldo: $124.50
```
Mostra USDC reale o demo a seconda della modalità attiva. Aiuta l'utente a non spendere più di quanto ha.

**Banner Segnale Predimark** (se attivo per questo mercato):

In modalità Mercato (banner espanso):
```
┌─────────────────────────────────────┐
│ ✓ Segnale Predimark: BUY UP +14%   │
│   Confidence 72% · Final Period     │
│   [Vedi analisi completa →]         │
└─────────────────────────────────────┘
```

In modalità Limit (banner compatto):
```
┌─────────────────────────────────────┐
│ ✓ Segnale: BUY UP +14% [→]          │
└─────────────────────────────────────┘
```

Quando il segnale suggerisce il **side opposto** alla scelta utente:
```
┌─────────────────────────────────────┐
│ ⓘ Segnale suggerisce UP (opposto)  │
│   [Vedi perché →]                   │
└─────────────────────────────────────┘
```
- Colore beige/giallo soft (`#fbbf2415` background)
- Icona ⓘ neutra (NON ⚠️ allarme, NON ✗ rosso)
- Non blocca l'utente, solo informa

Quando NON c'è segnale attivo:
- Niente banner (lo spazio è libero per altro)

### Bottone CTA "Trading"

- Full-width
- Blu primario `#3b82f6`
- Testo bianco "Trading"
- Disabilitato se importo è 0 o saldo insufficiente
- Click → invia ordine, modal di conferma firma (Privy) → toast success/error
- Loading state durante submission con spinner

### Quick amounts dinamici (logica algoritmica)

Quando l'utente è in modalità Limit, i quick amounts shares cambiano dinamicamente in base al prezzo limit. Logica:

```
Total USDC stimato target (regola pollice): $50-200 con +N tap

Se prezzo limit = 50¢:
  +1000 azioni × 50¢ = $500 (esagerato per default)
  +200 azioni × 50¢ = $100 (ok)
  → Quick amounts: -100 -10 +10 +100 +1000 (1000 = "buy big")

Se prezzo limit = 97¢:
  +1000 azioni × 97¢ = $970 (esagerato)
  +200 azioni × 97¢ = $194 (ok)
  → Quick amounts: -100 -10 +10 +100 +200 (200 = "buy big")

Se prezzo limit = 5¢:
  +1000 azioni × 5¢ = $50 (ok ma piccolo)
  +5000 azioni × 5¢ = $250 (più sensato)
  → Quick amounts: -100 -10 +100 +1000 +5000 (5000 = "buy big")
```

Implementazione:
```typescript
function getQuickAmounts(priceLimitCents: number): number[] {
  const targetUSDC = 200; // dollari per "buy big" tap
  const bigAmount = Math.round(targetUSDC * 100 / priceLimitCents);
  // Round to nearest sensible number (100, 200, 500, 1000, 2000, 5000)
  const roundedBig = roundToSensible(bigAmount);
  return [-100, -10, +10, +100, roundedBig];
}
```

L'ultimo valore (`roundedBig`) ha highlight viola/blu nei nostri colori brand per indicare "buy big calibrato".

---

## LAYOUT 1 — Pagina evento BINARY

**Quando si usa**: per eventi con 1 solo market binario (Yes/No).

**Esempi reali**: "Will Trump win 2028?", "Will TikTok be banned by 2026?"

### Desktop

```
┌──────────────────────────────────────────────────────────┬──────────┐
│ Home > Politics > Elections > Trump 2028                 │          │
├──────────────────────────────────────────────────────────┤          │
│                                                           │ TRADE    │
│ HERO EVENTO                                               │ WIDGET   │
│ ┌──────────────────────────────────────────────────────┐ │ (sticky) │
│ │ [foto Trump] Will Trump win in 2028?     [share][🔖] │ │          │
│ │              Politics · Elections                     │ │ Compra ▼ │
│ │              $24.5M Vol · Closes Nov 5 2028          │ │ Mercato⇄ │
│ └──────────────────────────────────────────────────────┘ │          │
│                                                           │ [icon]   │
│ HERO PROBABILITY                                          │ Trump... │
│ ┌──────────────────────────────────────────────────────┐ │ [Yes ⟲]  │
│ │  62% Yes               38% No                         │ │          │
│ │  (verde, grande)       (rosso, grande)                │ │  - $5 +  │
│ └──────────────────────────────────────────────────────┘ │          │
│                                                           │ Vincere  │
│ CHART PROBABILITY STORIA                                  │ $9.42    │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ [linea Yes verde, linea No rossa]                    │ │ +$1 +$5  │
│ │ asse Y: 0-100%                                       │ │ +$10 +$  │
│ │ asse X: timeline (1m, 1w, 1y, all)                   │ │ Max      │
│ │ [tabs: 1H · 6H · 1D · 1W · 1M · ALL]                 │ │          │
│ └──────────────────────────────────────────────────────┘ │ Saldo:   │
│                                                           │ $124.50  │
│ BOTTONI TRADE INLINE                                      │          │
│ ┌──────────────────┐  ┌──────────────────┐               │ ✓ Signal │
│ │  Buy Yes 62¢     │  │  Buy No 38¢      │               │ BUY YES  │
│ │  (verde grande)  │  │  (rosso grande)  │               │ +14%     │
│ └──────────────────┘  └──────────────────┘               │          │
│                                                           │ [Trading]│
│ INFO TABS                                                 │          │
│ [Comments] [News] [Holders] [Rules] [Activity]           │ ─────    │
│                                                           │          │
│ [contenuto tab attivo]                                    │ 🎯       │
│                                                           │ SEGNALE  │
│                                                           │ ...      │
│                                                           │          │
│                                                           │ 🔥       │
│                                                           │ SENTIMENT│
│                                                           │ ...      │
│                                                           │          │
│                                                           │ ⭐ MERC. │
│                                                           │ CORREL.  │
│                                                           │ ...      │
└──────────────────────────────────────────────────────────┴──────────┘
```

### Mobile

```
┌─────────────────────────────────────┐
│ ← back · Politics > Trump 2028      │
├─────────────────────────────────────┤
│ HERO                                │
│ [foto] Will Trump win 2028?         │
│ Politics · Elections    [share][🔖] │
│ $24.5M Vol · Closes Nov 2028        │
├─────────────────────────────────────┤
│ HERO PROBABILITY                    │
│  62% Yes      38% No                │
│  (grandi)                            │
├─────────────────────────────────────┤
│ CHART PROBABILITY                    │
│ [linea storia + timeframe tabs]      │
├─────────────────────────────────────┤
│ BOTTONI TRADE                       │
│ ┌──────────┐  ┌──────────┐          │
│ │ Buy Yes  │  │ Buy No   │          │
│ │   62¢    │  │   38¢    │          │
│ └──────────┘  └──────────┘          │
├─────────────────────────────────────┤
│ 🎯 SEGNALE PREDIMARK                │
│ BUY YES · Edge +14% · 72%           │
│ [Vedi analisi]                       │
├─────────────────────────────────────┤
│ 🔥 SENTIMENT                        │
│ Volume oggi: $850k                  │
│ Trader unici: 234                   │
│ Holders Yes: 156 / No: 78           │
├─────────────────────────────────────┤
│ ⭐ MERCATI CORRELATI [▼ collapse]   │
├─────────────────────────────────────┤
│ INFO TABS                           │
│ [Comments] [News] [Holders] [Rules] │
│ [Activity]                           │
└─────────────────────────────────────┘

[Click su Buy Yes/No]
        ↓
[Bottom sheet trade widget sale dal basso]
```

### Elementi specifici Binary

- **Hero probability**: 2 numeri grandi (62% Yes verde, 38% No rosso) sopra il chart
- **Chart**: 2 linee (Yes verde, No rosso) sulla storia. Asse X timeframe selezionabile. Asse Y 0-100%.
- **Bottoni trade inline**: Yes/No grandi con prezzo share (es. "Buy Yes 62¢")
- **Auto-refresh**: nessuno (Pattern 1 e 2 NON applicabili a binary)

---

## LAYOUT 2 — Pagina evento MULTI-OUTCOME

**Quando si usa**: per eventi con N market mutuamente esclusivi.

**Esempi reali**: "Champions League winner" (32 squadre), "Quando finisce la guerra Iran-Israel?" (date), "AI lab con miglior modello" (Anthropic/OpenAI/Google/Meta)

### Layout principale (lista verticale outcome)

Ispirato direttamente al pattern Polymarket "Pace USA-Iran" che ti ho mostrato.

#### Desktop

```
┌──────────────────────────────────────────────────────────┬──────────┐
│ Home > Geopolitics > Diplomacy > Pace USA-Iran           │ TRADE    │
├──────────────────────────────────────────────────────────┤ WIDGET   │
│ HERO EVENTO                                               │ (sticky) │
│ [bandiere] Accordo di pace permanente USA-Iran entro...?│          │
│             Geopolitics · Diplomacy   [share][🔖]        │ ...      │
│             $53M Vol · 5 markets                          │          │
├──────────────────────────────────────────────────────────┤          │
│                                                           │          │
│ CHART PROBABILITY STORIA (multi-linea)                    │          │
│ [linee colorate per ogni outcome attivo]                  │          │
│ - 30 giugno (linea blu)                                   │          │
│ - 31 maggio (linea ciano)                                 │          │
│ - 30 aprile (linea arancione)                             │          │
│ etichette finali sui punti recenti                        │          │
│ [tabs: 1H · 6H · 1D · 1W · 1M · ALL]                     │          │
│                                                           │          │
├──────────────────────────────────────────────────────────┤          │
│                                                           │          │
│ LISTA OUTCOME                                             │          │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ 30 aprile                              3%            │ │          │
│ │ $16.4M Vol.                                          │ │          │
│ │ ┌──────────────────┐  ┌──────────────────┐          │ │          │
│ │ │ Compra Sì 3.4¢   │  │ Compra No 96.8¢  │          │ │          │
│ │ │ (verde tenue)    │  │ (rosso tenue)    │          │ │          │
│ │ └──────────────────┘  └──────────────────┘          │ │          │
│ └──────────────────────────────────────────────────────┘ │          │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ 31 maggio                             27%            │ │          │
│ │ $5.9M Vol.                                           │ │          │
│ │ ┌──────────────────┐  ┌──────────────────┐          │ │          │
│ │ │ Compra Sì 27¢    │  │ Compra No 74¢    │          │ │          │
│ │ └──────────────────┘  └──────────────────┘          │ │          │
│ └──────────────────────────────────────────────────────┘ │          │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ 30 giugno                             45%            │ │          │
│ │ $1.9M Vol.                                           │ │          │
│ │ ┌──────────────────┐  ┌──────────────────┐          │ │          │
│ │ │ Compra Sì 45¢    │  │ Compra No 56¢    │          │ │          │
│ │ └──────────────────┘  └──────────────────┘          │ │          │
│ └──────────────────────────────────────────────────────┘ │          │
│                                                           │          │
│ [View resolved ⌄] (espande lista outcome scaduti)        │          │
│                                                           │          │
├──────────────────────────────────────────────────────────┤          │
│ INFO TABS                                                 │          │
└──────────────────────────────────────────────────────────┴──────────┘
```

#### Mobile

```
┌─────────────────────────────────────┐
│ ← back · Geopolitics > Pace USA-Iran│
├─────────────────────────────────────┤
│ [bandiere] Accordo di pace          │
│ permanente USA-Iran entro...?       │
│ $53M Vol · 5 markets    [share][🔖] │
├─────────────────────────────────────┤
│ CHART (multi-linea)                  │
│ [linee colorate per outcome attivi]  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 30 aprile                  3%   │ │
│ │ $16.4M Vol.                     │ │
│ │ [Compra Sì 3.4¢][Compra No 97¢] │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 31 maggio                 27%   │ │
│ │ $5.9M Vol.                      │ │
│ │ [Compra Sì 27¢] [Compra No 74¢] │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 30 giugno                 45%   │ │
│ │ [Compra Sì 45¢] [Compra No 56¢] │ │
│ └─────────────────────────────────┘ │
│ [View resolved ⌄]                   │
├─────────────────────────────────────┤
│ 🎯 SEGNALE PREDIMARK                │
│ 🔥 SENTIMENT                        │
│ ⭐ MERCATI CORRELATI [▼]            │
│ [Tabs info]                         │
└─────────────────────────────────────┘
```

### Elementi specifici Multi-outcome

- **Lista outcome verticale**: ogni outcome è una "card-row" con nome + volume + percentuale + 2 bottoni Sì/No
- **Percentuale grande** a destra del nome (font 24-32px)
- **Volume per outcome** sotto il nome (font 12-14px grigio)
- **2 bottoni full-width** sotto: "Compra Sì X¢" e "Compra No Y¢" con prezzo share dinamico
- **Pattern 2 di refresh**: outcome risolti scompaiono automaticamente, quelli rimasti si riordinano. Click su "View resolved" mostra storico.
- **Chart multi-linea**: una linea per ogni outcome attivo. Etichette finali sui punti recenti per identificarli.
- **Niente data nel footer hero** (la data è dentro ogni outcome)

### Variante: outcome con date come outcome

È **lo stesso layout** (non un layout separato). Solo il contenuto degli outcome è diverso:
- Outcome nominali: "Real Madrid", "Manchester City", ...
- Outcome date: "30 aprile", "31 maggio", "30 giugno", ...

Il pattern è identico. Anzi, l'esempio sopra (Pace USA-Iran) usa proprio le date.

---

## LAYOUT 3 — Pagina evento MULTI-STRIKE

**Quando si usa**: per eventi con N market di soglia prezzo.

**Esempi reali**: "BTC max price in May 2026: ≥$100k, ≥$110k, ≥$120k...", "Recession 2026: GDP -1%, -2%, -3%..."

### Layout principale (ladder verticale soglie)

Pattern simile a Multi-outcome, ma con soglie ordinate **dalla più alta alla più bassa**.

#### Desktop e Mobile (struttura identica a Multi-outcome)

```
┌──────────────────────────────────────────────────────────┐
│ HERO                                                      │
│ [icona BTC] BTC max price May 2026                       │
│             Crypto · Price target  [share][🔖]           │
│             $4.2M Vol · 6 markets                         │
├──────────────────────────────────────────────────────────┤
│ CHART PRICE STORIA                                        │
│ [linea prezzo BTC + linee orizzontali tratteggiate per   │
│  ogni soglia (target line)]                               │
├──────────────────────────────────────────────────────────┤
│ LISTA SOGLIE (dalla più alta alla più bassa)              │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ≥ $130k                                3%            │ │
│ │ $0.5M Vol.                                           │ │
│ │ [Compra Sì 3¢]   [Compra No 97¢]                    │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ≥ $120k                                8%            │ │
│ │ $1.2M Vol.                                           │ │
│ │ [Compra Sì 8¢]   [Compra No 92¢]                    │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ≥ $110k                       32%   ← currently      │ │
│ │ $1.8M Vol.                                           │ │
│ │ [Compra Sì 32¢]  [Compra No 68¢]                    │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ≥ $100k                               78%            │ │
│ │ $1.0M Vol.                                           │ │
│ │ [Compra Sì 78¢]  [Compra No 22¢]                    │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                            │
│ [View resolved ⌄]                                         │
└──────────────────────────────────────────────────────────┘
```

### Elementi specifici Multi-strike

- **Soglie ordinate dalla più alta alla più bassa** (visivamente: chi vuole "scommettere alto" sta in cima)
- **Indicatore "← currently"** sulla soglia attuale (corrisponde al prezzo BTC live)
- **Chart con linee target**: oltre alla linea storia prezzo, mostra le soglie come linee orizzontali tratteggiate
- **Pattern 2 di refresh**: quando il prezzo BTC supera/scende sotto una soglia, l'indicatore "currently" si sposta dinamicamente
- **Chart timeframes**: 1H · 6H · 1D · 1W · 1M · ALL come binary

---

## LAYOUT 4 — Pagina evento H2H SPORT

**Quando si usa**: per eventi sport tra 2 (o più) team con N market interni (moneyline, spread, totals, props).

**Esempi reali**: "Pistons vs Magic" (NBA), "Italy vs France" (calcio), "Lakers vs OKC"

### Hub Sport intermedio (`/sport`)

PRIMA di arrivare alla pagina evento, l'utente passa per l'**Hub Sport** (se viene da nav o esplora). L'hub è una pagina aggregatrice per categoria sport.

#### Layout Hub Sport mobile

```
┌─────────────────────────────────────┐
│ HEADER GLOBALE                      │
├─────────────────────────────────────┤
│ NAV TABS GLOBALI (Sport selezionato)│
├─────────────────────────────────────┤
│ SUB-NAV SPORT                       │
│ [Live · NBA · UCL · NHL · UFC ...]  │
├─────────────────────────────────────┤
│ Sport live          [🔍] [⚙ filter]│
├─────────────────────────────────────┤
│ NBA                                 │
│ ┌─────────────────────────────────┐ │
│ │ ●LIVE · Q3-09:44 · $3.89M Vol  │ │
│ │ DET 58 · Pistons (60-22)       │ │
│ │ ORL 69 · Magic (45-37)         │ │
│ │ [DET 47¢]    [ORL 54¢]         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 21:30 · $1.72M Vol              │ │
│ │ OKC · Thunder (64-18)           │ │
│ │ PHX · Suns (45-37)              │ │
│ │ [OKC 78¢]    [PHX 23¢]          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ LIGUE 1                             │
│ ┌─────────────────────────────────┐ │
│ │ ●LIVE · 2H-78 · $2.27M Vol     │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Sub-nav Sport

```
[Live] [NBA] [UCL] [NHL] [UFC] [EPL] [La Liga] [Serie A] [F1] [Tennis] [Altro]
```

- "Live": tutti gli eventi sport in corso al momento (cross-lega)
- "NBA", "UCL", "NHL", "UFC": filtro per lega specifica
- "Altro": apre drawer con tutte le altre leghe disponibili (drawer simile a hamburger)

#### Card sport nell'Hub

Ogni card mostra:
- **Status**: ●LIVE Q3-09:44 oppure orario futuro (21:30) oppure FINAL
- **Volume** $X.XXM Vol.
- **2 team affiancati**:
  - Score live (per LIVE) o vuoto (per pre-match)
  - Logo team con sigla colorata
  - Nome team
  - Record stagione (es. 60-22 = 60 vittorie, 22 sconfitte)
- **2 bottoni** moneyline con prezzo share (es. "DET 47¢" / "ORL 54¢")
- Click sulla card (non sui bottoni) → naviga a pagina evento sport
- Click sui bottoni → apre bottom sheet trade widget pre-selezionato

### Pagina evento H2H Sport (dopo aver cliccato la card)

#### Desktop

```
┌──────────────────────────────────────────────────────────┬──────────┐
│ Home > Sport > NBA > Pistons vs Magic                    │ TRADE    │
├──────────────────────────────────────────────────────────┤ WIDGET   │
│ HERO MATCH                                                │ (sticky) │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ [logo DET]      54  -  61      [logo ORL]            │ │ ...      │
│ │   Pistons      LIVE ● HT       Magic                 │ │          │
│ │ $3.88M Vol.                          Polymarket logo │ │          │
│ └──────────────────────────────────────────────────────┘ │          │
│                                                           │          │
│ CHART PROBABILITY STORIA (multi-linea)                    │          │
│ [linea Pistons rosso, linea Magic blu]                   │          │
│ etichette: Magic 54%, Pistons 47%                         │          │
│ annotazioni laterali "+$20", "+$2", "+$1188", "+$420"    │          │
│ (whale trade highlight su grafico)                        │          │
│ [timeframes: 1H · 1D · 1W · ALL]                         │          │
│                                                           │          │
├──────────────────────────────────────────────────────────┤          │
│ SUB-TABS MERCATI                                          │          │
│ [Linee partita] · 1° tempo · Punti · Assist · Rimbalzi   │          │
├──────────────────────────────────────────────────────────┤          │
│ MERCATO MONEYLINE                                         │          │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ Moneyline                                             │ │          │
│ │ $3M Vol.                                              │ │          │
│ │ ┌──────────────────┐  ┌──────────────────┐           │ │          │
│ │ │ DET 47¢ (rosso)  │  │ ORL 54¢ (blu)    │           │ │          │
│ │ └──────────────────┘  └──────────────────┘           │ │          │
│ └──────────────────────────────────────────────────────┘ │          │
│                                                           │          │
│ MERCATO SPREAD                                            │          │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ Spread                                                │ │          │
│ │ $348K Vol.                                            │ │          │
│ │ ┌────────────────┐  ┌────────────────┐               │ │          │
│ │ │ DET -2.5 31.8¢ │  │ ORL +2.5 70.3¢ │               │ │          │
│ │ └────────────────┘  └────────────────┘               │ │          │
│ │                                                       │ │          │
│ │ Slider: 5.5  4.5  3.5  1.5  1.5  ▼2.5  3.5          │ │          │
│ │ (selettore valore spread)                             │ │          │
│ └──────────────────────────────────────────────────────┘ │          │
│                                                           │          │
│ MERCATO TOTALI                                            │          │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ Totali                                                │ │          │
│ │ $525K Vol.                                            │ │          │
│ │ ┌────────────────┐  ┌────────────────┐               │ │          │
│ │ │ O 215.5  98¢   │  │ U 215.5  19¢   │               │ │          │
│ │ └────────────────┘  └────────────────┘               │ │          │
│ │                                                       │ │          │
│ │ Slider: 209.5  213.5  214.5  ▼215.5  216.5          │ │          │
│ │ (selettore valore totali)                             │ │          │
│ └──────────────────────────────────────────────────────┘ │          │
│                                                           │          │
├──────────────────────────────────────────────────────────┤          │
│ REGOLE / CONTESTO MERCATO                                 │          │
│ [Regole] [Contesto del mercato]                          │          │
│                                                           │          │
│ Testo: "In the upcoming NBA game, scheduled for...       │          │
│ If the Pistons win, the market will resolve to..."       │          │
│                                                           │          │
├──────────────────────────────────────────────────────────┤          │
│ INFO TABS                                                 │          │
│ [Comments] [News] [Holders] [Rules] [Activity]           │          │
└──────────────────────────────────────────────────────────┴──────────┘
```

#### Mobile

```
┌─────────────────────────────────────┐
│ ← back · Sport > NBA > Pistons-Magic│
├─────────────────────────────────────┤
│ HERO MATCH                          │
│ [logo DET]   54-61   [logo ORL]    │
│  Pistons   LIVE ● HT   Magic        │
│ $3.88M Vol.                         │
├─────────────────────────────────────┤
│ CHART (multi-linea Pistons/Magic)   │
│ [timeframes]                         │
├─────────────────────────────────────┤
│ SUB-TABS MERCATI                    │
│ [Linee · 1°T · Punti · Assist ...]  │
├─────────────────────────────────────┤
│ MONEYLINE                            │
│ [DET 47¢]    [ORL 54¢]              │
├─────────────────────────────────────┤
│ SPREAD                               │
│ [DET -2.5 31.8¢] [ORL +2.5 70.3¢]   │
│ Slider: ...▼2.5...                  │
├─────────────────────────────────────┤
│ TOTALI                               │
│ [O 215.5 98¢] [U 215.5 19¢]         │
│ Slider: ...▼215.5...                │
├─────────────────────────────────────┤
│ REGOLE / CONTESTO                   │
│ [Regole] [Contesto]                 │
├─────────────────────────────────────┤
│ 🎯 SEGNALE                          │
│ 🔥 SENTIMENT                        │
│ ⭐ CORRELATI                        │
│ Tabs info                            │
└─────────────────────────────────────┘
```

### Elementi specifici H2H Sport

- **Hero match**: logo team affiancati + score live + nome team + status (LIVE ● HT / FINAL / 21:30)
- **Chart prob multi-linea** con annotazioni di trade (es. "+$20" sui movimenti grandi)
- **Sub-tabs mercati**: Linee partita / 1° tempo / Punti / Assist / Rimbalzi (varia per sport — calcio ha "Cartellini", "Corner", ecc.)
- **N mercati interni**:
  - **Moneyline**: chi vince (2 bottoni team + draw se applicabile)
  - **Spread**: chi vince con handicap (slider per scegliere il valore handicap)
  - **Totali**: punti totali Over/Under (slider per scegliere il valore O/U)
  - **Props**: punti del singolo giocatore, assist, rimbalzi (varia per sport)
- **Slider**: per spread e totals, selettore numerico orizzontale che permette di scegliere il valore handicap/total tra le opzioni disponibili
- **Sezione Regole/Contesto**: tabs Regole + Contesto mercato (testo statico spiegazione)
- **3 bottoni se draw applicabile** (es. soccer): Team1 / DRAW / Team2

---

## LAYOUT 5 — Pagina evento CRYPTO UP/DOWN

**Quando si usa**: per round crypto brevi (5m, 15m, 1h, 1d) Up/Down rispetto a un prezzo di riferimento.

**Esempi reali**: "BTC su o giù 5m", "ETH up or down 15m", "SOL up or down hourly"

### Desktop

```
┌──────────────────────────────────────────────────────────┬──────────┐
│ Home > Crypto > Bitcoin > BTC su o giù 5m                │ TRADE    │
├──────────────────────────────────────────────────────────┤ WIDGET   │
│ HERO ROUND                                                │ (sticky) │
│ ┌──────────────────────────────────────────────────────┐ │          │
│ │ [icona BTC] BTC su o giù 5m              ●Live >     │ │ Compra ▼ │
│ │             apr 25, 14:50-14:55 ET                   │ │ Mercato⇄ │
│ │             [share][🔖]                              │ │          │
│ │                                                        │ │ [icon]   │
│ │ Prezzo da battere: $77.328,17                        │ │ BTC...   │
│ │ Prezzo attuale:    $77.331  ▲ +$3 (+0.004%)          │ │ [Up ⟲]   │
│ │                                                        │ │          │
│ │ ⏱ Round termina in 02:11                             │ │ - $5 +   │
│ └──────────────────────────────────────────────────────┘ │ ...      │
│                                                           │          │
│ CHART PRICE LIVE                                          │ +$1 +$5  │
│ ┌──────────────────────────────────────────────────────┐ │ Max      │
│ │ [linea arancione prezzo BTC live]                    │ │          │
│ │ [linea tratteggiata orizzontale = target]            │ │ Saldo:   │
│ │ [pill grigia "Target" sulla linea tratteggiata]      │ │ $124.50  │
│ │ Asse Y: $77,320 · $77,330 · $77,340                  │ │          │
│ │                                                        │ │ ✓ Signal │
│ │ Tabs grafico: [Candele] [Linea] [Heikin Ashi]        │ │ BUY UP   │
│ │ Tabs timeframe: [1m] [5m] [15m]                       │ │ +14%     │
│ │                                                        │ │          │
│ │ Indicatori toggle: [⚙]                                │ │ [Trading]│
│ │  - RSI                                                │ │          │
│ │  - MACD                                               │ │ ─────    │
│ │  - VWAP                                               │ │          │
│ │  - Heiken Ashi (se Linea: aggiunge candele HA)       │ │ 🎯       │
│ └──────────────────────────────────────────────────────┘ │ SEGNALE  │
│                                                           │ ...      │
├──────────────────────────────────────────────────────────┤          │
│ BOTTONI TRADE                                             │ 🔥       │
│ ┌──────────────────┐  ┌──────────────────┐               │ SENTIMENT│
│ │ Up 1¢ (verde     │  │ Down 99¢ (rosso  │               │ ...      │
│ │ grande)          │  │ grande)          │               │          │
│ └──────────────────┘  └──────────────────┘               │ ⭐ CORR. │
│                                                           │ ...      │
├──────────────────────────────────────────────────────────┤          │
│ ROUND NAVIGATION                                          │          │
│ [< Round 4520 (closed)] [Round 4521 LIVE] [Round 4522 >] │          │
├──────────────────────────────────────────────────────────┤          │
│ INFO TABS                                                 │          │
│ [Comments] [News] [Holders] [Rules] [Activity]           │          │
└──────────────────────────────────────────────────────────┴──────────┘
```

### Mobile

```
┌─────────────────────────────────────┐
│ ← back · Crypto > BTC su o giù 5m   │
├─────────────────────────────────────┤
│ HERO ROUND                          │
│ [BTC] BTC su o giù 5m   ●Live >    │
│ apr 25, 14:50-14:55 ET              │
│                                      │
│ Prezzo da battere $77.328,17         │
│ Prezzo attuale   $77.331 ▲ +$3      │
│                                      │
│ ⏱ Round termina in 02:11            │
│                                      │
│ [share][🔖]                          │
├─────────────────────────────────────┤
│ CHART                                │
│ [linea prezzo + target tratteggiato] │
│ [tabs: Candele/Linea/Heikin]         │
│ [tabs: 1m/5m/15m]                    │
│ [⚙ Indicatori: RSI/MACD/VWAP]        │
├─────────────────────────────────────┤
│ BOTTONI TRADE                       │
│ ┌──────────┐  ┌──────────┐          │
│ │ Up 1¢    │  │ Down 99¢ │          │
│ └──────────┘  └──────────┘          │
├─────────────────────────────────────┤
│ ROUND NAVIGATION                    │
│ [< 4520] [4521 LIVE] [4522 >]       │
├─────────────────────────────────────┤
│ 🎯 SEGNALE PREDIMARK                │
│ Direzione: BUY UP                   │
│ Edge +14% · Confidence 72%          │
│ Strategia: Final Period Momentum    │
│ Win rate storico: 68% (234 trade)   │
│ [Vedi analisi]                       │
├─────────────────────────────────────┤
│ 🔥 SENTIMENT                        │
│ Volume round: $850k                 │
│ ...                                  │
├─────────────────────────────────────┤
│ ⭐ CORRELATI [▼ collapse]           │
├─────────────────────────────────────┤
│ INFO TABS                           │
└─────────────────────────────────────┘

[Click Up/Down]
        ↓
[Bottom sheet trade widget]
```

### Elementi specifici Crypto Up/Down

- **Hero round**: logo coin + titolo + orario round (es. "apr 25, 14:50-14:55 ET")
- **Chip "● Live >"** in alto destra che porta a un feed live esterno (TradingView, fonte Chainlink/Binance)
- **Prezzo da battere** prominente (prezzo all'apertura del round)
- **Prezzo attuale** + delta (verde se sopra, rosso se sotto)
- **Countdown** prominente (rosso se <30s, normale altrimenti)
- **Chart price live**:
  - Linea arancione del prezzo coin in tempo reale
  - Linea tratteggiata orizzontale = target (prezzo da battere)
  - Pill "Target" sulla linea tratteggiata
  - Tabs grafico: Candele / Linea / Heiken Ashi
  - Tabs timeframe: 1m / 5m / 15m
  - **Toggle indicatori tecnici** (apre dropdown):
    - RSI
    - MACD
    - VWAP
    - Bollinger Bands (opzionale)
    - EMA crossover (opzionale)
- **Bottoni trade**: "Up X¢" verde / "Down Y¢" rosso, grandi
- **Round navigation**: 3 chip orizzontali per navigare tra round adiacenti:
  - `[< Round 4520 (closed)]` = round precedente, già risolto, click apre pagina evento di quel round storico
  - `[Round 4521 LIVE]` = round corrente attivo (highlighted)
  - `[Round 4522 >]` = round successivo non ancora aperto, disabilitato finché non parte
- **Pattern 1 di refresh**: quando il round LIVE si chiude, la pagina si aggiorna automaticamente al round successivo che diventa LIVE (rotazione progressiva)
- **Indicatori tecnici on/off**: l'utente sceglie quali indicatori sovrapporre al grafico. Stato salvato in localStorage per coerenza tra round.

### Distinzione Indicatori vs Segnale Predimark

Importante chiarire (come avevamo discusso):

- **Indicatori tecnici** (RSI/MACD/VWAP/Heiken Ashi): sono **dati grezzi calcolati matematicamente** dal prezzo. L'utente li interpreta da solo. Stile TradingView/Binance Pro.
- **Segnale Predimark**: è un **consiglio finale automatico** generato dal nostro algoritmo. Combina indicatori + dati storici + backtest + altri input. Output: "BUY UP +14% Edge".

Sono complementari:
- Trader esperti vedono indicatori + segnale e fanno la loro valutazione
- Trader normali guardano solo il segnale e decidono
- Stessa pagina, due strumenti che si completano

Visivamente sono in **zone diverse**:
- Indicatori: dentro/sopra il chart (toggle)
- Segnale Predimark: card laterale (sidebar desktop) o sezione dedicata (mobile sotto bottoni)

---

## ESPANSIONE INLINE OUTCOME E LIBRO ORDINI

> **Nota architetturale importante**: la Pagina evento è l'unica deep view per evento e singolo market. NON esiste una pagina `/market/[id]` separata. La funzionalità "single market deep view" (libro ordini, dettagli specifici) è realizzata tramite **espansione inline accordion** dentro questa pagina. Pattern ispirato a Polymarket reale.

### Pattern accordion outcome (per Multi-outcome e Multi-strike)

Quando l'evento contiene N outcome (multi-outcome o multi-strike), la lista outcome funziona come **accordion**:

#### Stato compatto (default)

```
┌──────────────────────────────────────────────────────┐
│ 30 aprile                              3%            │
│ $16.4M Vol.                                          │
│ ┌──────────────────┐  ┌──────────────────┐          │
│ │ Compra Sì 3.4¢   │  │ Compra No 96.8¢  │          │
│ └──────────────────┘  └──────────────────┘          │
└──────────────────────────────────────────────────────┘
```

#### Stato espanso (dopo click sull'outcome)

```
┌──────────────────────────────────────────────────────┐
│ 30 aprile                              3%            │
│ $16.4M Vol.                                          │
│ ┌──────────────────┐  ┌──────────────────┐          │
│ │ Compra Sì 3.4¢   │  │ Compra No 96.8¢  │          │
│ └──────────────────┘  └──────────────────┘          │
│                                                       │
│ LIBRO ORDINI                              [+Rewards] │
│ [Fai trading su Sì] · Fai trading su No              │
│                                                       │
│ TRADE SÌ                                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │           PREZZO     AZIONI      TOTALE         │ │
│ │           4,2¢       687,75      $251,65        │ │
│ │           4,1¢       1235,70     $222,76        │ │
│ │           4,0¢       237,25      $172,10        │ │
│ │ Vendite                                          │ │
│ │           3,4¢       4782,76     $162,61        │ │
│ │           ─── Ultimo: 3,6¢ · Spread: 0,1¢ ───   │ │
│ │ Acquisti                                         │ │
│ │           3,3¢       398,00      $13,13         │ │
│ │           3,1¢       2015,22     $75,60         │ │
│ │           3,0¢       5639,25     $244,78        │ │
│ │           2,9¢       2200,00     $308,58        │ │
│ └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Comportamento accordion

- **Default**: tutti gli outcome compatti, niente libro ordini visibile
- **Click sul nome outcome o sulla riga** (NON sui bottoni Sì/No): espande l'outcome cliccato, mostrando libro ordini sotto
- **Click sui bottoni Sì/No**: NON espande l'outcome, apre/aggiorna il trade widget pre-compilato (sidebar desktop o bottom sheet mobile)
- **Click su un altro outcome quando uno è già espanso**: l'outcome precedente si chiude (accordion: solo uno aperto alla volta), il nuovo si apre
- **Click di nuovo sull'outcome aperto**: si chiude (toggle)
- **Animazione**: smooth transition 200ms ease-out per espansione/contrazione

### Pattern per Binary (1 solo market)

Quando l'evento contiene **1 solo market** (binary), il libro ordini è **auto-espanso** (perché non c'è ambiguità su quale market guardare). Esempio: "BTC su o giù 5m" mostra direttamente il libro ordini sotto il chart.

```
HERO + CHART + BOTTONI Up/Down
─────────────────────────────────
LIBRO ORDINI (sempre visibile, no accordion)
[Fai trading su Up] · Fai trading su Down
TRADE UP / TRADE DOWN tabella
─────────────────────────────────
REGOLE / CONTESTO
TABS COMMENTI / DETENTORI / POSIZIONI / ATTIVITÀ
```

### Pattern per H2H Sport

Per eventi sport, il libro ordini è auto-espanso **solo per il market attivo nelle tabs intermedie** (Moneyline / Spread / Totali / Punti / Assist / Rimbalzi). Click su un tab cambia quale market è espanso.

### Layout libro ordini (dettaglio)

Pattern stile exchange (Binance, Coinbase, ecc.) ma semplificato:

```
LIBRO ORDINI                                     [+ Rewards] [↻]
[Fai trading su YES (selezionato)] · Fai trading su NO

TRADE YES                          [icona ordina ⇕]
┌────────────────────────────────────────────────────────┐
│              PREZZO     AZIONI       TOTALE             │
│ ── Vendite (asks) — colore rosso ──                    │
│              68¢        403,70       $745,84            │
│              67¢        320,88       $471,32            │
│              66¢        196,45       $256,33            │
│ [Vendite] [highlight]   65¢          194,87             │
│              65¢        194,87       $126,67            │
│ ─── Ultimo: 65¢ · Spread: 1¢ ───                       │
│ [Acquisti]                                              │
│              64¢        276,53       $176,98            │
│              63¢         76,78       $225,35            │
│              62¢        256,83       $384,58            │
│              61¢        172,18       $489,61            │
│ ── Acquisti (bids) — colore verde ──                   │
└────────────────────────────────────────────────────────┘
```

#### Elementi del libro ordini

- **3 colonne**: PREZZO (in centesimi) / AZIONI (numero share) / TOTALE (USDC = prezzo × azioni)
- **Vendite (asks)** sopra in **rosso**, ordinate dal prezzo più alto al più basso (top of book = ultimo livello prima dello spread)
- **Spread** mostrato come riga di separazione: "Ultimo: X¢ · Spread: Y¢"
- **Acquisti (bids)** sotto in **verde**, ordinate dal prezzo più alto al più basso (top of book = primo livello dopo lo spread)
- **Visualizzazione massimo 4 livelli per side** (8 totali) di default. Bottone "Mostra di più" per espandere a 10/20.
- **Heatmap di sfondo**: i livelli con più volume hanno background più colorato (verde/rosso intenso) per visualizzare depth a colpo d'occhio
- **Click su un prezzo nel libro**: pre-compila il trade widget con quel prezzo come limit price (scorciatoia trader)

#### Tabs side filter sopra il libro ordini

```
[Fai trading su Sì] · Fai trading su No
```

Filtra il libro ordini per side:
- **"Fai trading su Sì"** (default): mostra book per chi vuole comprare Sì (asks/bids del side Yes)
- **"Fai trading su No"**: mostra book per chi vuole comprare No (asks/bids del side No)

Inverte la prospettiva. Per Polymarket binary, comprare Yes a 65¢ = comprare No a 35¢ (1¢ - spread). Il libro mostra solo il lato che interessa l'utente.

#### Header del libro ordini

```
LIBRO ORDINI                                  [+ Rewards] [↻]
```

- **+ Rewards**: link a programma rewards Polymarket (rebate maker per chi mette ordini limit). **Decisione Predimark V1**: NO rewards rebate al lancio (semplifica). In V1.5 valutiamo se aggiungere.
- **↻**: refresh manuale (in caso WebSocket abbia disconnesso)

### Real-time updates libro ordini

- WebSocket CLOB topic `book` per aggiornamento livelli
- Update animato: livelli che cambiano hanno flash 200ms (verde se sale, rosso se scende)
- Throttle: max 1 update/100ms per evitare flickering

---

## NAVIGATION TRA ROUND CRYPTO (auto-refresh)

Per i crypto round Up/Down, sotto il chart aggiungiamo una **navigation tra round storici** ispirata a Polymarket reale:

```
┌──────────────────────────────────────────────────────┐
│ Passato · [● ● ●] · 13:05 · 13:10 · 13:15 · 13:20 · More │
└──────────────────────────────────────────────────────┘
```

### Elementi della navigation

- **Pallini colorati** (sopra gli orari): esito di ogni round storico
  - **● Verde** = Up vinto (prezzo finale > prezzo da battere)
  - **● Rosso** = Down vinto (prezzo finale < prezzo da battere)
  - **● Grigio** = round corrente in corso
- **Orari** (es. 13:05, 13:10, 13:15, 13:20): inizio di ogni round storico
- **Round corrente** evidenziato in box bianco/blu sticky (es. il 13:25 LIVE)
- **More**: apre dropdown/modal con lista completa round storici (40-50 round indietro)

### Comportamento

- Click su un orario → la pagina si **aggiorna mostrando il chart e dati di quel round storico**
- URL cambia a `/event/btc-up-down-5m?round=2026-04-25-13-05`
- Se il round è già risolto: chart finale + esito + libro ordini "closed", nessun bottone trade
- Se cliccando "Live" o si torna al round attivo: si riattiva il flusso live normale

### Vantaggi vs il "Round navigation 3 chip" che avevo proposto

Il pattern Polymarket con pallini + orari è **molto più potente** del semplice "< Round 4520 / 4521 LIVE / 4522 >" che avevo proposto. Permette di:
- Vedere a colpo d'occhio il **trend recente** (verde/verde/rosso/verde/rosso = mix bilanciato)
- Saltare a un round specifico senza scorrere uno a uno
- Identificare pattern (es. "ultimi 5 round tutti Up = momentum bullish")

Lo adottiamo come pattern definitivo per Predimark V2.

---

## STATI DELLA PAGINA EVENTO

### Default (loggato, mercato aperto, dati live)
Layout completo con dati real-time via WebSocket.

### Loading (primo caricamento)
- Skeleton placeholder per hero, chart, lista outcome
- Caricamento progressivo

### Error (problema rete/API)
- Banner "Connessione interrotta, riprovo automaticamente..."
- Mostra ultimi dati cached
- Recovery silenzioso

### Mercato chiuso (closed/resolved)
- Hero mostra "RESOLVED" o "CLOSED"
- Esito mostrato chiaramente (es. "Yes won" verde grande / "No won" rosso grande)
- Bottoni trade disabilitati (grigi) con tooltip "Market resolved"
- Trade widget sostituito con riepilogo: "This market resolved on [data]. Winning side: [side]"
- Chart mostra l'intera storia fino alla risoluzione
- Sidebar mantiene Sentiment + Correlati (per esplorazione)

### Geo-blocked
- Banner persistente "Trading not available in your region"
- Bottoni Trade tooltip "Available in Demo only"
- Sidebar trade widget sostituito con CTA "Try Demo Mode"
- Tutto il resto consultabile (chart, comments, news, ecc.)

### Non loggato (visitatore)
- Tutto identico al loggato
- Click su bottoni Trade → dialog signup
- Bet Slip e Trade Widget chiedono login al primo trade
- Sidebar mostra Trade Widget visualizzabile ma azione bloccata

### Modalità Demo
- Banner persistente "Modalità Demo"
- Saldo visualizzato è virtuale (paper money)
- Tutto funzionante, ordini in demo store separato
- Trade in demo NON contribuiscono al volume del mercato real

---

## COMPORTAMENTI INTERATTIVI

### Real-time updates

Aggiornamenti via WebSocket per:
- **Prezzi share** (CLOB `price_change`): aggiornamento bottoni Yes/No/Up/Down/Team
- **Chart price storia**: aggiornamento linea live (per crypto round, ogni secondo)
- **Score live sport**: WebSocket Sport WS
- **Volume**: polling 15s
- **Comments**: WebSocket per nuovi commenti
- **Activity**: WebSocket per nuovi trade
- **Sentiment**: polling 30s

### Click su bottoni Trade

Desktop:
- Click su bottone Yes/No/Up/Down/Team → il **side viene pre-selezionato** nel widget sidebar
- Se modalità Mercato attiva: importo focus, l'utente digita
- Se modalità Limite attiva: prezzo limit focus

Mobile:
- Click su bottone Yes/No/Up/Down/Team → **bottom sheet sale dal basso** con widget pre-compilato
- Pagina dietro oscurata (ma countdown, prezzo live, chart restano leggibili sopra)
- Swipe down chiude il bottom sheet

### Switch outcome dentro il widget

Click sull'icona `⟲` accanto al chip outcome:
- Apre selector con tutti gli outcome disponibili
- L'utente sceglie un outcome diverso senza chiudere widget
- Importo/prezzo si resetta automaticamente

### Tabs intermediate (H2H Sport)

Click su un tab (es. "Punti"):
- Cambia il contenuto della sezione mercati
- Mostra solo i mercati di quel tipo
- Trade widget si aggiorna se ha un side selezionato di un altro tab

### Round navigation (Crypto Up/Down)

Click su `[< Round 4520]`:
- Naviga alla pagina del round precedente (closed/resolved)
- Mostra esito (Up won / Down won) e chart finale
- Trade widget mostra "This round is closed" + bottone "Go to LIVE round"

Click su `[Round 4522 >]` (futuro):
- Bottone disabilitato finché non parte
- Quando parte (es. countdown attivo precedente arriva a 0): si attiva automaticamente

### Pattern 1 auto-refresh (Crypto Round)

Quando l'utente è sulla pagina del round 4521 LIVE e il countdown arriva a 0:
- Il mercato si risolve (Up won o Down won)
- Toast notification: "Round 4521 ended! Up won. Round 4522 is now LIVE."
- Pagina si aggiorna automaticamente al **round 4522** (nuovo LIVE)
- URL cambia a `/event/btc-up-down-5m-round-4522`
- Chart, prezzo da battere, countdown si resettano al nuovo round
- Trade widget mantiene il side selezionato dell'utente (Up rimane Up nel nuovo round)

### Pattern 2 promozione outcome (Multi-outcome con date, Multi-strike)

Quando un outcome dentro l'evento si risolve:
- L'outcome scompare dalla lista visibile
- Gli altri outcome si riordinano
- Toast notification (se l'utente è sulla pagina): "Outcome [nome] resolved as [Yes/No]"
- Sezione "View resolved" mostra l'outcome scaduto

---

## DIFFERENZE DALLA HOME

La pagina evento è una **deep view** dell'evento. Differenze chiave dalla Home:

| Aspetto | Home | Pagina Evento |
|---|---|---|
| Vista | Lista di EventCard (compatte) | 1 evento espanso completamente |
| Trade | Bottone "+" → Bet Slip | Bottoni inline + widget sidebar/bottom sheet |
| Chart | Sparkline o niente | Chart completo storia |
| Comments | Niente | Tab dedicato |
| Holders | Niente | Tab dedicato |
| Rules | Niente | Tab dedicato |
| Sentiment | Sidebar minimale | Sidebar dettagliata |
| Indicatori tecnici | Niente | Sì (solo crypto round) |
| Round navigation | Niente | Sì (solo crypto round) |
| Sub-tabs mercati interni | Niente | Sì (solo H2H sport) |
| Slider spread/totali | Niente | Sì (solo H2H sport) |

---

## ACCESSIBILITÀ

- Bottoni trade hanno `aria-label` esplicito ("Buy Yes at 62 cents")
- Chart hanno descrizione testuale per screen reader
- Live indicator (●LIVE) ha `role="status"` con announcement
- Countdown ha announcement ogni minuto via `aria-live="polite"`
- Score live aggiornamenti via `aria-live="polite"` (non interrompe lettura)
- Tabs navigabili con frecce keyboard
- Bottom sheet mobile chiudibile con tasto ESC e swipe
- Toggle indicatori chart hanno `role="checkbox"` con stato

---

## NOTE TECNICHE PER COWORK

Quando costruirai la Pagina evento, ricorda:

### Componenti da costruire

- **EventPage**: contenitore polimorfo, switch su CardKind per renderizzare il layout giusto
- **TradeWidget**: componente unico con 2 modalità (Mercato/Limite), riusato in sidebar desktop e bottom sheet mobile
- **EventChart**: chart polimorfo, renderizza differente per CardKind (probability multi-linea per binary/multi-outcome, price live per crypto round, prob bilinea per h2h sport)
- **OutcomeRow**: componente per riga outcome multi-outcome/multi-strike (con bottoni Sì/No)
- **MarketSection**: componente per sezione mercato H2H sport (Moneyline/Spread/Totali) con slider opzionale
- **RoundNavigator**: 3-chip navigation per crypto round
- **InfoTabs**: tabs Comments/News/Holders/Rules/Activity
- **SignalBanner**: banner segnale Predimark (espanso/compatto/warning/none)
- **SentimentPanel**: sezione sentiment laterale
- **CorrelatedMarkets**: sezione mercati correlati laterale

### Dati e API

- **Eventi**: Gamma API `/events/[slug]` per metadata
- **Markets**: Gamma API `/markets?event_id=X` per market interni
- **Prezzi share**: CLOB API + WebSocket `price_change`
- **Storia probability**: CLOB API `/prices-history`
- **Prezzo live crypto**: WebSocket Polymarket RTDS topic `crypto_prices_chainlink` (5m/15m) o `crypto_prices` (1h/1d). Fallback Binance per check.
- **Sentiment**: Data API `/holders`, `/leaderboard`, `/trades`
- **Comments**: WebSocket comments topic
- **News**: API news interna (Gamma extension o nostra)
- **Activity**: WebSocket Polymarket RTDS topic `activity`

### Performance

- **Chart virtualizzato**: massimo 500 punti renderizzati alla volta
- **Lazy loading**: tabs Comments/News/Holders caricano solo quando attivi
- **Throttle WebSocket**: max 1 update/200ms per ogni componente live
- **Skeleton during loading**: tutti i componenti hanno stato skeleton

### Pattern UX da rispettare

- **Trade widget pattern unico** per tutti i CardKind (un componente, polimorfo)
- **Quick amounts dinamici** in modalità Limit (calcolati lato client)
- **Banner segnale**: 3 stati visivi (allineato/opposto/nessuno) + 2 size (espanso/compatto)
- **Pattern 1 e 2 di refresh** già definiti — applicarli correttamente
- **Bottom sheet mobile** con drag handle e swipe-to-close
- **Sidebar desktop sticky** con scroll interno

---

## RIFERIMENTI

- **Documento 1** — Vision & Product
- **Documento 2** — User Stories (US-013, US-014, US-015 specifici per pagina evento)
- **Documento 3** — Sitemap
- **Documento 4 — Pagina 1** — Home v2 (cui si collega questa pagina)
- **Documento 5** — Tech stack & Architettura (componenti tecnici)
- **Documento 8** — Design System (formalizzazione design tokens)

---

## PAGINE SUCCESSIVE

Documenti che verranno costruiti nelle prossime sessioni:

- ~~**Pagina 3** — Mercato deep view~~ **ELIMINATA** (funzionalità inclusa in Pagina 2 tramite espansione inline)
- **Pagina 3 (era 4)** — Profilo `/me` (dashboard + posizioni + history)
- ~~**Pagina 5** — Trade widget standalone~~ **ELIMINATA** (già documentato in Pagina 2)
- **Pagina 4 (era 6)** — Profilo creator `/creator/[username]`
- **Pagina 5 (era 7)** — Admin overview `/admin`
- **Pagina 6 (era 8)** — Signup + onboarding flow

**Totale pagine wireframe**: da 8 → 6 pagine (Home + Evento già fatte, restano 4)

---

*Fine Documento 4 — Wireframes — Pagina 2 (Pagina evento) v3*
*Continua con Pagina 3 (Profilo /me) nella sessione successiva*
