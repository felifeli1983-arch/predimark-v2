# PROMPT — Fix 3.4.1-A — Hero carousel mobile + pagination dots desktop

> **Quando eseguire**: prima di Sprint 3.5.1
> **Priorità**: ALTA — cambia l'esperienza mobile della pagina principale

---

## Problema

`HeroZone.tsx` fa uno stack verticale su mobile. Il wireframe (Doc 4) dice esplicitamente:

> "Mobile NON ha la divisione 60%/40% del desktop. Le hero diventano un carousel singolo."
> "●○○○ pagination" e frecce "← Iran Meeting | Sports →" per navigare tra hero.

Due mancanze separate:

1. Mobile: HeroZone deve essere un carousel swipeabile con pagination dots
2. Desktop + mobile: Hero Big deve avere pagination dots + frecce per navigare tra le hero disponibili

---

## Riferimenti da leggere prima

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — sezione "Hero zone desktop" e "Hero zone mobile"
- `components/home/HeroZone.tsx` — componente attuale (stack, da trasformare)
- `components/home/HeroCard.tsx` — singola hero card (non modificare il contenuto)

---

## Cosa modificare

### `components/home/HeroZone.tsx`

Aggiungere stato locale `activeIndex: number` (default 0).

**Desktop** (comportamento attuale conservato, aggiungere solo pagination):

- Layout 60%/40% invariato
- Aggiungere sotto Hero Big: dot navigation (●○○○) — un dot per ogni hero, click → cambia Hero Big
- Le frecce ← → cambiano `activeIndex` e aggiornano Hero Big

**Mobile** (nuovo — carousel):

- Una sola HeroCard visibile alla volta (full width)
- Stessi pagination dots in basso
- Swipe orizzontale via CSS `overflow-x: scroll; snap-type: x mandatory` su container scroll + `scroll-snap-align: start` su ogni slide
- NON usare librerie carousel esterne — implementare con CSS scroll-snap nativo

### Comportamento carousel mobile

```
[Hero 0] [Hero 1] [Hero 2] [Hero 3] [Hero 4]  ← scroll orizzontale snappante
     ●○○○○  ← dots aggiornati tramite IntersectionObserver
```

Usare `IntersectionObserver` per rilevare quale slide è visibile e aggiornare `activeIndex`.

---

## Acceptance criteria

- [ ] Mobile: una sola hero visibile, swipe orizzontale funziona con scroll-snap
- [ ] Mobile: pagination dots si aggiornano mentre si swipa
- [ ] Desktop: Hero Big mostra la hero con `activeIndex`, dot navigation funziona
- [ ] Desktop: frecce ← → cambiano `activeIndex`
- [ ] Nessuna libreria carousel esterna aggiunta
- [ ] Nessun colore hardcoded — tutti CSS vars
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "fix: HeroZone carousel mobile + pagination dots (3.4.1-A)" && git push origin main`
