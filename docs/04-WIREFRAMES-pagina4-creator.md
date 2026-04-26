# Predimark V2 — Wireframes — Pagina 4 (Profilo creator)

> **Documento 4 di 10** — UX Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Pagina 4 (Profilo creator) completa
> Predecessori: Pagina 1 (Home) v2, Pagina 2 (Pagina evento) v3, Pagina 3 (Profilo /me) v1

---

## Cos'è questo documento

Questo documento descrive la **Pagina Profilo Creator** (`/creator/[username]`) e il pattern simile per i **Top Trader esterni Polymarket** (`/trader/[address]`).

Predimark adotta un'**architettura ibrida** dei creator/trader:
- **Verified Creators**: utenti opt-in al programma Predimark, profilo completo, copy trading con revenue share 30%
- **Top Traders Polymarket**: trader esterni monitorati via dati pubblici on-chain, profilo minimo, copy trading senza revenue al trader

Entrambi accessibili dalla **leaderboard ibrida** (descritta in Pagina 5).

---

## DECISIONE ARCHITETTURALE FONDAMENTALE

### Architettura ibrida creator + trader

| Aspetto | Verified Creator | Top Trader Polymarket |
|---|---|---|
| URL | `/creator/[username]` | `/trader/[address]` |
| Identità | Username + foto + bio | Address troncato (0x9d84...0306) o nickname Polymarket |
| Verifica | ✓ Verified badge | Nessun badge |
| Onboarding | Opt-in via `/creator/apply` | Automatico (dati pubblici on-chain) |
| Profilo | Completo: bio, social, score, achievements | Minimo: solo metriche on-chain |
| Copy trading | ✅ Sì, con revenue share 30% al creator | ✅ Sì, senza revenue al trader (è esterno) |
| Posizioni aperte | Pubbliche con delay 30 min | Sempre pubbliche (sono on-chain) |
| Trade history | Dettagliato pubblico | Dettagliato pubblico (on-chain) |
| Notifiche follow | Real-time push/email/Telegram | Polling on-chain (latency ~30s) |
| Score Predimark | Calcolato (87/100 visibile) | Score "External" o "Public Wallet" |
| Revenue share | 30% builder fee va al creator | 0% (trader esterno non sa) |
| Disclaimer | Nessuno | "Trader non partner Predimark" |

### Perché questa scelta

- **Cold start risolto**: lanciamo con classifica piena di Top Traders Polymarket dal day 1
- **Programma creator parallelo**: cresce nel tempo con qualità (revenue share incentiva opt-in)
- **Trasparenza etica**: disclaimer chiaro che esterni non sono partner
- **Rischio mitigato**: posizioni con delay 30 min anche su Verified evita front-running

---

## STRUTTURA DELLA SEZIONE /creator e /trader

```
/creator                        Landing page programma creator
├── /creator/apply              Form application
├── /creator/[username]         Profilo pubblico creator
│   ├── tab Overview (default)
│   ├── tab Posizioni
│   ├── tab History
│   ├── tab Stats
│   └── tab Comments

/creator/dashboard              Dashboard creator (auth, solo se opt-in)
├── /creator/dashboard/followers
├── /creator/dashboard/earnings
├── /creator/dashboard/stats
└── /creator/dashboard/settings

/trader/[address]               Profilo Top Trader esterno (Polymarket-only)
├── stesse tab del creator profile
└── disclaimer "External Trader" sempre visibile
```

---

## PAGINA `/creator/[username]` — Verified Creator Profile

### Layout Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER GLOBALE (uguale a Home)                                        │
├──────────────────────────────────────────────────────────────────────┤
│ NAV TABS GLOBALI                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ HERO PROFILO CREATOR                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  [foto avatar]    @theo4  ✓ Verified Creator                    │ │
│ │   80x80           Theodore Smith                                 │ │
│ │                   "Crypto trader · Sport fan · Politica nerd"   │ │
│ │                   📍 USA · 🌐 theo4.com · 𝕏 @theo4_eth          │ │
│ │                                                                  │ │
│ │   PREDIMARK SCORE: 87/100  🏆 Tier: Gold                        │ │
│ │                                                                  │ │
│ │   [ Follow ]  [ Start Copy Trading → ]    [Share] [Report]      │ │
│ │   (outlined)    (filled blue prominent)                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ METRICHE PRINCIPALI (cards)                                          │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐        │
│ │ P&L 30g      │ Win rate     │ Volume tot   │ Followers    │        │
│ │ +$2,430      │ 64%          │ $48,200      │ 487          │        │
│ │ +18.5% ▲     │ 312/487      │              │ +23 oggi     │        │
│ └──────────────┴──────────────┴──────────────┴──────────────┘        │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐        │
│ │ ROI medio    │ Sharpe ratio │ Drawdown max │ Specializ.   │        │
│ │ +6.2%        │ 2.18         │ -$340 (-7%)  │ Crypto · Sport│       │
│ └──────────────┴──────────────┴──────────────┴──────────────┘        │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ SUB-NAV CREATOR PROFILE                                              │
│ [Overview] · Positions · History · Stats · Comments                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ CONTENUTO TAB ATTIVO                                                  │
│                                                                       │
│ — Tab Overview (default) —                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ EQUITY CURVE                                                     │ │
│ │ [linea verde profitto cumulato 30 giorni]                       │ │
│ │ [tabs: 7g · 30g · 90g · 1y · ALL]                                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ POSIZIONI APERTE (top 5, con delay 30 min)                       │ │
│ │ [card 1: Trump 2028 · YES · $500 @ $0.62]                       │ │
│ │ [card 2: BTC 100k · YES · $200 @ $0.78]                         │ │
│ │ [card 3: Champions Inter · YES · $300 @ $0.32]                  │ │
│ │ [Vedi tutte →]                                                  │ │
│ │ ⓘ Posizioni mostrate con delay di 30 min                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ULTIMI TRADE CHIUSI (top 5 più recenti)                         │ │
│ │ [card 1: ✓ WIN · Trump 2024 · +$245]                            │ │
│ │ [card 2: ✓ WIN · BTC 75k · +$120]                               │ │
│ │ [card 3: ✗ LOSS · Lakers vs Boston · -$87]                      │ │
│ │ [Vedi tutto storico →]                                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ ACHIEVEMENTS                                                          │
│ 🏆 Top 100 Traders · 🏆 100k Volume · 🏆 6 Months Verified           │
│ 🏆 90 Day Streak · 🏆 Best ROI March 2026                            │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Mobile

```
┌─────────────────────────────────────┐
│ HEADER GLOBALE                      │
├─────────────────────────────────────┤
│ ← back                              │
├─────────────────────────────────────┤
│ HERO PROFILO                        │
│ [avatar 64]                         │
│ @theo4  ✓ Verified                  │
│ Theodore Smith                      │
│ "Crypto · Sport · Politica nerd"   │
│ 📍 USA  𝕏 @theo4_eth                │
│                                      │
│ SCORE: 87/100  🏆 Gold              │
│                                      │
│ [ Follow ]  [ Copy → ]              │
├─────────────────────────────────────┤
│ METRICHE (grid 2x4)                 │
│ P&L 30g   |  Win rate                │
│ +$2,430   |  64%                    │
│ ─────────────────                    │
│ Volume    |  Followers              │
│ $48,200   |  487                    │
│ ─────────────────                    │
│ ROI medio |  Sharpe                 │
│ +6.2%     |  2.18                   │
│ ─────────────────                    │
│ Drawdown  |  Spec.                  │
│ -$340     |  Crypto·Sport           │
├─────────────────────────────────────┤
│ SUB-NAV (scroll horizontal)         │
│ [Overview] Positions History ...    │
├─────────────────────────────────────┤
│ CONTENUTO TAB                       │
│ [Equity curve]                       │
│ [Posizioni aperte top 3]             │
│ [Ultimi trade top 3]                 │
│ [Achievements]                       │
├─────────────────────────────────────┤
│ Bottom navigation 5 voci             │
└─────────────────────────────────────┘
```

---

## HERO PROFILO CREATOR (componente chiave)

### Elementi sempre presenti

- **Foto avatar** (80x80 desktop, 64x64 mobile) — caricata dal creator
- **Username** `@theo4` (link copiabile)
- **Badge ✓ Verified Creator** (icona check blu Predimark)
- **Nome reale** (opzionale, scelta del creator)
- **Bio breve** (max 140 caratteri, scelta del creator)
- **Location** (📍 paese, opzionale)
- **Social links** (sito web, X/Twitter, Discord — opzionali)

### Score Predimark e Tier

```
PREDIMARK SCORE: 87/100  🏆 Tier: Gold
```

**Score 0-100** calcolato da algoritmo proprietario che combina:
- P&L cumulato (peso 25%)
- Win rate (peso 20%)
- Sharpe ratio (peso 20%)
- Calibration (peso 15%)
- Consistency over time (peso 10%)
- Community trust (followers, comments helpful — peso 10%)

**Tier**:
- 🏆 **Gold** (90-100): top elite
- 🥈 **Silver** (75-89): consolidated trader
- 🥉 **Bronze** (60-74): emerging trader
- ⭐ **Rising** (40-59): new creator with potential
- 📊 **Standard** (<40): trader normale

Tier mostrato come **icona colorata** accanto al numero. Tooltip explains: "Calcolo: P&L + Win rate + Sharpe + Calibration + Consistency + Community"

### Bottoni azione (5 stati)

#### Stato 1: Visitatore non loggato
```
[ Follow @theo4 ]    [ Start Copy Trading → ]
   (outlined)             (filled blue)
```
Click su qualsiasi → dialog "Crea account o accedi per usare questa funzione"

#### Stato 2: Loggato + creator NON opt-in copy
```
[ Follow @theo4 ]
   (filled blue)

ⓘ Questo creator non offre copy trading
```
Solo Follow visibile. Tooltip esplicativo.

#### Stato 3: Loggato + creator opt-in copy
```
[ Follow @theo4 ]    [ Start Copy Trading → ]
   (outlined)             (filled blue prominent)
```
Entrambi attivi.

#### Stato 4: Già segue
```
[ ✓ Following ]    [ Start Copy Trading → ]
   (success green)       (filled blue)
```
Follow diventa "Following" verde. Click → unfollow con dialog conferma.

#### Stato 5: Già fa copy (e segue)
```
[ ✓ Following ]    [ Manage Copy → ]
   (success green)       (outlined neutral)
```
"Manage Copy" → naviga a `/me/sessions` per gestire/revocare la session.

### Bottoni secondari (sempre)

- **Share**: copia link al profilo o condividi su Twitter/Telegram
- **Report**: segnala creator per comportamento sospetto (apre form admin)

---

## SUB-NAV CREATOR PROFILE

```
[Overview] · Positions · History · Stats · Comments
```

5 tabs per navigare il profilo. Stato attivo evidenziato (sottolineato + colore primario).

---

## TAB 1 — Overview (default)

### Contenuto

1. **Equity curve** (componente riusato da `/me/stats`):
   - Linea verde se profitto, rossa se perdita
   - Tabs timeframe: 7g · 30g · 90g · 1y · ALL
   - Tooltip su hover
   - **Privacy mode** (opzionale del creator): scale anonimizzata (mostra %, non $)

2. **Posizioni aperte top 5** (con delay 30 min):
   ```
   Posizioni aperte di @theo4
   ┌──────────────────────────────────────────────────┐
   │ [foto] Trump 2028 · YES                          │
   │        500 shares @ $0.62 = $310                 │
   │        P&L unrealized: +$60 (+24%) ▲             │
   │        Aperta 4 giorni fa                        │
   │        [Vai al market] [Copy this trade]         │
   └──────────────────────────────────────────────────┘
   [card 2, 3, 4, 5...]
   [Vedi tutte le posizioni →]

   ⓘ Posizioni mostrate con delay di 30 minuti
     per prevenire front-running. Iscriviti al copy
     trading per esecuzione istantanea.
   ```

3. **Ultimi trade chiusi top 5** (riusa pattern da `/me/history`):
   - Card con badge ✓ WIN o ✗ LOSS
   - Mercato + side + entrata + risoluzione + P&L

4. **Achievements** (badge sbloccati):
   - 🏆 Top 100 Traders
   - 🏆 100k Volume
   - 🏆 6 Months Verified
   - 🏆 90 Day Streak
   - 🏆 Best ROI March 2026

---

## TAB 2 — Positions

### Layout

```
┌──────────────────────────────────────────────────────┐
│ Posizioni aperte di @theo4 (12)                      │
│ Valore totale: $4,820 · P&L unrealized: +$340 ▲      │
│                                                       │
│ ⓘ Posizioni con delay 30 min                         │
├──────────────────────────────────────────────────────┤
│ Filtri: [Tutti] [Crypto] [Sport] [Politica] ...      │
│ Sort: [Aperta più recente ▼]                         │
├──────────────────────────────────────────────────────┤
│ LISTA POSIZIONI (verticale, dettagliata)             │
│ [card 1, 2, 3, ... 12]                               │
└──────────────────────────────────────────────────────┘
```

Stessa struttura di `/me/positions` ma:
- **Niente bottoni Sell/Trade** (sono posizioni del creator, non tue)
- **Bottone "Copy this trade"** su ogni card (replica il singolo trade sul tuo wallet)
- **Bottone "Vai al market"** per navigare alla pagina evento

---

## TAB 3 — History

### Layout

Stesso pattern di `/me/history`:
- Header con totali (profit cumulato, win rate, trade count)
- Filtri (Tutti/Vinti/Persi/Per categoria/Per periodo)
- Sort (più recenti, P&L, hold time)
- Lista verticale completa con badge WIN/LOSS

**Differenze**:
- Nessun "Export CSV" (privacy: solo lui può esportare i suoi)
- Card cliccabile → naviga al market (per vedere come è andata)

---

## TAB 4 — Stats

### Layout

Stesso pattern di `/me/stats` ma **pubblico**:
- 8 metriche cards (P&L, Win rate, ROI, Trade count, Volume, Drawdown, Sharpe, Best trade)
- Equity curve dettagliata
- P&L per categoria (bar chart)
- **Calibration curve pubblica** (differenziatore Predimark)
- Top 3 best/worst trade

**Differenze**:
- Periodo selezionabile: 7g/30g/90g/1y/all-time
- Niente dati privati (saldo USDC, dettagli wallet)

### Calibration curve pubblica

Il creator viene **valutato** dalla community in base a quanto è "calibrato":
- Linea sotto diagonale = sovrastima → meno credibilità su Yes
- Linea sopra diagonale = sottostima → più credibilità su Yes
- Linea sulla diagonale = ben calibrato → trader affidabile

**Brier score** mostrato pubblicamente come metrica di calibrazione (più basso = meglio).

---

## TAB 5 — Comments

### Layout

```
┌──────────────────────────────────────────────────────┐
│ Commenti di @theo4                                   │
├──────────────────────────────────────────────────────┤
│ Filtri: [Tutti] [Sui mercati] [Discussioni]          │
├──────────────────────────────────────────────────────┤
│ FEED COMMENTI (cronologico)                          │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Mercato: BTC su o giù 5m · 2h fa                 │ │
│ │ "I'm going Up — RSI oversold + last 3 rounds    │ │
│ │  were red, mean reversion incoming"              │ │
│ │ ❤ 23  💬 8 risposte                              │ │
│ │ [Vai al mercato →]                               │ │
│ └──────────────────────────────────────────────────┘ │
│ [card 2, 3, ...]                                     │
└──────────────────────────────────────────────────────┘
```

Feed cronologico di tutti i commenti pubblici lasciati dal creator sui mercati. Utile per:
- Capire il "thinking" del creator
- Vedere se la sua tesi convince
- Engagement community

---

## PAGINA `/trader/[address]` — Top Trader Polymarket esterno

### Differenze rispetto a `/creator/[username]`

```
┌──────────────────────────────────────────────────────────────────────┐
│ HERO TRADER ESTERNO                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  [generic icon]   0x9d84...0306                                 │ │
│ │                   Polymarket nickname (se esistente): "WhaleAI" │ │
│ │                   ⚠ Trader esterno · Non partner Predimark     │ │
│ │                                                                  │ │
│ │   PREDIMARK SCORE: External Wallet (no calibration interna)     │ │
│ │                                                                  │ │
│ │   [ Follow ]  [ Start Copy Trading → ]    [Share]               │ │
│ │   (outlined)    (filled blue with caution mark)                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Elementi sostituiti per Top Trader esterno

| Elemento | Verified Creator | Top Trader esterno |
|---|---|---|
| Avatar | Foto reale del creator | Icona generica (avatar gradient da hash address) |
| Nome | Username + nome reale | Address troncato (0x9d84...0306) + nickname Polymarket se esiste |
| Badge | ✓ Verified Creator | ⚠ External Trader |
| Bio | Bio scelta dal creator | Niente (esterno non ha profilo) |
| Social | Link sito/Twitter/Discord | Niente |
| Score Predimark | 87/100 + Tier Gold | "External Wallet" (no calibration interna) |
| Achievements | Sì (sbloccati su Predimark) | Niente |
| Comments tab | Sì | Niente (commenti sono solo per utenti Predimark) |
| Posizioni delay | 30 minuti (privacy creator) | Tempo reale (sono on-chain pubbliche da subito) |
| Notifiche follow | Real-time push/email/Telegram | Polling on-chain (latency ~30s) |

### Disclaimer prominente sempre visibile

In cima alla pagina, banner permanente:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠ Trader esterno · Dati pubblici Polymarket on-chain            │
│   Questo trader non è un partner Predimark.                     │
│   Non riceve revenue dal copy trading.                          │
│   La sua attività potrebbe interrompersi senza preavviso.       │
│   [Scopri di più →]                                              │
└─────────────────────────────────────────────────────────────────┘
```

Background giallo soft (non blu come info, non rosso come errore — è un warning informativo). Non chiudibile.

### Bottoni azione modificati

**Copy Trading button con caution mark**:
```
[ Start Copy Trading ⚠ → ]
```

Click apre dialog speciale:
```
┌────────────────────────────────────────────────────────────┐
│ Copy Trading External Trader                              │
├────────────────────────────────────────────────────────────┤
│ Stai per iniziare a copiare i trade di un trader esterno  │
│ che NON è un partner Predimark.                           │
│                                                            │
│ Cose da sapere:                                            │
│ • Il trader non sa di essere copiato                       │
│ • Il trader non riceve compensi                            │
│ • Il trader può smettere di tradare in qualsiasi momento   │
│ • I dati provengono da blockchain pubblica (Polygon)       │
│ • Nessuna SLA garantita                                    │
│                                                            │
│ Predimark prende:                                          │
│ • Builder fee 0.5% sui tuoi trade                          │
│ • Service fee 1% sui profitti realizzati                   │
│                                                            │
│ ☐ Ho letto e accetto                                       │
│                                                            │
│ [Cancel]  [Continue setup →]                              │
└────────────────────────────────────────────────────────────┘
```

L'utente deve **esplicitamente acknowledgare** prima di procedere. Niente sorprese.

### Tab disponibili per External Trader

```
[Overview] · Positions · History · Stats
```

**4 tabs invece di 5**: niente "Comments" tab (esterno non ha account Predimark, non lascia commenti).

---

## PAGINA `/creator` — Landing programma creator

### Layout

Pagina informativa per chi vuole **diventare Verified Creator**.

```
┌──────────────────────────────────────────────────────────────────────┐
│ HERO LANDING                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Diventa Verified Creator su Predimark                          │ │
│ │  Guadagna fino al 30% delle fee dai trader che ti copiano       │ │
│ │                                                                  │ │
│ │  [ Apply now → ]                                                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ COME FUNZIONA                                                         │
│ 1. Apri un account Predimark e tradi normalmente                     │
│ 2. Quando soddisfi i requisiti, applica al programma                 │
│ 3. Approvazione manuale dell'admin Predimark                         │
│ 4. Profilo verificato + badge ✓                                      │
│ 5. Altri utenti possono seguirti e copiarti                          │
│ 6. Guadagni 30% delle builder fee dai loro trade                     │
├──────────────────────────────────────────────────────────────────────┤
│ REQUISITI                                                             │
│ • Almeno 30 trade chiusi                                              │
│ • Almeno 30 giorni di attività                                        │
│ • ROI positivo nei 30 giorni                                          │
│ • Almeno $1,000 USDC volume tradato                                   │
│ • Compliance check (no comportamenti sospetti)                       │
├──────────────────────────────────────────────────────────────────────┤
│ TOP CREATOR ATTIVI (showcase)                                        │
│ [grid card 6-9 top creator con foto, score, P&L]                     │
│ [Vedi tutti →]                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ FAQ                                                                   │
│ • Quanto guadagno?                                                    │
│ • Come ricevo i pagamenti?                                            │
│ • Posso uscire dal programma?                                        │
│ • ...                                                                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## PAGINA `/creator/apply` — Form application

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ Diventa Verified Creator                                             │
├──────────────────────────────────────────────────────────────────────┤
│ STEP 1: Verifica requisiti                                           │
│                                                                       │
│ ✅ Trade chiusi: 47 (richiesti 30)                                   │
│ ✅ Giorni attivi: 65 (richiesti 30)                                  │
│ ✅ ROI 30g: +8.4% (richiesto positivo)                               │
│ ✅ Volume USDC: $2,840 (richiesto $1,000)                            │
│ ✅ No flag compliance                                                 │
│                                                                       │
│ Tutti i requisiti soddisfatti! Procedi con l'application.            │
├──────────────────────────────────────────────────────────────────────┤
│ STEP 2: Compila il profilo                                            │
│                                                                       │
│ Username: [@theo4] (univoco, no spazi)                               │
│ Nome reale: [Theodore Smith] (opzionale)                             │
│ Foto avatar: [upload]                                                │
│ Bio breve (max 140): [...]                                           │
│ Location (opzionale): [USA]                                          │
│ Sito web (opzionale): [theo4.com]                                    │
│ X/Twitter (opzionale): [@theo4_eth]                                  │
│ Discord (opzionale): [theo4#1234]                                    │
│                                                                       │
│ Specializzazione (multi-select):                                     │
│ ☐ Crypto  ☑ Sport  ☑ Politica  ☐ Cultura  ☐ News                   │
│                                                                       │
│ Lingua preferita: [Italiano ▼]                                       │
├──────────────────────────────────────────────────────────────────────┤
│ STEP 3: Privacy settings                                              │
│                                                                       │
│ ☑ Mostra le mie posizioni aperte (con delay 30 min)                  │
│ ☑ Mostra il mio trade history pubblicamente                          │
│ ☑ Permetti commenti sul mio profilo                                  │
│ ☐ Anonimizza le metriche $ (mostra solo % e ROI)                     │
├──────────────────────────────────────────────────────────────────────┤
│ STEP 4: Termini e condizioni                                          │
│                                                                       │
│ ☑ Accetto termini programma creator                                  │
│ ☑ Capisco che il revenue share è 30% sulle builder fee               │
│ ☑ Accetto manual review (1-3 giorni)                                 │
│                                                                       │
│ [ Submit application ]                                                │
└──────────────────────────────────────────────────────────────────────┘
```

### Status post-submission

```
✅ Application inviata!
La review è in corso. Riceverai una notifica entro 1-3 giorni lavorativi.
Status: Pending review
[Vai al dashboard]
```

---

## PAGINA `/creator/dashboard` — Dashboard creator

### Layout (auth required, solo se opt-in approvato)

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER GLOBALE                                                        │
├──────────────────────────────────────────────────────────────────────┤
│ NAV CREATOR DASHBOARD                                                 │
│ Overview · Followers · Earnings · Stats · Settings                   │
├──────────────────────────────────────────────────────────────────────┤
│ HERO CREATOR                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Welcome back @theo4                                             │ │
│ │                                                                  │ │
│ │  Followers: 487  Copiers attivi: 124  Earnings 30g: $245.30     │ │
│ │                                                                  │ │
│ │  [ View public profile ]  [ Edit profile ]                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ CARDS DASHBOARD                                                       │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐        │
│ │ Earnings     │ Copy fee     │ Active copy  │ Pending      │        │
│ │ totali       │ generata     │ sessions     │ payout       │        │
│ │ $1,247       │ $87          │ 124          │ $45.20       │        │
│ │              │ (last 30g)   │              │              │        │
│ └──────────────┴──────────────┴──────────────┴──────────────┘        │
└──────────────────────────────────────────────────────────────────────┘
```

### Sub-pages

- **`/creator/dashboard/followers`**: lista follower con loro volume copy
- **`/creator/dashboard/earnings`**: storia dettagliata builder fee guadagnata + payout history
- **`/creator/dashboard/stats`**: stesse stats public (per check propri)
- **`/creator/dashboard/settings`**: edit profilo, privacy, withdraw payout, opt-out programma

---

## STATI DELLE PAGINE CREATOR

### Default
Layout completo con dati real-time.

### Loading
Skeleton placeholder per hero, metriche, contenuto tab.

### Empty state — Creator nuovo (poche posizioni/trade)
```
"@theo4 ha appena iniziato"
Ancora poche posizioni e trade. Torna presto per vedere come va.
```

### Creator non più attivo (suspended o opt-out)
- Banner rosso in cima: "Questo creator non è più attivo"
- Bottoni Follow/Copy disabilitati
- Storico ancora visibile per trasparenza

### Errore (creator non esiste)
404 standard con link "Torna a leaderboard".

---

## COMPORTAMENTI INTERATTIVI

### Real-time updates

- **Posizioni aperte**: aggiornamento ogni 30 secondi (delay 30 min applicato)
- **Trade history**: WebSocket per nuovi trade chiusi
- **Stats**: ricalcolo ogni 5 minuti (cached)
- **Followers count**: real-time
- **Equity curve**: ricalcolo ogni 5 minuti

### Click su Follow

Loggato:
1. Click su "Follow" → API `/api/copy/follow`
2. Bottone diventa "✓ Following" verde con animazione
3. Notifiche per questo creator attivate (push + email + Telegram in base a settings)
4. Toast "You're now following @theo4"

Non loggato:
1. Click → dialog "Crea account o accedi per seguire"
2. Bottoni "Sign up" + "Login"

### Click su Copy Trading

Loggato + creator opt-in:
1. Click su "Start Copy Trading" → naviga a `/me/sessions/new?creator=theo4`
2. Wizard setup session keys (definito in Pagina /me sessions)
3. Conferma + firma Privy
4. Toast "Copy trading attivato per @theo4"

Loggato + creator NON opt-in:
- Bottone non visibile

Non loggato:
- Dialog signup

### Click su Copy this trade (su una posizione singola)

1. Apre dialog: "Vuoi replicare questo singolo trade?"
2. Pre-compila importo proporzionale (default uguale al creator scaled per il tuo saldo)
3. L'utente conferma
4. Apre trade widget con prezzi di mercato attuali (NON i prezzi che il creator aveva al momento)
5. Conferma + firma Privy

---

## DIFFERENZE TRA `/creator/[username]` E `/trader/[address]` — RIASSUNTO

| Sezione | Verified Creator | Top Trader esterno |
|---|---|---|
| Hero | Foto + nome + bio + social + Score 87/100 + Tier Gold | Address + Polymarket nickname + Score "External" + warning |
| Bottoni | [Follow] + [Copy] (filled) | [Follow] + [Copy ⚠] (con caution + dialog speciale) |
| Disclaimer | Nessuno | Banner permanente "Trader esterno" |
| Tab Overview | Equity + Posizioni delay 30min + Last trade + Achievements | Equity + Posizioni real-time + Last trade (no Achievements) |
| Tab Positions | Lista con delay 30 min | Lista in real-time on-chain |
| Tab History | Lista completa con bottoni Copy | Lista completa on-chain con bottoni Copy ⚠ |
| Tab Stats | Tutte le metriche + Calibration curve | Solo metriche on-chain (no Calibration interna) |
| Tab Comments | Sì | NO |
| Notifiche follow | Push + email + Telegram real-time | Polling on-chain (delay ~30s) |
| Revenue share | Sì 30% | No (esterno non sa) |
| Service fee Predimark | Builder fee 0.5% (su tutti) | Builder fee 0.5% + Service fee 1% sui profitti |

---

## ACCESSIBILITÀ

- Bottoni Follow/Copy con `aria-label` esplicito ("Follow @theo4")
- Score Predimark con tooltip su hover (descrizione algoritmo)
- Achievements con `aria-describedby` per screen reader
- Calibration curve con descrizione testuale alternativa
- External Trader disclaimer con `role="alert"` per screen reader
- Tab navigation completa da tastiera (frecce)

---

## NOTE TECNICHE PER COWORK

### Componenti da costruire

- **CreatorHero**: hero profilo con foto, nome, bio, score, bottoni
- **TraderHero**: variante per External Trader con disclaimer
- **MetricsCardsGrid**: 8 cards metriche (riusato da `/me/stats`)
- **CreatorSubNav**: tabs Overview/Positions/History/Stats/Comments
- **CalibrationCurveChart**: chart calibration (riusato da `/me/stats`)
- **CreatorPositionCard**: card posizione del creator (NO bottoni Sell, SI Copy this trade)
- **CreatorScoreTier**: badge score 87/100 + tier Gold con tooltip
- **ExternalTraderDisclaimer**: banner permanente per `/trader/[address]`
- **CopyTradingDialog**: dialog setup standard (per creator)
- **CopyTradingDialogExternal**: dialog setup speciale con caveat (per trader esterno)

### Dati e API

**Per Verified Creator**:
- `/api/creator/[username]` — profilo completo
- `/api/creator/[username]/positions` (con delay 30 min server-side)
- `/api/creator/[username]/history` — trade chiusi
- `/api/creator/[username]/stats` — metriche aggregate
- `/api/creator/[username]/comments` — feed commenti

**Per Top Trader esterno**:
- Polymarket Data API `/leaderboard` per identificare top trader
- Polymarket Data API `/positions?address=X` per posizioni live
- Polymarket Data API `/trades?address=X` per history
- Calcoli stats fatti da noi (no API Polymarket per sharpe/calibration)
- Cache aggressiva (5-15 min) per non sovraccaricare API Polymarket

### Privacy / Backend

- **Delay 30 min posizioni Verified Creator**: filtro `WHERE opened_at < NOW() - INTERVAL '30 minutes'` in API
- **Top Trader esterno**: nessun delay (è già pubblico on-chain)
- **Anonimizzazione metriche $**: settings creator per mostrare solo % invece di valori assoluti
- **GDPR**: utente Verified Creator può cancellare account → profilo diventa "deleted" ma trade restano on-chain

### Performance

- **Cache aggressivo** per dati esterni Polymarket (15 min)
- **Lazy load tabs** (Stats e Calibration calcolati on-demand)
- **WebSocket** solo per posizioni delay-applied
- **CDN** per foto avatar creator

---

## RIFERIMENTI

- **Documento 1** — Vision & Product (da aggiornare con leaderboard ibrida)
- **Documento 2** — User Stories (US-021..US-027 specifici per creator/copy trading)
- **Documento 3** — Sitemap
- **Documento 4** — Pagina 5 (Leaderboard) — descrive da dove arriva l'utente qui
- **Documento 5** — Tech stack (per logica delay e API Polymarket)

---

## PAGINE SUCCESSIVE

Documenti che verranno costruiti nelle prossime sessioni:

- **Pagina 5** — Leaderboard `/leaderboard` (Verified Creators + Top Traders Polymarket)
- **Pagina 6** — Admin overview `/admin`
- **Pagina 7** — Signup + onboarding flow

**Totale pagine wireframe**: 7 (4 fatte, 3 restano)

---

*Fine Documento 4 — Wireframes — Pagina 4 (Profilo creator)*
*Continua con Pagina 5 (Leaderboard) nella sessione successiva*
