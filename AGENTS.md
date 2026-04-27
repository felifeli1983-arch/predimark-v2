<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Auktora — Istruzioni per agenti

## Nome app

Il nome dell'app è **Auktora** (non Predimark). Ogni volta che scrivi nuovo codice usa "Auktora".
Se incontri "Predimark" in file di codice (non nei docs storici in `docs/`), sostituiscilo con "Auktora".
La cartella `predimark-v2/` e il repo GitHub restano invariati — sono nomi infrastrutturali.

## Regole generali

- Non installare Playwright — end-to-end rinviato a MA8
- Usare `vitest` (non Jest)
- TypeScript strict — niente `any` espliciti

## Modalità operativa

VS Code Claude (questo agente) gestisce l'intero progetto in autonomia: codice,
DB Supabase via MCP, planning sprint, decisioni architetturali. Cowork è
disattivato a partire da MA4.

### Matrice autonomia DB Supabase (MCP)

| Tipo operazione                               | Quando                 | Conferma utente |
| --------------------------------------------- | ---------------------- | --------------- |
| Read-only (`list_tables`, `get_logs`,         | sempre                 | NO              |
| `generate_typescript_types`, ecc.)            |                        |                 |
| Write su staging (`hhuwxcijarcyivwzpqfp`)     | sempre, senza chiedere | NO              |
| Write su prod (`vlrvixndaeqcxftovzmw`)        | solo dopo OK utente    | SÌ, esplicita   |
| Drop / truncate / destructive (qualsiasi env) | con OK utente          | SÌ, esplicita   |

L'agente PUÒ aggiornare `docs/HANDOFF-LOG.md` quando completa uno sprint,
documentando cosa è cambiato (file, migration, decisioni). Resta un changelog
tecnico, non un canale verso Cowork.

### Pre-sprint: lettura Doc obbligatoria

PRIMA di scrivere un PROMPT-SPRINT-X.md o di chiedere decisioni architetturali
all'utente, leggere TUTTI i Doc rilevanti per lo sprint:

1. Inventario Doc rilevanti (es. Bet Slip → Doc 02 user stories, Doc 03
   sitemap, Doc 04 wireframe home + evento, Doc 05 tech stack, Doc 06 DB,
   Doc 08 design system)
2. Leggerli tutti, non solo le sezioni ovvie. File > 600 righe → delegare a
   subagent Explore con istruzione di leggere il file intero e tornare un
   brief sintetico
3. Il prompt sprint cita esplicitamente le sezioni Doc su cui si basa
   (numero riga) come riferimento di prova
4. Se un Doc ha una specifica chiara, applicarla — NON chiedere conferma
   all'utente per cose già scritte
5. Chiedere all'utente solo per ambiguità reali, citando quale Doc/sezione
   lascia il gap

Razionale: i Doc 1-10 sono la fonte di verità del progetto. Saltare la lettura
significa fare assunzioni che poi l'utente deve correggere — costo alto in
giri di prompt.

### Post-sprint audit obbligatorio

Al termine di OGNI sprint (prima del commit finale e prima di dire "fatto"
all'utente), eseguire un audit di completezza:

1. Rileggere il prompt sprint stesso (PROMPT-SPRINT-X.X.X.md) o, se l'ho
   pianificato io, la lista di acceptance criteria che mi sono dato
2. Rileggere i Doc rilevanti (wireframe Doc 4 per UI, Doc 6 per DB, Doc 8
   per design system, ecc.)
3. Per ogni acceptance criterion / requisito Doc, verificare nel codice
   l'implementazione effettiva (file, riga, evidenza)
4. Produrre un mini-report a fine sprint con:
   - ✅ cosa è stato implementato (con link file:riga)
   - ⚠️ cosa è stato implementato ma in modo parziale o divergente (e perché)
   - ❌ cosa manca o è stato saltato
5. Se ci sono ❌ non intenzionali, completarli prima di chiudere lo sprint.
   Se sono divergenze volute, documentarle in `HANDOFF-LOG.md`.

Razionale: nei sprint precedenti capitava di saltare deliverable minori
(test specifici, edge case, copertura tab/pagina). L'audit chiude il
loop e impedisce drift silenziosi tra docs e codice.

## Comandi utili

```bash
npm run dev         # avvia su localhost:3001
npm run validate    # typecheck + lint + test (deve passare prima di ogni commit)
npm run test        # solo i test
```

## Conventions

- Tailwind 4: styling via `@theme` in `globals.css`, no `tailwind.config.ts`
- Import alias: `@/` mappa alla root del progetto
- Font: Inter via `next/font/google`, variabile CSS `--font-sans`
- ESLint: `no-explicit-any: error`, `no-unused-vars: error` (prefix `_` per ignorare)

## Regole architetturali — file size e split obbligatori

### Limite dimensione file

- Componenti React: **max 300 righe**. Sopra questa soglia, spezzare in sub-componenti.
- Hook e utility: max 150 righe.
- Route handler API: max 100 righe (logica pesante → funzioni separate in `lib/`).

### Inline style e classi Tailwind — regola critica

**Mai** mettere `display: 'flex'` (o qualsiasi valore display) in `style={}` inline quando lo stesso elemento usa classi Tailwind per la visibilità (`md:hidden`, `hidden md:flex`, ecc.).
Gli stili inline hanno specificità più alta delle classi Tailwind e le sovrascrivono sempre.
✅ Corretto: `className="flex md:hidden"` senza `display` in style
❌ Sbagliato: `className="md:hidden" style={{ display: 'flex' }}`

### Split obbligatori per componenti critici

#### Header (`components/layout/Header.tsx`)

Il file Header.tsx è un orchestratore leggero (~80 righe). I sub-componenti vivono in `components/layout/header/`:

```
components/layout/
  Header.tsx                  ← import e composizione, max 80 righe
  header/
    DesktopNav.tsx            ← NAV_LINKS + link attivi (hidden md:flex)
    DesktopSearch.tsx         ← search bar placeholder desktop
    MobileDrawer.tsx          ← drawer hamburger (position:fixed overlay, md:hidden)
    ProfileDropdown.tsx       ← avatar button + dropdown menu
    RealDemoToggle.tsx        ← REAL/DEMO button con larghezza fissa
```

#### Pagina evento (`app/event/[slug]/page.tsx`)

La page route è max 80 righe: legge slug, classifica il tipo, renderizza il layout corretto.
I layout vivono in `components/events/layouts/`:

```
app/event/[slug]/
  page.tsx                    ← classifica tipo → renderizza layout, max 80 righe
components/events/
  layouts/
    BinaryLayout.tsx
    MultiOutcomeLayout.tsx
    MultiStrikeLayout.tsx
    H2HSportLayout.tsx
    CryptoRoundLayout.tsx
  EventChart.tsx              ← SVG CandleChart custom (riusato da tutti i layout)
  OrderbookPanel.tsx          ← orderbook expansion (riusato)
```

#### TradeWidget (`components/trade/`)

```
components/trade/
  TradeWidget.tsx             ← shell + stato + context, max 150 righe
  trade/
    MarketTab.tsx             ← tab Mercato (importo, quick amounts, preview)
    LimitTab.tsx              ← tab Limite (slider prezzo, preset scadenza)
    TradeConfirmModal.tsx     ← modal conferma prima di submit
    SignalBanner.tsx          ← banner segnale Auktora se attivo
```

#### Admin panel (`app/admin/`)

Ogni sezione admin è una cartella separata con `page.tsx` + componenti propri.
Non creare mai componenti admin in `components/` globali — sono specifici del pannello.

### Pattern generale per pagine complesse

Se una page route supera 80 righe di JSX, estrarre sezioni in componenti dedicati in `components/[feature]/`.
Esempio: `app/page.tsx` (Home) deve importare `<HeroSection>`, `<CryptoLiveRail>`, `<MarketGrid>` — non scrivere tutto inline.
