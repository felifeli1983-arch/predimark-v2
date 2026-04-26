# Predimark V2 — User Stories

> **Documento 2 di 10** — Product Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v2 — sincronizzata con Doc 1 v3 e decisioni di Doc 4-9
>
> **Changelog v2 (rispetto a v1)**:
>
> - US-024 aggiornata: leaderboard ibrida adattiva (1-tab → 2-tab)
> - US-025 espansa: distinzione Verified vs External Trader, delay 30 min posizioni
> - US-021 e US-028 spostate da P0 a **P1.1** (rinviate post-lancio)
> - Aggiunte 9 nuove US (US-042 → US-050) per coprire: External Trader copy + service fee, Calibration curve, Demo separation, Admin pannello
> - Priorità ricalibrate per riflettere "cosa va in V1 vs V1.1"
> - Aggiunto Flusso 11 (Admin operations) con 5 US per il pannello admin

---

## Cos'è questo documento

Questo documento elenca le **azioni concrete che gli utenti devono poter fare** su Predimark V2. È la traduzione operativa della Vision (Documento 1) in funzionalità testabili.

**Formato standard**:

> Come [tipo di utente], voglio [fare qualcosa], in modo da [ottenere questo beneficio].

Ogni user story ha:

- **ID** univoco (US-XXX)
- **Priorità**:
  - **P0** = MVP critico (al lancio V1)
  - **P1** = MVP forte (al lancio V1)
  - **P1.1** = post-lancio (V1.1, 1-2 mesi dopo lancio)
  - **P2** = Nice-to-have (V1.2, 3-4 mesi dopo lancio)
- **Acceptance criteria** (cosa deve funzionare per dire "fatto")

Le user stories sono raggruppate per **flussi** corrispondenti ai principali momenti d'uso della piattaforma.

---

## Flusso 1 — Primo arrivo (utente non registrato)

### US-001 (P0) — Vedere la home senza signup

**Come** visitatore non registrato,
**voglio** vedere subito la home con i mercati attivi, segnali, leaderboard, eventi sport in corso e mercati in scadenza,
**in modo da** capire cosa fa Predimark prima di iscrivermi.

**Acceptance criteria**:

- La home è completamente accessibile senza login
- Mostra: rail "Featured/Hero", "Crypto Live" (6 coin con Up/Down), "Top Movers", "In scadenza"
- Mostra una sezione con leaderboard top trader (anteprima)
- Mostra eventi sportivi in corso con score live (se ce ne sono)
- Mostra una breve descrizione "cos'è Predimark" in 2-3 frasi
- Mostra cataloghi/categorie per filtrare (Sport, Crypto, Politica, Cultura, Economia, ecc.)
- I segnali sono visibili in modalità preview (nome, direzione, edge), il dettaglio richiede signup

### US-002 (P0) — Esplorare un mercato senza signup

**Come** visitatore non registrato,
**voglio** poter aprire la pagina di un mercato e vedere tutti i dati pubblici,
**in modo da** capire come funziona prima di registrarmi.

**Acceptance criteria**:

- Posso aprire qualunque pagina mercato senza login
- Vedo grafici, volumi, probabilità, rules, commenti, top holders, trade recenti
- Il bottone "Trade" è visibile ma cliccandoci mi richiede signup
- Il bottone "Try Demo" è anche presente come alternativa al signup

### US-003 (P0) — Vedere CTA chiare per signup e demo

**Come** visitatore non registrato,
**voglio** vedere chiaramente i due percorsi possibili (signup reale vs demo),
**in modo da** scegliere consapevolmente come proseguire.

**Acceptance criteria**:

- Header con bottoni "Sign In" e "Sign Up" sempre visibili
- Sulla pagina mercato, quando clicco "Trade" non loggato, mi appare un dialog con doppia scelta: "Crea account" oppure "Prova in modalità Demo"
- Demo mode richiede comunque signup (per tracciare paper trades)
- L'utente non loggato non può tradare né accedere al demo (deve fare almeno signup base)

---

## Flusso 2 — Signup e onboarding

### US-004 (P0) — Signup veloce con email/Google/Apple

**Come** nuovo utente,
**voglio** registrarmi in 30 secondi con email, Google o Apple,
**in modo da** iniziare subito senza configurazioni complesse.

**Acceptance criteria**:

- Signup richiede solo: email + password (oppure Google/Apple OAuth)
- Privy crea automaticamente un wallet embedded a nome dell'utente, invisibile in UI
- Lingua dell'app rilevata automaticamente dal browser (con possibilità di cambio)
- Paese rilevato automaticamente da IP (per geo-block) — l'utente NON sceglie
- Al termine: utente atterra in dashboard con saldo $0

### US-005 (P0) — Doppia scelta dopo signup: Demo o Reale

**Come** nuovo utente appena registrato,
**voglio** poter scegliere se iniziare con modalità Demo o passare al deposito reale,
**in modo da** procedere con il flusso che preferisco.

**Acceptance criteria**:

- Dopo signup appare schermata "Come vuoi iniziare?"
- 2 opzioni: "Modalità Demo ($10.000 paper money)" o "Deposito Reale (carta di credito)"
- L'utente può sempre cambiare dopo (switch Real/Demo nell'header)
- Skip possibile: utente può andare direttamente alla home senza scegliere

### US-006 (P1) — Onboarding tutorial breve

**Come** nuovo utente,
**voglio** un tutorial veloce di 3-4 step che mi spiega come funziona Predimark,
**in modo da** capire le funzioni principali senza dover leggere documentazione.

**Acceptance criteria**:

- Tutorial mostrato solo al primo accesso
- Skip-able in qualunque momento
- Massimo 4 schermate: cosa fa Predimark, cos'è un segnale, cos'è il copy trading, cos'è la demo mode
- Riavvio del tutorial possibile dalle impostazioni

### US-007 (P0) — Login utente esistente

**Come** utente già registrato,
**voglio** fare login con email/password o OAuth,
**in modo da** accedere al mio account.

**Acceptance criteria**:

- Login con email + password
- Login con Google/Apple OAuth
- Recupero password via email
- Sessione persistente (rimane loggato fino a logout esplicito)

### US-008 (P1) — Connect wallet esterno (per crypto-native)

**Come** utente con wallet crypto già esistente,
**voglio** collegare il mio MetaMask/Phantom/Rabby/Coinbase invece di crearne uno nuovo,
**in modo da** usare i miei fondi USDC esistenti senza dover depositare.

**Acceptance criteria**:

- Bottone "Connect Wallet" visibile come alternativa nello screen di signup
- Supporta MetaMask, Phantom, Coinbase Wallet, Rabby, WalletConnect
- L'utente firma un messaggio di login
- Predimark riconosce l'address e mostra eventuale saldo USDC esistente
- L'utente può fare trading immediato senza depositi

---

## Flusso 3 — Esplorazione mercati

### US-009 (P0) — Filtrare e cercare mercati

**Come** utente esplorando la piattaforma,
**voglio** filtrare i mercati per categoria, tag, stato, volume, tipo di mercato, presenza di segnale, movimento recente, e cercare per testo,
**in modo da** trovare velocemente i mercati che mi interessano.

**Acceptance criteria**:

- Filtri rapidi (chip): Sport, Crypto, Politica, Cultura, Economia, Tutti
- Filtri avanzati: tag specifici, stato (live/in-scadenza/nuovi), volume range, tipo (binary/multi-outcome/h2h-sport/crypto-round/multi-strike)
- Filtri segnale: "ha segnale attivo", "edge >5%", "movimento >5% in 1h"
- Search testuale free in cima
- Filtri salvabili come "preset" per accesso rapido
- URL condivisibile dei filtri (per condividere con amici)

### US-010 (P0) — Home con rail multi-categoria

**Come** utente che apre la home,
**voglio** vedere mercati organizzati in rail tematici,
**in modo da** scoprire contenuti rilevanti senza dover cercare.

**Acceptance criteria**:

- Rail "Hero/Featured" in cima (eventi importanti del giorno, hand-picked o auto-selezionati)
- Rail "Crypto Live" (6 coin con round Up/Down 5m attivi)
- Rail "Live Score" (eventi sport in corso con punteggio live)
- Rail "Top Movers" (>X% di movimento prezzo nelle ultime ore)
- Rail "In Scadenza" (mercati che chiudono nelle prossime 24h)
- Rail "Top Volume" (più tradati del giorno)

### US-011 (P0) — Multi-predizione dal drawer (cart-style)

**Come** utente che vuole tradare più mercati insieme,
**voglio** aggiungere mercati a un drawer laterale e piazzare tutte le predizioni con un click,
**in modo da** ottimizzare il tempo e firmare meno volte.

**Acceptance criteria**:

- Ogni card mercato nella home/lista ha un bottone "+" per aggiungere al drawer
- Drawer laterale (chiamiamolo "Bet Slip") mostra tutti i mercati selezionati
- Per ogni mercato nel drawer posso impostare: side (Yes/No), importo, tipo ordine
- Indicatore live di payout totale, stake totale, fee totale
- Bottone "Piazza tutte le predizioni" firma e invia tutti gli ordini in batch
- Privy permette firma batch (1 conferma utente per N ordini)
- Posso rimuovere singoli mercati dal drawer
- Il drawer persiste tra navigazioni (anche se chiudo e riapro la home)

---

## Flusso 4 — Pagina mercato

### US-012 (P0) — Visualizzare mercato con layout dedicato per tipo

**Come** utente che apre un mercato,
**voglio** vedere un layout adatto al tipo di mercato (binary, multi-outcome, sport h2h, crypto round, multi-strike),
**in modo da** comprendere immediatamente le informazioni rilevanti.

**Acceptance criteria**:

- **Binary**: donut probabilità + chart history + Yes/No big buttons
- **Multi-outcome**: lista candidates con barre orizzontali, ranking dinamico, scroll
- **H2H sport**: ScoreCard live in cima + 2 team affiancati + sub-tabs (Moneyline, Spread, Totals, Player Props)
- **Crypto round**: candele live + time-range nav (round adiacenti) + countdown + decimali corretti per fonte (Chainlink/Binance)
- **Multi-strike**: lista soglie con prob crescente

### US-013 (P0) — Vedere tutti i dati di un mercato

**Come** utente sulla pagina mercato,
**voglio** vedere grafico, widget di trade, volume tradato totale, probabilità live, top holders, commenti utenti Polymarket, tempo/data di chiusura,
**in modo da** prendere decisioni informate.

**Acceptance criteria**:

- Grafico price history (candele o line, switch utente)
- Widget di trade sticky (sempre visibile su mobile, sidebar su desktop)
- Volume tradato totale e ultime 24h
- Probabilità live aggiornata in real-time via WebSocket
- Top 5-10 holders con posizione e profit
- Commenti utenti Polymarket (read-only in V1, niente possibilità di commentare)
- Tempo rimanente o data di chiusura prominente
- Rules di risoluzione (in inglese originale, banner "Original English text — for legal accuracy")

### US-014 (P1) — Vedere segnale algoritmico nel mercato

**Come** utente loggato sulla pagina mercato,
**voglio** vedere il segnale Predimark live (se attivo) con direzione, edge stimato, confidence e strategia,
**in modo da** valutare se conviene tradare.

**Acceptance criteria**:

- Card "Predimark Signal" sopra il widget trade (se segnale attivo)
- Mostra: direzione (Buy Yes / Buy No / Hold), edge stimato in %, confidence (0-100%), strategia generante
- Click su "Vedi storia segnali simili" mostra performance passate di segnali simili (calibration)
- Disclaimer: "Past performance does not guarantee future results. This is not financial advice."
- Segnale aggiornato in real-time se cambiano condizioni di mercato

---

## Flusso 5 — Esecuzione trade

### US-015 (P0) — Widget di trade live con preview completo

**Come** utente che vuole tradare,
**voglio** vedere mentre inserisco l'importo: payout massimo, profit potenziale, builder fee Predimark, fee Polymarket, slippage stimato,
**in modo da** sapere esattamente cosa sto facendo prima di confermare.

**Acceptance criteria**:

- Widget mostra calcoli in tempo reale mentre l'utente digita
- Stessi parametri di Polymarket: To Win (payout), Avg Price, Shares, Total Cost
- Aggiunte Predimark: builder fee evidenziata separatamente
- Slippage stimato mostrato se >0.5% (con warning visivo)
- Disclaimer breve "Markets can move against you" sempre visibile
- Tasto conferma chiaramente etichettato con l'azione ("Buy 100 YES @ $0.50")

### US-016 (P0) — Tipi di ordine supportati da Polymarket

**Come** trader,
**voglio** usare i tipi di ordine supportati da Polymarket (variabili in base al tipo di evento),
**in modo da** avere flessibilità di esecuzione.

**Acceptance criteria**:

- Market order (default, esecuzione immediata al prezzo migliore disponibile)
- Limit order (specifico prezzo target)
- GTC (Good Till Cancelled), GTD (Good Till Date), FOK (Fill or Kill), FAK (Fill and Kill)
- Tipi di ordine disponibili variano per tipo di evento (es. round crypto 5m supportano solo Market)
- UI nasconde/mostra opzioni in base al mercato selezionato
- Per ordini limit: campo prezzo + scadenza opzionale

### US-017 (P0) — Conferma ed esecuzione trade reale

**Come** utente con saldo,
**voglio** confermare il trade e vederlo eseguito on-chain,
**in modo da** avere la mia posizione attiva.

**Acceptance criteria**:

- Click "Conferma" → Privy popup di firma
- Trade firmato con builder code Predimark V2 incluso
- Submit a Polymarket CLOB
- Toast "Order submitted" → "Order matched" (con quantità eseguita)
- Posizione appare immediatamente in `/me/positions`
- Notifica push/email/Telegram (se attive)

### US-018 (P0) — Inline trade sulla pagina mercato + drawer multi

**Come** utente sulla pagina di un singolo mercato,
**voglio** che il widget di trade sia inline nella pagina (non in un modal),
**in modo da** vedere il mercato e tradare contemporaneamente.

**Acceptance criteria**:

- Widget di trade sticky a destra (desktop) o in basso (mobile)
- Se l'utente vuole tradare più mercati, può aggiungerli al "Bet Slip" drawer (vedi US-011)
- Su pagina mercato, bottone "Aggiungi al Bet Slip" alternativo a "Compra ora"

---

## Flusso 6 — Profilo personale

### US-019 (P0) — Vedere proprio profilo con hero finanziario + calibration + demo separato

**Come** utente loggato,
**voglio** una pagina profilo con hero finanziario stile Robinhood, posizioni, storia, watchlist, creator seguiti, session, statistiche con calibration curve, achievements, e accesso separato al mio demo,
**in modo da** avere controllo completo sul mio account.

**Acceptance criteria**:

- **Pagina `/me`** con sub-nav: Overview, Positions, History, Watchlist, Stats, Settings
- **Hero finanziario** Robinhood-style:
  - Saldo principale grande (USDC) + delta P&L oggi (verde/rosso con arrow)
  - Equity curve chart SVG (200-300px) con periodi selezionabili (1D/1W/1M/3M/1Y/ALL)
  - Quick actions buttons (Deposit / Withdraw / View positions)
- **Sub-page Positions**: lista posizioni aperte con P&L live, filter, sort
- **Sub-page History**: storico trade con filter + bottone export CSV
- **Sub-page Stats** con KPI completi:
  - P&L totale, ROI, win rate, Sharpe ratio, drawdown max, trade count, volume
  - **Calibration curve** (differenziatore Predimark): grafico Brier score + ECE
  - Stats by category mercato
  - Best/worst trades
- **Sub-page Watchlist**: mercati seguiti con notify settings
- **Sub-page Settings** con 7 sezioni: profile, notifications, preferences, security, billing, language, data
- **Demo mode separato architetturalmente** in `/me/demo/*` (sub-pages parallele):
  - `/me/demo/positions`, `/me/demo/history`, `/me/demo/stats`, ecc.
  - Tutti i dati con filtro `is_demo = true`
  - Banner persistente "DEMO MODE" su ogni schermata
- Switch REAL/DEMO nell'header redirect tra `/me/*` e `/me/demo/*`
- Achievement: badge per milestone (es. "First Trade", "10 Trade", "First Win", "$1k Volume")

### US-020 (P0) — Depositare con carta di credito

**Come** utente con saldo zero,
**voglio** depositare via carta di credito tramite onramp integrato,
**in modo da** iniziare a tradare senza capire cos'è una crypto.

**Acceptance criteria**:

- Bottone "Deposita" prominente nella dashboard
- Flusso MoonPay (o alternativa) integrato in iframe
- Importo minimo $10, massimo configurabile (es. $5.000 per limite KYC light)
- Conferma deposito visibile in 1-5 minuti
- Aggiornamento saldo in tempo reale
- Storico deposito visibile in `/me/transactions`
- Fee MoonPay mostrata trasparentemente (es. "MoonPay fee: 4.5%")

### US-021 (P1.1) — Prelevare via off-ramp o trasferimento esterno (con KYC)

**Come** utente con saldo,
**voglio** poter prelevare i miei fondi,
**in modo da** uscire dalla piattaforma quando voglio.

**Note priorità**: spostata a **V1.1** (post-lancio). Al lancio i primi withdraw saranno pochi e gestibili manualmente. KYC infrastructure è grossa, va in V1.1.

**Acceptance criteria**:

- Bottone "Preleva" con 2 opzioni:
  - "Trasferisci a wallet esterno" (USDC verso indirizzo Polygon)
  - "Off-ramp fiat" (USDC → carta dell'utente via MoonPay) — V1.2
- **Pre-requisito: KYC approvato** (verifica documenti via AI + review admin)
- Wizard KYC 3 step: ID upload, selfie, address proof
- AI fraud check (Claude API) per pre-screening automatico
- Status pending/approved/rejected con notification
- Per trasferimento: l'utente inserisce indirizzo destinazione + firma con Privy
- Conferma e tracking transazione

### US-022 (P0) — Esportare chiave privata e dati account

**Come** utente che vuole controllo completo,
**voglio** poter esportare la mia chiave privata Privy e scaricare tutti i miei dati,
**in modo da** poter portare via i miei fondi e rispettare GDPR.

**Acceptance criteria**:

- Sezione "Sicurezza" in `/me/settings`
- Bottone "Esporta chiave privata" → flusso Privy nativo (richiede password + 2FA se attivo)
- Bottone "Scarica i miei dati" → genera ZIP con: profilo, trade history, deposit/withdrawal, copy sessions, ecc. (formato JSON + CSV)
- Bottone "Elimina account" → conferma + email + soft delete (90 giorni di recovery, poi hard delete)

### US-023 (P1) — Eliminare account

**Come** utente che vuole lasciare la piattaforma,
**voglio** poter eliminare il mio account,
**in modo da** rimuovere i miei dati personali.

**Acceptance criteria**:

- Bottone "Elimina account" in `/me/settings/security`
- Conferma con email + password
- Avviso: "Eventuali fondi sul wallet Privy rimangono accessibili tramite chiave privata esportata"
- Soft delete: account disabilitato per 90 giorni (recovery possibile)
- Hard delete dopo 90 giorni: dati personali rimossi definitivamente, dati on-chain restano (immutabili)

---

## Flusso 7 — Copy Trading

### US-024 (P0) — Vedere leaderboard top trader

**Come** utente,
**voglio** vedere la leaderboard dei top trader (sia Polymarket generali che Creator Predimark opt-in),
**in modo da** trovare trader da seguire.

**Acceptance criteria**:

- Pagina `/leaderboard` con **architettura ibrida adattiva**:
  - **Modalità lancio**: 1 classifica unificata che mescola Verified Creators + Top Traders Polymarket esterni, distinti con badge (✓ Verified vs ⚠ External)
  - **Modalità maturità (50+ Verified)**: 2 tab separate, attivabile da admin runtime senza deploy
- Filtri sempre disponibili: periodo (Oggi/7g/30g/all), sort (Volume/Profit/ROI/Win rate/Sharpe), categoria, tipo trader (Tutti/Solo Verified/Solo External), volume minimo
- Sharpe sort filtra automaticamente solo Verified (con banner esplicativo trasparente)
- Ogni trader mostra: avatar/icona, username o address troncato, P&L periodo, win rate, volume, score Predimark + Tier per Verified
- Pin riga utente loggato sempre visibile
- Click su Verified → `/creator/[username]`, click su External → `/trader/[address]`
- Top 50 + bottone "Carica altri 50" (max ~500 totali)

### US-025 (P0) — Profilo creator con statistiche complete (Verified vs External)

**Come** utente che valuta se seguire un trader,
**voglio** vedere statistiche dettagliate del trader, distinguendo se è un Verified Creator partner o un Top Trader esterno Polymarket,
**in modo da** prendere una decisione informata con piena trasparenza sulla relazione.

**Acceptance criteria**:

- **Per Verified Creators** (`/creator/[username]`):
  - Hero con foto, bio, score Predimark (0-100), Tier (Gold/Silver/Bronze/Rising/Standard)
  - Stats complete: P&L (7g/30g/90g/all), win rate, ROI, trade count, volume
  - **Calibration curve** (differenziatore Predimark): mostra quanto bene il trader prevede probabilità (Brier score + ECE)
  - Equity curve chart
  - Posizioni aperte visibili con **delay 30 minuti** (privacy + no front-running)
  - Stats per categoria mercato
  - Achievements sbloccati
  - Bottone "Segui" + "Copy trading" (con dialog setup)
  - Disclaimer rischio
- **Per External Traders** (`/trader/[address]`):
  - Hero con icona gradient (no foto), wallet address troncato + nickname Polymarket se esistente
  - **Disclaimer permanente** "⚠ External Trader · Non partner Predimark" sempre visibile
  - Stats da Polymarket Data API (P&L, volume, win rate, trade count)
  - **Posizioni real-time on-chain** (no delay artificiale, sono già pubbliche)
  - Bottone "Copy trading" → dialog speciale con caveat espliciti (trader non sa di essere copiato, no SLA, può sparire) + acknowledge obbligatorio
  - Service fee 1% sui profitti realizzati (dichiarata esplicitamente nel dialog)

### US-026 (P1.1) — Setup copy trading con session keys configurabili

**Come** utente che vuole copiare un creator,
**voglio** scegliere modalità di esecuzione (Manuale / Auto 24h / Auto 7g / Auto 30g / Auto indefinito), budget massimo, max per singolo trade, mercati ammessi,
**in modo da** controllare esattamente cosa viene copiato.

**Note priorità**: il setup MANUAL (US-027) è P0 in V1. Le modalità Auto (US-028) sono P1.1. Quindi questo flow completo è P1.1.

**Acceptance criteria**:

- Flow setup copy: scelta creator → impostazione regole → firma session
- Modalità Manuale: nessuna firma anticipata, ricevo notifica per ogni trade
- Modalità Auto 24h/7g/30g/indefinito: firmo session key Privy con vincoli (budget, max trade, expiry)
- Budget massimo configurabile (es. $500 totali)
- Max per singolo trade configurabile (es. $50)
- Filtro categorie mercati (solo Crypto, oppure tutto, ecc.)
- Limite di sicurezza hard-coded: max 50 trade copy/giorno indipendentemente da configurazione

### US-027 (P0) — Replicare trade manualmente con notifica

**Come** utente in modalità Manuale,
**voglio** ricevere notifica quando il creator fa un trade e poter replicare con 1 click,
**in modo da** decidere caso per caso.

**Acceptance criteria**:

- Notifica push + email + Telegram (se attivi) entro 30 secondi dal trade del creator
- Notifica include: nome creator, mercato, side (Yes/No), prezzo, importo creator
- Click "Replica" → apre widget di trade pre-compilato (importo proporzionale)
- L'utente può modificare prima di confermare
- Posso anche dismissare la notifica senza replicare

### US-028 (P1.1) — Replicare trade automaticamente con session key

**Come** utente in modalità Auto,
**voglio** che i trade compatibili con le mie regole vengano eseguiti automaticamente,
**in modo da** non dover stare incollato all'app.

**Note priorità**: spostata a **V1.1**. Al lancio supporto solo copy MANUAL (US-027). Session keys auto richiedono testing approfondito di sicurezza prima del rilascio. In V1.1 dopo aver osservato pattern reali di copy manual.

**Acceptance criteria**:

- Backend monitora trade del creator via WebSocket Polymarket
- Se trade rispetta vincoli session: backend firma con session key e invia ordine
- Se trade NON rispetta vincoli: notifica all'utente "Trade saltato perché >budget" / "categoria esclusa"
- Notifica conferma per ogni trade copy automatico ("Auto-copied: bought 50 share YES @ $0.45")
- Se session expired: notifica "Session scaduta, rinnova per continuare a copiare @theo4"

### US-029 (P0) — Gestire session attive con revoca istantanea

**Come** utente con session keys attive,
**voglio** vedere tutte le mie session in una pagina, con stato e tasto revoca,
**in modo da** avere controllo totale.

**Acceptance criteria**:

- Pagina `/me/sessions` con lista session attive
- Per ogni session: creator, modalità, budget rimanente, scadenza, trade copiati finora
- Bottone "Revoca" istantaneo: backend smette immediatamente di triggerare copy
- Conferma revoca + feedback "Session revoked successfully"
- Lista session scadute / revocate visibile in tab separato

### US-030 (P1) — Diventare creator opt-in (revenue share)

**Come** utente con buon track record,
**voglio** registrarmi come Verified Creator per ricevere revenue share dai miei follower,
**in modo da** monetizzare le mie performance.

**Acceptance criteria**:

- Sezione "Creator Program" in `/me/settings`
- Requisiti per applicare: minimo 30 trade, 30 giorni di history, ROI positivo
- Opt-in: l'utente accetta termini, riceve badge "Verified Creator", profilo diventa pubblico
- Configura settings creator: nome pubblico (può differire da username), bio, mercati preferiti, social links
- Vede dashboard creator con: numero follower, builder fee generata dai follower, payout pending

---

## Flusso 8 — Demo Mode

### US-031 (P0) — Entrare in demo mode con switch

**Come** utente loggato,
**voglio** uno switch sempre visibile in cima alla UI per passare tra Real e Demo,
**in modo da** testare senza confondermi.

**Acceptance criteria**:

- Toggle/switch nell'header (chiaro: badge colorato "REAL" o "DEMO")
- Cliccare cambia immediatamente tutti i dati visibili: saldo, posizioni, history, ecc.
- In demo mode: banner persistente in cima ogni schermata "Modalità Demo — i tuoi soldi non sono in gioco"
- Stato demo/real persiste tra sessioni (ricordo lo switch dell'ultima volta)
- Possibile attivare demo anche se l'utente non ha mai depositato nulla

### US-032 (P0) — $10.000 paper money + prezzi e segnali reali

**Come** utente in demo,
**voglio** $10.000 di paper money con cui testare, prezzi e segnali reali live,
**in modo da** capire come si comporta il prodotto.

**Acceptance criteria**:

- Saldo iniziale demo: $10.000 USDC virtuale (al primo accesso)
- Tutti i prezzi/quote/orderbook sono reali (presi dai feed live Polymarket)
- I segnali sono gli stessi degli utenti reali (stesso motore, stesso edge, stessa strategia)
- I trade demo non vanno on-chain (salvati solo in DB Supabase)
- P&L calcolato in base alla risoluzione reale dei mercati (vinco/perdo davvero come in real)
- Reset possibile del saldo demo (bottone "Reset Demo Balance" con conferma)

### US-033 (P1) — Copy trading anche in demo

**Come** utente in demo,
**voglio** poter testare il copy trading senza usare soldi veri,
**in modo da** capire le modalità prima di firmare session real.

**Acceptance criteria**:

- In demo posso seguire creator come in real
- Ricevo notifiche dei loro trade
- Posso attivare modalità auto in demo (con session key virtuali, no firma Privy reale)
- I copy trade demo NON contano nelle statistiche del creator (sono separati)
- Quando passo da demo a real, le mie configurazioni copy NON si trasferiscono (devo riautorizzare)

### US-034 (P1) — Leaderboard demo separato

**Come** utente in demo,
**voglio** vedere una leaderboard di altri utenti in demo,
**in modo da** confrontarmi senza distorcere i dati real.

**Acceptance criteria**:

- Pagina `/leaderboard` ha 2 tabs principali: "Real" e "Demo"
- Quando sono in demo mode, di default vedo tab "Demo"
- Posso passare a "Real" come riferimento educativo (ma sono utenti veri)
- I dati non si mescolano mai

### US-035 (P0) — Demo accessibile da paesi geo-bloccati

**Come** utente da paese geo-bloccato (es. Italia, USA),
**voglio** poter usare la demo mode anche se non posso fare trading reale,
**in modo da** comunque utilizzare il prodotto.

**Acceptance criteria**:

- Geo-blocking disabilita: trade real, deposito fiat, withdraw, copy trading real
- Geo-blocking NON disabilita: navigazione, segnali, demo mode, leaderboard, Telegram bot
- Banner informativo: "Trading not available in your region. Demo mode and signals are fully accessible."

---

## Flusso 9 — Notifiche e Telegram

### US-036 (P0) — Configurare notifiche email/telegram/push

**Come** utente,
**voglio** scegliere quali notifiche ricevere e su quale canale (email/Telegram/push),
**in modo da** non essere sopraffatto.

**Acceptance criteria**:

- Sezione `/me/settings/notifications` con switch per ogni tipo di notifica
- Tipi: trade conferma, mercato in scadenza con posizione, risoluzione mercato, segnale forte (>X%), movimento prezzo grosso (>5%), trade creator seguito, risultato copy trade
- Canali: email, Telegram (se collegato), Push web (se browser supporta)
- Default per nuovo utente: tutte attivate, canale email
- Quiet hours: posso impostare ore in cui non ricevere notifiche

### US-037 (P0) — Connettere bot Telegram

**Come** utente che vuole notifiche real-time,
**voglio** collegare il bot Telegram al mio account,
**in modo da** ricevere alert mobile senza dover aprire l'app.

**Acceptance criteria**:

- Pagina `/me/settings/telegram` con istruzioni
- Genera codice univoco da inviare al bot @PredimarkBot
- Bot riconosce e collega l'account
- Conferma in app: "Telegram connesso ✓"
- Disconnessione: bottone "Disconnect Telegram"

### US-038 (P1) — Tier premium Telegram

**Come** utente serio,
**voglio** abbonarmi a Telegram Premium per ricevere notifiche real-time e segnali esclusivi,
**in modo da** avere edge sui mercati.

**Acceptance criteria**:

- Sezione `/me/settings/premium`
- Pricing: $5/mese, billing tramite Stripe
- Tier Premium attiva: notifiche real-time (no delay 5min), segnali esclusivi, dossier automatico mercati seguiti
- Cancellazione possibile in qualunque momento
- Periodo di prova 7 giorni gratis al primo abbonamento

---

## Flusso 10 — Sicurezza e amministrazione

### US-039 (P0) — Geo-blocking automatico

**Come** piattaforma,
**voglio** rilevare l'IP dell'utente e bloccare il trading reale dai paesi vietati,
**in modo da** rispettare i termini di Polymarket.

**Acceptance criteria**:

- Detection IP via Cloudflare/MaxMind al primo accesso e ogni X tempo
- Lista paesi geo-bloccati: configurabile (USA, UK, FR, DE, IT, AU, SG, RU, ecc.)
- Da paese bloccato: banner "Trading not available", bottoni Trade disabilitati
- Demo mode + browse + segnali sempre accessibili
- L'utente può vedere il suo paese rilevato e disputare ("Wrong country detected? Contact support")

### US-040 (P1) — 2FA opzionale

**Come** utente che vuole sicurezza extra,
**voglio** abilitare 2FA sull'account,
**in modo da** proteggere meglio le mie operazioni sensibili.

**Acceptance criteria**:

- Pagina `/me/settings/security` con opzione 2FA
- Supporto Google Authenticator / Authy via TOTP
- 2FA richiesta per: cambio password, esportazione chiave privata, prelievo, modifiche profilo creator
- Backup codes scaricabili in caso di perdita app

### US-041 (P0) — Disclaimer e termini

**Come** utente,
**voglio** vedere disclaimer chiari su rischio, performance passate, non-custodia,
**in modo da** essere informato sui rischi.

**Acceptance criteria**:

- Disclaimer permanente in footer
- Disclaimer specifico in pagina segnali: "Past performance not indicative of future results"
- Disclaimer specifico in copy trading: "Predimark is not your asset manager"
- Disclaimer specifico in demo: "Real money trading carries significant risk"
- Termini e condizioni accettati durante signup
- Privacy policy GDPR-compliant

---

## Flusso 11 — External Trader Copy Trading (cold start solution)

### US-042 (P0) — Vedere top trader Polymarket esterni nella leaderboard

**Come** utente che esplora la leaderboard al lancio,
**voglio** vedere top trader Polymarket esterni anche prima che Predimark abbia molti Verified Creator,
**in modo da** avere contenuto utile dal day 1 (cold start solution).

**Acceptance criteria**:

- Leaderboard al lancio mostra ~1000-2000 top trader Polymarket importati on-chain via Data API
- Ognuno con badge "⚠ External · Non partner Predimark"
- Solo address troncato + nickname Polymarket (no foto, no bio)
- Job nightly aggiorna stats (refresh ogni 6 ore)
- Filtri funzionano per External anche

### US-043 (P0) — Copiare trade di External Trader con acknowledge esplicito

**Come** utente che vuole copiare un trader esterno,
**voglio** un dialog speciale che mi spiega chiaramente che è un External (non partner) prima di attivare il copy,
**in modo da** prendere decisione informata e accettare i caveat.

**Acceptance criteria**:

- Click "Copy" su External Trader apre dialog dedicato (non lo stesso dei Verified)
- Dialog contiene caveat espliciti:
  - "Questo trader non è partner Predimark"
  - "Non sa di essere copiato"
  - "Non c'è SLA, può smettere di tradare in qualsiasi momento"
  - "Predimark applica service fee 1% sui profitti realizzati dal copy"
- **Acknowledge obbligatorio** via checkbox "Ho letto e accetto"
- Solo dopo acknowledge si può procedere
- Acknowledge una tantum per External Trader (memorizzato)

### US-044 (P0) — Service fee 1% sui profitti External copy

**Come** Predimark (sistema),
**voglio** applicare service fee 1% sui profitti realizzati dai copy di External Traders,
**in modo da** monetizzare il valore aggiunto (tracking + automazione + protezione informata).

**Acceptance criteria**:

- Trade copy External calcola fee 1% su `profit_realized` (al momento del sell)
- Fee dichiarata trasparentemente nell'UI prima dell'attivazione
- Fee NON applicata su Verified Creator copy (solo builder fee 0.5%)
- Tracking in `trades` table con campo `service_fee` separato da `builder_fee`
- Rendicontabile in admin pannello revenue dashboard

---

## Flusso 12 — Calibration & Trasparenza

### US-045 (P0) — Vedere mia calibration curve nel profilo

**Come** utente che vuole capire quanto sono accurato nelle mie predizioni,
**voglio** vedere la mia calibration curve (Brier score + ECE) nel profilo Stats,
**in modo da** migliorare nel tempo.

**Acceptance criteria**:

- Sub-page `/me/stats` include calibration curve chart
- Buckets di probabilità predette (0-10%, 10-20%, ..., 90-100%) vs actual outcome rate
- Brier score numerico (più basso è meglio)
- ECE (Expected Calibration Error) numerico
- Tooltip esplicativi per chi non conosce le metriche
- Calcolo aggiornato nightly (cron job)

### US-046 (P0) — Vedere calibration globale Predimark (algoritmi)

**Come** utente che valuta la trasparenza Predimark,
**voglio** vedere quanto sono calibrati gli algoritmi Predimark globalmente (log pubblico delle performance),
**in modo da** decidere se fidarmi dei segnali.

**Acceptance criteria**:

- Pagina pubblica `/signals/performance` (no login)
- Hit rate cumulativo per algoritmo
- Calibration curve globale algoritmi Predimark
- Edge realized vs claimed
- Performance per categoria mercato
- Dati aggiornati nightly
- Differenziatore vs Polymarket (loro non lo mostrano)

---

## Flusso 13 — Demo Mode (separazione architetturale)

### US-047 (P0) — Demo mode default per nuovi utenti

**Come** nuovo utente appena registrato,
**voglio** atterrare in modalità Demo con $10k paper money di default,
**in modo da** esplorare il prodotto senza paura di rischiare.

**Acceptance criteria**:

- Dopo signup, utente atterra in `/home` con `appMode='demo'` di default
- Banner persistente "Welcome! You have $10k demo money to explore."
- Modal onboarding soft skippabile
- Switch REAL/DEMO disponibile in header
- Demo mode disponibile anche da paesi geo-bloccati (es. Italy)
- Bottone "Switch to REAL" porta a `/me/deposit` se saldo USDC = $0

### US-048 (P0) — Demo isolato architetturalmente in /me/demo/\*

**Come** utente in modalità Demo,
**voglio** sub-pages dedicate `/me/demo/*` parallele a `/me/*`,
**in modo da** avere chiarezza totale tra dati real e demo.

**Acceptance criteria**:

- Sub-pages parallele:
  - `/me/positions` ↔ `/me/demo/positions`
  - `/me/history` ↔ `/me/demo/history`
  - `/me/stats` ↔ `/me/demo/stats`
  - ecc.
- DB query con filtro `is_demo` flag (helper function `user_positions(user_id, is_demo)`)
- Banner persistente "DEMO MODE" su ogni schermata demo
- Switch in header redirect intelligente

---

## Flusso 14 — Admin operations (per founder + team)

Questo flusso è dedicato a Feliciano e team admin. Le US sono per **gestire il prodotto**, non per gli utenti finali.

### US-049 (P0) — Login admin con MFA + 3 ruoli

**Come** Feliciano (super-admin),
**voglio** un pannello admin protetto con MFA e 3 ruoli (super-admin / admin / moderator),
**in modo da** gestire il prodotto in modo sicuro e con permessi granulari.

**Acceptance criteria**:

- Login admin via `/admin/login` (separato da signup utenti normali)
- MFA obbligatoria per super-admin (TOTP)
- 3 ruoli con permessi differenti:
  - **Super-admin**: tutto, incluso cambio fee + ruoli altri admin
  - **Admin**: gestione operativa (users, markets, fees, creators)
  - **Moderator**: support (users ban/unban, KYC review, comments moderation)
- Session timeout 30 min inattività
- Layout dedicato con sidebar gerarchica (vedi Doc 4 Pagina 6)

### US-050 (P0) — Configurare fee e feature flags runtime

**Come** super-admin,
**voglio** cambiare builder fee, service fee, revenue share creator, e attivare/disattivare feature senza deploy,
**in modo da** gestire il business operativamente.

**Acceptance criteria**:

- Pagina `/admin/fees` con form per:
  - Builder fee (range 0% - 1%)
  - Service fee External profit (range 0% - 5%)
  - Creator revenue share % (range 0% - 50%)
  - Referral revenue share %
  - Telegram premium price
- Cambio applicato **immediatamente** runtime (no deploy)
- Confirmation dialog con reason note obbligatoria per cambi critici
- Audit log automatico (chi/cosa/quando + before/after + reason)
- Pagina `/admin/feature-flags` per attivare/disattivare feature con gradual rollout %
- Pagina `/admin/settings/leaderboard-mode` per toggle 1-tab vs 2-tab

### US-051 (P1) — Dashboard admin con KPI live

**Come** admin,
**voglio** una dashboard con KPI principali (DAU, volume, revenue, signups, KYC pending, refunds),
**in modo da** monitorare la salute del prodotto in real-time.

**Acceptance criteria**:

- Pagina `/admin` con KPI cards (8 metriche)
- Period selector (24h / 7d / 30d / all)
- Alerts bar automatici (es. "Revenue +35% spike", "3 KYC pending da >48h")
- Charts: volume over time, revenue breakdown
- Recent admin activity log
- Real-time updates via WebSocket

---

## Riepilogo per priorità (v2)

### P0 (MVP critico — al lancio V1) — 32 user stories

US-001, US-002, US-003, US-004, US-005, US-007, US-009, US-010, US-011, US-012, US-013, US-015, US-016, US-017, US-018, US-019, US-020, US-022, US-024, US-025, US-027, US-029, US-031, US-032, US-035, US-036, US-037, US-039, US-041, US-042, US-043, US-044, US-045, US-046, US-047, US-048, US-049, US-050

### P1 (MVP forte — al lancio V1) — 9 user stories

US-006, US-008, US-014, US-023, US-030, US-033, US-034, US-038, US-040, US-051

### P1.1 (post-lancio, V1.1 — 1-2 mesi dopo) — 3 user stories

US-021 (KYC withdraw), US-026 (copy session keys setup), US-028 (copy automatico)

### P2 (Nice-to-have, V1.2 — 3-4 mesi dopo) — candidate

- Achievements completi
- A/B testing dashboard utente
- Bet Slip multi-mercato avanzato
- Mobile app nativa (se PWA non basta)

## **Totale user stories**: 51 (era 41 in v1, aggiunte 10 in v2)

## Riferimenti

- **Documento 1 v3** — Vision & Product (la visione di alto livello)
- **Documento 3 v2** — Sitemap (le pagine necessarie per implementare queste stories)
- **Documento 4** — Wireframes (come appaiono visivamente)
- **Documento 9 v2** — Roadmap & Sprint Plan (in che ordine costruire le stories)

---

_Fine Documento 2 v2 — User Stories_
