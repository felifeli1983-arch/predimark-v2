# PROMPT — Sprint 3.1.1-R — Header split in sub-componenti

> Copia e incolla questo prompt in Claude in VS Code.

---

## Contesto

`components/layout/Header.tsx` è attualmente un file monolitico da 611 righe che contiene tutto: nav desktop, search desktop, hamburger mobile, drawer mobile, profile dropdown, REAL/DEMO toggle.

Questo è il refactor architetturale previsto da AGENTS.md prima di continuare con gli sprint successivi. **Non aggiungere nessuna funzionalità nuova — solo spostare codice esistente.**

---

## Obiettivo

Spezzare `Header.tsx` in 5 sub-componenti + 1 orchestratore snello, come specificato in `AGENTS.md` sezione "Split obbligatori".

---

## Struttura target esatta

```
components/layout/
  Header.tsx                  ← orchestratore, max 80 righe
  header/
    DesktopNav.tsx            ← NAV_LINKS + link attivi
    DesktopSearch.tsx         ← search bar placeholder desktop
    MobileDrawer.tsx          ← drawer hamburger con backdrop + pannello
    ProfileDropdown.tsx       ← avatar button + dropdown (My Profile + Logout)
    RealDemoToggle.tsx        ← REAL/DEMO button larghezza fissa 70px
```

---

## Cosa va in ogni file

### `header/DesktopNav.tsx`

- Riceve: `pathname: string`
- Contiene: array `NAV_LINKS`, rendering dei link con stato attivo
- Classe Tailwind: `hidden md:flex` — visibile solo desktop
- **Nessun `display` in style inline**

### `header/DesktopSearch.tsx`

- Nessuna prop (per ora è solo UI placeholder)
- Contiene: il div con icona Search + testo "Search markets…"
- Classe Tailwind: `hidden md:flex` — visibile solo desktop

### `header/MobileDrawer.tsx`

- Riceve: `open: boolean`, `onClose: () => void`, `pathname: string`
- Contiene: backdrop div + pannello nav (NAV_LINKS + theme toggle nel footer)
- Usa `useThemeStore` internamente
- Classe contenitore: `md:hidden` (il drawer compare solo su mobile)
- Il pannello è `position: fixed; inset: 0; zIndex: 200`

### `header/ProfileDropdown.tsx`

- Riceve: `user: AuthUser | null`, `onLogout: () => void`
- Contiene: avatar button + dropdown con "My Profile" e "Logout"
- Gestisce internamente `profileMenuOpen` state e click-outside via `useRef`

### `header/RealDemoToggle.tsx`

- Riceve: `isDemo: boolean`, `onToggle: () => void`
- Contiene: solo il button REAL/DEMO con `width: '70px'` fisso
- Nessun altro stato

### `Header.tsx` (orchestratore)

- Importa tutti e 5 i sub-componenti
- Gestisce solo: `mobileMenuOpen` state, `isDemo` state
- Passa i props giù ai sub-componenti
- Deve essere max ~80 righe di JSX

---

## Regole obbligatorie durante il refactor

1. **Zero modifiche funzionali** — comportamento identico prima e dopo
2. **Nessun `display` in `style={}`** per elementi con classi Tailwind di visibilità
   - ✅ `className="flex md:hidden"` senza display in style
   - ❌ `className="md:hidden" style={{ display: 'flex' }}`
3. Tutti i CSS vars invariati (nessun colore hardcoded)
4. `MobileDrawer` deve usare `className="md:hidden"` sul wrapper esterno senza display inline
5. Mantenere tutti i `flexShrink: 0` sugli elementi del header bar

---

## Acceptance criteria

- [ ] `npm run validate` passa (typecheck + lint + test)
- [ ] `npm run build` exit 0
- [ ] Nessun file nella cartella `components/layout/header/` supera 150 righe
- [ ] `Header.tsx` non supera 90 righe
- [ ] L'hamburger NON è visibile su desktop (verifica in DevTools a 1280px)
- [ ] La BottomNav NON è visibile su desktop
- [ ] Il drawer mobile funziona (apre/chiude) — verifica a 375px
- [ ] Il dropdown profilo funziona (apre/chiude, click outside chiude)
- [ ] `git add -A && git commit -m "refactor: split Header.tsx into sub-components (3.1.1-R)" && git push origin main`

---

## Note

- Non toccare `BottomNav.tsx`, `layout.tsx`, `globals.css` — sono già corretti
- Non aggiungere animazioni o nuovi import
- I test esistenti non testano Header direttamente — non serve aggiornare test
