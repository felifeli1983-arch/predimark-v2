# PROMPT — Sprint 3.1.3 — Footer minimal

> Copia e incolla questo prompt in Claude in VS Code.

---

## Contesto

App shell PWA completata (Header + BottomNav in flex flow). Manca il Footer che appare in fondo alla zona scrollabile in tutte le pagine pubbliche.

---

## Struttura attuale `app/layout.tsx`

```tsx
<div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
  <Header />
  <main style={{ flex: 1, overflowY: 'auto', ... }}>
    {children}
  </main>
  <BottomNav />
</div>
```

Il Footer va **dentro `<main>`**, dopo `{children}`, così scorre con il contenuto della pagina.

---

## Cosa produrre

### 1. `components/layout/Footer.tsx`

Footer minimal con:

- Link: Privacy Policy (`/legal/privacy`), Terms of Service (`/legal/terms`), Support (`/help`), About (`/about`)
- Disclaimer testo piccolo: `"Predimark is not a licensed broker. Prediction markets involve risk."`
- Lingua placeholder: bottone `🌐 EN` non funzionale (con `title="Language switch coming soon"`) — la i18n reale arriva in Sprint 8.3.x
- Copyright: `© {currentYear} Predimark. All rights reserved.`
- Layout: desktop → flex row centrato; mobile → flex column centrato, link in griglia 2 colonne
- Nascosto su mobile se BottomNav è presente (`md:block` o simile — valuta la soluzione più pulita)
- Nessun `display` inline su elementi con classi Tailwind responsive

Stile coerente con il design system:

- Background: `var(--color-bg-secondary)`
- Border top: `1px solid var(--color-border-subtle)`
- Testo link: `var(--color-text-muted)`, `font-size: 12px`
- Hover link: `var(--color-text-secondary)` con transition 150ms
- Max width: `1440px`, centrato, padding `16px 24px`
- Padding bottom desktop: `24px`; mobile: `env(safe-area-inset-bottom)` + `16px`

### 2. Aggiornamento `app/layout.tsx`

```tsx
<main style={{ flex: 1, overflowY: 'auto', ... }}>
  {children}
  <Footer />
</main>
```

Importare `Footer` da `@/components/layout/Footer`.

---

## Split file

`Footer.tsx` deve stare sotto `components/layout/` (non serve una cartella dedicata — è semplice).
Max 120 righe.

---

## Acceptance criteria

- [ ] Footer visibile in desktop su tutte le pagine (scroll fino in fondo)
- [ ] Footer nascosto su mobile (BottomNav occupa quella posizione)
- [ ] Link `/legal/privacy`, `/legal/terms`, `/help`, `/about` presenti e cliccabili (404 ok per ora — le pagine arrivano in sprint successivi)
- [ ] Bottone lingua placeholder presente, non funzionale
- [ ] Disclaimer text presente
- [ ] Anno corrente nel copyright (dinamico con `new Date().getFullYear()`)
- [ ] `npm run validate` passa
- [ ] `npm run build` exit 0
- [ ] Commit: `git commit -m "feat: Footer minimal (3.1.3)" && git push origin main`

---

## Note

- Non installare librerie nuove
- Non toccare Header, BottomNav, globals.css
- Step 3.1 (Layout globale) sarà completato dopo questo sprint
