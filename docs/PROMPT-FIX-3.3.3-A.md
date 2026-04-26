# PROMPT — Fix 3.3.3-A — Test mancanti per AuktoraMarket.outcomes[]

> Copia e incolla questo prompt in Claude in VS Code.
> **Quando eseguire**: prima o durante Sprint 3.3.4, prima del build finale

---

## Problema

Sprint 3.3.3 ha aggiunto `AuktoraOutcome` e il campo `outcomes: AuktoraOutcome[]` su `AuktoraMarket` nel mapper (`lib/polymarket/mappers.ts`). Il campo è usato da `H2HCard` per risolvere i nomi dei team, ma `mappers.test.ts` non ha test che verifichino questo nuovo campo.

---

## Riferimenti da leggere prima

- `lib/polymarket/mappers.ts` — righe dove `AuktoraOutcome` e `outcomes[]` vengono costruiti (funzione `mapGammaMarket`)
- `lib/polymarket/__tests__/mappers.test.ts` — test esistenti da cui capire lo stile e le fixture

---

## Cosa aggiungere

Nel file `lib/polymarket/__tests__/mappers.test.ts`, aggiungere **2 nuovi test** al gruppo `mapGammaMarket`:

1. **Test outcomes 2-way**: dato un market con `outcomes: '["Yes","No"]'` e `outcomePrices: '["0.72","0.28"]'`, verifica che `market.outcomes` sia un array di 2 elementi con i campi `name` e `price` corretti.

2. **Test outcomes H2H 3-way**: dato un market con `outcomes: '["Lakers","Draw","Celtics"]'` e 3 prezzi, verifica che `market.outcomes` abbia 3 elementi con nomi e prezzi corretti, e che `yesPrice`/`noPrice` siano ancora gli alias degli index 0/1 (retrocompatibilità).

---

## Acceptance criteria

- [ ] `npx vitest run lib/polymarket` → tutti i test passano inclusi i 2 nuovi
- [ ] I 2 nuovi test coprono esplicitamente `market.outcomes[i].name` e `market.outcomes[i].price`
- [ ] `npx tsc --noEmit` exit 0
- [ ] Commit: `git commit -m "test: AuktoraMarket.outcomes[] coverage — fix 3.3.3-A" && git push origin main`

---

## Note

- Non modificare la logica del mapper — solo aggiungere test
- Non cambiare test esistenti — solo aggiungere in append al gruppo `mapGammaMarket`
