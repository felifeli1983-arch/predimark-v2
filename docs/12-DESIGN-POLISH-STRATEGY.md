# Doc 12 — Design Polish Strategy

> **Scope**: piano di intervento UX/visivo Auktora vs benchmark competitor (Polymarket).
> **Decisione utente**: 2026-04-28 — Opzione C (quick wins ora + Phase C + deep polish MA8).
> **Status**: quick wins MA4.4-B.1 in esecuzione. Deep polish MA8 (settembre 2026).

---

## Contesto

Confronto event page Auktora vs Polymarket evidenzia gap reali su densità,
typography e feature visibili. Listato qui sotto il delta osservato e la
strategia di intervento — **incrementale**, non full-redesign.

## Gap osservati 2026-04-28

| Categoria                 | Polymarket                 | Auktora                          | Gap              |
| ------------------------- | -------------------------- | -------------------------------- | ---------------- |
| Densità lista candidati   | ~50px row                  | ~80px row                        | troppi padding   |
| Trade widget desktop      | sempre pre-populato        | "Seleziona outcome" finché click | UX onerosa       |
| Chart prezzi storici      | grafico interattivo        | placeholder stub                 | feature mancante |
| Volume + tag inline       | mostrati per riga          | solo `$Vol` sotto                | poco visibile    |
| Bookmark / share / embed  | 3 icone in alto            | mancanti                         | feature mancante |
| Disclaimer geo            | sempre visibile            | mancante                         | compliance       |
| % change movement         | verde +X% sui candidati    | mancante                         | engagement       |
| Comments / News / Holders | tab in fondo con dati live | tab placeholder                  | feature mancante |
| Typography density        | font + line-height tight   | line-height più ariosi           | polish           |

## Strategia: 3 ondate

### Ondata 1 — Quick wins (MA4.4-B.1, ora)

**Effort totale**: ~1h
**Goal**: ridurre gap visivo ~40-50% senza rallentare ship Phase C trading REAL.

| Fix                                                                | Effort | Impatto                      | File principale                             |
| ------------------------------------------------------------------ | ------ | ---------------------------- | ------------------------------------------- |
| Trade widget pre-populato desktop al landing event page            | 15 min | ALTO                         | `EventTradeBoot.tsx` o `EventPageShell.tsx` |
| Densità candidati: padding 16→10, gap tighter                      | 10 min | MEDIO                        | `EventProbabilities.tsx` (o variant layout) |
| Typography scale: header 18→16, body 13→12 nella lista             | 10 min | MEDIO                        | stessi file densità                         |
| Disclaimer geo "Regione soggetta a restrizioni" sotto trade widget | 5 min  | BASSO ma compliance          | `TradeWidget.tsx`                           |
| Bookmark / share / embed icons header event                        | 15 min | BASSO funz, MEDIO percezione | `EventPageShell.tsx` header                 |

**Acceptance**:

- Landing su `/event/[slug]` desktop → Trade widget mostra Compra/Vendi tabs già attivi col primo outcome (Yes) selezionato
- Lista candidati più densa, ~3-4 row visibili in più senza scroll
- Disclaimer compliance visibile sotto la CTA Trading

**Out of scope (Ondata 1)**:

- ❌ Chart storico (richiede price history API + libreria)
- ❌ Comments / News / Holders (integration esterna)
- ❌ Order book panel destra (ws stream)
- ❌ % movement live (ws price stream)

### Ondata 2 — Phase C MA4.4 (real trading)

**Effort**: 6-8h dopo Ondata 1.
**Goal**: chiudere lifecycle real trading CLOB V2.

- Wrap USDC.e → pUSD
- Edge Function `submit-trade`
- EIP-712 v2 signing client-side via Privy
- REAL submit + sell flow
- TradeWidget rimuove restrizioni "DEMO only"

Vedi `PROMPT-SPRINT-MA4.4.md` per dettagli.

### Ondata 3 — Deep polish (MA8, settembre 2026)

**Effort**: 1-2 settimane intere.
**Goal**: pareggiare Polymarket UX visivo.

| Feature                 | Effort stimato | Razionale rinvio                                                                                                                    |
| ----------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Chart storico prezzi    | 2-3 giorni     | Richiede CLOB price history API + lightweight-charts o ApexCharts; va bene fatto post real-trading per testare con dati veri utenti |
| Comments live           | 3-4 giorni     | Integrazione Polymarket comments API o stesso DB; bisogna decidere first-party vs proxy                                             |
| Order book panel destra | 2-3 giorni     | WebSocket subscription CLOB book; UX non banale per multi-outcome                                                                   |
| Holder distribution     | 1-2 giorni     | Data API integration + viz libreria                                                                                                 |
| News taggate event      | 2-3 giorni     | News pipeline (X/Twitter API) → tagging per market id                                                                               |
| % movement live ws      | 2 giorni       | RTDS price stream + animation logic                                                                                                 |
| Typography deep audit   | 3-4 giorni     | Font scale rivisto end-to-end (Doc 8 design system update)                                                                          |

**Quando**: dopo che abbiamo:

1. Real trading funzionante (MA4.4 done)
2. Signal AI live (MA5)
3. Copy trading live (MA6)
4. Telegram bot live (MA7)
5. Dati su come gli utenti usano davvero il prodotto

In quel momento il polish è data-driven, non guess-driven.

## Razionale strategico

**Perché NON full-redesign ora?**

- Senza utenti reali il polish è speculation
- Il vero valore Auktora vs polymarket.com è nelle feature uniche (signal italiani / arabi, copy trading, bot Telegram), non nel pareggiare UX di un prodotto USA
- Risorse limitate: 1 dev (VS Code Claude) + utente PM. Time-to-market reale > polish premature

**Perché quick wins comunque?**

- Demo a stakeholder / early testers richiede UX "buono abbastanza"
- Trade widget pre-populato è zero-cost, alto impatto
- Density fix è 30 min ma cambia perception drasticamente
- Disclaimer compliance è bloccante per launch UAE (regulatory)

**Quando scaleremo polish?**

- Se hit ≥1K MAU senza polish: aspettiamo MA8 come pianificato
- Se feedback consistente "UX poor" da early users: anticipiamo deep polish
- Se entriamo in deal con investor/partner che richiedono brand polish: anticipiamo

## Tracking

- Ondata 1: commit `feat(MA4.4-B.1): event page quick wins` (oggi 2026-04-28)
- Ondata 2: serie commit `feat(MA4.4-C/D)`
- Ondata 3: `feat(MA8.1)` → `feat(MA8.5)` settembre 2026

## Riferimenti competitor

- [Polymarket event page reference](https://polymarket.com)
- [Kalshi event page](https://kalshi.com) — alternativa US regolamentata
- [Manifold Markets](https://manifold.markets) — community-driven, UX più educativa
