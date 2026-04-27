# PROMPT — Fix 3.3.1-B — MultiOutcomeCard mostra question completa invece di groupItemTitle

> **Quando eseguire**: subito — bug visivo attivo in produzione
> **Priorità**: ALTA — le card multi-outcome mostrano "Will Finland win Eurovision 2026?" invece di "Finland"

---

## Problema

`MultiOutcomeCard.tsx` riga 106 usa `market.question` come label di ogni riga outcome:

```tsx
{
  market.question
} // "Will Finland win Eurovision 2026?" → troncato a "Will Finland win Eurov..."
```

Polymarket ha un campo `groupItemTitle` su ogni market che contiene il nome pulito del candidato:

- `groupItemTitle = "Finland"` invece di `question = "Will Finland win Eurovision 2026?"`
- `groupItemTitle = "Denmark"` invece di `question = "Will Denmark win Eurovision 2026?"`

Il campo esiste già in `GammaMarket` (riga 25 di `lib/polymarket/types.ts`) ma **non viene mai mappato** su `AuktoraMarket` in `mapGammaMarket`, quindi la card non può usarlo.

---

## Riferimenti da leggere prima

- `lib/polymarket/types.ts` — `GammaMarket.groupItemTitle: string` già presente
- `lib/polymarket/mappers.ts` — `AuktoraMarket` interface + `mapGammaMarket` function
- `components/markets/cards/MultiOutcomeCard.tsx` — riga 31 (looksLikeDate su `m.question`) e riga 106 (`market.question` come label)
- `lib/polymarket/__tests__/mappers.test.ts` — aggiungere test per groupItemTitle

---

## Fix 1 — `lib/polymarket/mappers.ts`

### Aggiungere `groupItemTitle` a `AuktoraMarket`

```ts
export interface AuktoraMarket {
  // ... campi esistenti ...
  /**
   * Label pulito del candidato/outcome per eventi multi-outcome.
   * Es. "Finland" invece di "Will Finland win Eurovision 2026?"
   * Stringa vuota se non presente (mercati binary standard).
   */
  groupItemTitle: string
}
```

### Mapparlo in `mapGammaMarket`

```ts
return {
  // ... campi esistenti ...
  groupItemTitle: raw.groupItemTitle ?? '',
}
```

---

## Fix 2 — `components/markets/cards/MultiOutcomeCard.tsx`

### Sostituire `market.question` con il label pulito

Aggiungere una helper locale:

```ts
/** Restituisce il label da mostrare nella riga outcome:
 *  - usa groupItemTitle se non vuoto
 *  - fallback a market.question (per mercati che non hanno groupItemTitle)
 */
function outcomeLabel(market: AuktoraMarket): string {
  return market.groupItemTitle || market.question
}
```

Sostituire la riga 106:

```tsx
// prima:
{
  market.question
}

// dopo:
{
  outcomeLabel(market)
}
```

### Aggiornare anche `looksLikeDate` (riga 31)

```ts
// prima:
const dateLike = top.filter((m) => looksLikeDate(m.question)).length

// dopo:
const dateLike = top.filter((m) => looksLikeDate(outcomeLabel(m))).length
```

---

## Fix 3 — `lib/polymarket/__tests__/mappers.test.ts`

Aggiungere 1 test che verifica che `groupItemTitle` venga mappato correttamente:

```ts
it('mapGammaMarket preserva groupItemTitle', () => {
  const raw = makeMockMarket({ groupItemTitle: 'Finland' })
  const mapped = mapGammaMarket(raw)
  expect(mapped.groupItemTitle).toBe('Finland')
})

it('mapGammaMarket groupItemTitle è stringa vuota se assente', () => {
  const raw = makeMockMarket({ groupItemTitle: '' })
  const mapped = mapGammaMarket(raw)
  expect(mapped.groupItemTitle).toBe('')
})
```

(Se `makeMockMarket` non esiste nel file di test, creare un helper minimo inline.)

---

## Acceptance criteria

- [ ] `AuktoraMarket` ha campo `groupItemTitle: string`
- [ ] `mapGammaMarket` mappa `raw.groupItemTitle` (fallback `''`)
- [ ] `MultiOutcomeCard` mostra "Finland" invece di "Will Finland win Eurovision 2026?"
- [ ] Se `groupItemTitle` è vuoto, fallback a `market.question` (retrocompatibile)
- [ ] `looksLikeDate` usa `outcomeLabel(m)` (non più `m.question` direttamente)
- [ ] 2 test aggiunti in `mappers.test.ts`
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "fix: MultiOutcomeCard usa groupItemTitle come label outcome (3.3.1-B)" && git push origin main`
