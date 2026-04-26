# PROMPT OPERATIVO — SPRINT 1.4.1

## Configurazione Vercel — vercel.json + env vars + metadata produzione

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.4 / Sprint 1.4.1
> Stima: 1 ora
> Dipendenze: 1.3.1 ✅ completato

---

## Contesto

Stai implementando lo **Sprint 1.4.1** di Predimark V2. Il progetto è già live su Vercel:

- **URL staging**: `https://predimark-v2.vercel.app`
- **Dominio custom**: `https://auktora.com` (già configurato su Vercel)
- **Account Vercel**: `funerixs-projects`

Questo sprint completa la configurazione Vercel lato codice: `vercel.json` con headers di sicurezza, metadata produzione in `layout.tsx`, e variabile `NEXT_PUBLIC_APP_URL` per gestire l'URL dell'app in modo dinamico.

**Nota**: Le variabili d'ambiente su Vercel dashboard (`NEXT_PUBLIC_PRIVY_APP_ID`, chiavi Supabase, ecc.) sono già state aggiunte manualmente — non devi farlo tu.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Creare `vercel.json` con headers di sicurezza e configurazione base
2. Aggiungere `NEXT_PUBLIC_APP_URL` al codice
3. Aggiornare `app/layout.tsx` con metadata produzione completi
4. Aggiornare `app/globals.css` con font display swap (già presente, solo verifica)
5. Aggiornare `.env.example` con `NEXT_PUBLIC_APP_URL`
6. Verificare il build locale con `npm run build`
7. Commit e push → trigger deploy automatico su Vercel

---

## Step operativi

### Step 1 — Crea `vercel.json`

Crea `vercel.json` nella root del progetto:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

**Note:**

- `X-Frame-Options: DENY` → previene clickjacking
- `X-Content-Type-Options: nosniff` → previene MIME sniffing
- `Referrer-Policy` → non leaka URL completi nelle richieste cross-origin
- `Permissions-Policy` → nega accesso a camera/microfono/geolocalizzazione (non servono)
- NON aggiungere `Content-Security-Policy` ora — bloccherebbe Privy, Supabase e altri script di terze parti. Viene in MA8.

### Step 2 — Aggiorna `.env.local` e `.env.example`

Aggiungi questa variabile a `.env.local` (per development locale):

```
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

Aggiungi il placeholder a `.env.example`:

```
NEXT_PUBLIC_APP_URL=https://auktora.com
```

### Step 3 — Aggiorna `app/layout.tsx`

Aggiorna il metadata per la produzione. Sostituisci il contenuto attuale con:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PrivyProvider } from '@/providers/PrivyProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://auktora.com'

export const metadata: Metadata = {
  title: {
    default: 'Auktora',
    template: '%s | Auktora',
  },
  description: 'Prediction markets platform — powered by Polymarket.',
  metadataBase: new URL(appUrl),
  openGraph: {
    title: 'Auktora',
    description: 'Prediction markets platform — powered by Polymarket.',
    url: appUrl,
    siteName: 'Auktora',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auktora',
    description: 'Prediction markets platform — powered by Polymarket.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  )
}
```

**Note importanti:**

- `robots: { index: false }` → NON indicizzare su Google ora, l'app è ancora in sviluppo. Si abilita in MA8 prima del launch.
- `title.template: '%s | Auktora'` → ogni page può sovrascrivere il titolo con `export const metadata = { title: 'Home' }` e apparirà "Home | Auktora"
- `metadataBase` → necessario per generare URL assoluti per og:image quando li aggiungeremo

### Step 4 — Verifica build locale

```bash
npm run build
```

Il build deve completare senza errori. Warning TypeScript/ESLint minori sono accettabili, errori no.

Se il build passa:

```bash
npm run validate
```

Entrambi devono passare.

### Step 5 — Commit e push

```bash
git add .
git status  # verifica: vercel.json, app/layout.tsx, .env.example, .env.local

git commit -m "chore: Vercel config + production metadata (Sprint 1.4.1)

- vercel.json: security headers (X-Frame-Options, CSP deferred to MA8)
- layout.tsx: metadata produzione con title template + OpenGraph
- robots: noindex/nofollow (abilitare in MA8 pre-launch)
- NEXT_PUBLIC_APP_URL per URL dinamico dev/prod"

git push origin main
```

Dopo il push, Vercel farà deploy automatico. Controlla la dashboard Vercel che il build vada a buon fine.

---

## Acceptance criteria

- [ ] `vercel.json` esiste con security headers
- [ ] `app/layout.tsx` ha `title.template` e `metadataBase` configurati
- [ ] `robots: { index: false }` (noindex fino al launch)
- [ ] `.env.example` ha `NEXT_PUBLIC_APP_URL`
- [ ] `npm run build` → exit 0
- [ ] `npm run validate` → exit 0
- [ ] Push GitHub → deploy Vercel automatico avviato
- [ ] Build Vercel verde (verificare su dashboard)

---

## Cosa NON fare in questo sprint

- ❌ Non aggiungere `Content-Security-Policy` — blocca Privy/Supabase, viene in MA8
- ❌ Non abilitare `robots: { index: true }` — l'app non è pronta per essere indicizzata
- ❌ Non configurare `og:image` — non abbiamo ancora assets grafici
- ❌ Non modificare le variabili d'ambiente su Vercel dashboard — già gestite manualmente

---

## Cosa segnalare al completamento

```
Sprint 1.4.1 completato ✅

Acceptance criteria verificati:
- vercel.json: ✅
- layout.tsx metadata: ✅
- robots noindex: ✅
- npm run build: ✅ exit 0
- npm run validate: ✅ exit 0
- push + deploy Vercel: ✅ [link deployment]

Note: [eventuali warning di build o problemi]
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 1.4.1_
_Prossimo sprint: 1.4.2 (dominio custom + CORS Supabase) oppure 1.3.2 (Privy + Supabase sync)_
