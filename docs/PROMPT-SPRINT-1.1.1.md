# PROMPT OPERATIVO — SPRINT 1.1.1
## Setup credenziali GitHub per Claude in VS Code

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.1 / Sprint 1.1.1
> Stima: 30 minuti
> Dipendenze: nessuna (è il primo sprint in assoluto)

---

## Contesto

Stai iniziando il progetto **Predimark V2** — una web-app di prediction markets builder sopra Polymarket. Questo è lo **Sprint 1.1.1**, il primo sprint in assoluto del progetto.

**Divisione dei ruoli importante:**
- **Cowork** gestisce tutto il database Supabase direttamente via MCP — tu non tocchi mai `supabase CLI`, non applichi migrations, non crei progetti. Il DB è già configurato e pronto.
- **Tu (Claude in VS Code)** scrivi codice Next.js, fai commit, push, PR su GitHub.
- Il file `.env.local` con tutte le chiavi Supabase è **già pronto** nella root del progetto — non devi crearlo, solo verificare che esista.

Questo sprint configura solo le credenziali GitHub per poter fare commit e push.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Prerequisiti — Cosa Feliciano deve fornirti

Un solo valore ti serve:

| Variabile | Dove ottenerla |
|---|---|
| `GITHUB_PAT` | GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → scope: `repo`, `workflow`, `read:org` |

> ⚠️ Se il PAT manca, **fermati e chiedi a Feliciano** di generarlo prima di continuare.

---

## Task

1. Configurare `git` con le credenziali di Feliciano
2. Autenticare `gh` (GitHub CLI) con il Personal Access Token
3. Verificare che il file `.env.local` esista e sia popolato
4. Creare il file `.env.example` (versione pubblica senza valori segreti)
5. Verificare/creare `.gitignore`
6. Verificare tutti gli acceptance criteria

---

## Step operativi

### Step 1 — Verifica stato attuale

```bash
# Verifica git
git --version
git config --get user.name
git config --get user.email

# Verifica gh CLI (se non installato, vai allo step 2)
gh --version
gh auth status
```

### Step 2 — Configura git e gh CLI

```bash
# Configura identità git con le credenziali di Feliciano
git config --global user.name "Feliciano Ciccarelli"
git config --global user.email "felicianociccarelli1983@gmail.com"

# Installa GitHub CLI se non presente (macOS)
brew install gh

# Autenticati con il PAT fornito da Feliciano
# Quando gh auth login ti chiede il metodo, scegli "Paste an authentication token"
gh auth login --hostname github.com --git-protocol https

# Verifica autenticazione
gh auth status
```

> Se `brew` non è installato: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

### Step 3 — Verifica il file `.env.local`

Il file `.env.local` è già stato creato da Cowork nella root del progetto. Verificane l'esistenza:

```bash
cd ~/predimark-v2
ls -la .env.local
```

Se il file esiste, controlla che contenga i valori Supabase reali (non placeholder):

```bash
grep "SUPABASE_URL" .env.local
```

Deve restituire due URL reali (`https://hhuwxcijarcyivwzpqfp.supabase.co` e `https://vlrvixndaeqcxftovzmw.supabase.co`).

> ⚠️ **Non modificare il file `.env.local`** — è gestito da Cowork. Se manca o sembra vuoto, segnala a Feliciano.

### Step 4 — Crea il file `.env.example`

```bash
cat > .env.example << 'EOF'
# =============================================================
# PREDIMARK V2 — ENV VARS TEMPLATE
# Copia questo file in .env.local e popola i valori
# NON inserire valori reali in questo file
# =============================================================

# --- GITHUB ---
GITHUB_PAT=your_github_personal_access_token

# --- SUPABASE STAGING ---
NEXT_PUBLIC_SUPABASE_URL_STAGING=https://your-staging-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY_STAGING=your_staging_service_role_key
SUPABASE_DB_URL_STAGING=postgresql://postgres:your_password@db.your-staging-ref.supabase.co:5432/postgres

# --- SUPABASE PRODUCTION ---
NEXT_PUBLIC_SUPABASE_URL_PRODUCTION=https://your-production-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_PRODUCTION=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY_PRODUCTION=your_production_service_role_key
SUPABASE_DB_URL_PRODUCTION=postgresql://postgres:your_password@db.your-production-ref.supabase.co:5432/postgres

# --- PRIVY ---
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# --- POLYMARKET ---
POLYMARKET_BUILDER_CODE=your_builder_code
POLYMARKET_CLOB_BASE_URL=https://clob.polymarket.com
POLYMARKET_GAMMA_BASE_URL=https://gamma-api.polymarket.com

# --- ANTHROPIC API ---
ANTHROPIC_API_KEY=your_anthropic_api_key

# --- MOONPAY ---
MOONPAY_API_KEY=your_moonpay_api_key
MOONPAY_SECRET_KEY=your_moonpay_secret_key
EOF
```

### Step 5 — Verifica/crea `.gitignore`

```bash
cd ~/predimark-v2

# Verifica se esiste già
cat .gitignore 2>/dev/null || cat > .gitignore << 'EOF'
# Env vars — MAI committare
.env.local
.env.*.local
.env.staging
.env.production

# Node
node_modules/
.next/
out/

# Sistema
.DS_Store
*.log
.vercel
EOF
```

### Step 6 — Verifica git remote (se il repo GitHub esiste già)

```bash
cd ~/predimark-v2
git remote -v
```

Se il remote non è configurato — è normale, il repo GitHub viene creato nello Sprint **1.1.2**. Non crearlo in questo sprint.

---

## Acceptance criteria

- [ ] `git config --get user.email` ritorna `felicianociccarelli1983@gmail.com`
- [ ] `git config --get user.name` ritorna `Feliciano Ciccarelli`
- [ ] `gh auth status` mostra `✓ Logged in to github.com`
- [ ] File `.env.local` esiste in `~/predimark-v2/` con i valori Supabase reali
- [ ] File `.env.example` esiste con valori placeholder
- [ ] File `.gitignore` include `.env.local`
- [ ] `grep "service_role" .env.local` NON restituisce variabili con prefisso `NEXT_PUBLIC_`

---

## Cosa NON fare in questo sprint

- ❌ Non installare o autenticare Supabase CLI — il DB è gestito da Cowork via MCP
- ❌ Non applicare migrations Supabase — lo fa Cowork
- ❌ Non creare il repo GitHub — quello è Sprint 1.1.2
- ❌ Non scrivere codice Next.js
- ❌ Non modificare `.env.local` — è gestito da Cowork

---

## Cosa segnalare al completamento

```
Sprint 1.1.1 completato ✅

Acceptance criteria verificati:
- git config: ✅ felicianociccarelli1983@gmail.com
- gh auth status: ✅ [username confermato]
- .env.local: ✅ esiste con valori reali
- .env.example: ✅ creato
- .gitignore: ✅ include .env.local

Pronto per Sprint 1.1.2 — Init Next.js 16 project.
```

---

*Prompt preparato da Cowork — Predimark V2 Sprint 1.1.1*
*Prossimo sprint: 1.1.2 — Init Next.js 16 project con stack base*
