# Predimark V2 — Wireframes — Pagina 7 (Signup + onboarding)

> **Documento 4 di 10** — UX Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Pagina 7 (Signup + onboarding) completa
> Predecessori: Pagine 1-6 completate
> **Questa è l'ultima pagina del Documento 4 — Wireframes**

---

## Cos'è questo documento

Questo documento descrive il **flusso completo di signup e onboarding** di Predimark V2 — dal primo click su "Sign up" fino al primo trade dell'utente.

L'obiettivo è massimizzare la **conversion** mantenendo qualità: l'utente deve poter iniziare a esplorare il prodotto in **meno di 30 secondi**, e fare il primo trade demo entro **2 minuti**.

---

## DECISIONI ARCHITETTURALI

### Approccio: Signup minimo + Onboarding soft skippabile

Adottiamo un approccio **ibrido** in 2 fasi:

**Fase 1 — Signup minimo (30 secondi)**:
- Email/Google/Apple/Twitter via Privy
- Wallet creato automaticamente in background
- L'utente entra subito nella home

**Fase 2 — Onboarding soft (skippabile, 2 minuti se completato)**:
- Banner non-bloccante in cima alla home
- Modal soft con step opzionali (profilo, preferenze, primo trade demo)
- Skip facile in qualsiasi momento

### Default modalità: DEMO

Il nuovo utente atterra in **modalità Demo** con $10,000 paper money. Può:
- Esplorare la home con dati live (prezzi, segnali, leaderboard)
- Fare trade demo per familiarizzare
- Switch a REAL quando vuole (richiede deposit USDC)

Questo abbassa drasticamente la barriera psicologica all'ingresso.

### Geo-block trasparente

Pattern doppio:
- **Banner soft al signup** (trasparente: "Da Italia, real trading non disponibile, ma demo sì")
- **Redirect concreto al trade**: quando prova a fare un trade real, redirect a demo con tooltip esplicativo

### Preferenze interessi (Netflix-style)

Domanda smart unica nell'onboarding soft: "Cosa ti interessa?" con chip categorie multi-select. **Skippabile** — se skip, useremo il segnale dei click per personalizzare home progressivamente.

---

## STRUTTURA COMPLETA DEL FLUSSO

```
[Visitor lands on Predimark]
            │
            ▼
[Click "Sign up" or "Get Started"]
            │
            ▼
┌──────────────────────────────────┐
│ SIGNUP MINIMO (30 secondi)        │
│                                   │
│ /signup                           │
│ ↓ Choose method (Email/Google/    │
│   Apple/Twitter)                  │
│                                   │
│ /signup/verify                    │
│ ↓ Insert verification code        │
│   (only for email method)         │
│                                   │
│ [Wallet creato in background]     │
│ [Geo-block check]                 │
└──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ /home (DEMO MODE attivo)          │
│                                   │
│ Banner persistente:               │
│ "Welcome! You have $10k demo      │
│  money to explore."               │
│                                   │
│ Onboarding soft modal (apre auto) │
└──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ ONBOARDING SOFT MODAL              │
│                                   │
│ Step 1: Welcome + first action    │
│ Step 2: Pick interests (skip OK)  │
│ Step 3: First demo trade (skip OK)│
│ Step 4: Connect Telegram (skip OK)│
│                                   │
│ [Skip onboarding] sempre disponi. │
└──────────────────────────────────┘
            │
            ▼
[Utente in /home con setup ready]
            │
            ▼
┌──────────────────────────────────┐
│ ESPLORAZIONE LIBERA               │
│                                   │
│ Demo trade illimitati             │
│ Banner ricorda "switch to real"   │
│ Notifiche push richiesta          │
│                                   │
│ Quando vuole tradare REAL:        │
│ → /me/deposit (MoonPay)           │
│ → KYC se richiesto                │
│ → Switch a REAL mode              │
└──────────────────────────────────┘
```

---

## PAGINA `/signup` — Entry point

### Layout Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER MINIMAL (solo logo, no nav)                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│            ┌──────────────────────────────────────────┐              │
│            │  Logo Predimark grande                    │              │
│            │                                            │              │
│            │  Welcome to Predimark                      │              │
│            │  The smart prediction market              │              │
│            │                                            │              │
│            │  ┌──────────────────────────────────────┐ │              │
│            │  │ ✉ Continue with Email                │ │              │
│            │  └──────────────────────────────────────┘ │              │
│            │                                            │              │
│            │  ┌──────────────────────────────────────┐ │              │
│            │  │ G Continue with Google               │ │              │
│            │  └──────────────────────────────────────┘ │              │
│            │                                            │              │
│            │  ┌──────────────────────────────────────┐ │              │
│            │  │  Continue with Apple                │ │              │
│            │  └──────────────────────────────────────┘ │              │
│            │                                            │              │
│            │  ┌──────────────────────────────────────┐ │              │
│            │  │ 𝕏 Continue with X (Twitter)          │ │              │
│            │  └──────────────────────────────────────┘ │              │
│            │                                            │              │
│            │  ─── or ───                                │              │
│            │                                            │              │
│            │  ┌──────────────────────────────────────┐ │              │
│            │  │ 🔗 Connect external wallet           │ │              │
│            │  │   (MetaMask, Phantom, Coinbase...)   │ │              │
│            │  └──────────────────────────────────────┘ │              │
│            │                                            │              │
│            │  By continuing, you agree to our          │              │
│            │  [Terms] and [Privacy Policy]             │              │
│            │                                            │              │
│            │  Already have an account? [Login]         │              │
│            └──────────────────────────────────────────┘              │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ FOOTER MINIMAL (lingua, support, social links)                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Mobile

```
┌─────────────────────────────────────┐
│ Logo Predimark (centered)           │
├─────────────────────────────────────┤
│                                      │
│  Welcome to Predimark                │
│  The smart prediction market         │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ ✉ Continue with Email           │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ G Continue with Google          │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Continue with Apple           │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ 𝕏 Continue with X               │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ─── or ───                          │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ 🔗 Connect external wallet      │ │
│  └─────────────────────────────────┘ │
│                                      │
│  Terms · Privacy                     │
│  Already a user? Login               │
└─────────────────────────────────────┘
```

### Caratteristiche

- **Header minimale**: solo logo Predimark (no nav, no distrazioni)
- **5 metodi auth via Privy** (priorità ordinata):
  1. **Email** (con codice OTP)
  2. **Google** (OAuth)
  3. **Apple** (OAuth)
  4. **X/Twitter** (OAuth)
  5. **External wallet** (MetaMask/Phantom/Coinbase/Rabby/Rainbow via WalletConnect)
- **Bottoni grandi tap-friendly** (mobile)
- **Link footer**: Terms + Privacy + Login (per utenti esistenti)
- **Lingua**: switch lingua nel footer (riconosce automaticamente browser)

### Flussi alternativi

#### Flusso Email
1. Click "Continue with Email" → input email
2. Privy invia codice OTP (6 cifre)
3. Redirect a `/signup/verify` per inserire codice
4. Verificato → wallet creato automaticamente in background
5. Redirect a `/home` con DEMO mode attivo

#### Flusso OAuth (Google/Apple/X)
1. Click "Continue with X" → OAuth popup/redirect
2. Authorize → callback Privy
3. Wallet creato automaticamente
4. Redirect a `/home`

#### Flusso External Wallet
1. Click "Connect external wallet" → modal con lista wallet
2. Click su MetaMask (es.) → richiesta firma
3. User firma message → autenticazione
4. Wallet già esistente collegato (no creazione nuovo)
5. Redirect a `/home`

### Geo-block check (in background)

Mentre l'utente firma/verifica, il backend fa **geo-check** via IP:
- Paese **allowed**: signup completato normalmente, accesso REAL + DEMO
- Paese **demo-only** (es. Italy): signup completato, banner permanente "Real trading not available", DEMO completo
- Paese **blocked** (es. sanzioni): signup bloccato con messaggio "Service not available in your region"

---

## PAGINA `/signup/verify` — Email verification (solo per metodo Email)

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER MINIMAL (logo + back arrow)                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│            ┌──────────────────────────────────────────┐              │
│            │  Check your email                         │              │
│            │                                            │              │
│            │  We sent a 6-digit code to:               │              │
│            │  user@example.com                          │              │
│            │                                            │              │
│            │  ┌─┬─┬─┬─┬─┬─┐                            │              │
│            │  │ │ │ │ │ │ │  (input cifre)             │              │
│            │  └─┴─┴─┴─┴─┴─┘                            │              │
│            │                                            │              │
│            │  Didn't get the code?                      │              │
│            │  [Resend in 30s]                          │              │
│            │                                            │              │
│            │  [Use different email]                     │              │
│            └──────────────────────────────────────────┘              │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Caratteristiche

- **6 input separati** per le cifre OTP (UX standard, auto-advance al successivo)
- **Auto-submit** quando tutte le 6 cifre sono inserite
- **Resend countdown** (30 secondi) per evitare spam
- **Use different email** torna a `/signup`
- **Loading state** dopo submit (spinner blu)
- **Errore**: codice errato → highlight rosso + messaggio "Invalid code, try again"

---

## ATTERRAGGIO POST-SIGNUP — Home con onboarding soft

L'utente dopo signup atterra direttamente in `/home` (non in pagine intermedie obbligatorie).

### Differenze rispetto a Home normale per nuovo utente

#### 1. Banner welcome persistente (in cima)

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🎉 Welcome! You have $10,000 demo money to explore Predimark.        │
│    Try a trade to see how it works.   [Tour Predimark]  [×]          │
└──────────────────────────────────────────────────────────────────────┘
```

- Background blu chiaro `#3b82f615`
- Bottone "Tour Predimark" apre il modal onboarding soft
- Bottone "[×]" chiude permanentemente il banner (salva in user prefs)
- Sparisce automaticamente dopo il primo trade demo

#### 2. Onboarding soft modal (apre auto al primo atterraggio)

Vedi sezione successiva.

#### 3. Tooltip contestuali (smart hints)

Per i primi minuti, alcuni elementi della UI hanno **tooltip contestuali**:
- Hover su "Bet Slip" → "Add markets here to bet on multiple outcomes"
- Hover su switch REAL/DEMO → "You're in DEMO mode. Switch to REAL when ready."
- Hover su Segnale Predimark → "Algorithmic signal calibrated on real performance"

Tooltip dismissable individualmente. Non riappaiono dopo dismiss.

---

## ONBOARDING SOFT MODAL

### Layout (apre automaticamente al primo atterraggio post-signup)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Pagina /home dietro oscurata                                          │
│                                                                       │
│        ┌──────────────────────────────────────────────────┐          │
│        │ Welcome to Predimark                          [×] │          │
│        │ Step 1 of 4 ●○○○                                  │          │
│        ├──────────────────────────────────────────────────┤          │
│        │                                                    │          │
│        │  [STEP CONTENT]                                    │          │
│        │                                                    │          │
│        ├──────────────────────────────────────────────────┤          │
│        │ [Skip onboarding]              [Back] [Next →]    │          │
│        └──────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────┘
```

### 4 Step dell'onboarding soft

#### Step 1 — Welcome

```
Welcome to Predimark!
You can predict the future and earn rewards.

🎯  Algorithmic signals — based on real backtest data
📊  Demo mode — explore with $10,000 paper money first
🌐  Trade on Polymarket markets — global liquidity
⚡  Copy top traders — learn from the best

You're currently in DEMO mode. Let's set things up in 1 minute.

[Skip onboarding]              [Get started →]
```

#### Step 2 — Pick interests (Netflix-style)

```
What are you into?
Select what interests you. We'll personalize your home.

Multi-select chips:
☐ 📈 Crypto         ☐ ⚽ Sport
☐ 🗳 Politics        ☐ 🎬 Cultura
☐ 📰 News           ☐ 🌍 Geopolitica
☐ 💼 Economia        ☐ 🤖 Tech

You can change this later in settings.

[Skip this step]              [Back] [Continue →]
```

**Caratteristiche**:
- Multi-select chip layout grid 4x2
- Hover/active state con bordo blu
- Almeno 1 selezione ottimale ma skippabile
- Quando l'utente seleziona almeno 1, bottone "Continue" diventa primary (azzurro pieno)

#### Step 3 — First demo trade (guidato)

```
Try your first trade!
We'll guide you through a sample demo trade.

[Featured market preview]
┌─────────────────────────────────────┐
│ Will Bitcoin reach $100k by 2026?   │
│                                      │
│  YES 62%        NO 38%               │
│  $0.62          $0.38                │
│                                      │
│  [Buy YES $5]   [Buy NO $5]          │
└─────────────────────────────────────┘

Click YES or NO to make your first $5 demo trade.
You can sell later if you change your mind.

[Skip this step]              [Back]
```

**Caratteristiche**:
- Mercato selezionato dinamicamente (uno popolare al momento)
- 2 bottoni grandi: Buy YES / Buy NO
- Click su uno → esegue trade demo, mostra animazione success, passa a Step 4
- "Skip" → vai a Step 4 senza trade

#### Step 4 — Connect Telegram (optional)

```
Get smart signals on Telegram
Receive Predimark signals directly on your phone.

Free tier:
• 5-minute delayed signals
• 3 channels (Crypto, Sport, Politics)

Premium tier ($5/month):
• Real-time signals
• All categories
• Priority support

[Connect Telegram]   [Maybe later]   [Skip onboarding]
```

**Caratteristiche**:
- Click "Connect Telegram" → apre Telegram bot in nuova tab/finestra
- Click "Maybe later" → finisce onboarding, ricorda di proporlo dopo 7 giorni
- Click "Skip onboarding" → finisce onboarding senza promemoria

#### Step 5 (auto, dopo Step 4) — Welcome complete

```
You're all set! 🎉

What you can do now:
✓ Explore featured markets
✓ Make demo trades freely  
✓ Switch to REAL anytime

[Start exploring]
```

Click "Start exploring" → chiude modal, l'utente è in home pronto a usare il prodotto.

### Skip flow

Se l'utente clicca "Skip onboarding" in qualsiasi step:
- Modal si chiude
- Toast: "You can complete onboarding later from your profile"
- Banner welcome rimane visibile in home

### Onboarding NON ripresentato dopo skip

Se l'utente chiude/skippa l'onboarding, non gliela proponiamo di nuovo automaticamente. L'utente può triggerarla manualmente da `/me/settings/profile` con bottone "Replay onboarding".

---

## GEO-BLOCK COMUNICAZIONE

### Banner soft al signup completato (paese demo-only)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⓘ Real trading not available in Italy                                │
│   You can use Predimark in Demo mode with $10k paper money.          │
│   [Learn more]  [×]                                                   │
└──────────────────────────────────────────────────────────────────────┘
```

- Background giallo soft (info, non errore)
- Click "Learn more" → apre pagina FAQ con dettagli legali
- Bottone "[×]" chiude (ma riappare dopo 24h se l'utente prova a tradare real)

### Redirect concreto al trade

Quando l'utente prova a fare un trade in REAL mode da paese geo-block:

```
┌──────────────────────────────────────────────────┐
│ Real trading not available in your region        │
│                                                   │
│ You're in Italy, where real money trading is     │
│ not available due to local regulations.          │
│                                                   │
│ But you can:                                      │
│ ✓ Trade with $10k demo money                     │
│ ✓ Get algorithmic signals                        │
│ ✓ Compete on leaderboard                         │
│                                                   │
│ [Try Demo Mode →]   [Cancel]                     │
└──────────────────────────────────────────────────┘
```

Click "Try Demo Mode" → switch automatico a DEMO con toast notification.

### Per paesi completamente bloccati (sanzioni)

Mostrato già al signup (no signup permesso):

```
Service not available in your region.

Predimark is not available in your country due to international 
sanctions or local regulations.

If you believe this is an error, please contact support.

[Contact support]
```

---

## DEPOSIT FLOW (post-signup, opzionale)

### Quando l'utente vuole switchare a REAL

L'utente clicca switch REAL nell'header (era in DEMO):

#### Caso A — Saldo $0 USDC
```
┌──────────────────────────────────────────────────┐
│ You need USDC to trade in REAL mode              │
│                                                   │
│ Your wallet has $0 USDC.                          │
│ Deposit to start trading with real money.         │
│                                                   │
│ [Deposit USDC]   [Stay in Demo]                  │
└──────────────────────────────────────────────────┘
```

#### Caso B — Saldo > $0 USDC
Switch immediato a REAL, toast "You're now in REAL mode."

### Pagina `/me/deposit`

```
┌──────────────────────────────────────────────────────────────────────┐
│ Deposit USDC                                                          │
├──────────────────────────────────────────────────────────────────────┤
│ Method:                                                               │
│ ○ Buy with credit card (MoonPay)                                     │
│ ○ Transfer from external wallet                                      │
│ ○ Receive from another address                                       │
├──────────────────────────────────────────────────────────────────────┤
│ [If MoonPay selected:]                                                │
│ Amount: [$100 ▼]  ($25 - $1,000 per transaction)                     │
│ Estimated fees: $3.50                                                 │
│ You'll receive: $96.50 USDC                                          │
│                                                                       │
│ [Continue with MoonPay]                                              │
├──────────────────────────────────────────────────────────────────────┤
│ [If external wallet:]                                                 │
│ Send USDC to your Predimark wallet:                                  │
│ 0x9d84...0306  [Copy]                                                │
│ Network: Polygon (USDC.e)                                            │
│                                                                       │
│ ⚠ Send only USDC on Polygon network. Other tokens will be lost.      │
└──────────────────────────────────────────────────────────────────────┘
```

### KYC trigger

KYC richiesto solo per **withdraw** (non per signup, non per deposit, non per trade).

Quando l'utente prova a fare withdraw:
1. Form withdraw → input importo + destination
2. Se KYC non fatto: redirect a `/me/kyc/start`
3. Wizard KYC (3 step: ID upload, selfie, address proof)
4. Submit → in queue admin review (sezione KYC review)
5. Approvato → withdraw processato
6. Rifiutato → notification con reason

---

## STATI DELLE PAGINE

### Default (utente nuovo, signup completato)
DEMO mode attivo, banner welcome, modal onboarding soft.

### Loading durante signup
- Spinner durante OAuth callback
- "Creating your wallet..." durante Privy embedded wallet creation
- Skeleton placeholder per home iniziale

### Errori comuni

#### Errore email OTP scaduto
```
Code expired. [Request new code]
```

#### Errore OAuth fallito
```
Authentication failed. Please try again.
[Back to signup]
```

#### Errore wallet connection
```
Wallet connection rejected. Please try again or use email signup.
[Try again] [Use email instead]
```

#### Errore geo-block (paese sanzionato)
```
Service not available in your region.
[Contact support]
```

#### Errore network during signup
```
Network error. Please check your connection and try again.
[Retry]
```

---

## COMPORTAMENTI INTERATTIVI

### Auto-advance OTP input

Quando l'utente digita una cifra nell'input OTP, il focus passa automaticamente al successivo input. Quando tutti e 6 sono pieni, auto-submit.

### Onboarding modal close

Click su `[×]` o ESC → conferma:
```
Skip onboarding?
You can replay it later from your profile.
[Cancel] [Skip]
```

### Demo to Real switch

Switch in header → se saldo $0, dialog deposit. Altrimenti switch immediato.

### Signup multi-tab

Se l'utente apre signup in 2 tab e completa in una, l'altra mostra:
```
You're already signed in.
[Go to home]
```

### Mobile keyboard handling

Su mobile, quando l'utente è in OTP input, la tastiera numerica appare automaticamente (input type="numeric pattern").

---

## ANALYTICS DA TRACCIARE (signup funnel)

Per ottimizzare la conversion, tracciamo:

1. **Visit /signup**: count
2. **Click su un metodo signup**: count + method
3. **Email entered**: count
4. **OTP submitted correctly**: count
5. **OAuth completed**: count
6. **Wallet created (background)**: count + duration
7. **Redirect to /home**: count
8. **Onboarding modal shown**: count
9. **Onboarding completed**: count
10. **Onboarding skipped**: count + at which step
11. **First demo trade**: count + time from signup
12. **First real deposit**: count + time from signup
13. **First real trade**: count + time from signup

Funnel target (D30):
- Signup → first demo trade: 60%
- Signup → first real deposit: 15%
- Signup → first real trade: 12%

---

## ACCESSIBILITÀ

- Form signup completamente navigabile da tastiera
- OTP input con `aria-label` per ogni cifra
- Errori con `role="alert"` per screen reader
- Loading states con `aria-busy="true"`
- Onboarding modal con focus trap (no escape)
- Skip button sempre raggiungibile (no hidden)
- Touch target minimo 44x44px
- Color contrast AAA per testi importanti
- Lingua dichiarata in `<html lang>` per screen reader

---

## MULTILINGUA

### Lingue supportate al lancio

EN (English) · ES (Español) · PT (Português) · IT (Italiano) · FR (Français)

### Detection automatica

Al primo atterraggio:
1. Check browser language (`Accept-Language` header)
2. Match con lingue supportate
3. Default a EN se nessun match

### Switch manuale

Footer di `/signup` ha switch lingua (dropdown):
```
🌐 English ▼
   English
   Español
   Português
   Italiano
   Français
```

Cambio lingua → reload pagina con cookie persistente.

---

## NOTE TECNICHE PER COWORK

### Componenti da costruire

- **SignupLayout**: layout minimal con header logo + footer
- **SignupMethodButton**: bottone metodo auth (Email/Google/Apple/X/Wallet)
- **OTPInput**: 6 input separati con auto-advance
- **GeoBlockBanner**: banner soft per paese demo-only
- **WelcomeBanner**: banner welcome per nuovo utente in home
- **OnboardingModal**: modal multi-step skippabile
- **InterestChips**: multi-select chips Netflix-style
- **GuidedTradeWidget**: widget per primo trade demo guidato
- **DepositFlow**: flow per MoonPay onramp
- **KYCWizard**: wizard 3-step per KYC

### Integrazione Privy

Privy gestisce:
- Email OTP signup
- OAuth (Google, Apple, X)
- External wallet connection
- Embedded wallet creation (background)
- Session management
- JWT generation

Configurazione Privy:
- Project ID: definito in `/admin/settings/integrations`
- Login methods: email, google, apple, twitter, wallet
- Embedded wallet: auto-create on signup
- Network: Polygon

### Geo-blocking

- **Cloudflare Workers** per geo-detection IP-based
- **MaxMind** per database IP→country
- **Lista paesi** gestita in `/admin/compliance/geo-block`
- **Override admin** per casi specifici (es. business travelers)

### MoonPay integration

- Widget embedded MoonPay nel deposit flow
- Pre-fill USDC + Polygon network
- Min/max amounts configurabili in `/admin/settings/integrations`
- Webhook per conferma deposito

### Performance

- **Server-side rendering** per /signup (SEO + first paint)
- **Client-side routing** dopo signup (smooth navigation)
- **Lazy load** OAuth SDKs (caricati solo quando metodo selezionato)
- **Optimistic UI**: UI aggiornata prima del backend response per fluidità

### Security

- **Rate limiting** su OTP (5 attempts/15min per email)
- **CAPTCHA invisibile** (Cloudflare Turnstile) per bot prevention
- **HTTPS obbligatorio** su tutti gli endpoint signup
- **No password storage** (Privy gestisce auth)
- **JWT short-lived** (1 ora) + refresh token (30 giorni)

### Privacy / GDPR

- **Cookie consent banner** al primo atterraggio (categorie: essential, analytics, marketing)
- **Privacy policy link** in footer + signup
- **Right to deletion**: bottone in `/me/settings/data`
- **Data export**: bottone in `/me/settings/data`
- **No tracking** prima del consenso esplicito

---

## RIFERIMENTI

- **Documento 1** — Vision & Product (target user, value prop)
- **Documento 2** — User Stories (US-001..US-004 specifici per signup)
- **Documento 3** — Sitemap (`/signup/*`, `/me/deposit`, `/me/kyc`)
- **Documento 4** — Pagine 1-6 (Home, Pagina evento, Profilo /me, Profilo creator, Leaderboard, Admin)
- **Documento 5** — Tech stack (Privy, MoonPay, Cloudflare)

---

## DOCUMENTO 4 — WIREFRAMES — COMPLETATO

Questa è l'ultima pagina del Documento 4 — Wireframes.

### Riepilogo finale

| # | Pagina | Status |
|---|---|---|
| 1 | Home v2 | ✅ |
| 2 | Pagina evento v3 | ✅ |
| 3 | Profilo /me v1 | ✅ |
| 4 | Profilo creator v1 | ✅ |
| 5 | Leaderboard v1 | ✅ |
| 6 | Admin overview v1 | ✅ |
| 7 | Signup + onboarding v1 | ✅ adesso |

**Documento 4 — Wireframes — COMPLETO**

### Documenti successivi (5-10)

- **Documento 5** — Tech stack & Architettura
- **Documento 6** — Database schema
- **Documento 7** — API design
- **Documento 8** — Design System
- **Documento 9** — Roadmap V1 → V2
- **Documento 10** — Memo finale per Cowork

---

*Fine Documento 4 — Wireframes — Pagina 7 (Signup + onboarding)*
*Documento 4 completato al 100%*
