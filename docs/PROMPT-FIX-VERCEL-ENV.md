# PROMPT OPERATIVO — Fix Vercel Production Env Vars

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Task: Fix env vars Vercel production (fuori-sprint, post MA1)
> Stima: 10 minuti

---

## Contesto

Sprint 1.4.3 (MA1) ha verificato le env vars Vercel production e trovato problemi:

- Presenti con nomi sbagliati: `NEXT_PUBLIC_SUPABASE_URL_STAGING`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING`
- Mancanti: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PRIVY_APP_SECRET`, `NEXT_PUBLIC_APP_URL`

**Progetto Vercel**: `predimark-v2` — account `funerixs-projects`
**Progetto Supabase production**: `vlrvixndaeqcxftovzmw`

---

## Task

Usare la Vercel CLI (`npx vercel`) per:

1. Rimuovere le 2 variabili con nome sbagliato dall'ambiente Production
2. Aggiungere le 5 variabili corrette
3. Verificare che siano presenti
4. Triggerare un redeploy

---

## Step operativi

### Step 1 — Verifica accesso Vercel CLI

```bash
npx vercel whoami
```

Se non autenticato, esegui:

```bash
npx vercel login
```

(apre browser — autorizza e torna)

### Step 2 — Collega il progetto locale (se non già fatto)

```bash
npx vercel link
```

Quando chiede:

- Set up `~/Desktop/predimark-v2`? → **Y**
- Which scope? → seleziona `funerixs-projects`
- Found project `predimark-v2`? → **Y**

### Step 3 — Rimuovi le variabili con nome sbagliato

```bash
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL_STAGING production --yes
npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING production --yes
```

Se il comando `rm` non accetta `--yes`, omettilo e conferma interattivamente.

### Step 4 — Aggiungi le variabili corrette

Esegui questi comandi uno alla volta. Ogni comando chiederà il valore — incolla il valore indicato e premi Enter:

```bash
# 1. URL Supabase production (pubblica)
echo "https://vlrvixndaeqcxftovzmw.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production

# 2. Anon key Supabase production (pubblica)
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscnZpeG5kYWVxY3hmdG92em13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDc4NTAsImV4cCI6MjA5MjcyMzg1MH0.j7WI0pI64QLaUR2kEomdXxwLWqvPYTKSVw0GjUDegZI" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 3. Service role key (server-only — sensitive)
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscnZpeG5kYWVxY3hmdG92em13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE0Nzg1MCwiZXhwIjoyMDkyNzIzODUwfQ.NLI3DgoOkI8s2EFGZdVfisUTNmZVcsWxIJYvMMonSSI" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 4. Privy app secret (server-only — sensitive)
echo "privy_app_secret_4UpXdZrt5KwswZD3AbX5eZhcptse7CobEwnstRXtr43z38csuc6AiHvJtP58jFKH6bpm52s2N1y5px6iQAjEFNf8" | npx vercel env add PRIVY_APP_SECRET production

# 5. App URL production (pubblica)
echo "https://auktora.com" | npx vercel env add NEXT_PUBLIC_APP_URL production
```

**Nota**: se `echo "value" | npx vercel env add NAME production` non funziona per le sensitive, usa:

```bash
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
# poi incolla il valore quando richiesto
```

### Step 5 — Verifica variabili presenti

```bash
npx vercel env ls production
```

Deve mostrare tutte e 5 le nuove variabili (più `NEXT_PUBLIC_PRIVY_APP_ID` che era già ok).

### Step 6 — Redeploy

```bash
npx vercel --prod
```

Oppure se preferisci usare git:

```bash
git commit --allow-empty -m "chore: trigger redeploy post env vars fix"
git push origin main
```

### Step 7 — Verifica deploy

Dopo il deploy, controlla che il sito su `https://predimark-v2.vercel.app` (o `https://auktora.com`) si carichi senza errori Supabase nella console.

---

## Acceptance criteria

- [ ] `npx vercel env ls production` mostra: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PRIVY_APP_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PRIVY_APP_ID`
- [ ] `NEXT_PUBLIC_SUPABASE_URL_STAGING` e `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING` rimossi da Production
- [ ] Deploy production completato senza errori
- [ ] Segnalato output di `npx vercel env ls production`

---

## Cosa segnalare al completamento

```
Fix Vercel env vars completato ✅

- npx vercel env ls production: [output]
- Variabili aggiunte: NEXT_PUBLIC_SUPABASE_URL ✅ / NEXT_PUBLIC_SUPABASE_ANON_KEY ✅ / SUPABASE_SERVICE_ROLE_KEY ✅ / PRIVY_APP_SECRET ✅ / NEXT_PUBLIC_APP_URL ✅
- Variabili rimosse: NEXT_PUBLIC_SUPABASE_URL_STAGING ✅ / NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING ✅
- Deploy: ✅ [URL deploy]
```

---

_Prompt preparato da Cowork — Fix post Sprint 1.4.3_
_Dopo questo fix, MA1 è definitivamente chiusa e si può iniziare MA2._
