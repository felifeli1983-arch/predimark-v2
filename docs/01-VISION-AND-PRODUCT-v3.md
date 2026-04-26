# Predimark V2 — Vision & Product

> **Documento 1 di 10** — Product Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v3 — incorporata leaderboard ibrida adattiva e service fee External
>
> **Changelog v3 (rispetto a v2)**:
>
> - Pilastro 3 (Copy Trading) riscritto con architettura adattiva 1→2 leaderboard, delay 30 min, service fee 1%
> - Demo Mode promosso da sezione standalone a Pilastro 5
> - Sezione "Cosa Predimark NON è" estesa con disclosure trasparente su External Traders
> - Modello economico aggiornato con service fee 1% External + 30% revenue share Verified Creators espliciti
> - Nuova sezione "Cold Start Strategy" che spiega come la leaderboard piena al day 1 risolve il problema del prodotto vuoto

---

## Nota preliminare sul nome

"Predimark" è il nome di lavoro. Il brand finale verrà deciso prima del lancio pubblico (entro maggio 2026). In tutti i documenti di sviluppo useremo "Predimark" come segnaposto.

---

## La frase di lancio

**Predimark aiuta chiunque a fare predizioni sui mercati che contano — elezioni, sport, crypto, cultura — in modo veloce, automatizzato, e accessibile anche senza wallet.**

In una sola riga: _"Polymarket, ma con segnali, copy trading, e senza la complessità crypto."_

---

## La visione in 3 paragrafi

I prediction markets sono uno degli strumenti più potenti per leggere il mondo. Polymarket ha dimostrato che persone qualunque, scommettendo soldi propri, producono previsioni più accurate di sondaggi e analisti tradizionali. Ma Polymarket oggi è ancora un prodotto per crypto-native: per usarlo bisogna avere un wallet, capire USDC, conoscere le gas fee, e sapere interpretare un orderbook senza nessun aiuto.

Predimark abbassa entrambe le barriere. Da un lato facciamo onboarding come un'app fintech moderna: login con email, deposito con carta di credito, saldo in dollari, zero gergo crypto. Dietro le quinte usiamo Privy per creare un wallet auto-custodial all'utente — i suoi soldi, le sue chiavi, sempre. Dall'altro lato diamo all'utente quello che Polymarket non gli dà: **segnali algoritmici real-time** che gli dicono se conviene comprare adesso o aspettare, **copy trading** dei migliori trader con pre-autorizzazione configurabile, e **demo mode** per imparare prima di rischiare soldi reali.

Il risultato è un terminale di trading per prediction markets che funziona per il newbie alla prima predizione e per il trader esperto che vuole un edge. Con notifiche Telegram, layout dedicati per ogni tipo di mercato (sport, crypto, politica, multi-outcome), supporto multilingua nativo, e log pubblico delle performance — perché la trasparenza è il nostro vero vantaggio.

---

## Il problema che risolviamo

### Pain primario 1 — "Non posso usare Polymarket senza wallet"

L'utente medio interessato a prediction markets non ha un wallet crypto. L'idea di "scaricare MetaMask, comprare ETH, swapparlo in USDC, mandarlo su Polygon, approvare i contratti, firmare le transazioni" è una barriera di 30 minuti che fa scappare il 95% delle persone. Polymarket ha mitigato questo problema con Magic Link, ma resta un'esperienza che non ispira fiducia ai non-crypto-native.

**Predimark risolve così:** signup con Google/email/Apple in 30 secondi (Privy), wallet creato silenziosamente, mai mostrato all'utente come "wallet" se non vuole, deposito con carta di credito tramite onramp integrato (MoonPay), saldo mostrato in dollari. L'utente vede "Saldo: $100" e clicca "Predici". Punto.

### Pain primario 2 — "Polymarket non mi dice se conviene comprare adesso o aspettare"

Polymarket mostra prezzi e volumi, ma è una tabula rasa: nessuna analisi, nessun consiglio, nessun edge stimato. L'utente esperto può guardare il grafico e farsi un'idea. Il newbie non ha strumenti.

**Predimark risolve così:** ogni mercato attivo ha un **segnale algoritmico** generato dal nostro motore. Per i round crypto brevi (5m, 15m, 1h, 1d) il segnale è quasi continuo. Per gli altri mercati il segnale è meno frequente ma più ragionato. Tutti i segnali passati sono **pubblici e tracciati** — l'utente può vedere il nostro track record prima di fidarsi. Inoltre l'utente può **copiare i top trader** (sia di Polymarket che del nostro programma Creator), con session keys configurabili dalla durata personalizzata.

### Pain secondari (ma significativi)

- **"Polymarket è confuso su mobile"** — Predimark è PWA mobile-first, layout dedicati per ogni CardKind
- **"Le rules dei mercati sono in inglese"** — UI tradotta in 5 lingue al lancio (EN, ES, PT, IT, FR), traduzione contenuti pianificata in fase successiva
- **"Non posso testare senza rischiare soldi"** — Demo mode con $10.000 di paper money, prezzi e segnali reali live
- **"Non ho modo di sapere quando un mercato si muove"** — bot Telegram con notifiche real-time

---

## Per chi costruiamo

Predimark V2 ha **un target primario** e tre target secondari complementari.

### Target primario — Il "newbie curioso ma non crypto-native"

Una persona di 25-45 anni che ha sentito parlare di Polymarket dopo le elezioni 2024/2028 o vede screenshot di trade su Twitter. Vuole partecipare ma non ha mai usato un wallet crypto. È a suo agio con app fintech (Revolut, Robinhood, Wise) e vorrebbe un'esperienza simile per i prediction markets.

**Per questo target costruiamo**: signup email, fiat onramp, segnali "ti aiutano a scegliere", demo mode per imparare, design pulito mobile-first.

### Target secondario 1 — Il "user-friendly seeker"

Già usa Polymarket ma non gli piace. Trova l'interfaccia confusa, mobile pessimo, mancano alert. È disposto a cambiare se trova qualcosa di meglio.

**Per questo target costruiamo**: layout dedicati per CardKind, bot Telegram, copy trading dei top trader, notifiche real-time, search e filtri migliori.

### Target secondario 2 — Il "trader sportivo che migra"

Gioca a Bet365, Betfair, scommesse tradizionali. Sta scoprendo che i prediction markets pagano meglio delle scommesse classiche. Conosce odds e probabilità ma non blockchain.

**Per questo target costruiamo**: vista sport dedicata con score live, moneyline + spreads + totals + player props, payout chiari in dollari.

### Target secondario 3 — Il "crypto-native esperto"

Ha già wallet, sa cos'è USDC e gas fee. Vuole un terminale migliore di Polymarket diretto.

**Per questo target costruiamo**: connect wallet esterno (MetaMask, Phantom, Rabby, Coinbase), trading widget veloce, copy trading semi-auto con session keys avanzate, segnali API.

---

## Cosa Predimark NON è

- **Non è un casinò.** Niente slot, roulette, scommesse pure di fortuna. I prediction markets sono uno strumento di previsione, non azzardo cieco.
- **Non è un broker tradizionale.** Niente azioni, niente forex, niente derivati classici. Solo prediction markets su eventi del mondo reale.
- **Non è un exchange di crypto.** Non scambiamo token, non listiamo monete.
- **Non è un social network.** Niente DM, niente commenti, niente follow reciproco. Il copy trading **non è socialità**: è osservazione di trade pubblici e replica con consenso. Tu segui un trader per le sue performance, non per parlare con lui.
- **Non è custodial.** Mai terremo le chiavi degli utenti. Ogni utente ha il suo wallet, può sempre esportare la chiave e portare via i suoi fondi.
- **Non è solo italiano.** Predimark è per il mondo. L'italiano è una delle 5 lingue al lancio, non quella primaria.
- **Non è un sostituto di Polymarket.** Siamo builder sopra Polymarket. Loro forniscono i mercati e la liquidità. Noi forniamo l'interfaccia, i segnali, il copy trading e l'onboarding.
- **Non nasconde la sorgente dei dati.** Quando importiamo top trader esterni Polymarket per la nostra leaderboard, sono **chiaramente etichettati** come "External Trader" con disclaimer permanente. Niente scraping nascosto, niente impressione di dati nostri quando sono di terzi. La trasparenza è il nostro vantaggio competitivo, non un'opzione.

### Sui bot e gli algos: sono benvenuti

A differenza di altre piattaforme che cercano di filtrare i bot, Predimark **accetta tutti gli utenti, inclusi bot di market making e algotrader**. Loro generano volume, noi guadagniamo builder fees, vinciamo entrambi. Non costruiamo feature dedicate ai bot professionali (no co-location, no rebate maker, no API order book deep), ma non li discriminiamo. Tutti gli utenti sono benvenuti se generano volume e rispettano i termini di servizio Polymarket.

### Sui Top Traders esterni: trasparenza prima di tutto

Predimark importa la leaderboard pubblica Polymarket per risolvere il cold start (vedi sezione Cold Start Strategy). Questa scelta comporta responsabilità che gestiamo trasparentemente:

- I trader esterni sono **sempre identificati visivamente** con badge "⚠ External" e disclaimer "Non partner Predimark"
- I loro profili `/trader/[address]` mostrano address troncato + nickname Polymarket se esistente, **mai foto o bio**
- Il copy trading di External Trader richiede **acknowledge esplicito** dell'utente via dialog dedicato con caveat
- Predimark prende **service fee 1% sui profitti** del copy External, dichiarata esplicitamente
- Il trader esterno **non riceve nulla** (non sa di essere copiato), questo è dichiarato all'utente

Non lo nascondiamo. È una decisione esplicita per dare valore agli utenti dal day 1, in modo etico e legalmente trasparente.

---

## I cinque pilastri di Predimark V1

Su tante cose competiamo. Su quattro vinciamo.

### 1. Segnali algoritmici real-time con trasparenza totale

Ogni mercato attivo riceve un segnale dal nostro motore. Per i round crypto brevi, il segnale è continuo. Per gli altri, frequente. Ogni segnale ha:

- Una **direzione** consigliata (Buy Yes, Buy No, Hold)
- Un **edge stimato** in punti percentuali
- Una **confidence** basata su backtest sui dati storici Polymarket
- Una **strategia** che lo ha generato (es. "Final Period Momentum", "Mean Reversion", "Panic Fade")

E soprattutto:

- Un **log pubblico** di tutti i segnali passati con il loro outcome reale
- Un **calibration score** aggiornato che mostra quanto siamo affidabili

Nessun altro builder Polymarket lo fa con questo livello di trasparenza. Polymarket stesso non lo fa. Questa è la nostra arma principale.

### 2. Layout dedicati per ogni tipo di mercato

I mercati Polymarket non sono tutti uguali. Una previsione binaria (_"Trump vincerà?"_) è diversa da una multi-outcome (_"Chi vincerà la Champions?"_) che è diversa da uno sport h2h (_"Lakers vs Celtics"_) che è diversa da un round crypto 5m.

Polymarket usa **lo stesso layout per tutti**. Predimark usa **layout dedicati**:

- **Binary**: donut probabilità, history price, trade widget Yes/No
- **Multi-outcome**: lista candidates con barra orizzontale, ranking dinamico
- **H2H sport**: ScoreCard live in cima, prob 2 team affiancate, sub-tabs Moneyline/Spread/Totals/Player Props
- **Crypto round**: candele live, time-range nav tra round adiacenti, decimali al pip giusto in base alla fonte (Chainlink/Binance), countdown alla risoluzione
- **Multi-strike**: lista soglie con prob crescente, identifier rapido di "dove siamo nella distribuzione"

Layout giusto = comprensione immediata = decisioni migliori.

### 3. Copy Trading combinato con creator economy

L'utente può copiare i trade dei migliori trader in due categorie complementari, gestite con un'**architettura di leaderboard adattiva**.

#### Architettura adattiva: 1 classifica al lancio, 2 tab a maturità

**Al lancio**: una **classifica unificata** che mescola Verified Creators e Top Traders Polymarket, distinti visivamente con badge (✓ Verified vs ⚠ External). Filtro "Tipo trader" sempre disponibile per chi vuole già da subito navigare per categoria. Questa scelta risolve il **cold start**: la classifica è piena dal day 1, anche prima di avere creator nostri.

**A maturità (50+ Verified)**: l'admin attiva runtime le 2 tab separate (Verified Creators / Top Traders Polymarket). Cambio applicato a tutti gli utenti senza deploy. Pattern di evoluzione naturale del prodotto.

#### Categoria 1 — Top Traders Polymarket (cold start solution)

Tutti i top trader Polymarket sono visibili nella nostra leaderboard, perché i loro wallet sono on-chain e i trade sono pubblici. Importiamo i dati via Polymarket Data API.

**Caratteristiche**:

- Profilo `/trader/[address]` con avatar generico (gradient da hash) e address troncato
- **Niente delay**: posizioni in real-time (sono già on-chain)
- **Disclaimer permanente** "External Trader · Non partner Predimark" su ogni profilo
- **Copy trading disponibile** con dialog speciale di acknowledge (caveat espliciti: trader non sa di essere copiato, no SLA, può sparire)
- **Predimark prende fee anche da copy External**: builder fee 0.5% + service fee 1% sui profitti realizzati

#### Categoria 2 — Verified Creators (programma Predimark)

Trader che si registrano consapevolmente al programma. Profilo verificato `/creator/[username]` con foto, bio, social links, score Predimark (87/100), tier (Gold/Silver/Bronze/Rising/Standard), achievements.

**Win-win**:

- Il creator riceve **30% delle builder fee** generate dai trade dei suoi follower
- I follower hanno trader top selezionati con SLA implicito
- Predimark vince con più volume e qualità

**Privacy posizioni Verified Creator**: posizioni aperte mostrate con **delay di 30 minuti**. Trasparenza preservata, ma niente front-running. Chi vuole esecuzione istantanea attiva copy trading con session keys.

#### Modalità di esecuzione configurabili dall'utente

Per ogni trader seguito (sia Verified che External):

- **Manuale** — Notifica + 1 click per replicare con firma classica. Massima sicurezza.
- **Auto 24 ore** — Pre-autorizzi i trade copy per 24h, poi rinnovi
- **Auto 7 giorni** — Pre-autorizzi per la settimana
- **Auto 30 giorni** — Pre-autorizzi per il mese
- **Auto indefinito** — Pre-autorizzi a tempo illimitato, revoca quando vuoi

Tutto basato su **Privy Session Keys**: l'utente firma off-chain una volta sola, viene generata una chiave temporanea con vincoli stringenti (budget max, max per trade, mercati ammessi, scadenza), il backend usa quella chiave per firmare i trade copy fino a scadenza o revoca. Mai custodial, sempre revocabile.

**Tutele utente obbligatorie**:

- Notifica push per ogni trade copy automatico (sai sempre cosa succede)
- Pagina "Le mie session" sempre accessibile, con stato e tasto "Revoca"
- Email summary settimanale con tutti i trade copy fatti
- Limite max trade/giorno per protezione anche su modalità indefinita
- Disclaimer chiari al momento dell'attivazione: "Predimark non è il tuo gestore patrimoniale. Il rischio di perdita è interamente tuo."
- Per External Traders: warning aggiuntivo che il trader non è partner Predimark e può smettere senza preavviso

### 4. Bot Telegram con notifiche personalizzate

I prediction markets si muovono spesso fuori orario. Polymarket ti chiede di stare incollato al sito.

Predimark V2 ha un **bot Telegram** che ti notifica:

- Segnali nuovi sui mercati nella tua watchlist
- Movimenti grossi di prezzo (es. >5% in 1h)
- Trade dei creator che segui (in modalità Manuale)
- Mercati in scadenza con tue posizioni aperte
- Eventi da news che muovono i mercati

Tier free: notifiche con delay 5min. Tier paid ($5/mese): real-time + segnali premium + dossier automatico.

---

### 5. Demo Mode come strategia di onboarding

Ogni utente Predimark **atterra in modalità Demo di default** dopo il signup, con $10.000 di paper money virtuale. Questa è la nostra strategia principale per abbassare la barriera psicologica all'ingresso.

**Caratteristiche**:

- $10.000 di **paper money** virtuale al primo accesso
- **Prezzi reali e live** presi dai feed Polymarket (zero simulazione)
- **Segnali reali e live** dal nostro motore (stessi degli utenti reali)
- **P&L calcolato sulla risoluzione reale** dei mercati (vinci o perdi davvero come faresti con soldi veri, ma è virtuale)
- **Switch tra Real e Demo** sempre visibile in cima alla UI
- **Demo separato architetturalmente** in `/me/demo/*` (sub-pages parallele a /me, dati isolati nel DB)
- Banner persistente "Modalità Demo — i tuoi soldi non sono in gioco" su ogni schermata
- Demo è disponibile anche da paesi geo-bloccati per il real trading (es. Italy)

**Perché è un pilastro strategico**:

1. **Conversion del newbie**: l'utente che non ha mai usato prediction markets può esplorare senza paura. Pattern Robinhood/eToro provato.
2. **Geo-block trasparente**: utenti da paesi bloccati hanno comunque un'esperienza completa del prodotto. Imparano, si fidelizzano, e quando le regole cambieranno saranno già clienti.
3. **Trust building**: utenti scettici sui nostri segnali possono testarli per settimane prima di mettere soldi veri.
4. **Marketing magnete**: "Try Predimark with $10,000 demo money — no deposit required" è un hook potente.
5. **A/B testing infrastruttura**: possiamo provare nuove feature (algoritmi, UI, segnali) sui demo user prima del rollout real.

**Chi lo usa**:

- **Newbie**: capiscono il prodotto prima di depositare
- **Utenti geo-bloccati**: esperienza completa anche senza poter tradare real
- **Trader esperti**: testano nuove strategie senza rischio
- **Curiosi**: esplorano dopo aver visto un tweet su Polymarket

---

## Modello economico

### Come facciamo soldi

**1. Builder fees Polymarket (revenue principale a regime)**

Per ogni trade fatto da utenti Predimark, Polymarket ci paga una builder fee.

- **Limite massimo Polymarket**: 1.0% del volume tradato
- **Promo lancio (primi 30 giorni)**: 0% — incentivo all'adozione
- **Target a regime**: 0.5% — sostenibile, competitivo (Betmoar applica ~0.25%, Polymtrade 0%)
- **Massimo applicabile in casi speciali**: 1.0% (limite Polymarket)
- **Configurazione runtime**: l'admin può cambiare la fee senza deploy via `/admin/fees`

**2. Service fee 1% sui profitti da copy External Trader**

Quando un utente copia un Top Trader esterno Polymarket (non un Verified Creator), Predimark applica una **service fee dell'1% sui profitti realizzati** in aggiunta alla builder fee standard.

Razionale: il Top Trader esterno non è partner Predimark, non riceve revenue share. Predimark fornisce il servizio di tracciamento on-chain + replication automation + dialog di acknowledge informato, e quel valore va monetizzato.

Esempio: utente copia trader esterno, profitto realizzato $100 → service fee Predimark $1.

Questa fee è applicata SOLO sui copy trade di External Trader. Copy di Verified Creators ha solo builder fee 0.5% (di cui 30% va al creator, 70% a Predimark).

**3. Tier Premium Telegram (revenue early stage)**

Bot Telegram free → notifiche con delay 5 minuti.
Bot Telegram premium ($5/mese) → notifiche real-time + segnali esclusivi + dossier automatico sui mercati seguiti.

Target conservativo a 3 mesi: 50 abbonati = $250 MRR.

**4. Programma Referral Predimark**

L'utente A invita l'utente B con il suo link referral Predimark.
B si registra su Predimark e fa trade **tramite Predimark**.
Predimark riceve la builder fee da Polymarket per ogni trade di B.
**Predimark gira il 20% della builder fee a A** per i primi 6 mesi (es. su 0.5% di builder fee, A riceve 0.1% del volume di B).

**Importante**: il referral funziona SOLO se B tradi attraverso Predimark. Se B abbandona Predimark e va direttamente su Polymarket, A non riceve nulla. Questo perché il nostro builder code deve essere incluso nella firma dell'ordine, e ciò avviene solo se l'ordine parte dalla nostra interfaccia.

Stripe Connect per i payout. Acceleratore di acquisizione organica.

**5. Programma Creator (revenue share copy trading)**

Verified Creators registrati al programma ricevono **30% delle builder fee** generate dai trade dei loro follower (calcolata sui copy trade dei follower, non sul totale).

Esempio: follower fa $1000 di volume copiando Creator @theo4 → builder fee Predimark $5 → @theo4 riceve $1.50, Predimark $3.50.

Win-win:

- Creator: incentivo a tradare bene e attirare follower
- Follower: hanno trader top selezionati con SLA implicito
- Predimark: più volume tradato, qualità della classifica

### Sostenibilità economica onesta

Va detto chiaramente: **a 3 mesi dal lancio, le sole builder fees non bastano per sostenere i costi**. I conti realistici aggiornati:

**Scenario conservativo a 3 mesi** (basato su 100 utenti attivi/settimana):

- 100 utenti attivi/settimana × $50 volume medio = $5.000/settimana = $20k/mese di volume
- Builder fee 0.5% = **$100/mese** dalle builder fees pure

**Scenario con copy trading External attivo**:

- Aggiunta: copy trading External Trader genera volume incrementale stimato +20-30% (utenti che copiano whale Polymarket fanno volume più alto del trader medio)
- Service fee 1% sui profitti = revenue extra stimato **$50-100/mese** a 3 mesi
- Cold start risolto: leaderboard piena dal day 1 = utenti vedono valore subito = retention migliore

**Per coprire i costi infrastrutturali** (Supabase, Vercel, Polygon RPC premium, MoonPay fees, Privy MAU, Claude API, Telegram bot hosting, dominio) e mantenere lo sviluppo, contiamo su:

1. **Tier Premium Telegram**: $250 MRR a 3 mesi (50 utenti × $5)
2. **Service fee 1% External copy trading**: $50-150 MRR a 3 mesi
3. **Polymarket Builders Program grants**: Polymarket distribuisce $1M+ a builder che integrano correttamente. Applicheremo.
4. **Runway personale del founder** per i primi mesi (i primi 6 mesi sono di investimento)
5. **Possibili partnership**: collaborazioni con creator/influencer crypto e sport con revenue share

Il piano è raggiungere **break-even infrastrutturale entro 6 mesi** dal lancio (~500 utenti attivi/settimana, $5k MRR tra builder fees + service fee External + Telegram premium + creator revenue).

### Quello che NON facciamo

- **Non vendiamo dati degli utenti.** Mai.
- **Non prendiamo spread sui trade.** I nostri utenti vedono i prezzi reali Polymarket, senza markup.
- **Non facciamo pubblicità in-app.** Predimark è un terminale di trading, non una piattaforma ad-supported.
- **Non mettiamo paywall sulla funzionalità base.** Trading, segnali base, layout dedicati, demo mode — tutto gratis. Solo features premium (Telegram real-time, segnali avanzati) sono a pagamento.
- **Non costruiamo crescita con bonus di benvenuto fittizi o sorteggi promozionali.** Niente trick tipo "iscriviti e ricevi $10 gratis" — questi attirano utenti che spariscono dopo il primo bonus. Vogliamo utenti che restano perché il prodotto è valido.

---

## Cold Start Strategy

Una delle decisioni architetturali più importanti di Predimark V2 è come gestire il **cold start problem** — il fatto che al lancio non abbiamo né utenti, né creator, né classifica, né dati storici nostri.

Polymarket ha avuto questo problema nel 2020-2022 e l'ha risolto con anni di crescita organica. Noi non abbiamo quel tempo: dobbiamo lanciare con un prodotto che sembra **vivo dal day 1**.

### Il problema concreto

Senza una strategia esplicita, al lancio avremmo:

- Leaderboard vuota (0 trader nostri)
- 0 Verified Creators
- 0 trade history per stats / calibration / score
- Programma copy trading senza nessuno da copiare
- Sezione "Top traders" vuota in home

Risultato: l'utente atterra, non vede attività, non capisce il valore, abbandona.

### La nostra soluzione: importare il liquido di Polymarket

Predimark V2 risolve il cold start importando dati dal **livello di liquidità più ricco al mondo per prediction markets**: Polymarket stesso, on-chain.

#### Cosa importiamo

1. **Mercati attivi**: tutti i mercati Polymarket via Gamma API → la home è piena dal day 1 con migliaia di mercati
2. **Top traders Polymarket**: tutti i top trader on-chain via Data API → leaderboard piena dal day 1 con whale e top performers
3. **Volume totale platform**: visibile come "trader attivi" e "volume tradato oggi" → l'utente vede attività reale
4. **Trade history pubblica**: visibile su ogni profilo `/trader/[address]` → nessun profilo vuoto
5. **Comments e discussioni**: dei mercati popolari (filtrati) → community sembra attiva

#### Cosa costruiamo nostro

1. **Verified Creator Program**: cresce nel tempo con onboarding manuale (target 50+ a 6 mesi)
2. **Algoritmi e segnali**: sviluppati internamente con backtest (4 codici GitHub di riferimento)
3. **Calibration curve e score**: calcolati su utenti Predimark che opt-in
4. **Achievements e gamification**: native Predimark
5. **Comments interni**: per utenti registrati Predimark

### Architettura adattiva: 1 → 2 leaderboard

Come spiegato in Pilastro 3, la classifica si evolve nel tempo:

**Fase 1 (lancio → 50 Verified)**: 1 classifica unificata mescolata con badge distintivi. L'utente vede contenuto subito.

**Fase 2 (50+ Verified)**: 2 tab separate. Programma maturo, ha senso categorizzare.

L'admin gestisce il trigger runtime senza deploy. Pattern di **graceful upgrade** del prodotto.

### Tempistica realistica

| Tempo   | Verified Creators | Top Traders importati | Tab leaderboard      |
| ------- | ----------------- | --------------------- | -------------------- |
| Lancio  | 0-5               | ~1,000                | 1 unificata          |
| Mese 1  | 5-15              | ~1,500                | 1 unificata          |
| Mese 3  | 15-30             | ~2,000                | 1 unificata          |
| Mese 6  | 30-50             | ~3,000                | 1 unificata (border) |
| Mese 9  | 50-80             | ~4,000                | **2 tab attivate**   |
| Mese 12 | 80-150            | ~5,000                | 2 tab consolidate    |

Stime conservative basate su tasso di onboarding manuale Verified e crescita organica.

### Trasparenza ed etica

Importare top trader Polymarket on-chain è **legale** (dati pubblici on-chain) ma comporta scelte etiche che gestiamo trasparentemente:

- **Disclaimer permanente** "External Trader · Non partner Predimark" su ogni profilo importato
- **Nessuna foto/bio** per External Trader (solo address troncato + nickname Polymarket se esistente)
- **Service fee 1% sui profitti** dichiarata esplicitamente nel dialog di copy trading
- **Caveat espliciti** prima del primo copy: trader non sa di essere copiato, no SLA, può sparire
- **Acknowledge utente obbligatorio** via checkbox prima di attivare copy
- **Posizioni real-time on-chain** (no delay artificiale): è già pubblico, non simulamo trasparenza falsa

Questo approccio è la nostra **interpretazione etica** di un'opportunità di mercato. Polymarket lo permette, è legalmente possibile, e gli utenti possono fare scelte informate.

---

Lancio agosto 2026. A novembre 2026 vogliamo:

**Metriche di adozione utenti**:

- **1.000 utenti registrati**
- **100 utenti attivi a settimana** (login almeno 1 volta nei 7 giorni)
- **30% W1 retention** sugli utenti registrati

**Metriche economiche**:

- **$100.000 di volume tradato totale** (sia da volume medio diffuso che da whale; entrambi contano)
- **50 abbonati al bot Telegram premium** ($250 MRR base)
- **5 creator attivi nel programma** con almeno 10 follower ciascuno

**Metriche di prodotto**:

- **Calibration score segnali ≥ 0.55** (i segnali devono essere meglio del random per essere credibili)
- **NPS utenti attivi ≥ 30** (feedback positivo della base utenti reali)

Sono numeri **realistici per una nicchia**, non per un consumer mass-market. Il piano è validare prima il pattern (utenti che si registrano, depositano, tradano, restano), poi scalare con marketing.

---

## Lingue e geo-targeting

### Lingue supportate al lancio

**EN, ES, PT, IT, FR** — interfaccia completamente tradotta. L'utente sceglie nella signup, può cambiare in qualunque momento.

### Cosa è tradotto, cosa no (V1)

- ✅ UI Predimark (bottoni, menu, label, errori, tooltip, onboarding, email)
- ❌ Titoli/descrizioni mercati Polymarket → restano in inglese originale al lancio
- ❌ Rules di risoluzione → restano sempre in inglese originale (anche in V2, per evitare ambiguità legali in caso di dispute)

### Cosa pianifichiamo per V2 (post-lancio)

- Traduzione automatica titoli/descrizioni Polymarket con cache permanente in DB
- Provider candidato: Claude API (qualità) o ibrido con DeepL
- Tempistica: 2-3 mesi dopo il lancio V1, basandoci sulle richieste utenti

### Geo-blocking

Predimark è builder sopra Polymarket. **Seguiamo le regole geo di Polymarket** (USA, UK, FR, DE, IT, AU, SG, RU, e altri). Da quei IP:

- ✅ Navigazione consentita (vedere mercati, segnali, dati)
- ✅ Demo mode consentito (paper trading)
- ❌ Trading reale disabilitato (no creazione ordini)
- ❌ Onramp fiat disabilitato

L'utente da paese geo-bloccato vede l'app in modalità "Read + Demo Only" con disclaimer: _"Trading not available in your region. You can still browse markets, follow signals, and use demo mode. Predimark follows Polymarket's geo restrictions."_

---

## Wallet e custodia

### Modello: Privy embedded primary + external wallet supportati

**Per utenti newbie (target primario)**:

1. Signup con email/Google/Apple (Privy)
2. Privy crea silenziosamente un wallet embedded a nome dell'utente
3. UI mostra "Saldo: $0", non parla di wallet a meno che l'utente lo cerchi
4. Deposito con carta di credito (MoonPay onramp) → riceve USDC sul SUO wallet
5. Trade

**Per utenti crypto-native**:

1. Click "Connect Wallet" nella signup
2. Sceglie tra MetaMask, Phantom, Coinbase Wallet, Rabby, WalletConnect
3. Firma il messaggio di login
4. Predimark riconosce l'indirizzo, vede saldo USDC esistente
5. Trade senza depositi

### Dichiarazione di non-custodia

> _"Predimark non è custodial. Il tuo wallet è tuo, le tue chiavi sono tue. Puoi sempre esportare la chiave privata e portare via i tuoi fondi. Predimark è solo un'interfaccia che ti aiuta a usare il tuo wallet su Polymarket."_

Importante legalmente (UE/MiCA) e per fiducia utente.

---

## Principi guida del prodotto

Quando dobbiamo scegliere tra A e B in fase di sviluppo, applichiamo questi principi:

### 1. Trasparenza prima di tutto

Mostriamo le nostre fee. Mostriamo le performance dei nostri segnali (anche quelli che hanno perso). Mostriamo che non siamo custodial. Niente trick, niente dark pattern.

### 2. Mobile-first, sempre

Il 70%+ degli utenti web sono mobile. Ogni decisione UX si valuta sul mobile prima che su desktop. Se non funziona su uno schermo da 380px, non funziona.

### 3. Onboarding come una banca moderna, trading come un terminale serio

L'onboarding deve essere semplice come Revolut. Il trading deve essere preciso come un terminale Bloomberg.

### 4. Velocità prima della perfezione visiva

Predimark V2 deve caricare in <2 secondi su 4G. I dati devono essere live. Quando in dubbio tra "bello e lento" e "essenziale e veloce", scegliamo veloce.

### 5. Mai fare l'utente sentire stupido

Niente messaggi tipo _"Insufficient liquidity for slippage tolerance"_. Diciamo _"Il tuo ordine è troppo grande per il momento. Prova con un importo più piccolo o usa un ordine limite."_. Il gergo finanziario è opzionale, mai obbligatorio.

### 6. Respect the data source

I prezzi che mostriamo vengono da Polymarket o da Chainlink/Binance per crypto. Non li manipoliamo, non li ritardiamo. Se la fonte dice X, mostriamo X. Sempre.

### 7. Sicurezza > Funzionalità

Quando una feature aggiunge rischio (custodia, copy trading aggressivo, automazione), scegliamo sempre la versione più sicura anche se meno fluida. Meglio perdere 5 secondi di UX che esporre i fondi degli utenti.

---

## Roadmap di alto livello

Dettaglio nel **Documento 9 — Roadmap completa**. Sintesi qui:

| Settimana | Focus                                                                                   |
| --------- | --------------------------------------------------------------------------------------- |
| 1-2       | Setup repo, Supabase, autenticazione Privy, geoblocking                                 |
| 3-4       | Home con eventi live, layout cards per CardKind, navigazione                            |
| 5-7       | 5 pagine evento dedicate (binary, multi-outcome, h2h sport, crypto round, multi-strike) |
| 8         | Trade widget completo con builder code Polymarket V2 + Privy Session Keys               |
| 9         | Integrazione MoonPay onramp                                                             |
| 10-11     | Motore segnali (estensione PolymarketBTC15mAssistant a 7 coin × 4 timeframe)            |
| 12        | Demo mode con paper trading                                                             |
| 13        | Copy trading: leaderboard, profili creator, session keys configurabili                  |
| 14        | Bot Telegram con notifiche e tier premium                                               |
| 15        | i18n complete (5 lingue), polish finale, beta privata                                   |

**Stima totale: 15 settimane** dal kickoff al lancio pubblico, lavorando con setup Cowork.

**Lancio pubblico target: agosto 2026**.

---

## Cosa fa di Predimark un prodotto vincente

Riassumo in un paragrafo perché Predimark V2 ha senso oggi:

> _Polymarket sta diventando l'unicorn dei prediction markets ($600M+ volume mensile a metà 2026). Ha aperto il programma builder per consentire interfacce alternative sopra di loro. Esistono già builder generalisti (Betmoar) e specialisti (terminali Telegram, Polymtrade). Quello che manca è un builder che combini: onboarding facile per non-crypto-native (Polymtrade ha questo), segnali algoritmici trasparenti (nessuno ha questo), copy trading con session keys configurabili (nessuno ha questo), demo mode (nessuno ha questo), multilingua nativo (pochi hanno questo). Predimark V2 è l'unico builder che fa tutto questo insieme. La concorrenza diretta su questa combinazione è zero. Lo stack tecnico esiste già (Polymarket V2 SDK, Privy Session Keys, Supabase, NautilusTrader). I 5 codici di riferimento che abbiamo (poly-data, poly-maker, prediction-market-analysis, prediction-market-backtesting-3, PolymarketBTC15mAssistant) ci danno un vantaggio iniziale di mesi. Il momento è adesso._

---

## Riferimenti

- **Documento 2** — User stories (le azioni concrete dell'utente)
- **Documento 3** — Sitemap (le pagine del prodotto)
- **Documento 4** — Wireframes (come appaiono le pagine principali)
- **Documento 9** — Roadmap dettagliata
- **Bibbia tecnica** — stack, decisioni tecniche, integrazione 5 codici

---

_Fine Documento 1 — Vision & Product (versione 2)_
