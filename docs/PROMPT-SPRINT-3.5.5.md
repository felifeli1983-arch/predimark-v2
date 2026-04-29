# PROMPT — Sprint 3.5.5 — Chart multi-linea live (Binary YES/NO + Multi-outcome + Multi-strike)

> **Priorità**: ALTA — il chart mostra solo 1 linea per tutti i CardKind. Binary deve avere YES+NO, multi_outcome deve avere una curva per candidato
> **Base**: commit `1e72ff7` (Sprint 3.5.4 completato)
> **Obiettivo**: chart completo e fedele al wireframe per tutti e 5 i CardKind

---

## Contesto attuale

`PriceHistoryChart` → `HistoryChartView` mostra:

- 1 linea YES (stroke `--color-cta`) + area fill per tutti i CardKind
- `marketId = event.markets[0].clobTokenIds[0]` (YES token primo market)
- No linea NO, no multi-linea candidati, no target lines

La route `/api/v1/markets/[marketId]/price-history` già ritorna `{ timestamp, yes_price, no_price }` — i dati ci sono, mancano solo le view.

---

## Task 1 — `PriceHistoryChart.tsx` — nuova prop `multiMarkets`

Aggiungere prop opzionale:

```ts
interface Props {
  marketId: string
  cardKind?: CardKind
  assetId?: string | null
  cryptoSymbol?: string
  isLive?: boolean
  /**
   * Solo per cardKind === 'multi_outcome':
   * array di { tokenId, label } per ogni outcome (top 5 per prob).
   * Se presente con cardKind multi_outcome → usa MultiLineChartView.
   */
  multiMarkets?: Array<{ tokenId: string; label: string }>
}
```

Aggiornare il routing principale:

```tsx
export function PriceHistoryChart({
  marketId,
  cardKind = 'binary',
  assetId,
  cryptoSymbol,
  isLive,
  multiMarkets,
}: Props) {
  if (cardKind === 'crypto_up_down') {
    return <LiveSpotView cryptoSymbol={cryptoSymbol ?? ''} />
  }
  if (cardKind === 'h2h_sport' && isLive) {
    return <LiveScoreStub />
  }
  if (cardKind === 'multi_outcome' && multiMarkets && multiMarkets.length > 0) {
    return <MultiLineChartView markets={multiMarkets} />
  }
  // binary | multi_strike | h2h_sport non-live | fallback
  return (
    <HistoryChartView
      marketId={marketId}
      showBothLines={cardKind === 'binary' || cardKind === 'h2h_sport'}
    />
  )
}
```

---

## Task 2 — `HistoryChartView` — dual-line mode per `binary`

Aggiungere `showBothLines?: boolean` a `HistoryChartView`. Quando true:

- Linea YES: `stroke="var(--color-success)"` (verde), `strokeWidth=1`
- Linea NO: `stroke="var(--color-danger)"` (rosso), `strokeWidth=1`
- Area fill: solo sotto YES, `fillOpacity=0.08`
- Legenda inline piccola: `● YES` verde · `● NO` rosso

Implementazione SVG paths:

```tsx
// YS path — usa yes_price (già esistente)
const yesPath = points
  .map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((p.yes_price - min) / range) * height
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
  })
  .join(' ')

// NO path — usa no_price (= 1 - yes_price, già presente nel payload)
const noPath = points
  .map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((p.no_price - min) / range) * height
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
  })
  .join(' ')
```

Il `min`/`max`/`range` deve considerare sia `yes_price` che `no_price`:

```ts
const allPrices = points.flatMap((p) => [p.yes_price, p.no_price])
const min = Math.max(0, Math.min(...allPrices) - 0.05)
const max = Math.min(1, Math.max(...allPrices) + 0.05)
```

**Stat header con dual-line:**

```
Attuale: YES 72% (+3.2% 7G)  ·  NO 28% (−3.2% 7G)
```

---

## Task 3 — Nuovo `MultiLineChartView` per `multi_outcome`

Componente interno che:

1. Fetcha `/api/v1/markets/[tokenId]/price-history?period={period}` in parallelo per tutti i market
2. Renderizza N linee SVG colorate

```tsx
const OUTCOME_COLORS = [
  'var(--color-cta)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-danger)',
  'var(--color-text-secondary)',
]

interface MultiMarket {
  tokenId: string
  label: string
}

interface SeriesData {
  label: string
  color: string
  points: PricePoint[]
}

function MultiLineChartView({ markets }: { markets: MultiMarket[] }) {
  const [period, setPeriod] = useState<Period>('7d')
  const [series, setSeries] = useState<SeriesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (markets.length === 0) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const results = await Promise.all(
        markets.map(async (m, i) => {
          try {
            const res = await fetch(
              `/api/v1/markets/${encodeURIComponent(m.tokenId)}/price-history?period=${period}`
            )
            if (!res.ok) return null
            const data = (await res.json()) as { items: PricePoint[] }
            return {
              label: m.label,
              color: OUTCOME_COLORS[i % OUTCOME_COLORS.length] ?? 'var(--color-cta)',
              points: data.items ?? [],
            } satisfies SeriesData
          } catch {
            return null
          }
        })
      )
      if (!cancelled) {
        setSeries(results.filter((r): r is SeriesData => r !== null && r.points.length >= 2))
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [markets, period])

  // ... SVG multi-path rendering (vedi sotto)
}
```

**SVG multi-path rendering:**

Normalizzare i prezzi su un asse Y comune (0–1 sempre per i mercati multi-outcome):

```tsx
const width = 100
const height = 60
const min = 0
const max = 1

{
  series.map((s) => {
    const path = s.points
      .map((p, i) => {
        const x = (i / (s.points.length - 1)) * width
        const y = height - (p.yes_price / 1) * height
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
    return (
      <path
        key={s.label}
        d={path}
        stroke={s.color}
        strokeWidth={1.5}
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    )
  })
}
```

**Legenda sotto il chart** (scroll orizzontale su mobile):

```tsx
<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
  {series.map((s) => (
    <span
      key={s.label}
      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-xs)' }}
    >
      <span
        style={{
          width: 12,
          height: 2,
          background: s.color,
          display: 'inline-block',
          borderRadius: 1,
        }}
      />
      <span style={{ color: 'var(--color-text-secondary)' }}>{s.label}</span>
      <span style={{ color: s.color, fontWeight: 700 }}>
        {s.points.length > 0
          ? `${((s.points[s.points.length - 1]?.yes_price ?? 0) * 100).toFixed(0)}%`
          : '—'}
      </span>
    </span>
  ))}
</div>
```

---

## Task 4 — `EventPageShell.tsx` — passare `multiMarkets` per `multi_outcome`

```tsx
const multiMarkets =
  event.kind === 'multi_outcome'
    ? [...event.markets]
        .sort((a, b) => b.yesPrice - a.yesPrice)
        .slice(0, 5)
        .map((m) => ({
          tokenId: m.clobTokenIds?.[0] ?? '',
          label: m.groupItemTitle || m.question,
        }))
        .filter((m) => m.tokenId !== '')
    : undefined

// Nel JSX:
{
  event.markets[0]?.clobTokenIds?.[0] && (
    <PriceHistoryChart
      marketId={event.markets[0].clobTokenIds[0]}
      cardKind={event.kind}
      assetId={event.markets[0].clobTokenIds[0]}
      cryptoSymbol={cryptoSymbol}
      isLive={event.active && !event.closed}
      multiMarkets={multiMarkets}
    />
  )
}
```

---

## Task 5 — `HistoryChartView` — target lines per `multi_strike`

Per `multi_strike`, aggiungere prop `strikeTargets?: number[]` (valori 0-1). Questo è opzionale per ora: disegna N linee orizzontali tratteggiate grigie con label valore.

Non richiesto come bloccante per questo sprint — implementare se rimane tempo, altrimenti `multi_strike` continua a usare la single-line view.

---

## Struttura file modificati

```
components/event/PriceHistoryChart.tsx   ← +multiMarkets prop, dual-line binary, MultiLineChartView
components/event/EventPageShell.tsx      ← calcola e passa multiMarkets per multi_outcome
```

---

## Regole architetturali

- Nessun colore hardcoded — solo CSS vars
- `OUTCOME_COLORS` usa solo CSS vars esistenti (cta, success, warning, danger, text-secondary)
- Il componente resta `< 300 righe` — se supera, splittare `MultiLineChartView` in file separato `MultiLineChart.tsx`
- `Promise.all` con timeout implicito — se un tokenId non ha dati, salta quella linea (non blocca le altre)
- Max 5 outcomes nel multi-chart (top 5 per prob, ordinati da `EventPageShell`)

---

## Fix lock file git (fare PRIMA del commit)

Il file `.git/index.lock` è rimasto da un processo precedente. Eseguire da terminale Mac:

```bash
rm /Users/brupashop/Desktop/predimark-v2/.git/index.lock
```

Poi: `git add -A && git commit -m "feat: chart multi-linea — binary YES/NO + multi-outcome per candidato (3.5.5)" && git push origin main`

---

## Acceptance criteria

- [ ] Binary market: chart mostra 2 linee — YES verde + NO rosso, legenda inline
- [ ] Multi-outcome: chart mostra fino a 5 linee colorate (una per candidato), legenda con % attuale
- [ ] Period selector 1H/6H/1G/7G/MAX funziona per tutti i CardKind chart
- [ ] Crypto up/down: LiveSpotView mostra prezzo spot Chainlink in $XX,XXX.XX (non centesimi ¢)
- [ ] H2H non-live: dual-line chart come binary
- [ ] Multi-strike: single-line chart (target lines opzionale)
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "feat: chart multi-linea — binary YES/NO + multi-outcome per candidato (3.5.5)" && git push origin main`
