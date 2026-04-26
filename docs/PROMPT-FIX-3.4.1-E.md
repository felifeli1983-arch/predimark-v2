# PROMPT — Fix 3.4.1-E — HeroCard colori hardcoded + EventCard onAddToSlip in MarketsGrid

> **Quando eseguire**: subito — violazione architetturale + bottone Slip non funzionante
> **Priorità**: ALTA (colori) + MEDIA (slip)

---

## Problema A — Colori hardcoded in HeroCard.tsx

`HeroCard.tsx` usa colori hardcoded che violano AGENTS.md ("Nessun colore hardcoded — CSS vars"):

- Riga ~86: `rgba(0,0,0,0.6)` e `rgba(0,0,0,0.1)` nell'overlay gradient
- Riga ~93: `color: '#fff'` per il titolo
- Riga ~112: `color: 'rgba(255,255,255,0.85)'` per la riga sottotitolo

---

## Problema B — EventCard.onAddToSlip non passato in MarketsGrid

`MarketsGrid.tsx` renderizza `<EventCard key={event.id} event={event} />` senza la prop `onAddToSlip`. Risultato: il bottone `[+ Slip]` nel footer di **ogni** EventCard è invisibile (undefined → non renderizzato).

Doc 4 dice `[+ Slip]` deve essere presente in ogni card. Senza `useBetSlip` store (MA4), la soluzione di questo sprint è collegare `onAddToSlip` a una funzione stub che mostra un toast "coming soon" o semplicemente loggea l'azione — l'importante è che il bottone sia visibile e cliccabile.

---

## Riferimenti da leggere prima

- `components/home/HeroCard.tsx` — colori hardcoded da sostituire
- `components/home/MarketsGrid.tsx` — dove aggiungere la prop
- `components/markets/EventCard.tsx` — interfaccia prop `onAddToSlip`
- `components/markets/EventCardFooter.tsx` — bottone + Slip condizionale su `onAddToSlip`
- `app/globals.css` — token disponibili: `--color-overlay`, `--color-text-primary`

---

## Fix A — HeroCard.tsx

Sostituire:

1. `rgba(0,0,0,0.6)` nell'overlay gradient → `var(--color-overlay)` per la parte opaca, oppure mantenere il gradient ma usando il token come base. In alternativa, aggiungere `--color-hero-overlay: rgba(0,0,0,0.6)` in globals.css e usarlo qui.
2. `'#fff'` per il titolo → `var(--color-text-primary)` (è `#ffffff` in dark mode)
3. `'rgba(255,255,255,0.85)'` → `var(--color-text-secondary)` o creare un token `--color-text-on-dark: rgba(255,255,255,0.85)` in globals.css

Aggiungere in `app/globals.css` (se non già presenti):

```css
--color-hero-overlay: rgba(0, 0, 0, 0.6);
--color-text-on-dark: rgba(255, 255, 255, 0.85);
```

## Fix B — MarketsGrid.tsx

Aggiungere `onAddToSlip` stub alla lista eventi:

```
onAddToSlip={(eventId, outcome) => {
  // TODO MA4: collegare a useBetSlip store
  console.log('[Slip stub]', eventId, outcome)
}}
```

In questo modo il bottone `[+ Slip]` è visibile e cliccabile su tutte le card. Il collegamento reale al Bet Slip drawer arriva in MA4.

---

## Acceptance criteria

- [ ] Nessun `#fff`, `rgba(0,0,0,...)`, `rgba(255,255,255,...)` hardcoded in HeroCard.tsx
- [ ] Bottone `[+ Slip]` visibile su tutte le EventCard nella griglia home
- [ ] Click `[+ Slip]` non genera errori (anche solo console.log stub OK)
- [ ] Nuovi CSS token aggiunti a globals.css se necessario
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "fix: HeroCard no hardcoded colors + EventCard Slip button visible (3.4.1-E)" && git push origin main`
