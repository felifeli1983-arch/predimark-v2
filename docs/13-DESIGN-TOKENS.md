# Doc 13 — Design Tokens System

> **Scope**: definizione e adozione di una scala consistente per fontSize,
> borderRadius, spacing (padding/gap/margin). Sostituisce inline values
> arbitrari con CSS vars condivise.
>
> **Decisione utente**: 2026-04-28 — Opzione B (mini-sprint design tokens
> prima di Phase D).
>
> **Status**: in adozione progressiva — componenti high-visibility prima.

---

## Razionale

Prima di questo sprint il codice usava inline values arbitrari:

- **13 fontSize diversi** (9, 10, 11, 12, 13, 14, 15, 16, 18, 22, 24, 32, 36)
- **10 borderRadius diversi** (3, 4, 5, 6, 7, 8, 10, 12, 16, 999)
- **30+ varianti padding** sparse

Effetto: due bottoni della stessa "famiglia" semantica avevano dimensioni
percepibilmente diverse (es. `padding 8px 12px` vs `10px 14px` vs `6px 12px`).

## Scala definitiva

### Font sizes (7 valori)

| Token         | Valore | Use case                                          |
| ------------- | ------ | ------------------------------------------------- |
| `--font-xs`   | 11px   | label muted, badge, chip, caption                 |
| `--font-sm`   | 12px   | body small, card meta, tab label                  |
| `--font-base` | 13px   | body default, button label, link                  |
| `--font-md`   | 14px   | button primary label, card title small            |
| `--font-lg`   | 16px   | card title, modal header, field input             |
| `--font-xl`   | 20px   | section heading, page title small                 |
| `--font-2xl`  | 28px   | candidate %, hero stat, price prominent           |
| `--font-3xl`  | 36px   | hero amount input (Trade Widget), super-prominent |

### Border radius (4 valori)

| Token           | Valore | Use case                  |
| --------------- | ------ | ------------------------- |
| `--radius-sm`   | 4px    | chip, badge, inline pill  |
| `--radius-md`   | 8px    | button, input, small card |
| `--radius-lg`   | 12px   | card, modal, panel        |
| `--radius-full` | 999px  | round avatar, full pill   |

### Spacing (6 valori, base 4px)

| Token       | Valore | Use case                           |
| ----------- | ------ | ---------------------------------- |
| `--space-1` | 4px    | gap minimo tra inline items        |
| `--space-2` | 8px    | gap items list, padding chip/badge |
| `--space-3` | 12px   | padding row, gap section internal  |
| `--space-4` | 16px   | padding card, gap section root     |
| `--space-5` | 20px   | padding modal/page wrapper         |
| `--space-6` | 24px   | gap macro-section                  |

## Mapping vecchio → nuovo

### fontSize

- 9, 10 → **11** (`--font-xs`) — micro-text leggibilità
- 11 → **11** (`--font-xs`)
- 12 → **12** (`--font-sm`)
- 13 → **13** (`--font-base`)
- 14, 15 → **14** (`--font-md`)
- 16 → **16** (`--font-lg`)
- 18, 20, 22 → **20** (`--font-xl`)
- 24, 28, 32 → **28** (`--font-2xl`)
- 36 → **36** (`--font-3xl`)

### borderRadius

- 3, 4, 5, 6 → **4** (`--radius-sm`)
- 7, 8, 10 → **8** (`--radius-md`)
- 12, 16 → **12** (`--radius-lg`)
- 999 → **999** (`--radius-full`)

### padding (per le combinazioni più comuni)

- `4px 8px` → `var(--space-1) var(--space-2)`
- `6px 12px` → `var(--space-1) var(--space-3)` (vicino)
- `8px 12px` → `var(--space-2) var(--space-3)`
- `8px 14px` → `var(--space-2) var(--space-4)` (arrotondato)
- `10px 14px` → `var(--space-3) var(--space-4)` (arrotondato)
- `12px 14px` → `var(--space-3) var(--space-4)`
- `12px 16px` → `var(--space-3) var(--space-4)`
- `14px 18px` → `var(--space-4) var(--space-5)` (arrotondato)
- `16px` → `var(--space-4)`
- `20px` → `var(--space-5)`

Note: in alcuni casi i valori vengono leggermente "forzati" nella scala (es.
`6px → 4px` nel padding pill può rendere la pill leggermente più tight). È
un trade-off accettabile per consistenza.

## Adozione

### Fase 1 — Tokens in globals.css ✅

CSS variables aggiunte sotto `@theme`.

### Fase 2 — Refactor incrementale

**Priority A** (componenti high-visibility, sempre a schermo):

- [ ] Header (HeaderActions + sub)
- [ ] BottomNav (mobile)
- [ ] TradeWidget + TradeConfirmModal
- [ ] OutcomeRowFull (event page candidates list)
- [ ] EventHero + EventRules + EventProbabilities

**Priority B** (componenti medium):

- [ ] MarketsGrid cards (EventCardHeader, Binary/Multi/Strike/H2H/Crypto)
- [ ] Sidebar (SidebarPositions, SidebarPortfolio, ecc)
- [ ] OnboardCard + WrapPusdSection
- [ ] SellConfirmModal + PositionRow + TradeHistoryRow + PositionsList + TradesHistoryList

**Priority C** (low-visibility, refactor opzionale):

- [ ] Test pages (test-auth, test-design-system, ecc)
- [ ] Footer, BottomNav inner items

### Fase 3 — Test 3 breakpoint

- Mobile 375px: iPhone SE / 14
- Tablet 768px: iPad portrait
- Desktop 1280px: laptop standard

## Regola da qui in avanti

**Nuove componenti**: usare SOLO le vars `--font-*`, `--radius-*`, `--space-*`.

**Colori**: continuare con le vars `--color-*` esistenti (Doc 8).

**Inline values numerici**: ammessi SOLO per dimensioni "geometriche"
(width avatar 40px, icon size 16px, height progress bar 4px) dove non esiste
una scala semantica naturale.

## Riferimenti

- Doc 8 — Design System (colori + token base)
- Doc 12 — Design Polish Strategy (roadmap polish)
