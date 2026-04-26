# Predimark V2 — Design System

> **Documento 8 di 10** — Design Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Design System completo
> Predecessori: Doc 1-7
> Audience: Cowork (per implementazione UI) + designer futuri

---

## Cos'è questo documento

Questo documento è il **vocabolario visivo e interattivo** di Predimark V2.

Definisce:

- **Design tokens** (colori, tipografia, spacing, radius, shadows) con codice CSS pronto
- **Iconografia** (Lucide React conventions)
- **Componenti base** (button, input, card, badge, chip)
- **Componenti complessi** (dialog, drawer, dropdown, tooltip)
- **Pattern UI ricorrenti** (form, table, list, hero, header)
- **Animazioni** (transition principles, motion)
- **Dark + Light mode** strategia
- **Accessibility** (keyboard nav, ARIA, focus, contrast)
- **Responsive** (breakpoints, mobile-first rules)

Cowork userà questo documento come **riferimento unico** per garantire coerenza visiva tra tutte le pagine.

---

## DECISIONI ARCHITETTURALI

| Decisione           | Scelta                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Font family         | **Inter** (variabile, copre tutte 5 lingue)                                                                |
| Border radius scale | **Mix moderato**: 4px / 8px / 12px / full (chip)                                                           |
| Density / Spacing   | **Dynamic**: compact in data-heavy (table, orderbook, leaderboard), spacious in landing/profile/onboarding |
| Animation           | **Moderate**: 200ms transitions standard, Framer Motion per modal/drawer/bottom sheet                      |
| Theming             | **Tailwind 4 con `@theme` directive** in `globals.css` (no `tailwind.config.ts`)                           |
| Component library   | **shadcn/ui** copy-paste (no npm dep)                                                                      |
| Icons               | **Lucide React** — zero emoji nelle UI                                                                     |

---

## 1. DESIGN TOKENS

### 1.1 — Palette colori

#### Dark mode (default)

```css
@theme {
  /* Backgrounds */
  --color-bg-primary: #0a0e1a; /* Body background */
  --color-bg-secondary: #141a2a; /* Card / panel background */
  --color-bg-tertiary: #1c2333; /* Hover / active state */
  --color-bg-elevated: #232b3d; /* Modal / dropdown background */

  /* Text */
  --color-text-primary: #ffffff; /* Headings, important text */
  --color-text-secondary: #b8c2d4; /* Body text */
  --color-text-tertiary: #7a849a; /* Helper, placeholder */
  --color-text-muted: #4a5169; /* Disabled */

  /* Borders */
  --color-border-default: #2a3142;
  --color-border-strong: #3a4258;
  --color-border-subtle: #1f2535;

  /* Semantic colors (regole strict Predimark) */
  --color-success: #10b981; /* Verde: Yes / Up / Buy / Profit / Win */
  --color-success-bg: #10b98115; /* Background tinted verde */
  --color-success-border: #10b981;

  --color-danger: #ef4444; /* Rosso: No / Down / Sell / Loss */
  --color-danger-bg: #ef444415;
  --color-danger-border: #ef4444;

  --color-cta: #3b82f6; /* Blu: CTA primario, link, action */
  --color-cta-hover: #2563eb;
  --color-cta-bg: #3b82f615;

  --color-live: #dc2626; /* Rosso pulsante: indicator LIVE */
  --color-hot: #f97316; /* Arancione: hot indicator */
  --color-info: #06b6d4; /* Ciano: info, neutral status */
  --color-warning: #fbbf24; /* Beige soft: warning (NO giallo brillante) */
  --color-warning-bg: #fbbf2415;

  /* Category colors (color blocking direzione Dribbble) */
  --color-cat-sport: #3b82f6; /* Blu */
  --color-cat-politics: #ef4444; /* Rosso */
  --color-cat-crypto: #f97316; /* Arancione */
  --color-cat-culture: #a855f7; /* Viola */
  --color-cat-news: #06b6d4; /* Verde-acqua */
  --color-cat-geopolitics: #1e40af; /* Blu scuro */
  --color-cat-economy: #047857; /* Verde scuro */
  --color-cat-tech: #6d28d9; /* Viola scuro */
}
```

#### Light mode

```css
@media (prefers-color-scheme: light) {
  @theme {
    /* Backgrounds */
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f9fafb;
    --color-bg-tertiary: #f3f4f6;
    --color-bg-elevated: #ffffff;

    /* Text */
    --color-text-primary: #0a0e1a;
    --color-text-secondary: #4a5169;
    --color-text-tertiary: #6b7280;
    --color-text-muted: #9ca3af;

    /* Borders */
    --color-border-default: #e5e7eb;
    --color-border-strong: #d1d5db;
    --color-border-subtle: #f3f4f6;

    /* Semantic (slightly darker variants per leggibilità su white) */
    --color-success: #059669;
    --color-success-bg: #05966915;
    --color-danger: #dc2626;
    --color-danger-bg: #dc262615;
    --color-cta: #3b82f6; /* Stesso blu (funziona bene) */
    --color-cta-hover: #2563eb;
    --color-cta-bg: #3b82f615;
    --color-live: #dc2626;
    --color-hot: #ea580c;
    --color-info: #0891b2;
    --color-warning: #d97706;
    --color-warning-bg: #d9770615;

    /* Category colors (light variants leggermente più scuri per contrasto) */
    --color-cat-sport: #2563eb;
    --color-cat-politics: #dc2626;
    --color-cat-crypto: #ea580c;
    --color-cat-culture: #9333ea;
    --color-cat-news: #0891b2;
    --color-cat-geopolitics: #1e3a8a;
    --color-cat-economy: #065f46;
    --color-cat-tech: #5b21b6;
  }
}
```

### 1.2 — Regole strict colori

Queste regole sono **sacre** in tutta la UI:

- ✅ **Verde** = Yes / Up / Buy / Profit / Win — sempre
- ✅ **Rosso** = No / Down / Sell / Loss — sempre
- ✅ **Blu** = CTA primario, link, action — sempre
- ✅ **Grigio** = neutral, dati informativi
- ✅ **Live indicator** = rosso pulsante `#dc2626`
- ✅ **Hot indicator** = arancione `#f97316`
- ❌ **MAI giallo brillante** in UI Predimark (riservato a warning come `#fbbf24` soft)
- ❌ **MAI rosa, viola brillante, fluo** (look distintivo: serio + moderno)

Per validation:

- Errori di form → rosso (`--color-danger`)
- Successi/conferme → verde (`--color-success`)
- Info neutral → ciano (`--color-info`)
- Warning soft → beige (`--color-warning`, mai giallo)

### 1.3 — Tipografia

```css
@theme {
  /* Font families */
  --font-sans: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace; /* Per address, numeri, codice */

  /* Font sizes (mobile-first) */
  --text-xs: 11px; /* Helper, tooltip */
  --text-sm: 13px; /* Body small, badge, chip */
  --text-base: 15px; /* Body default */
  --text-lg: 17px; /* Subheading */
  --text-xl: 20px; /* H4 */
  --text-2xl: 24px; /* H3 */
  --text-3xl: 30px; /* H2 */
  --text-4xl: 36px; /* H1 */
  --text-5xl: 48px; /* Hero title (desktop) */
  --text-6xl: 60px; /* Equity curve number, KPI big */

  /* Font weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line heights */
  --leading-tight: 1.2; /* Headings */
  --leading-normal: 1.5; /* Body */
  --leading-relaxed: 1.7; /* Long paragraphs */

  /* Letter spacing */
  --tracking-tight: -0.02em; /* Big numbers (KPI, equity curve) */
  --tracking-normal: 0;
  --tracking-wide: 0.05em; /* Small caps, labels */
}
```

### 1.4 — Type scale (uso pratico)

```
H1 / Hero title    36-48px / weight 700 / tight tracking
H2                 30px / weight 700
H3                 24px / weight 600
H4                 20px / weight 600
Body large         17px / weight 400
Body default       15px / weight 400 / leading-normal
Body small         13px / weight 400
Caption / Helper   11-13px / weight 400 / muted color
Number (KPI)       36-60px / weight 700 / mono / tight tracking
```

**Uso Inter Variable**: importare via `next/font/google` con weights 400, 500, 600, 700.

### 1.5 — Spacing scale

Tailwind default + utility custom per dynamic density:

```css
@theme {
  /* Spacing scale (Tailwind compatible) */
  --spacing-0: 0;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
}
```

**Density rules**:

```
DATA-HEAVY (table, orderbook, leaderboard):
  cell padding:          spacing-2 (8px) vertical, spacing-3 (12px) horizontal
  row gap:               spacing-1 (4px)
  section gap:           spacing-4 (16px)

SPACIOUS (landing, profile, onboarding):
  container padding:     spacing-6 (24px) mobile, spacing-12 (48px) desktop
  section gap:           spacing-12 (48px) mobile, spacing-16 (64px) desktop
  card padding:          spacing-6 (24px)

DEFAULT (most pages):
  container padding:     spacing-4 (16px) mobile, spacing-8 (32px) desktop
  section gap:           spacing-8 (32px)
  card padding:          spacing-4 (16px)
```

### 1.6 — Border radius

```css
@theme {
  --radius-none: 0;
  --radius-xs: 2px; /* Bordo sottile elementi piccoli */
  --radius-sm: 4px; /* Badge, micro-elements */
  --radius: 8px; /* Default: button, input, card small */
  --radius-md: 12px; /* Card large, modal, hero */
  --radius-lg: 16px; /* Modal grandi, dialog */
  --radius-xl: 24px; /* Hero card grandi */
  --radius-full: 9999px; /* Chip, avatar, indicator */
}
```

**Uso**:

- **Button**: `--radius` (8px)
- **Card EventCard**: `--radius-md` (12px)
- **Hero card grande**: `--radius-xl` (24px)
- **Chip / pill**: `--radius-full`
- **Avatar**: `--radius-full`
- **Modal**: `--radius-lg` (16px)
- **Bottom sheet mobile**: `--radius-xl` (24px) solo top corners
- **Input**: `--radius` (8px)
- **Badge / tag**: `--radius-sm` (4px) o `--radius-full` per pill style

### 1.7 — Shadows

```css
@theme {
  /* Dark mode shadows (più sottili, perché bg già scuro) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
  --shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.7);

  /* Glow effects (per highlighted state) */
  --glow-cta: 0 0 0 3px rgba(59, 130, 246, 0.4);
  --glow-success: 0 0 0 3px rgba(16, 185, 129, 0.4);
  --glow-danger: 0 0 0 3px rgba(239, 68, 68, 0.4);
}

@media (prefers-color-scheme: light) {
  @theme {
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
    --shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
}
```

**Uso**:

- **Card hover**: `--shadow-md`
- **Modal**: `--shadow-xl`
- **Dropdown**: `--shadow-lg`
- **Tooltip**: `--shadow`
- **Button focus**: `--glow-cta`

### 1.8 — Z-index scale

```css
@theme {
  --z-base: 1;
  --z-sticky: 10; /* Sticky header */
  --z-dropdown: 20;
  --z-tooltip: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-toast: 60;
  --z-skip-link: 100; /* Accessibility skip link sempre visibile */
}
```

---

## 2. ICONOGRAFIA

### 2.1 — Lucide React conventions

Usiamo **Lucide React** ovunque. Mai emoji nelle UI Predimark.

**Sizes standard**:

- 14px — inline con testo small
- 16px — default in pulsanti, link
- 20px — header nav, CTA
- 24px — sezione headings, hero
- 32px — large indicator
- 48px — empty state, hero centrale

### 2.2 — Icone più usate (riferimento)

| Use case                | Icon name                         |
| ----------------------- | --------------------------------- |
| Navigation home         | `Home`                            |
| Search                  | `Search`                          |
| Filter                  | `SlidersHorizontal`               |
| Sort                    | `ArrowUpDown`                     |
| User profile            | `User` / `UserCircle`             |
| Settings                | `Settings`                        |
| Notifications           | `Bell`                            |
| Wallet                  | `Wallet`                          |
| Bookmark / watchlist    | `Bookmark`                        |
| Share                   | `Share2`                          |
| External link           | `ExternalLink`                    |
| More menu               | `MoreHorizontal` / `MoreVertical` |
| Close                   | `X`                               |
| Chevron up/down         | `ChevronUp` / `ChevronDown`       |
| Chevron left/right      | `ChevronLeft` / `ChevronRight`    |
| Trending up/down        | `TrendingUp` / `TrendingDown`     |
| Check / success         | `Check` / `CheckCircle2`          |
| X / error               | `XCircle`                         |
| Warning                 | `AlertTriangle`                   |
| Info                    | `Info`                            |
| Live indicator          | `Radio` (pulsante) o custom dot   |
| Hot indicator           | `Flame`                           |
| Trophy / achievement    | `Trophy`                          |
| Star / favorite         | `Star`                            |
| Lock                    | `Lock`                            |
| Sign out                | `LogOut`                          |
| Camera / upload         | `Camera` / `Upload`               |
| Telegram                | `Send` (custom Telegram SVG)      |
| Calendar                | `Calendar`                        |
| Clock / timer           | `Clock`                           |
| Globe / language        | `Globe`                           |
| Sun/Moon (theme toggle) | `Sun` / `Moon`                    |

### 2.3 — Custom SVG icons (per branding)

Alcune icone le facciamo custom (Predimark logo, brand icons):

- **Logo Predimark** — SVG in `public/logo.svg`
- **Verified badge** — SVG custom con check blu
- **External trader badge** — SVG custom con warning soft

### 2.4 — Icone dinamiche per categoria

```typescript
const CategoryIcons = {
  crypto: Bitcoin,
  sport: Trophy,
  politics: Vote,
  culture: Film,
  news: Newspaper,
  geopolitics: Globe,
  economy: TrendingUp,
  tech: Cpu,
}
```

### 2.5 — Animazioni icone

- **Live indicator**: pulse animation (scale 1 → 1.2 → 1, infinite, 1.5s)
- **Loading spinner**: rotate 360° linear infinite
- **Bell notification**: shake quando nuova notifica
- **Heart like**: scale up on tap
- **Bookmark**: rotate 0 → -10° → 10° → 0 on tap

---

## 3. COMPONENTI BASE

### 3.1 — Button

#### Varianti

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'
```

#### Spec visivo

```
PRIMARY (CTA):
  bg: --color-cta (#3b82f6)
  text: white
  hover: --color-cta-hover (#2563eb)
  active: scale 0.98

SECONDARY:
  bg: --color-bg-tertiary
  text: --color-text-primary
  border: --color-border-default
  hover: bg --color-bg-elevated

OUTLINE:
  bg: transparent
  text: --color-text-primary
  border: --color-border-strong
  hover: bg --color-bg-tertiary

GHOST:
  bg: transparent
  text: --color-text-primary
  hover: bg --color-bg-tertiary

DANGER:
  bg: --color-danger
  text: white
  hover: --color-danger filter brightness(1.1)

SUCCESS:
  bg: --color-success
  text: white
  hover: --color-success filter brightness(1.1)
```

#### Sizes

```
SM:
  height: 32px
  padding: 6px 12px
  font: 13px
  icon: 14px

MD (default):
  height: 40px
  padding: 8px 16px
  font: 15px
  icon: 16px

LG:
  height: 48px
  padding: 12px 24px
  font: 17px
  icon: 20px

XL:
  height: 56px
  padding: 16px 32px
  font: 17px
  icon: 24px
```

#### States

- **Default**: vedi sopra
- **Hover**: cambio bg, transition 200ms
- **Active**: scale 0.98, transition 100ms
- **Disabled**: opacity 0.5, cursor not-allowed
- **Loading**: spinner inline + testo grigio
- **Focus**: glow ring (`--glow-cta` per primary, ecc.)

#### Trade widget special buttons

I bottoni trade nella pagina evento sono **speciali**:

```
Buy Yes / Up:
  bg: --color-success-bg (verde tinted 15%)
  text: --color-success
  border: --color-success
  height: 56px (large)

Buy No / Down:
  bg: --color-danger-bg (rosso tinted 15%)
  text: --color-danger
  border: --color-danger
  height: 56px

Quando selected (clicked):
  bg: --color-success / --color-danger (full)
  text: white
```

### 3.2 — Input

```
Default:
  height: 40px
  padding: 8px 12px
  border: 1px solid --color-border-default
  border-radius: 8px
  bg: --color-bg-secondary
  text: --color-text-primary
  font: 15px

Focus:
  border: --color-cta
  glow: --glow-cta (3px ring)

Error:
  border: --color-danger
  glow: --glow-danger (3px ring)
  + helper text rosso sotto

Disabled:
  bg: --color-bg-tertiary
  text: --color-text-muted
  cursor: not-allowed
```

### 3.3 — Card

```
Default Card:
  bg: --color-bg-secondary
  border: 1px solid --color-border-subtle
  border-radius: 12px
  padding: 16px (default) o 24px (spacious)
  shadow: none di default

Hoverable:
  hover: border --color-border-default, shadow --shadow-md
  cursor: pointer
  transition: all 200ms

Selected / Active:
  border: --color-cta
  glow: --glow-cta

Highlight (Hot, Featured):
  border: --color-hot (arancione)
```

#### EventCard varianti (per CardKind)

5 varianti EventCard (vedi Doc 4 Pagina 1):

1. **Binary**: hero singolo con donut prob
2. **Multi-outcome**: lista compact outcome
3. **Multi-strike**: ladder soglie
4. **H2H Sport**: 2 team + score
5. **Crypto Up/Down**: countdown + bottoni Up/Down

Pattern comune:

- Border-radius 12px
- Padding 16px desktop, 12px mobile
- Header con icon + title + tags
- Body con CardKind-specific content
- Footer con volume + close countdown

### 3.4 — Badge

```
Default Badge:
  height: 20px
  padding: 2px 8px
  border-radius: 4px o full (pill style)
  font: 11px / weight 500

Variants:
  - Default: bg --color-bg-tertiary, text --color-text-secondary
  - Success: bg --color-success-bg, text --color-success
  - Danger: bg --color-danger-bg, text --color-danger
  - Info: bg #06b6d415, text --color-info
  - Warning: bg --color-warning-bg, text --color-warning
  - Verified: bg --color-cta-bg, text --color-cta + icon CheckCircle2

LIVE badge (special):
  bg: --color-live (rosso pulsante)
  text: white
  border-radius: full
  + dot pulsante a sinistra (animazione)

HOT badge (special):
  bg: --color-hot (arancione)
  text: white
  border-radius: full
  + Flame icon
```

### 3.5 — Chip (filter/select)

```
Default Chip:
  height: 32px
  padding: 6px 12px
  border-radius: full
  border: 1px solid --color-border-default
  bg: transparent
  font: 13px
  cursor: pointer

Selected:
  bg: --color-cta
  text: white
  border: --color-cta

Hover (non-selected):
  border: --color-cta
  bg: --color-cta-bg
```

Usato in: filter periods, tipo trader, categorie, preferences interests, scadenza preset trade widget.

### 3.6 — Avatar

```
Sizes:
  xs: 24px
  sm: 32px
  md: 40px (default)
  lg: 48px
  xl: 64px (hero)
  2xl: 80px (creator hero)

Border-radius: full
Border: 2px solid --color-bg-secondary (per stand out su backgrounds)

Fallback (no avatar URL):
  Verified Creator: gradient da hash username
  External Trader: gradient da hash address (più neutral)

Status indicator (optional):
  small dot top-right (8px diametro, border bg)
  online: --color-success
  away: --color-warning
```

---

## 4. COMPONENTI COMPLESSI

### 4.1 — Dialog / Modal

Pattern shadcn/ui Dialog:

```
Backdrop:
  bg: rgba(0, 0, 0, 0.6)
  blur: 4px
  z-index: --z-modal-backdrop
  fade-in: 200ms

Container:
  max-width: 480px (default), 640px (large), 800px (xl)
  bg: --color-bg-elevated
  border-radius: 16px
  shadow: --shadow-xl
  z-index: --z-modal
  centered viewport

Animation:
  Enter: fade + scale 0.95 → 1, 250ms ease-out
  Exit: fade + scale 1 → 0.95, 200ms ease-in

Sections:
  Header: padding 24px, border-bottom subtle, contains title + close button
  Body: padding 24px, scrollable se overflow
  Footer: padding 24px, border-top subtle, action buttons (right-aligned)
```

### 4.2 — Drawer (sidebar slideout)

Per mobile menu, filters avanzati, sub-pages admin:

```
Position: right (default), left, bottom

Width:
  Mobile: 90vw (max 360px)
  Desktop: 320-400px

Animation:
  Slide-in 300ms ease-out
  Slide-out 250ms ease-in

Backdrop: come modal

Z-index: --z-modal
```

### 4.3 — Bottom Sheet (mobile only)

Pattern usato per Trade Widget mobile (vedi Doc 4 Pagina 2):

```
Position: bottom, full width
Height: dynamic (50-90vh)
Border-radius: 24px solo top corners
Bg: --color-bg-elevated

Drag handle:
  width: 40px
  height: 4px
  bg: --color-border-strong
  border-radius: full
  centered top

Animation:
  Slide-up 300ms ease-out
  Slide-down 250ms ease-in
  Swipe-down to close (Framer Motion drag)

Backdrop pages dietro: oscurate ma countdown/prezzo ancora leggibili sopra
```

### 4.4 — Dropdown Menu

```
Trigger: button con ChevronDown icon
Width: min 200px, max 320px
Border-radius: 8px
Bg: --color-bg-elevated
Shadow: --shadow-lg
Border: 1px solid --color-border-default

Items:
  height: 36px
  padding: 8px 12px
  hover: bg --color-bg-tertiary
  selected: bg --color-cta-bg, text --color-cta

Separators: border-top --color-border-subtle

Animation:
  Open: fade + scale 0.95 → 1 from origin, 200ms
  Close: fade out 150ms
```

### 4.5 — Tabs

3 varianti:

```
TABS UNDERLINE (default per page sub-nav):
  Tab item: padding 12px 16px
  Active: border-bottom 2px --color-cta, text --color-cta
  Inactive: text --color-text-secondary
  Hover: text --color-text-primary

TABS PILL (per filter sections):
  Container: bg --color-bg-tertiary, border-radius full, padding 4px
  Tab item: padding 6px 16px, border-radius full
  Active: bg --color-bg-elevated, shadow-sm, text primary
  Inactive: transparent, text secondary

TABS BUTTON (per leaderboard 2-tab mode):
  Like outline buttons but grouped, no gap
  Active: bg --color-cta, text white
  Inactive: bg transparent, border --color-border-default
```

### 4.6 — Tooltip

```
Bg: --color-bg-elevated
Color: --color-text-primary
Border: 1px solid --color-border-default
Border-radius: 6px
Padding: 6px 10px
Font: 13px
Shadow: --shadow
Max-width: 280px

Position: top (default), bottom, left, right (auto-flip if outside viewport)

Arrow: 6px triangle pointing to trigger

Delay:
  Show: 500ms (debounced)
  Hide: 100ms

Animation:
  Show: fade + slight slide from origin, 200ms
```

### 4.7 — Toast / Notification

```
Position: top-right (default), bottom-right
Width: 360px
Padding: 12px 16px
Border-radius: 8px
Shadow: --shadow-md

Variants (border-left 4px):
  Success: border-success, icon CheckCircle2 verde
  Danger: border-danger, icon XCircle rosso
  Info: border-info, icon Info ciano
  Warning: border-warning, icon AlertTriangle beige

Auto-dismiss:
  Success/Info: 4 secondi
  Warning: 6 secondi
  Danger: 8 secondi (più tempo per leggere)

Animation:
  Enter: slide from right + fade, 300ms
  Exit: slide right + fade, 250ms

Stack: max 3 toasts visibili, gli altri in queue
```

### 4.8 — Skeleton Loader

```
Bg: gradient da --color-bg-secondary a --color-bg-tertiary
Animation: shimmer left-to-right, 1.5s infinite
Border-radius: matches content (8px text, 12px card)

Variants pre-built:
  - SkeletonText (single line)
  - SkeletonHeading (larger text)
  - SkeletonAvatar (circle)
  - SkeletonCard (full card placeholder)
  - SkeletonTable (multiple rows)
  - SkeletonChart (rectangle large)
```

### 4.9 — Progress / Loader

```
Spinner:
  size: 14px (inline), 20px (button), 32px (page), 48px (overlay)
  stroke: --color-cta
  rotate: 360° linear infinite, 800ms

Progress Bar:
  height: 4px (default), 8px (large)
  bg-track: --color-border-default
  bg-fill: --color-cta
  border-radius: full
  smooth animation on value change (300ms)

Indeterminate:
  bar che si muove avanti-indietro
```

---

## 5. PATTERN UI RICORRENTI

### 5.1 — Form

```
Form layout:
  vertical stack, gap 16px (default) o 24px (spacious)

Field:
  Label: 13px / weight 500 / margin-bottom 6px
  Input: height 40px (vedi Input spec)
  Helper text: 11px / muted color / margin-top 4px
  Error text: 11px / danger color / margin-top 4px

Required indicator: asterisco rosso "*" dopo label

Group headers: 17px / weight 600 / margin-bottom 12px
Group separator: border-top --color-border-subtle, margin 24px 0

Submit button: full-width mobile, auto desktop, primary variant
Cancel link: ghost variant, inline a sinistra del submit
```

### 5.2 — Table (data-heavy compact)

```
Table:
  width: 100%
  border-collapse: separate
  border-spacing: 0

Thead:
  bg: --color-bg-secondary
  text: --color-text-tertiary, 11px / weight 500 / uppercase / tracking-wide
  border-bottom: 1px solid --color-border-default

Th:
  padding: 12px (vertical 8px, horizontal 12px)
  text-align: left (default), right per numbers
  Sortable: cursor pointer, hover bg --color-bg-tertiary

Tbody:
  Tr: border-bottom 1px solid --color-border-subtle
  Tr hover: bg --color-bg-tertiary, cursor pointer
  Tr selected: bg --color-cta-bg

Td:
  padding: 10px 12px
  font: 13px
  text: --color-text-primary
  vertical-align: middle

Special cells:
  Currency / numbers: font-mono, text-align right, tabular-nums
  Avatar + name combo: flex gap 8px
  Status badges: inline
  Action buttons: small ghost variant

Mobile responsive:
  Cards layout invece di table (a <768px)
  O scroll horizontal con sticky first column
```

### 5.3 — List (vertical card list)

```
List Container:
  vertical stack, gap 12px (compact) o 16px (default)

ListItem (Card variant):
  padding: 16px
  border-radius: 12px
  bg: --color-bg-secondary
  border: 1px solid --color-border-subtle
  hover: shadow-md, border-default
  cursor: pointer
  transition: 200ms

Empty state:
  Centered content
  Icon 48px (--color-text-muted)
  Heading 17px (--color-text-secondary)
  Body 13px (--color-text-tertiary)
  CTA button (primary)
  padding: 64px vertical
```

### 5.4 — Hero section

#### Hero standard (page header)

```
Padding: 32px (mobile), 48px desktop
Background: optional gradient or image
Title: 36-48px / weight 700 / tight tracking
Subtitle: 17px / weight 400 / muted
Actions: button group margin-top 24px
```

#### Hero finanziario /me (Robinhood-style)

```
KPI principale (saldo): 36-48px / mono / weight 700
Delta (P&L oggi): 17px / weight 600 / verde o rosso + arrow icon
Equity curve chart: 200-300px height
Quick actions: button group sotto
```

#### Hero card grande (Pagina 1 home Dribbble-style)

```
Border-radius: 24px
Padding: 32px
Background: gradient categoria
Image: full bleed o icon decorativa
Title: 30px / weight 700
Donut probability: 120px diametro centrale
CTA: primary variant
```

### 5.5 — Header (top bar)

#### Header globale (per tutte le pagine pubbliche)

```
Height: 64px desktop, 56px mobile
Bg: --color-bg-primary
Border-bottom: 1px solid --color-border-default
Position: sticky top, z-index --z-sticky

Layout:
  Logo: 32px, left
  Nav primary (desktop): inline links
  Nav primary (mobile): hamburger drawer
  Search bar (desktop): center, max 600px
  User menu: right, avatar + dropdown
  Notifications icon: right, bell + badge count
  Theme toggle: right
  REAL/DEMO switch: right (loggato)
```

#### Header admin

```
Height: 56px
Bg: --color-bg-secondary (slightly different per zona admin)
Border-bottom: 2px solid bordeaux (visivo "sei in admin")

Layout:
  Logo "Predimark Admin": left
  Role badge: "Super-admin · Feliciano"
  Last login info
  Search global
  Switch to user view
  Notifications admin
  Profile dropdown
  Logout
```

### 5.6 — Sidebar (admin / settings)

```
Width: 240px (collapsed: 64px icon-only)
Bg: --color-bg-secondary
Border-right: 1px solid --color-border-default
Position: sticky / scroll independent

Sections (collapsible):
  Header: 13px / uppercase / tracking-wide / muted color
  Items: 36px height, padding 8px 12px, icon 16px + text
  Active item: bg --color-cta-bg, border-left 3px --color-cta, text --color-cta
  Hover: bg --color-bg-tertiary
  Badge counts: right-aligned, small bg-tertiary pill

Toggle collapse: bottom button "← Collapse" / icon-only ">"
```

---

## 6. ANIMAZIONI

### 6.1 — Transition principles

Stack di durata standard:

```
--transition-fast: 100ms     /* micro-interactions: active state, ripple */
--transition-base: 200ms     /* default: hover, color change, opacity */
--transition-slow: 300ms     /* enter/exit modal, drawer */
--transition-slower: 500ms   /* page transitions (rare) */

--ease-default: cubic-bezier(0.4, 0, 0.2, 1)    /* ease-out */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55)  /* per chip selection */
--ease-spring: spring(1, 80, 10, 0)             /* per modal Framer */
```

### 6.2 — Tailwind utilities

```css
.transition-default {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition:
    color 200ms,
    background-color 200ms,
    border-color 200ms;
}

.transition-transform {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 6.3 — Framer Motion usage

Riservato per:

- **Modal / Dialog** (`AnimatePresence` + variants)
- **Drawer / Bottom Sheet** (`drag` con elastic constraints)
- **Page transitions** rare casi (es. onboarding wizard step)
- **Hero card flip / reveal** (se direzione visiva lo richiede)

```typescript
// Esempio bottom sheet
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
  drag="y"
  dragConstraints={{ top: 0, bottom: 200 }}
  onDragEnd={(_, info) => {
    if (info.offset.y > 100) onClose();
  }}
>
  ...
</motion.div>
```

### 6.4 — Special animations

#### Live indicator pulse

```css
@keyframes pulse-live {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.3);
  }
}

.live-dot {
  animation: pulse-live 1.5s ease-in-out infinite;
}
```

#### Number ticker (price changes)

Quando un prezzo cambia, animazione flash:

```css
@keyframes flash-up {
  0% {
    background: --color-success;
    color: white;
  }
  100% {
    background: transparent;
    color: var(--current);
  }
}

@keyframes flash-down {
  0% {
    background: --color-danger;
    color: white;
  }
  100% {
    background: transparent;
    color: var(--current);
  }
}
```

Durata 200ms, applicato on price change via React effect.

#### Skeleton shimmer

```css
@keyframes shimmer {
  from {
    background-position: -200% 0;
  }
  to {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 0%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 6.5 — Reduced motion

Rispettare `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Anche un toggle in `/me/settings/profile`: "Reduce animations" (per accessibility).

---

## 7. DARK + LIGHT MODE

### 7.1 — Strategia

- **Default**: segue `prefers-color-scheme` del browser
- **Override utente**: settings in user preferences (`theme` field), salvato in localStorage + DB
- **Toggle nel header**: icona Sun (light → dark) / Moon (dark → light)

### 7.2 — Implementazione

Tailwind 4 con `class` strategy:

```html
<html class="dark">
  <!-- o "light" -->
</html>
```

JavaScript switcher:

```typescript
function setTheme(theme: 'light' | 'dark') {
  const html = document.documentElement
  html.classList.remove('light', 'dark')
  html.classList.add(theme)
  localStorage.setItem('predimark-theme', theme)
}

// On mount
const saved = localStorage.getItem('predimark-theme')
const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
setTheme(saved ?? preferred)
```

### 7.3 — Differenze visive principali

```
DARK MODE:
  bg: deep navy #0a0e1a (mai puro black)
  cards: lighter navy #141a2a
  text: white #ffffff
  accents: vibrant (verde brillante, rosso brillante)
  shadows: pronunced

LIGHT MODE:
  bg: pure white #ffffff
  cards: subtle gray #f9fafb
  text: deep navy #0a0e1a
  accents: slightly desaturated (verde più scuro, rosso più profondo)
  shadows: subtle
```

### 7.4 — Test entrambi i mode

**Regola**: ogni componente deve essere testato in entrambi i mode prima del merge.

---

## 8. ACCESSIBILITY

### 8.1 — Keyboard navigation

Tutto navigabile da tastiera:

- **Tab** / **Shift+Tab**: tra elementi interattivi
- **Enter** / **Space**: attiva button/link/checkbox
- **Esc**: chiude modal/dropdown
- **Frecce**: in tabs, dropdown items, slider
- **Home/End**: in lists lunghe

### 8.2 — Focus visible

Mai rimuovere `outline` senza alternative. Sempre **focus ring** custom:

```css
*:focus-visible {
  outline: none;
  box-shadow: var(--glow-cta);
  border-radius: var(--radius);
}
```

### 8.3 — ARIA roles e labels

```html
<!-- Button -->
<button aria-label="Close dialog">
  <X />
</button>

<!-- Tab -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Overview</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">History</button>
</div>
<div role="tabpanel" id="panel-1">...</div>

<!-- Live region -->
<div aria-live="polite">Price updated to $0.65</div>

<!-- Loading -->
<button aria-busy="true">Loading...</button>
```

### 8.4 — Color contrast (WCAG AA / AAA)

Tutti i testi devono passare WCAG AA:

- **Body text** (15px+): ratio ≥ 4.5:1
- **Headings** (18px+): ratio ≥ 3:1
- **UI components** (buttons, icons): ratio ≥ 3:1

Verificato con tool **WebAIM Contrast Checker**.

**Eccezioni**: solo per testi decorativi (caption) in muted color, dove leggibilità non è critica.

### 8.5 — Touch target size

Mobile minimum 44x44px (Apple HIG standard):

- Buttons: min height 44px su mobile
- Icon-only buttons: 44x44 hit area (anche se icon è 20px)
- Link inline: padding extra per dare hit area

### 8.6 — Screen reader

- **Skip link**: invisibile ma keyboard-focusable, "Skip to main content"
- **Heading hierarchy** corretta (H1 unico per page, H2 sezioni, H3 sub-sezioni)
- **Alt text** su tutte le immagini significative
- **`<button>`** preferito su `<div onClick>` per native semantics

### 8.7 — Forms accessibility

```html
<label for="username">Username</label>
<input id="username" type="text" aria-describedby="username-helper" />
<p id="username-helper">3-20 lowercase alphanumeric characters</p>

<!-- Error -->
<input aria-invalid="true" aria-describedby="error-username" />
<p id="error-username" role="alert">Username already taken</p>
```

---

## 9. RESPONSIVE

### 9.1 — Breakpoints

Tailwind default + custom Predimark:

```css
@theme {
  --breakpoint-xs: 480px;
  --breakpoint-sm: 640px; /* Mobile large */
  --breakpoint-md: 768px; /* Tablet */
  --breakpoint-lg: 1024px; /* Desktop */
  --breakpoint-xl: 1280px; /* Large desktop */
  --breakpoint-2xl: 1536px; /* Wide */
}
```

### 9.2 — Mobile-first rules

Tutti gli stili **partono da mobile**, poi vengono espansi via `md:`, `lg:`, ecc.

```html
<!-- ✅ CORRETTO -->
<div class="px-4 lg:px-8 text-sm lg:text-base">
  <!-- ❌ SBAGLIATO -->
  <div class="px-8 sm:px-4 text-base sm:text-sm"></div>
</div>
```

### 9.3 — Layout patterns

#### Stack → Grid

```html
<!-- Mobile: stack vertical -->
<!-- Desktop: 2 colonne -->
<div class="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_320px]">
  <main>...</main>
  <aside>...</aside>
</div>
```

#### Hamburger → Inline nav

```html
<!-- Mobile: hamburger drawer -->
<button class="lg:hidden"><menu /></button>
<!-- Desktop: inline -->
<nav class="hidden lg:flex">...</nav>
```

#### Bottom sheet → Sidebar

Trade widget (Doc 4 Pagina 2):

- Mobile: bottom sheet on click
- Desktop: sidebar fissa destra

### 9.4 — Touch vs hover

```css
/* Hover effects solo su devices con hover capability */
@media (hover: hover) {
  .card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

/* Active state per touch */
.card:active {
  transform: scale(0.98);
}
```

### 9.5 — Bottom navigation mobile

5 voci principali (vedi Doc 4 Pagina 1):

```
[Home] [Search] [Signals] [Bet Slip] [Altro]
```

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  bg: --color-bg-elevated;
  border-top: 1px solid --color-border-default;
  display: flex;
  z-index: --z-sticky;
}

@media (min-width: 1024px) {
  .bottom-nav {
    display: none; /* Solo mobile */
  }
}
```

### 9.6 — Safe areas (iOS notch / Android system bars)

```css
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-top {
  padding-top: env(safe-area-inset-top);
}
```

---

## 10. ESEMPI COMPLETI

### 10.1 — globals.css completo

```css
@import 'tailwindcss';

@theme {
  /* Colors (vedi sezione 1.1) */
  --color-bg-primary: #0a0e1a;
  --color-bg-secondary: #141a2a;
  /* ... tutti i token ... */

  /* Typography */
  --font-sans: 'Inter Variable', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-base: 15px;
  /* ... */

  /* Spacing, radius, shadows... */
}

@layer base {
  body {
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
  }

  /* Focus visible */
  *:focus-visible {
    outline: none;
    box-shadow: var(--glow-cta);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

### 10.2 — Componente Button (shadcn/ui adapted)

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-default focus-visible:ring-2 focus-visible:ring-cta disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-cta text-white hover:bg-cta-hover',
        secondary: 'bg-bg-tertiary text-text-primary border border-border-default hover:bg-bg-elevated',
        outline: 'border border-border-strong text-text-primary hover:bg-bg-tertiary',
        ghost: 'text-text-primary hover:bg-bg-tertiary',
        danger: 'bg-danger text-white hover:brightness-110',
        success: 'bg-success text-white hover:brightness-110',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded',
        md: 'h-10 px-4 text-base rounded-lg',
        lg: 'h-12 px-6 text-lg rounded-lg',
        xl: 'h-14 px-8 text-lg rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
);
```

---

## 11. CHECKLIST IMPLEMENTAZIONE

Per Cowork:

- [ ] Setup `globals.css` con tutti i design tokens
- [ ] Configurare Inter Variable via `next/font/google`
- [ ] Installare shadcn/ui base components (button, input, card, dialog, dropdown, tabs, etc.)
- [ ] Adattare componenti shadcn/ui ai nostri design tokens
- [ ] Implementare theme switcher (dark/light/auto)
- [ ] Implementare bottom navigation mobile
- [ ] Implementare focus-visible ring globale
- [ ] Test reduced motion preference
- [ ] Test screen reader su pagine critiche (signup, trade, profilo)
- [ ] Validate WCAG AA su 5 lingue
- [ ] Setup Lucide icons + lazy load
- [ ] Setup Framer Motion solo per modal/drawer/bottom sheet
- [ ] Test breakpoints responsive su 4 device size (375, 768, 1024, 1440)

---

## 12. RIFERIMENTI

- **Documento 1** v3 — Vision (palette regole strict)
- **Documento 4** — Wireframes (componenti specifici per pagina)
- **Documento 5** — Tech stack (Tailwind 4, shadcn/ui, Lucide, Framer Motion)
- **Documento 7** — API design (componenti che consumano API)

---

_Fine Documento 8 — Design System_
_Continua con Documento 9 (Roadmap V1→V2) nella sessione successiva_
