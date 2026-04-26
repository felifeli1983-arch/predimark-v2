# Predimark V2 — Project Memo

> **Documento 10 di 10** — Onboarding & Operations Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Memo finale del progetto
> Audience: Claude in VS Code (esecutore), Cowork (planner), nuovi sviluppatori, Feliciano

---

## Cos'è questo documento

Questo è l'**ultimo documento** del set Predimark V2. È il **punto di ingresso** per chiunque entri nel progetto — sia Claude in VS Code all'inizio di ogni sessione, sia Cowork quando deve preparare un prompt, sia un eventuale futuro sviluppatore.

Se sei un **agente AI o uno sviluppatore** che sta lavorando su questo progetto, **leggi questo documento per primo**. Poi consulta i Doc 1-9 quando hai bisogno di dettagli specifici.

---

## PARTE 1 — PROJECT OVERVIEW (in 30 secondi)

**Predimark V2** è una web-app di prediction markets builder sopra Polymarket. È un rebuild da zero della V1 esistente, mira a essere **prediction-only** (no lineup mode), **target globale** (no Italia per real trading), e ha **ambizioni di lancio ottobre 2026**.

### Value proposition in 1 riga

_"Polymarket, ma con segnali algoritmici, copy trading, demo mode, e zero complessità crypto."_

### Cosa lo distingue

- **Onboarding fintech** (signup email/Google, no wallet manager, deposito carta)
- **Segnali algoritmici** real-time per ogni mercato + log pubblico delle performance
- **Copy trading ibrido** (Verified Creators interni + Top Trader esterni Polymarket on-chain)
- **Demo mode** con $10k paper money per esplorare senza rischio
- **Bot Telegram** con notifiche
- **Multilingua** EN + ES + PT + IT + FR

### Cosa NON è

- Non è un casinò (sono mercati di previsione, non azzardo)
- Non è custodial (utenti hanno sempre il controllo dei loro fondi)
- Non è solo italiano (è globale, italiano una delle lingue)
- Non è sostituto di Polymarket (siamo builder sopra di loro)

---

## PARTE 2 — IL TEAM E I SUOI RUOLI

```
┌─────────────────┐
│   FELICIANO     │ ← Founder, decisore strategico
│   (founder)     │   Dice cosa costruire, fa marketing, gestisce admin pannello via UI
└────────┬────────┘
         │ scelte strategiche, copy-paste prompt
         ↓
┌─────────────────┐
│     COWORK      │ ← Architetto + planner + reviewer
│ (Claude desktop)│   Prepara prompt, verifica codice, aggiorna log
└────────┬────────┘
         │ prompt operativi
         ↓
┌─────────────────┐
│ CLAUDE IN       │ ← Esecutore (questo sei tu, se stai leggendo)
│  VS CODE        │   Scrive codice, gestisce git, deploya
└─────────────────┘
```

### Chi fa cosa (tabella riassuntiva)

| Operazione                                                          | Responsabile                       |
| ------------------------------------------------------------------- | ---------------------------------- |
| **Decisioni strategiche** ("vogliamo questa feature?")              | Feliciano                          |
| **Direzione prodotto**                                              | Feliciano                          |
| **Marketing + lancio**                                              | Feliciano                          |
| **Configurazione runtime** (fees, feature flags via admin pannello) | Feliciano (UI clicca-clicca)       |
| **Lettura documentazione + decisioni implementative**               | Cowork                             |
| **Preparazione prompt operativi**                                   | Cowork                             |
| **Review codice + acceptance criteria**                             | Cowork                             |
| **Aggiornare HANDOFF-LOG**                                          | Cowork                             |
| **Scrivere tutto il codice**                                        | Claude in VS Code                  |
| **Git: commit, push, PR, merge**                                    | Claude in VS Code                  |
| **Supabase: applicare migrations (staging E production)**           | Claude in VS Code                  |
| **Deploy edge functions**                                           | GitHub Actions automatico          |
| **Run tests**                                                       | Claude in VS Code + GitHub Actions |

---

## PARTE 3 — ISTRUZIONI PER CLAUDE IN VS CODE

> **Questa sezione è il punto di ingresso operativo per Claude in VS Code. Leggi tutto prima di iniziare il primo sprint.**

### 3.1 — Chi sei e cosa fai

**Tu sei Claude in VS Code, l'esecutore del progetto Predimark V2.**

Il tuo ruolo:

1. **Ricevi prompt operativi** da Feliciano (via copy-paste). I prompt sono preparati da Cowork.
2. **Esegui il task descritto** nel prompt scrivendo codice, eseguendo comandi, applicando migrations, gestendo git.
3. **Aspetti il prossimo prompt** dopo aver completato lo sprint corrente. Non agisci di tua iniziativa fuori dal task.

### 3.2 — Cosa hai a disposizione

Nella cartella `~/predimark-v2/` trovi:

- `docs/` — tutti i 10 documenti del progetto. Consultali quando il prompt fa riferimento a un Doc specifico
- `app/`, `components/`, `lib/`, `supabase/` — codice del progetto (vuoto inizialmente)
- `.env.local` — env vars con credenziali (Privy, Supabase, GitHub PAT, MoonPay, Anthropic API)
- `package.json` — dipendenze npm

Hai accesso a:

- **Filesystem locale** della cartella `~/predimark-v2/`
- **Git CLI** con Personal Access Token configurato (puoi push, mergiare PR)
- **Supabase CLI** con service role keys (puoi applicare migrations a staging e production)
- **npm** per gestire dipendenze
- **Internet** per scaricare libraries, consultare docs API esterne, etc.

### 3.3 — Cosa NON fare

**Mai**:

- ❌ Iniziare a scrivere codice senza un prompt esplicito da Feliciano
- ❌ Decidere autonomamente di aggiungere feature non richieste
- ❌ Cambiare architettura/stack senza approvazione (lo stack è fissato in Doc 5)
- ❌ Push direttamente su `main` (sempre via PR + merge dopo OK Cowork)
- ❌ Applicare migrations a production senza che la PR corrispondente sia mergiata su main
- ❌ Esporre service role keys o credenziali in commit
- ❌ Includere dati personali nei log o nei commit
- ❌ Hardcodare valori che dovrebbero essere in env vars
- ❌ Fare refactor di file fuori dallo scope dello sprint corrente

**Sempre**:

- ✅ Leggere il prompt fino in fondo prima di iniziare
- ✅ Consultare i Doc referenziati (es. "vedi Doc 6 sezione 1.1")
- ✅ Lavorare su feature branch (`feature/sprint-X.Y.Z-short-desc`)
- ✅ Commit message conventional (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`)
- ✅ Test ogni cambio significativo prima di chiudere lo sprint
- ✅ Aprire PR con descrizione dettagliata (template in Doc 9 sezione 1.4)
- ✅ Aspettare l'OK di Cowork prima di mergiare
- ✅ Aggiornare nessun file fuori dalla cartella progetto senza chiedere

### 3.4 — Cosa fare quando hai dubbi

Durante lo sprint, se incontri:

**Ambiguità nei requisiti**: il prompt non specifica un dettaglio
→ Consulta il Doc referenziato. Se anche il Doc non chiarisce, **fermati e segnala in chat con Feliciano** ("Ambiguità su X, possibili interpretazioni A o B"). Non assumere.

**Conflitto tra Doc**: due documenti dicono cose diverse
→ Il **Doc 1 v3 è la source of truth** per la vision. Il **Doc 6 è source of truth** per lo schema DB. Il **Doc 7 per le API**. Se conflict persiste, segnala.

**Errore tecnico** (dipendenza rotta, comando che fallisce)
→ Investiga + tenta fix. Se non risolvi in 3 tentativi, segnala con dettagli ("Errore X tentando Y, ho provato Z, A, B").

**Decisione di design** (es. "come chiamo questa funzione?")
→ Decidi tu se è dettaglio implementativo. Se è architetturale, chiedi.

**Mancanza credenziali esterne** (es. MoonPay non configurato)
→ Segnala a Feliciano con istruzioni precise di cosa serve.

### 3.5 — Workflow standard di uno sprint

Quando ricevi un prompt da Feliciano:

```
1. LEGGI il prompt completamente
2. CONSULTA i Doc referenziati (Doc 1-9 nella cartella docs/)
3. CREA feature branch: git checkout -b feature/sprint-X.Y.Z-short-desc
4. ESEGUI il task (scrivi codice, applica migrations, etc.)
5. TESTA quello che hai fatto:
   - npm run dev (se c'è UI)
   - npm test (se ci sono test)
   - Manual test degli acceptance criteria
6. COMMIT con conventional message:
   git commit -m "feat(sprint-X.Y.Z): short description"
7. PUSH del feature branch:
   git push origin feature/sprint-X.Y.Z-short-desc
8. APRI PR su GitHub con template (vedi Doc 9 sezione 1.4)
9. ATTENDI l'OK di Cowork (Cowork rivede il codice + acceptance criteria)
10. Se Cowork dà OK: MERGIA la PR su main (gh pr merge --squash)
11. Se Cowork chiede fix: applica fix, push, ripeti review
12. Dopo merge: NOTIFICA in chat "Sprint X.Y.Z completato"
13. ASPETTA il prossimo prompt
```

### 3.6 — Convenzioni di codice

**TypeScript**:

- `strict: true` sempre
- Niente `any` (usa `unknown` se davvero non sai)
- Tipi espliciti per export pubblici
- Interface > Type per oggetti, Type per union/literal

**React**:

- Functional components con hooks
- Server Components di default in App Router (Next 16)
- Client Components SOLO quando servono (state, event handlers, browser APIs) — usa `'use client'`
- Custom hooks per logica condivisa

**File naming**:

- Componenti: `PascalCase.tsx` (es. `EventCard.tsx`)
- Hooks: `useCamelCase.ts` (es. `useLiveMidpoint.ts`)
- Utilities: `camelCase.ts` (es. `formatPrice.ts`)
- Types: `kebab-case.types.ts` o inline
- Routes App Router: `kebab-case` per folder

**Imports**:

- Absolute paths con `@/` (es. `import { Button } from '@/components/ui/button'`)
- Mai relativi profondi (`../../../`)

**Styling**:

- Solo Tailwind classes che riferiscono CSS vars in `globals.css`
- Niente colori hardcoded, niente inline styles (eccetto valori dinamici come progress bar width)
- Niente emoji nelle UI (sempre Lucide React icons)

**Comments**:

- Spiega il "perché", non il "cosa" (il codice già dice il cosa)
- TODO: con descrizione chiara + nome ("TODO: handle edge case X — Cowork")

### 3.7 — Quando uno sprint è "done"

Uno sprint è completato quando:

- ✅ Tutti gli acceptance criteria del Doc 9 sono verificati
- ✅ Codice committato e pushato su feature branch
- ✅ PR aperta con descrizione completa
- ✅ CI verde (lint + typecheck + test pass)
- ✅ Cowork ha dato OK su review
- ✅ PR mergiata su main
- ✅ HANDOFF-LOG aggiornato (Cowork lo fa)

Niente sprint "parzialmente completato". O è done o non è done.

### 3.8 — Cosa fai all'inizio di una nuova sessione

Se è la **primissima volta** che lavori sul progetto:

1. Leggi questo Doc 10 fino in fondo
2. Apri `~/predimark-v2/docs/HANDOFF-LOG.md` per vedere lo stato corrente
3. Apri `~/predimark-v2/docs/09-ROADMAP-AND-SPRINT-PLAN-v2.md` per vedere gli sprint
4. Aspetta il prompt di Feliciano

Se è una **sessione successiva** (continui dopo break):

1. Apri HANDOFF-LOG per vedere ultimo sprint chiuso
2. Verifica che la cartella sia in stato pulito (`git status`)
3. Aspetta il prompt

---

## PARTE 4 — ISTRUZIONI PER COWORK

> **Questa sezione è il riferimento operativo per Cowork (architetto/planner).**

### 4.1 — Il tuo ruolo

**Tu sei Cowork, l'architetto e planner del progetto Predimark V2.**

Il tuo ruolo:

1. **Leggi i Doc 1-10** all'inizio del progetto (e re-leggi quando ne aggiorni uno)
2. **Prepari prompt operativi** per Claude in VS Code, basandoti sugli sprint nel Doc 9
3. **Verifichi** il codice prodotto da Claude in VS Code (review + acceptance criteria)
4. **Aggiorni HANDOFF-LOG** dopo ogni sprint chiuso
5. **Comunichi con Feliciano** per decisioni strategiche o blockers

### 4.2 — Come prepari un prompt per Claude in VS Code

Quando arriva il momento di iniziare uno sprint:

#### Step 1: identifica lo sprint

Leggi HANDOFF-LOG per vedere ultimo chiuso. Trova il prossimo sprint nel Doc 9 v2 (rispettando dipendenze).

#### Step 2: raccogli il contesto

Leggi nel Doc 9 v2:

- Sprint ID + titolo
- Cosa produce
- Acceptance criteria
- Riferimenti Doc

Apri i Doc 1-8 referenziati e prendi le sezioni rilevanti.

#### Step 3: scrivi il prompt

Format raccomandato:

```markdown
## SPRINT [ID]: [Titolo]

### Contesto

Stiamo costruendo Predimark V2. Il setup è già fatto (vedi HANDOFF-LOG per stato corrente).
Per questo sprint, riferiti a:

- Doc 9 v2 sezione [Y.Y.Y]
- Doc [N] sezione [X.X]

### Task

[Descrizione del task in 2-3 frasi.]

[INCLUDI INLINE le sezioni rilevanti dei Doc, es:]
**Schema da implementare** (da Doc 6 sezione 1.1):
\`\`\`sql
CREATE TABLE users (
... [SQL completo copiato dal Doc 6] ...
);
\`\`\`

### Step operativi

1. Crea feature branch: `feature/sprint-X.Y.Z-short-desc`
2. [Step concreto 1]
3. [Step concreto 2]
4. Test: [come testare]
5. Commit: `feat(sprint-X.Y.Z): description`
6. Push + PR

### Acceptance criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Note

- [Eventuale gotcha specifico]
- [Riferimento a codice V1 da riusare se applicabile]
- [Cosa segnalarmi se non chiaro]

Iniziamo. Procedi quando pronto.
```

#### Step 4: condividi con Feliciano

Scrivi il prompt in chat con Feliciano. Lui lo copy-paste in VS Code.

#### Step 5: aspetta esecuzione

Claude in VS Code lavora. Quando finisce, segnala in chat ("Sprint X.Y.Z completato, PR aperta #N").

#### Step 6: review codice

- Apri la PR su GitHub
- Verifica acceptance criteria uno per uno
- Test manuale se necessario
- Se OK: dai l'OK in chat ("OK, mergia pure")
- Se non OK: lista cosa fixare

#### Step 7: aggiorna HANDOFF-LOG

Aggiungi entry sprint chiuso. Scegli prossimo sprint. Loop.

### 4.3 — Best practice per i prompt

**Sii specifico**: "Crea tabella users con schema in Doc 6 sezione 1.1" è meglio di "Setup database utenti".

**Includi inline il codice critico** (SQL, types, costanti) invece di solo riferimento. Riduce errori.

**Definisci acceptance criteria in modo verificabile**: "Run `psql -c '\\d users'` mostra colonne X Y Z" è meglio di "Schema corretto".

**Riusa codice V1 quando possibile**: Predimark V1 esiste e ha pattern già funzionanti (Polymarket client, charts, classify). Cowork può chiedere a Claude in VS Code di copiare/adattare invece di scrivere da zero.

**Identifica i gotcha**: "Attenzione: tabella audit_log è PARTITIONED, vedi Doc 6 sezione 7" salva tempo.

### 4.4 — Quando consultare Feliciano

Decisioni che richiedono Feliciano:

- ⚠️ Cambio scope sprint (es. "questo sprint è troppo grande, lo divido?")
- ⚠️ Conflitto tra Doc (es. Doc 4 dice X, Doc 6 dice Y)
- ⚠️ Decisione strategica (es. "manteniamo questa feature o la spostiamo a V1.1?")
- ⚠️ Setup esterno mancante (es. "MoonPay account non ancora configurato")
- ⚠️ Rischio costi (es. "questo richiede passare a Supabase Pro $25/mese")

Decisioni che NON richiedono Feliciano (decidi tu):

- ✅ Naming di funzioni interne, file, branch
- ✅ Ordine sprint paralleli (se non hanno dipendenze)
- ✅ Dettagli implementativi (es. quale lib usare per X tra 2 simili)
- ✅ Format esatto del prompt (basta che sia chiaro)

---

## PARTE 5 — STRUTTURA FILE PROGETTO

```
~/predimark-v2/
│
├── docs/                          ← TUTTI i 10 documenti
│   ├── 01-VISION-AND-PRODUCT-v3.md
│   ├── 02-USER-STORIES.md
│   ├── 03-SITEMAP.md
│   ├── 04-WIREFRAMES-pagina1-home-v2.md
│   ├── 04-WIREFRAMES-pagina2-evento-v3.md
│   ├── 04-WIREFRAMES-pagina3-profilo.md
│   ├── 04-WIREFRAMES-pagina4-creator.md
│   ├── 04-WIREFRAMES-pagina5-leaderboard.md
│   ├── 04-WIREFRAMES-pagina6-admin.md
│   ├── 04-WIREFRAMES-pagina7-signup.md
│   ├── 05-TECH-STACK-AND-ARCHITETTURA.md
│   ├── 06-DATABASE-SCHEMA.md
│   ├── 07-API-DESIGN.md
│   ├── 08-DESIGN-SYSTEM.md
│   ├── 09-ROADMAP-AND-SPRINT-PLAN-v2.md
│   ├── 10-PROJECT-MEMO.md          ← Questo file
│   └── HANDOFF-LOG.md               ← Aggiornato dopo ogni sprint
│
├── app/                           ← Next.js 16 App Router
│   ├── (public)/                  ← Routes pubbliche
│   ├── (auth)/                    ← Routes auth (signup, login)
│   ├── (user)/                    ← Routes utente loggato (/me/*)
│   ├── (creator)/                 ← Routes creator (/creator/*)
│   ├── (admin)/                   ← Routes admin (/admin/*)
│   ├── api/                       ← API BFF
│   │   └── v1/                    ← API versioning
│   ├── layout.tsx
│   └── globals.css                ← Design tokens (@theme directive)
│
├── components/
│   ├── ui/                        ← shadcn/ui base components
│   ├── markets/                   ← EventCard + 5 CardKind variants
│   ├── trade/                     ← Trade widget e dialog
│   ├── charts/                    ← SVG charts custom
│   ├── creators/                  ← Creator profile components
│   ├── leaderboard/
│   ├── admin/                     ← Componenti admin-only
│   └── layout/                    ← Header, footer, sidebar
│
├── lib/
│   ├── polymarket/                ← Client Polymarket (riusato da V1)
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   ├── classify.ts
│   │   ├── mappers.ts
│   │   └── trading/
│   ├── supabase/
│   │   ├── client.ts              ← Browser client
│   │   ├── server.ts              ← Server client
│   │   ├── admin.ts               ← Service role client
│   │   └── database.types.ts      ← Types auto-generated
│   ├── privy/
│   │   ├── client.ts
│   │   └── server.ts              ← verifyToken helper
│   ├── ws/                        ← WebSocket singleton manager
│   │   ├── SingletonWS.ts
│   │   ├── clob.ts
│   │   └── rtds.ts
│   ├── stores/                    ← Zustand stores
│   │   ├── useAppMode.ts
│   │   ├── usePrediction.ts
│   │   └── ...
│   ├── hooks/                     ← React custom hooks
│   ├── api/                       ← API client wrapper
│   └── utils/                     ← Helpers
│
├── messages/                      ← i18n translation files
│   ├── en.json
│   ├── es.json
│   ├── pt.json
│   ├── it.json
│   └── fr.json
│
├── public/                        ← Static assets
│   ├── logo.svg
│   └── ...
│
├── supabase/
│   ├── migrations/                ← SQL migrations
│   ├── functions/                 ← Edge Functions Deno
│   └── seed.sql                   ← Seed data
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                       ← Playwright (solo MA8)
│
├── .github/
│   └── workflows/                 ← GitHub Actions CI/CD
│
├── .env.example                   ← Template env vars
├── .env.local                     ← Local env (gitignored)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts             ← VUOTO (usiamo @theme in globals.css)
└── README.md
```

---

## PARTE 6 — GLOSSARIO TERMINI PREDIMARK

Termini critici da conoscere:

### Architettura prodotto

- **CardKind** — categoria visiva di un mercato. 5 valori: `binary`, `multi_outcome`, `multi_strike`, `h2h_sport`, `crypto_up_down`. Definita in Doc 1, classificata in `lib/polymarket/classify.ts`.

- **Verified Creator** — trader registrato al programma Predimark. Ha profilo completo (foto, bio, score), riceve 30% revenue share. Vedi Doc 1 Pilastro 3.

- **External Trader** — top trader Polymarket esterno (non partner). Importato on-chain via Data API. Mostrato con disclaimer "⚠ External · Non partner Predimark". Vedi Doc 1 Pilastro 3.

- **Leaderboard ibrida adattiva** — al lancio: 1 classifica unificata Verified + External. A maturità (50+ Verified): 2 tab separate. Toggle runtime admin. Vedi Doc 4 Pagina 5.

- **Demo Mode** — modalità con $10k paper money. Default per nuovi utenti. Sub-pages parallele in `/me/demo/*`. Vedi Doc 1 Pilastro 5.

- **Score Predimark** — punteggio 0-100 calcolato per Verified Creator. Determina Tier (Gold/Silver/Bronze/Rising/Standard).

- **Calibration curve** — grafico che mostra quanto bene un trader prevede probabilità (differenziatore Predimark). Brier score + ECE.

### Tecnologie

- **Builder code Polymarket** — `0xc520...92475`. Hardcoded in env. Permette a Predimark di ricevere builder fee da ogni trade.

- **Session keys Privy** — chiavi temporanee per copy trading auto. Budget + scadenza configurabili. Revocabili sempre.

- **RLS** — Row Level Security. Policy Postgres per limitare accesso dati per utente.

- **TimescaleDB** — extension Postgres per time-series. Usato per `equity_curve` e `price_history`.

- **CLOB** — Central Limit Order Book di Polymarket. Per piazzare ordini.

- **RTDS** — Real-Time Data Service di Polymarket. WebSocket per prezzi crypto, activity, comments.

- **Gamma API** — REST API Polymarket per mercati, eventi, comments, tags.

- **Data API** — REST API Polymarket per leaderboard, trades, holders on-chain.

### Workflow

- **Sprint** — unità minima di lavoro. ~1-8 ore Claude in VS Code. Format definito in Doc 9 v2.

- **Macro Area** — gruppo di sprint che insieme producono una capability completa. 8 totali.

- **HANDOFF-LOG** — file mantenuto da Cowork con stato sprint completati/in corso/blockers.

- **Acceptance criteria** — checklist verificabile per dichiarare uno sprint "done".

---

## PARTE 7 — QUICK START (cosa fare al primo giorno)

Se sei Feliciano, Cowork, o Claude in VS Code e oggi è il **primo giorno** di lavoro sul progetto:

### Per Feliciano (founder)

1. Crea cartella `~/predimark-v2/` sul tuo computer
2. Copia tutti i 10 documenti markdown nella sotto-cartella `~/predimark-v2/docs/`
3. Apri Cowork (Claude desktop) e collega la cartella `~/predimark-v2/`
4. Apri VS Code e collega la stessa cartella
5. In Cowork, scrivi: "Cowork, leggi tutti i Doc 1-10 nella cartella docs/. Poi prepara il prompt per Sprint 1.1.1 secondo Doc 9 v2."
6. Aspetta che Cowork prepari il prompt
7. Copia il prompt e incollalo in VS Code (chat con Claude in VS Code)
8. Aspetta che Claude in VS Code completi
9. Cowork verifica + dà OK
10. Avanti col prossimo sprint

### Per Cowork (Claude desktop)

1. Leggi questo Doc 10 fino in fondo
2. Leggi Doc 1 v3 (vision) per contesto
3. Leggi Doc 5 (tech stack), Doc 6 (database), Doc 7 (API), Doc 8 (design system) per riferimenti tecnici
4. Apri Doc 9 v2 e identifica Sprint 1.1.1 (primo sprint in assoluto)
5. Prepara il prompt per Claude in VS Code seguendo Parte 4.2 di questo doc
6. Condividi il prompt con Feliciano
7. Inizializza HANDOFF-LOG.md con template Doc 9 sezione 1.6

### Per Claude in VS Code

1. Leggi questo Doc 10 (Parte 3 in particolare)
2. Aspetta il prompt di Feliciano
3. Quando arriva, leggi i Doc referenziati nel prompt
4. Esegui lo sprint
5. Apri PR
6. Aspetta OK Cowork → mergia → notifica → next sprint

---

## PARTE 8 — FAQ TECNICHE

### Q: Quale Node version usare?

A: Node 20 LTS o superiore. Specificare in `.nvmrc`.

### Q: Come gestisco env vars senza esporle?

A: Tutte le secrets in `.env.local` (gitignored). Service role keys mai in `NEXT_PUBLIC_*`. In Vercel, configura env vars per environment (development/staging/production).

### Q: Posso modificare i Doc se trovo errori?

A: **Sì, ma con processo**. Cowork può segnalare errori a Feliciano. Se Feliciano approva, Cowork può aggiornare il Doc e bumpare la versione (es. v3 → v4) con changelog. Claude in VS Code non modifica Doc senza prompt esplicito.

### Q: Cosa faccio se uno sprint richiede una libreria non prevista nel Doc 5?

A: **Cowork** valuta. Se è una lib piccola (utility) → ok aggiungere senza problemi. Se è un sostituto di lib core (es. cambiare wagmi con qualcos'altro) → Cowork chiede a Feliciano. Aggiornare Doc 5 di conseguenza.

### Q: Come si gestiscono breaking changes Polymarket?

A: Monitor changelog Polymarket. Se cambiano API, aprire issue dedicata, sprint hotfix. La logica Polymarket è isolata in `lib/polymarket/`, quindi cambi lì.

### Q: Il progetto V1 esiste, posso copiare codice da V1?

A: **Sì, espressamente raccomandato** per pattern collaudati: client Polymarket, classify event, charts SVG custom, WebSocket singleton, trading scaffold V2. Cowork lo segnala nei prompt. Mai copiare lineup mode (eliminato in V2) o PrediCoin (eliminato).

### Q: Cosa NON deve mai entrare nel codice committato?

A: Service role keys, password, JWT tokens, API keys delle integration in plain text, dati personali utenti, log con email/IP, file `.env.local`.

### Q: Come gestisco i bug in produzione?

A: Hotfix branch dal main → fix → PR → merge → deploy. Documentare in HANDOFF-LOG sotto "Hotfix" section.

### Q: Cosa faccio se Cowork e Claude in VS Code "non si parlano" bene?

A: Tu (Feliciano) sei sempre l'intermediario. Se uno fa qualcosa di sbagliato, l'altro segnala a te. Tu decidi. Mai bypassare il loop.

---

## PARTE 9 — CONTATTI & RESPONSABILITÀ

### Account & credenziali

**Feliciano possiede e gestisce**:

- GitHub organization Predimark
- Account Vercel (con team members)
- Account Supabase (staging + production projects)
- Account Privy
- Account MoonPay (KYC business)
- Account Cloudflare (DNS + Workers)
- Account Anthropic (Claude API)
- Account Stripe (per V1.5)
- Email aziendale + dominio predimark.com

**Cowork e Claude in VS Code accedono via**:

- Personal Access Token GitHub (configurato in env locale Claude in VS Code)
- Service role keys Supabase (configurate in env locale)
- API keys per servizi esterni (in `.env.local`)

**Mai condividere queste credenziali fuori dal team**.

### Backup & sicurezza

- **Codice**: backup automatico via GitHub (multiple maintainers raccomandati per non perdere accesso)
- **Database**: backup automatico Supabase (Pro plan, retention 7 giorni)
- **Documenti**: backup ricorrente cartella `docs/` (es. su Drive/Dropbox)
- **Credenziali**: salvate in 1Password o equivalente da Feliciano

---

## PARTE 10 — RIEPILOGO DEI 10 DOCUMENTI

Per riferimento rapido, cosa contiene ogni documento:

| Doc | Nome                       | Cosa contiene                                                                    | Audience                       |
| --- | -------------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| 1   | Vision & Product (v3)      | Cosa costruiamo, perché, target user, modello economico                          | Tutti                          |
| 2   | User Stories               | 41 user stories in 10 flussi                                                     | Cowork (per validare features) |
| 3   | Sitemap                    | ~95 routes del prodotto                                                          | Cowork (per orientarsi)        |
| 4   | Wireframes (7 pagine)      | Layout dettagliato di Home, Evento, Profilo, Creator, Leaderboard, Admin, Signup | Cowork (per implementare UI)   |
| 5   | Tech Stack & Architettura  | Next 16 + Supabase + Privy + ...                                                 | Cowork + Claude VS Code        |
| 6   | Database Schema            | 25 tabelle SQL complete                                                          | Cowork + Claude VS Code        |
| 7   | API Design                 | ~80 endpoint REST + WebSocket                                                    | Cowork + Claude VS Code        |
| 8   | Design System              | Colori, tipografia, componenti                                                   | Cowork + Claude VS Code        |
| 9   | Roadmap & Sprint Plan (v2) | 92 sprint distribuiti in 8 macro aree                                            | Cowork (per preparare prompt)  |
| 10  | Project Memo               | Questo file: onboarding, ruoli, glossario                                        | Tutti                          |

---

## PARTE 11 — STATO INIZIALE PROGETTO

Quando inizi (sprint 1.1.1):

- ✅ Documentazione completa (10 doc)
- ✅ Decisioni architetturali prese
- ✅ Roadmap definita (92 sprint)
- ✅ Ruoli chiari
- ⏳ Codice: 0 righe (si parte da zero)
- ⏳ Repo GitHub: da creare
- ⏳ Supabase: da configurare
- ⏳ Privy: da configurare
- ⏳ Vercel: da configurare
- ⏳ Dominio: da acquistare/configurare

**Lancio target**: ottobre 2026 (5 mesi da inizio metà maggio 2026 con buffer 30%).

---

## PARTE 12 — PRINCIPI GUIDA (per quando hai dubbi)

Quando devi prendere una decisione e i Doc non sono chiari:

1. **Trasparenza prima di tutto** — Predimark vince con la trasparenza. Se in dubbio, mostra di più piuttosto che meno (con disclaimer chiari).

2. **Mobile-first sempre** — il 70% degli utenti userà mobile. Disegna per mobile prima, espandi a desktop.

3. **Velocità prima della perfezione visiva** — meglio una feature ruvida ma veloce che una bellissima ma lenta.

4. **Mai far sentire l'utente stupido** — i prediction markets sono complessi. Onboarding gentile, jargon spiegato, demo mode per imparare.

5. **Respect the data source** — Polymarket è la nostra fonte di liquidità. Mostriamo i loro prezzi senza markup. Mai manipolare i dati.

6. **Sicurezza > Funzionalità** — se una feature introduce rischi (custody, key exposure), preferiamo lentezza/limitazione a feature.

7. **Onestà sui limiti** — quando qualcosa non funziona, lo diciamo. Non inventiamo dati. Calibration curve pubblica.

---

## CHIUSURA

Questo è l'**ultimo documento** del progetto Predimark V2. Con i 10 documenti completi, il sistema è **pronto a essere avviato**.

**Cosa succede adesso**:

1. Feliciano copia i 10 documenti nella cartella `~/predimark-v2/docs/`
2. Cowork legge tutto e prepara il primo prompt (Sprint 1.1.1)
3. Loop di sprint inizia
4. ~14-18 settimane di lavoro
5. Soft launch beta privata ottobre 2026
6. Public launch a seguire

**Buona fortuna a tutto il team.** Questo è il punto in cui i piani diventano realtà.

---

_Fine Documento 10 — Project Memo_
_Fine del set documentale Predimark V2 (10 documenti totali)_
