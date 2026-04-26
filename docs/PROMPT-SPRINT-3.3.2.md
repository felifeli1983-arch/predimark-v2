# PROMPT — Sprint 3.3.2 — EventCard Multi-outcome + Multi-strike

> Copia e incolla questo prompt in Claude in VS Code.
> **Dipendenza**: Sprint 3.3.1 completato (EventCardHeader, EventCardFooter, DonutChart esistenti)

---

## Obiettivo

Aggiungere le due varianti card che coprono i mercati con più outcome: `multi_outcome` e `multi_strike`. Sostituire i placeholder "coming soon" in `EventCard.tsx` con i componenti reali.

---

## Riferimenti obbligatori da leggere prima di scrivere codice

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — sezione "Variante 2a Multi-outcome nominali", "Variante 2b Multi-outcome date", "Variante 3 Multi-strike"
- `components/markets/EventCard.tsx` — dove inserire i due nuovi case
- `components/markets/EventCardHeader.tsx` e `EventCardFooter.tsx` — componenti da riusare
- `lib/polymarket/mappers.ts` — struttura `AuktoraEvent` e `AuktoraMarket`

---

## Cosa costruire

```
components/markets/cards/
  MultiOutcomeCard.tsx    ← copre sia variante 2a (nominali) che 2b (date come outcome)
  MultiStrikeCard.tsx     ← variante 3 — soglie prezzo ordinate decrescente
```

Aggiornare `EventCard.tsx`: sostituire `PlaceholderCard` per `multi_outcome` e `multi_strike` con i nuovi componenti.

---

## Comportamento Multi-outcome (Doc 4, Variante 2a e 2b)

- Mostra top 3 outcome con barra probabilità proporzionale
- Se ci sono più di 3 outcome: link "+ N altri →" che porta alla pagina evento
- Ogni outcome ha: nome/data, barra, percentuale
- Bottone "+ Slip" nel footer (come sempre)
- Se `endDate` è un outcome (variante 2b): **non mostrare** la data nel footer — le date sono già dentro gli outcome
- La distinzione 2a/2b si fa guardando se gli outcome label assomigliano a date — usa una regex semplice o controlla il formato

---

## Comportamento Multi-strike (Doc 4, Variante 3)

- Mostra soglie ordinate per valore decrescente (≥$130k in cima)
- Ogni riga: label soglia + barra probabilità + percentuale
- Evidenzia la soglia "corrente" (la più alta con prob > 50%, oppure la più vicina al prezzo attuale)
- Stessa logica "+ N altri →" se più di 4-5 soglie
- **Non** mostrare data nel footer (Pattern 2: le soglie cambiano, non la data)

---

## Regole architetturali

- Ogni file max 300 righe (AGENTS.md)
- Nessun colore hardcoded — CSS vars
- Nessun `display` inline su elementi con classi Tailwind responsive

---

## Acceptance criteria

- [ ] `npm run validate` passa
- [ ] `npm run build` exit 0
- [ ] Home page mostra card Multi-outcome reali (non placeholder) per eventi con più mercati
- [ ] Home page mostra card Multi-strike per eventi con soglie numeriche
- [ ] Le barre di probabilità sono proporzionali ai valori reali
- [ ] Click card → `/event/[slug]` funziona
- [ ] Commit: `git commit -m "feat: EventCard Multi-outcome + Multi-strike variants (3.3.2)" && git push origin main`

---

## Note

- I `outcomes` di ogni `AuktoraMarket` si ricavano dall'array `markets` dell'evento — ogni market ha il suo `question` come label
- Per Multi-outcome: `event.markets` = array di mercati, ognuno con `yesPrice` come probabilità di quell'outcome
- Per Multi-strike: stesso pattern, ma i label dei market contengono soglie numeriche (es. "≥$100,000")
- Non serve WebSocket in questo sprint — i prezzi sono statici da Gamma API (30s revalidate)
