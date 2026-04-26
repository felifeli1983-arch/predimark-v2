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

- Non modificare `docs/HANDOFF-LOG.md` — lo gestisce Cowork
- Non eseguire migration Supabase — le gestisce Cowork via MCP
- Non installare Playwright — end-to-end rinviato a MA8
- Usare `vitest` (non Jest)
- TypeScript strict — niente `any` espliciti

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
