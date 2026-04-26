# PROMPT — Sprint 3.3.1 — EventCard Binary variant

> Copia e incolla questo prompt in Claude in VS Code.

---

## Contesto

Il layer dati Polymarket è pronto (`lib/polymarket/`). Ora costruiamo il primo componente UI reale: la EventCard nella variante Binary. È il componente più usato dell'app — ogni pagina Home ne contiene decine.

---

## Struttura da creare

```
components/markets/
  EventCard.tsx               ← container che riceve AuktoraEvent e renderizza la variant giusta
  cards/
    BinaryCard.tsx            ← variante binary (questo sprint)
    EventCardHeader.tsx       ← header comune a tutte le varianti (riusato)
    EventCardFooter.tsx       ← footer comune a tutte le varianti (riusato)
  charts/
    DonutChart.tsx            ← donut SVG probability (riusato in più varianti)
```

---

## Design da rispettare (Doc 4 — Wireframe Binary)

```
┌──────────────────────────────────────────────┐
│ [📷 img]  Titolo evento            [badge][🔖]│
│           Tag · categoria                      │
├──────────────────────────────────────────────┤
│              [DONUT] 62% Yes                   │
│                                                │
│     ┌────────────────┐  ┌────────────────┐    │
│     │     Yes  62%   │  │     No   38%   │    │
│     └────────────────┘  └────────────────┘    │
├──────────────────────────────────────────────┤
│ $24.5M Vol · Closes Nov 2028      [+ Slip]   │
└──────────────────────────────────────────────┘
```

---

## 1. `components/markets/charts/DonutChart.tsx`

Componente SVG puro (no librerie). Mostra una singola probabilità (0-1) come arco colorato su sfondo grigio.

Props:

```typescript
interface DonutChartProps {
  probability: number // 0 a 1 (es. 0.62 = 62%)
  size?: number // diameter in px, default 80
  strokeWidth?: number // default 10
  color?: string // default var(--color-success) se >0.5, var(--color-danger) se <0.5
}
```

Implementazione SVG:

- Cerchio base: `stroke="var(--color-bg-tertiary)"` (arco grigio completo)
- Arco valore: `stroke-dasharray` e `stroke-dashoffset` per mostrare la percentuale
- Testo centrale: `{Math.round(probability * 100)}%`, font-weight 700, font-size relativo al size
- Etichetta sotto il testo: "Yes" se >0.5, "No" se <0.5, colore coerente
- `transform="rotate(-90)"` sull'arco per partire dall'alto
- Nessuna animazione (arriverà in sprint separato)

---

## 2. `components/markets/EventCardHeader.tsx`

Header riusabile da tutte le varianti.

Props:

```typescript
interface EventCardHeaderProps {
  title: string
  image: string // URL immagine evento
  tags: string[] // primi 2 tag mostrati
  isLive?: boolean
  isHot?: boolean
  isNew?: boolean
  isBookmarked?: boolean
  onBookmark?: () => void
}
```

Layout (flex row):

- Sinistra: immagine rotonda 40x40px con `object-fit: cover`, `border-radius: 50%`, fallback con iniziale del titolo su `var(--color-bg-tertiary)` se immagine fallisce
- Centro (flex 1): titolo (max 2 righe, `overflow: hidden`, `text-overflow: ellipsis`, `display: -webkit-box`, `-webkit-line-clamp: 2`), sotto i tag separati da `·`
- Destra: badge LIVE/HOT/NEW + icona bookmark `Bookmark` da lucide

Badge LIVE: pallino rosso pulsante (`.live-dot`) + testo "LIVE", background `var(--color-danger-bg)`, colore `var(--color-danger)`
Badge HOT: 🔥 + "HOT", colore `var(--color-hot)`
Badge NEW: "NEW", colore `var(--color-cta)`

Bookmark: icona `Bookmark` (lucide), `size={16}`, fill quando bookmarked, toggle su click, `stopPropagation()` per non triggerare click card

---

## 3. `components/markets/EventCardFooter.tsx`

Footer riusabile da tutte le varianti.

Props:

```typescript
interface EventCardFooterProps {
  volume: number // in USDC
  endDate: Date | null
  onAddToSlip?: () => void
  showEndDate?: boolean // default true
}
```

Layout (flex row, space-between):

- Sinistra: volume formattato (`$24.5M`, `$850K`, `$12.3K`) + se showEndDate: `· Closes {formatDate(endDate)}`
- Destra: bottone `[+ Slip]` — icona `Plus` (lucide) + "Slip", padding piccolo, background `var(--color-bg-elevated)`, border `var(--color-border-default)`, hover `var(--color-cta)`

Funzione `formatVolume(n: number): string`:

- ≥1B → `$X.XB`
- ≥1M → `$X.XM`
- ≥1K → `$X.XK`
- else → `$X`

Funzione `formatEndDate(date: Date): string`:

- Se scade oggi/domani → "Today" / "Tomorrow"
- Se scade entro 7 giorni → "in X days"
- Altrimenti → `MMM D, YYYY` (es. "Nov 5, 2028")

---

## 4. `components/markets/cards/BinaryCard.tsx`

Usa `EventCardHeader`, `DonutChart`, `EventCardFooter`.

Props:

```typescript
interface BinaryCardProps {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
  onAddToSlip?: (eventId: string, outcome: 'yes' | 'no') => void
}
```

Il mercato binary ha 1 solo market in `event.markets[0]`. Usa `yesPrice` e `noPrice` da lì.

Layout (flex column):

```
<EventCardHeader ... />

<div> // corpo
  <DonutChart probability={yesPrice} size={80} />

  <div> // riga bottoni
    <button> Yes {yesPercent}% </button>
    <button> No  {noPercent}% </button>
  </div>
</div>

<EventCardFooter ... />
```

Bottone Yes: background `var(--color-success-bg)`, colore `var(--color-success)`, border `var(--color-success)` a 20% opacità, hover più saturo
Bottone No: background `var(--color-danger-bg)`, colore `var(--color-danger)`, border `var(--color-danger)` a 20% opacità
Entrambi: `borderRadius: 8px`, `padding: '8px 16px'`, `fontSize: 13px`, `fontWeight: 600`, `flex: 1`
I bottoni chiamano `onAddToSlip` con outcome corretto + `stopPropagation()`

---

## 5. `components/markets/EventCard.tsx`

Container che riceve `AuktoraEvent` e renderizza la variant giusta in base a `event.kind`.

```typescript
interface EventCardProps {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
  onAddToSlip?: (eventId: string, outcome: string) => void
}
```

```tsx
export function EventCard({ event, onBookmark, onAddToSlip }: EventCardProps) {
  // Wrapper comune: Link a /event/[slug], styling card
  return (
    <Link href={`/event/${event.slug}`} style={cardStyle}>
      {event.kind === 'binary' && <BinaryCard ... />}
      {event.kind === 'multi_outcome' && <PlaceholderCard label="Multi outcome — coming soon" />}
      {event.kind === 'multi_strike' && <PlaceholderCard label="Multi strike — coming soon" />}
      {event.kind === 'h2h_sport' && <PlaceholderCard label="H2H Sport — coming soon" />}
      {event.kind === 'crypto_up_down' && <PlaceholderCard label="Crypto — coming soon" />}
    </Link>
  )
}
```

`PlaceholderCard`: div semplice 160px height, background `var(--color-bg-tertiary)`, testo centrato `var(--color-text-muted)` — placeholder per le varianti future.

Stile card wrapper:

```typescript
const cardStyle = {
  display: 'block',
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: '12px',
  overflow: 'hidden',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 150ms, box-shadow 150ms',
  cursor: 'pointer',
}
```

Hover: `border-color: var(--color-border-strong)`, `box-shadow: var(--shadow-md)` — via className `hover-lift` già presente in globals.css

---

## 6. Smoke test visivo in `app/page.tsx`

Aggiungi temporaneamente una sezione di test per vedere le card in azione:

```tsx
// app/page.tsx — SERVER COMPONENT
import { fetchFeaturedEvents } from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'
import { EventCard } from '@/components/markets/EventCard'

export default async function HomePage() {
  const rawEvents = await fetchFeaturedEvents(12)
  const events = rawEvents.map(mapGammaEvent)

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1
        style={{
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        Markets
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
```

**Non rimuovere questo smoke test** — diventa la base della Home page reale nello sprint 3.4.1.

---

## Regole architetturali (da AGENTS.md)

- Ogni file max 300 righe
- Nessun `display` inline su elementi con classi Tailwind responsive
- Nessun colore hardcoded — sempre via CSS vars
- Immagini: usa sempre `<img>` nativo con `onError` per il fallback (no `next/image` per ora — lo adottiamo in Sprint MA8 polish)

---

## Acceptance criteria

- [ ] `npm run validate` passa (typecheck + lint + test)
- [ ] `npm run build` exit 0
- [ ] Home page (`/`) mostra una griglia di EventCard con dati reali Polymarket
- [ ] Le card binary mostrano DonutChart + bottoni Yes/No con percentuali reali
- [ ] Le card non-binary mostrano il placeholder
- [ ] Click su una card naviga a `/event/[slug]` (404 ok per ora)
- [ ] Bookmark click NON naviga (stopPropagation funziona)
- [ ] Responsive: griglia si adatta da 1 colonna mobile a 3-4 colonne desktop
- [ ] Commit: `git commit -m "feat: EventCard Binary variant + DonutChart + shared Header/Footer (3.3.1)" && git push origin main`

---

## Note

- `AuktoraEvent` e `AuktoraMarket` sono importati da `@/lib/polymarket/mappers`
- Non aggiungere test unitari per i componenti UI in questo sprint — i test delle card arrivano in MA8 (Playwright E2E)
- Non installare librerie nuove
