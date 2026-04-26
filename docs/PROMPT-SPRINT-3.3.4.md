# PROMPT — Sprint 3.3.4 — EventCard Crypto Up/Down

> Copia e incolla questo prompt in Claude in VS Code.
> **Dipendenze**: Sprint 3.3.1 completato + Sprint 3.2.3 (CLOB WS) + Sprint 3.2.4 (RTDS WS)

---

## Obiettivo

Aggiungere la variante card più complessa — il round Crypto Up/Down con prezzo live, countdown e live betting feed. È l'unica card che richiede WebSocket attivo.

---

## Riferimenti obbligatori da leggere prima di scrivere codice

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — sezione "Variante 5 Crypto Up/Down" + "Pattern 1 Auto-refresh"
- `lib/ws/hooks/useCryptoLivePrice.ts` — hook da usare per il prezzo live
- `lib/ws/hooks/useLiveActivity.ts` — hook da usare per live betting feed
- `lib/ws/hooks/useLiveMidpoint.ts` — hook per la probabilità live (Up%)
- `components/markets/EventCard.tsx` — dove inserire il nuovo case
- `lib/polymarket/mappers.ts` — `classifyEvent` per crypto_up_down

---

## Cosa costruire

```
components/markets/cards/
  CryptoCard.tsx                    ← variante Crypto Up/Down
components/markets/charts/
  Thermometer.tsx                   ← barra verticale Up vs Down (riusata anche in pagina evento)
```

Aggiornare `EventCard.tsx`: sostituire `PlaceholderCard` per `crypto_up_down` con `CryptoCard`.

---

## Layout CryptoCard (Doc 4, Variante 5)

Corpo della card (tra header e footer):

```
  Battere: $108.234,56  (prezzo target del round)
  Live:    $108.290,12 ↗ +$55,56  (prezzo attuale via WS)

  [TERMOMETRO Up/Down — visuale probabilità]

  [ Up 51% ]    [ Down 49% ]   ← bottoni con probabilità live
  [ +$2 ↗  ]    [ +$10 ↘  ]   ← live betting feed (cambia velocemente)

  ⏱  Round termina in 03:42  (countdown live)
```

---

## Componenti da implementare

**Termometro** (`Thermometer.tsx`): SVG semplice, barra verticale divisa Up/Down proporzionale alla probabilità. Colori: verde per Up, rosso per Down.

**Countdown**: calcola `endDate - now` e aggiorna ogni secondo via `setInterval`. Mostra `MM:SS` se < 1 ora, altrimenti `HH:MM:SS`.

**Live betting feed**: usa `useLiveActivity({ marketId })` — mostra l'ultimo importo trade con fade-in/fade-out (200ms/300ms). Solo 1 valore visibile alla volta, cambia ad ogni nuovo trade.

**Prezzi live**: usa `useCryptoLivePrice(symbol, source)` dove `source` dipende dalla durata del round: 5m/15m → `'chainlink'`, 1h/1d → `'binance'`.

**Probabilità live**: usa `useLiveMidpoint(clobTokenId)` per Up% aggiornato.

---

## Pattern 1 — Auto-refresh round (Doc 4)

Quando `endDate` è nel passato e il round è risolto, la card deve mostrare il round successivo automaticamente. Implementa polling leggero: ogni 30s controlla via `fetchEventById(event.id)` se il round è cambiato, e aggiorna lo stato locale.

---

## Regole architetturali

- Ogni file max 300 righe — se CryptoCard supera, estrai il countdown in `hooks/useCountdown.ts`
- Nessun colore hardcoded
- `Thermometer.tsx` deve essere un componente puro (no WS dentro di lui — riceve le probabilità come props)
- `setInterval` nel countdown: pulizia su unmount (cleanup in `useEffect`)

---

## Acceptance criteria

- [ ] `npm run validate` passa
- [ ] `npm run build` exit 0
- [ ] Card mostra prezzo live BTC/ETH aggiornato via WS
- [ ] Probabilità Up/Down aggiornate via CLOB WS
- [ ] Countdown conta in tempo reale
- [ ] Live betting feed cambia ad ogni trade con animazione
- [ ] Auto-refresh quando round scade
- [ ] Commit: `git commit -m "feat: EventCard Crypto Up/Down — live prices + countdown + betting feed (3.3.4)" && git push origin main`

---

## Note

- Il simbolo crypto si ricava dallo slug dell'evento (es. slug contiene "btc" → symbol "btcusdt")
- La durata del round si ricava dalla differenza `endDate - startDate` del market
- Se i WS non sono connessi (nessun abbonamento attivo): la card mostra l'ultimo prezzo noto da Gamma API come fallback
- Non implementare il trade reale da questa card — i bottoni chiamano `onAddToSlip` (stesso pattern delle altre card)
