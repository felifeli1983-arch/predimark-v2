# PROMPT — Fix 3.4.1-B — Sidebar mobile inline sections

> **Quando eseguire**: prima di Sprint 3.5.1
> **Priorità**: ALTA — su mobile la sidebar è totalmente assente

---

## Problema

`Sidebar.tsx` ha `hidden md:flex` — su mobile sparisce completamente. Il wireframe (Doc 4) dice:

> "Mobile NON ha sidebar fissa (no spazio). Le sezioni della sidebar diventano **rail/sezioni inline** dopo il rail 'Top Movers'."

Su mobile devono apparire 2-3 sezioni prioritarie inline nel flusso verticale della pagina, non una sidebar nascosta.

---

## Riferimenti da leggere prima

- `docs/04-WIREFRAMES-pagina1-home-v2.md` — sezione "Sidebar adattiva inline (mobile)"
- `app/page.tsx` — struttura layout attuale
- `components/home/Sidebar.tsx` — sidebar desktop attuale
- `components/home/SidebarActivity.tsx` — sezione attiva già funzionante
- `components/home/SidebarHotNow.tsx` — sezione attiva già funzionante

---

## Cosa costruire

### `components/home/MobileSidebarRails.tsx` (nuovo)

Componente `'use client'` che mostra le sezioni prioritarie inline su mobile. Si usa **solo su mobile** — visibile solo con `md:hidden`.

Ordine sezioni per stato:

**Guest**:

1. Demo Mode CTA (compatta, 1 riga)
2. Hot Now (tag cloud scrollabile orizzontale)
3. Recent Activity (ultimi 3 trade)

**Loggato**:

1. Hot Now
2. Recent Activity

Il componente riusa i componenti sidebar già esistenti (`SidebarHotNow`, `SidebarActivity`) — non duplica logica.

### Modifica `app/page.tsx`

Aggiungere `<MobileSidebarRails />` nel layout, tra `<HeroZone />` e `<MarketsGrid />`, visibile solo su mobile (`md:hidden`).

---

## Layout atteso mobile

```
HeroZone (carousel)
MobileSidebarRails (md:hidden):
  - Demo Mode CTA (se guest) — compatta
  - Hot Now tag cloud — scroll orizzontale
  - Recent Activity — ultimi 3 trade
MarketsFilters
MarketsGrid
```

---

## Acceptance criteria

- [ ] Su mobile appaiono le sezioni inline (Demo CTA / HotNow / Activity)
- [ ] Su desktop le sezioni inline NON appaiono (`md:hidden`)
- [ ] La sidebar desktop rimane invariata (`hidden md:flex`)
- [ ] I componenti sidebar riusati (SidebarActivity, SidebarHotNow) NON vengono duplicati
- [ ] Nessun colore hardcoded
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "fix: Sidebar mobile inline sections (3.4.1-B)" && git push origin main`
