# PROMPT — Fix 3.4.1-D — MarketsFilters: search, animations toggle, sub-filtri Related

> **Quando eseguire**: prima di Sprint 3.5.1
> **Priorità**: MEDIA — filtri incompleti rispetto al wireframe

---

## Problema

`MarketsFilters.tsx` implementa solo Sort dropdown + toggle Grid/List. Il wireframe (Doc 4) definisce:

```
[⚙ Filters] [🔍 Search markets...]  [⚡Animations] [Sort: Newest▼] [⊞|≡]
─────────────────────────────────────────────────────────────────────────
All · Wildfire · Breaking · Trump · Iran · GPT-5 · NFL · Mentions  →
```

Elementi mancanti:

1. **Search markets** — input di ricerca specifico per mercati (diverso dal search globale nell'header)
2. **Toggle Animations** — bottone ⚡ per disabilitare animazioni (accessibility, archiviato in localStorage)
3. **Sub-filtri Related** — seconda riga di tag dinamici scrollabili

---

## Riferimenti da leggere prima

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — sezione "Filtri e sub-filtri"
- `components/home/MarketsFilters.tsx` — stato attuale
- `components/home/MarketsGrid.tsx` — riceve le prop dal filtro

---

## Cosa modificare

### `components/home/MarketsFilters.tsx`

**Aggiungere alla prima riga dei filtri**:

- **Search markets** (input testuale): aggiorna URL con `?q=parola`. Debounced 300ms prima di chiamare `router.push`. Placeholder "Search markets..."
- **Toggle Animations** (bottone ⚡): legge/scrive `localStorage.getItem('animations-disabled')`. Quando disabilitato: aggiunge classe `no-animations` su `document.body`. Icona Lucide `Zap` — filled se attivo, outline se disattivato
- Bottone **Filters** (icona `SlidersHorizontal` da Lucide) — per ora solo un bottone placeholder che non apre ancora niente (il drawer filtri avanzati arriva in MA4)

**Aggiungere seconda riga (sub-filtri Related)**:

```
All · tag1 · tag2 · tag3 · tag4 ... →
```

- Tag hardcoded inizialmente: `['All', 'Trending', 'Breaking', 'Politics', 'Crypto', 'NFL', 'GPT-5']`
- Il tag attivo ha background evidenziato
- Stato in URL: `?tag=nfl` (separato da `?category=`)
- Scroll orizzontale, `scrollbarWidth: none`

### `components/home/MarketsGrid.tsx`

- Leggere `searchParams.get('q')` e filtrare `initialEvents` per titolo/tag (confronto case-insensitive su `event.title`)
- Leggere `searchParams.get('tag')` e applicare filtro aggiuntivo

### `app/globals.css`

Aggiungere:

```css
body.no-animations * {
  animation: none !important;
  transition: none !important;
}
```

---

## Acceptance criteria

- [ ] Search markets filtra la griglia mentre si digita (debounced 300ms)
- [ ] Toggle ⚡ Animations funziona e persiste in localStorage tra sessioni
- [ ] Sub-filtri Related scrollabili, stato in URL
- [ ] Bottone Filters visibile (placeholder — drawer in MA4)
- [ ] `body.no-animations` disattiva tutte le transizioni/animazioni
- [ ] Nessun colore hardcoded
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "fix: MarketsFilters search + animations toggle + sub-filtri Related (3.4.1-D)" && git push origin main`
