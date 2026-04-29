# PROMPT — Sprint 3.5.6 — Crypto Round Navigation + Auto-Refresh

> **Priorità**: ALTA — per `crypto_up_down` mancano: navigazione tra round storici (pallini colorati) + auto-refresh automatico a round scaduto
> **Base**: commit dopo Sprint 3.5.5
> **Obiettivo**: esperienza crypto identica a Polymarket — vedi round passati, esiti, naviga cliccando, il round successivo parte da solo

---

## Architettura round Polymarket

Ogni round `crypto_up_down` è un **evento Gamma separato** con il proprio slug (es. `btc-up-or-down-5m-apr-25-1305`). Tutti i round della stessa coppia appartengono alla **stessa serie** (`GammaSeries`): `event.series[0].slug` = `btc-up-or-down-5m`.

Gamma API supporta `?seriesSlug=X` per fetch round correlati.

**Risoluzione round** da `market.outcomePrices` (JSON array):

- `["1","0"]` → YES/Up vinto → pallino **verde**
- `["0","1"]` → NO/Down vinto → pallino **rosso**
- market.active && !market.closed → round corrente → pallino **grigio** (pulsante)

---

## Task 1 — Aggiungere `seriesSlug` a `AuktoraEvent` + mapper

In `lib/polymarket/mappers.ts`:

```ts
export interface AuktoraEvent {
  // ... campi esistenti ...
  /**
   * Slug della serie Polymarket (es. 'btc-up-or-down-5m').
   * Presente solo per eventi con series[]. Usato da CryptoRoundNav.
   */
  seriesSlug?: string
}
```

In `mapGammaEvent`:

```ts
export function mapGammaEvent(raw: GammaEvent): AuktoraEvent {
  return {
    // ...campi esistenti...
    seriesSlug: raw.series?.[0]?.slug ?? undefined,
  }
}
```

---

## Task 2 — Aggiungere `seriesSlug` a `GammaEventsParams` + `fetchRelatedRounds`

In `lib/polymarket/types.ts`, aggiungere a `GammaEventsParams`:

```ts
export interface GammaEventsParams {
  // ...esistenti...
  seriesSlug?: string
}
```

In `lib/polymarket/queries.ts`, aggiungere:

```ts
/**
 * Fetch round della stessa serie crypto.
 * Ordinati per endDate decrescente (più recenti prima).
 * Usato da CryptoRoundNav per mostrare esiti storici.
 */
export async function fetchRelatedRounds(
  seriesSlug: string,
  limit: number = 15
): Promise<GammaEvent[]> {
  const events = await gammaGet<GammaEvent[]>(
    '/events',
    { seriesSlug, limit, order: 'endDate', ascending: false },
    { revalidate: 60 }
  )
  return Array.isArray(events) ? events : []
}
```

---

## Task 3 — Nuova route `/api/v1/crypto/rounds/route.ts`

```
app/api/v1/crypto/rounds/route.ts
```

```ts
import { NextRequest, NextResponse } from 'next/server'
import { fetchRelatedRounds } from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'

export const revalidate = 60

interface RoundItem {
  slug: string
  endDate: string
  resolution: 'yes' | 'no' | 'active' | 'pending'
}

function resolveRound(event: ReturnType<typeof mapGammaEvent>): RoundItem['resolution'] {
  const market = event.markets[0]
  if (!market) return 'pending'
  if (market.active && !market.closed) return 'active'
  if (!market.closed) return 'pending'
  // Risolto: controlla outcomePrices via yesPrice/noPrice
  if (market.yesPrice >= 0.99) return 'yes'
  if (market.noPrice >= 0.99) return 'no'
  return 'pending'
}

/**
 * GET /api/v1/crypto/rounds?seriesSlug=btc-up-or-down-5m&limit=15
 *
 * Ritorna round storici della stessa serie, con esito (yes/no/active/pending).
 * Usato da CryptoRoundNav client-side.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const seriesSlug = url.searchParams.get('seriesSlug')
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '15', 10), 30)

  if (!seriesSlug) {
    return NextResponse.json({ error: 'seriesSlug richiesto' }, { status: 400 })
  }

  const events = await fetchRelatedRounds(seriesSlug, limit)
  const items: RoundItem[] = events.map((raw) => {
    const mapped = mapGammaEvent(raw)
    return {
      slug: raw.slug,
      endDate: raw.endDate,
      resolution: resolveRound(mapped),
    }
  })

  return NextResponse.json({ items })
}
```

---

## Task 4 — Nuovo componente `CryptoRoundNav.tsx`

```
components/event/CryptoRoundNav.tsx
```

Striscia orizzontale con scrollabile con pallini + orari. Click su un pallino naviga all'evento di quel round.

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoundItem {
  slug: string
  endDate: string
  resolution: 'yes' | 'no' | 'active' | 'pending'
}

interface Props {
  seriesSlug: string
  currentSlug: string
}

const DOT_COLOR: Record<RoundItem['resolution'], string> = {
  yes: 'var(--color-success)',
  no: 'var(--color-danger)',
  active: 'var(--color-text-muted)',
  pending: 'var(--color-bg-tertiary)',
}

function formatRoundTime(endDate: string): string {
  const d = new Date(endDate)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function CryptoRoundNav({ seriesSlug, currentSlug }: Props) {
  const router = useRouter()
  const [rounds, setRounds] = useState<RoundItem[]>([])

  useEffect(() => {
    if (!seriesSlug) return
    fetch(`/api/v1/crypto/rounds?seriesSlug=${encodeURIComponent(seriesSlug)}&limit=15`)
      .then((r) => r.json())
      .then((data: { items: RoundItem[] }) => {
        // Mostra più recenti a destra (ordinati per endDate crescente dopo il fetch)
        const sorted = [...(data.items ?? [])].sort(
          (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        )
        setRounds(sorted)
      })
      .catch(() => {
        /* silenzioso */
      })
  }, [seriesSlug])

  if (rounds.length === 0) return null

  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Round recenti
      </span>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        {rounds.map((round) => {
          const isCurrent = round.slug === currentSlug
          const isActive = round.resolution === 'active'

          return (
            <button
              key={round.slug}
              type="button"
              onClick={() => {
                if (!isCurrent) router.push(`/event/${round.slug}`)
              }}
              disabled={round.resolution === 'pending'}
              title={round.slug}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
                cursor: isCurrent || round.resolution === 'pending' ? 'default' : 'pointer',
                opacity: round.resolution === 'pending' ? 0.4 : 1,
                background: isCurrent ? 'var(--color-bg-tertiary)' : 'none',
                border: isCurrent
                  ? '1px solid var(--color-border-subtle)'
                  : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 6px',
              }}
            >
              {/* Pallino esito */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: DOT_COLOR[round.resolution],
                  display: 'block',
                  // Blink per round attivo
                  animation: isActive ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  flexShrink: 0,
                }}
              />
              {/* Orario */}
              <span
                style={{
                  fontSize: 9,
                  color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  fontWeight: isCurrent ? 700 : 400,
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatRoundTime(round.endDate)}
              </span>
              {isCurrent && (
                <span
                  style={{
                    fontSize: 8,
                    color: 'var(--color-cta)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  LIVE
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

> **CSS animation `pulse`**: aggiungere in `globals.css` se non già presente:
>
> ```css
> @keyframes pulse {
>   0%,
>   100% {
>     opacity: 1;
>   }
>   50% {
>     opacity: 0.3;
>   }
> }
> ```

---

## Task 5 — Auto-refresh su round scaduto

In `components/event/hero/HeroCrypto.tsx`, aggiungere il pattern auto-refresh:

```tsx
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function HeroCrypto({ event }: Props) {
  const router = useRouter()
  const countdown = useCountdown(event.endDate)
  const refreshedRef = useRef(false)

  // Auto-refresh 3s dopo scadenza round — carica il prossimo round attivo
  useEffect(() => {
    if (countdown.expired && !refreshedRef.current) {
      refreshedRef.current = true
      const timer = setTimeout(() => {
        router.refresh()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [countdown.expired, router])

  // ... resto del componente invariato
}
```

> **Nota**: `router.refresh()` ri-esegue la Server Component `app/event/[slug]/page.tsx` che ri-fetcha l'evento da Gamma. Se il round è già chiuso, Gamma restituirà il nuovo round attivo SOLO se il slug cambia. In questo caso, `router.refresh()` non naviga — aggiorna i dati del round corrente (countdown diventa 0, active=false, closed=true). Il cambio di slug vero avviene tramite `CryptoRoundNav` → click sul pallino del nuovo round LIVE.

---

## Task 6 — Integrare `CryptoRoundNav` in `EventPageShell.tsx`

```tsx
import { CryptoRoundNav } from './CryptoRoundNav'

// Sotto PriceHistoryChart, solo per crypto_up_down:
{
  event.kind === 'crypto_up_down' && event.seriesSlug && (
    <CryptoRoundNav seriesSlug={event.seriesSlug} currentSlug={event.slug} />
  )
}
```

---

## Struttura file modificati/creati

```
lib/polymarket/types.ts                          ← +seriesSlug in GammaEventsParams
lib/polymarket/mappers.ts                        ← +seriesSlug in AuktoraEvent + mapGammaEvent
lib/polymarket/queries.ts                        ← +fetchRelatedRounds
app/api/v1/crypto/rounds/route.ts               ← NUOVA
components/event/CryptoRoundNav.tsx             ← NUOVO
components/event/hero/HeroCrypto.tsx            ← +auto-refresh su countdown.expired
components/event/EventPageShell.tsx             ← +CryptoRoundNav sotto PriceHistoryChart
app/globals.css                                  ← +@keyframes pulse (se non presente)
```

---

## Regole architetturali

- Nessun colore hardcoded — `DOT_COLOR` usa solo CSS vars
- `CryptoRoundNav` è Client Component (`useEffect` + `useRouter`)
- `fetchRelatedRounds` è server-side (Next.js fetch cache)
- Auto-refresh usa `useRef` per garantire un solo refresh per round (evita loop)
- Se `seriesSlug` è `undefined` (evento non-crypto o non ha serie), `CryptoRoundNav` non viene renderizzato
- `router.refresh()` NON naviga — ricarica i dati del Server Component. Se il round è scaduto e l'utente deve andare al round successivo, lo fa cliccando il pallino LIVE nella navigation
- Animazione `pulse` solo CSS, no librerie aggiuntive

---

## Fallback se `seriesSlug` è vuoto

Alcuni eventi crypto potrebbero non avere `series[]` popolato da Gamma (raro). In questo caso:

- `event.seriesSlug` sarà `undefined`
- `CryptoRoundNav` non viene renderizzato (condizione `&& event.seriesSlug`)
- Auto-refresh funziona comunque (non dipende dalla serie)

---

## Acceptance criteria

- [ ] `crypto_up_down` event: striscia round navigation visibile sotto il chart con pallini colorati
- [ ] Pallino verde = round Up vinto, rosso = Down vinto, grigio pulsante = round corrente
- [ ] Click su un round storico naviga a `/event/[slug]` di quel round
- [ ] Round non ancora aperti (pending) sono disabilitati e opachi
- [ ] Quando il countdown arriva a 0, la pagina si aggiorna automaticamente dopo 3s
- [ ] Se `event.seriesSlug` è undefined: nessun crash, `CryptoRoundNav` non compare
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "feat: crypto round navigation + auto-refresh (3.5.6)" && git push origin main`
