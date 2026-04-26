# PROMPT — Fix rename: Predimark → Auktora (nei file di codice)

> Copia e incolla questo prompt in Claude in VS Code.

---

## Obiettivo

Sostituire "Predimark" con "Auktora" nei file di codice dell'app. I docs storici in `docs/` non vanno toccati — sono reference interni. La cartella `predimark-v2/` e il repo GitHub restano invariati.

---

## File da aggiornare — lista esatta

### `package.json`

- `"name": "predimark-v2"` → lascia invariato (nome repo/npm)
- `"description"` se contiene "Predimark" → sostituisci con "Auktora"

### `app/globals.css`

- Tutti i commenti che dicono "PREDIMARK V2" → "AUKTORA"

### `app/page.tsx`

- Qualsiasi testo visibile "Predimark" → "Auktora"

### `components/layout/Footer.tsx`

- Copyright: `© {year} Predimark` → `© {year} Auktora`
- Disclaimer: `"Predimark is not a licensed broker..."` → `"Auktora is not a licensed broker..."`

### `lib/stores/themeStore.ts`

- Chiave localStorage: `'predimark-theme'` → `'auktora-theme'`

### `AGENTS.md`

- Eventuali riferimenti a "Predimark V2" nel testo → "Auktora"

### `README.md` (root)

- Titolo e descrizione: "Predimark V2" → "Auktora"

---

## Regole

- NON toccare nulla dentro `docs/` — sono documenti storici
- NON rinominare cartelle o file
- NON modificare URL, domini, variabili d'ambiente (`NEXT_PUBLIC_APP_URL` ecc.)
- NON toccare `package-lock.json`
- Fai una sola passata con `grep -r "Predimark\|predimark" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.json" --include="*.md" --exclude-dir=docs --exclude-dir=node_modules --exclude-dir=.next .` per verificare che non sia rimasto nulla dopo le modifiche

---

## Acceptance criteria

- [ ] `grep -r "Predimark\|predimark" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.json" --exclude-dir=docs --exclude-dir=node_modules --exclude-dir=.next .` → zero risultati (eccetto `package.json` name field e variabili d'ambiente)
- [ ] `npm run validate` passa
- [ ] `npm run build` exit 0
- [ ] Commit: `git add -A && git commit -m "fix: rename Predimark → Auktora in code files" && git push origin main`
