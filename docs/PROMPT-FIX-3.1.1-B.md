# PROMPT — Fix 3.1.1-A — useAppMode Zustand store (REAL/DEMO toggle persistente)

> **Quando eseguire**: subito — bug funzionale attivo
> **Priorità**: ALTA — demo mode si resetta ad ogni navigazione

---

## Problema

`isDemo` in `Header.tsx` è `useState` locale. Quando l'utente attiva "DEMO" e naviga a un'altra pagina, il toggle torna a REAL. Il wireframe e Doc 5 dicono che REAL/DEMO deve persistere via Zustand con localStorage.

Doc 5 definisce:

> `useAppMode` — REAL vs DEMO toggle, lingua, tema dark/light. Persiste in localStorage.

Il tema è già in `lib/stores/themeStore.ts`. Il REAL/DEMO toggle va aggiunto allo stesso store o a un `appModeStore.ts` separato.

---

## Riferimenti da leggere prima

- `lib/stores/themeStore.ts` — store esistente con pattern da seguire
- `components/layout/header/HeaderActions.tsx` — dove `isDemo` è usato
- `components/layout/Header.tsx` — dove `isDemo` è useState + passato come prop
- `docs/05-TECH-STACK-AND-ARCHITETTURA.md` — sezione "State management"

---

## Cosa modificare

### Opzione A (raccomandata): aggiungere `isDemo` in `themeStore.ts`

Aggiungere al `ThemeStore` esistente:

```
isDemo: boolean
setIsDemo: (v: boolean) => void
toggleDemo: () => void
```

### Modifica `components/layout/Header.tsx`

Rimuovere `const [isDemo, setIsDemo] = useState(false)` e `onDemoToggle`.
Leggere `isDemo` e `toggleDemo` dal `useThemeStore`.
Passare `isDemo` e `toggleDemo` a `HeaderActions`.

### Modifica `components/layout/header/HeaderActions.tsx`

Rimuovere le prop `isDemo` e `onDemoToggle` dall'interfaccia.
Leggere direttamente da `useThemeStore()`.

### Modifica `components/layout/header/RealDemoToggle.tsx`

Se usa prop, aggiornare per leggere da store direttamente, oppure lasciare le prop (Header gliela passa già).

---

## Acceptance criteria

- [ ] Toggle REAL/DEMO persiste tra navigazioni (refresh pagina conserva lo stato)
- [ ] Toggle REAL/DEMO persiste tra sessioni (localStorage)
- [ ] `isDemo` è leggibile da qualunque componente via `useThemeStore()`
- [ ] Nessuna prop `isDemo` in Header.tsx (state dal store)
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "fix: useAppMode — REAL/DEMO toggle persistente via Zustand (3.1.1-A)" && git push origin main`
