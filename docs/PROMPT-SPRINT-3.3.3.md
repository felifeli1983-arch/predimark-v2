# PROMPT — Sprint 3.3.3 — EventCard H2H Sport

> Copia e incolla questo prompt in Claude in VS Code.
> **Dipendenza**: Sprint 3.3.1 completato

---

## Obiettivo

Aggiungere la variante card H2H Sport — i mercati sport con due squadre affiancate. Sostituire il placeholder `h2h_sport` in `EventCard.tsx` con il componente reale.

---

## Riferimenti obbligatori da leggere prima di scrivere codice

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — sezione "Variante 4 H2H Sport"
- `components/markets/EventCard.tsx` — dove inserire il nuovo case
- `components/markets/EventCardHeader.tsx` e `EventCardFooter.tsx` — componenti da riusare
- `lib/polymarket/mappers.ts` — struttura `AuktoraEvent`, `AuktoraMarket`

---

## Cosa costruire

```
components/markets/cards/
  H2HCard.tsx    ← variante H2H Sport con 2 team affiancati
```

Aggiornare `EventCard.tsx`: sostituire `PlaceholderCard` per `h2h_sport` con `H2HCard`.

---

## Layout H2H (Doc 4, Variante 4)

Corpo della card (tra header e footer):

```
   [Team A nome]         [Team B nome]
   [probabilità A%]      [probabilità B%]

   [ Bottone Team A ]  [ Bottone Team B ]
```

- Se c'è un terzo outcome (Draw/Pareggio nel soccer): aggiunge bottone centrale `DRAW` tra i due team
- Le probabilità si ricavano da `yesPrice` e `noPrice` del mercato H2H (che ha 2 outcome, non Yes/No standard)
- Header mostra badge `●LIVE` se `event.active === true` (per i match in corso)
- Footer: volume + data ("Game ends ~9pm ET" se today, altrimenti "Closes [data]")

---

## Stato LIVE vs non-live

- Se `event.active && !event.closed`: card può mostrare badge LIVE
- Non implementare score live in questo sprint (richiede un endpoint separato non ancora mappato) — mostra solo le probabilità
- Score live verrà aggiunto in sprint separato quando si costruisce la pagina evento

---

## Regole architetturali

- Ogni file max 300 righe
- Nessun colore hardcoded — CSS vars
- Usa `var(--color-success)` per il team favorito (prob > 50%), `var(--color-text-muted)` per lo sfavorito

---

## Acceptance criteria

- [ ] `npm run validate` passa
- [ ] `npm run build` exit 0
- [ ] Home page mostra card H2H reali per eventi sport con 2 outcome non-Yes/No
- [ ] Bottoni Team A / Team B con probabilità reali
- [ ] Card con 3 outcome mostra bottone Draw centrale
- [ ] Click card → `/event/[slug]` funziona
- [ ] Commit: `git commit -m "feat: EventCard H2H Sport variant (3.3.3)" && git push origin main`

---

## Note

- In H2H, `event.markets[0].yesPrice` è la probabilità del Team A (outcome index 0), `noPrice` è Team B (outcome index 1)
- Il nome dei team si ricava da `event.markets[0].question` che ha formato tipo "Will Lakers win?" oppure da `outcomes` JSON parsed: `["Lakers", "OKC"]`
- Non aggiungere WebSocket in questo sprint — prezzi statici
- Non aggiungere test UI — arrivano in MA8 Playwright
