# PROMPT — Sprint MA4.7 — Polymarket Account Import

> **Quando eseguire**: post-MA4.6 (funding flow chiuso) e PRIMA di MA5
> **Priorità**: ALTA — acquisition multiplier per utenti Polymarket esistenti, prerequisito Creator program MA6
> **Effort**: **2-3h totali** (revisionato 2026-04-29 dopo audit codice — Privy already supports `loginMethods: ['email', 'wallet']`, configurazione esiste già al 70%)

---

## Obiettivo

Permettere agli utenti che hanno **già un account Polymarket** (con il loro wallet MetaMask/WalletConnect/Coinbase) di tradare su Auktora **senza migrare nulla**:

- Stesso wallet → stesse API creds Polymarket (deterministic-derived da signature L1)
- Vedono istantaneamente: pUSD balance + posizioni aperte + storico trade
- Possono copy-tradare e usare signal AI immediatamente

**Marketing positioning**: Auktora come "second screen" per utenti Polymarket esperti — signal AI + copy trading + community senza spostare un satoshi.

Out of scope: import storico Polymarket on-chain in DB Auktora (resta on-chain, query on-demand). Import notifiche/preferenze Polymarket (impossibile, non c'è API).

---

## Riferimenti tecnici

- **Privy External Wallets**: https://docs.privy.io/guide/react/wallets/external/overview
  - Supporta MetaMask, WalletConnect, Coinbase Wallet, Rainbow, Trust, ecc.
  - Login config: `loginMethods: ['email', 'google', 'wallet']`
- **Polymarket CLOB V2 deriveApiKey**: `clobClient.deriveApiKey({ signer })` ritorna le creds esistenti del wallet, oppure 404 se mai create
- Polymarket Data API per posizioni: `GET https://data-api.polymarket.com/positions?user={wallet}`
- EIP-712 signing standard: utente vede messaggio human-readable nel wallet UI

---

## UX wording obbligatorio

> **CRITICAL**: il bottone/CTA per utenti Polymarket esistenti DEVE recitare esplicitamente
> **"Collega il tuo account Polymarket"**
> NON generico "Connect wallet" o "Sign in with wallet".

Posizionamento: differenzia dal flow nuovo utente (email/Google → embedded wallet) e comunica subito che non serve migrazione.

### Modal Privy custom labels

```
🔐 Accedi ad Auktora

[ Continua con email     ]
[ Continua con Google    ]
[ ─────────────────────  ]
[ 🦊 Collega il tuo account Polymarket ]
[    (MetaMask, WalletConnect, Coinbase) ]
```

### Welcome banner one-time

Quando rilevamo creds Polymarket esistenti dopo login external wallet:

```
👋 Bentornato! Abbiamo trovato il tuo account Polymarket.

   💰 $1.247 pUSD disponibili
   📊 5 posizioni aperte ($892 valore)
   📈 47 trade nello storico

   Auktora aggiunge: signal AI, copy trading, community.
   Stesso wallet, stesse posizioni — zero migrazione.

   [Esplora signal AI]  [Vedi copy trading]  [Chiudi]
```

---

## Fasi sprint

### Phase A — Privy config + custom labels (~30 min)

**Goal**: Privy modal mostra opzione "Collega il tuo account Polymarket" come label dedicata.

**Status attuale (verificato 2026-04-29)** — `providers/PrivyProvider.tsx` ha già:

```typescript
loginMethods: ['email', 'wallet'],  // 'wallet' già presente!
defaultChain: polygon,
supportedChains: [polygon],
embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' } }
```

- [ ] `providers/PrivyProvider.tsx`:
  - Aggiungere appearance custom per il bottone wallet:
    ```typescript
    appearance: {
      theme: 'dark',
      accentColor: '#00E5FF',
      walletList: ['metamask', 'walletconnect', 'coinbase_wallet'],
    }
    ```
  - Privy v3 supporta override label modal — verificare API esatta nei docs
  - Se Privy non permette label custom diretta, intercettare il click del bottone wallet con un componente intermedio (DepositCallout style)
- [ ] Eventuale `app/components/PolymarketLoginCallout.tsx` (se Privy non supporta label custom):
  - Bottone esterno al modal Privy: "Collega il tuo account Polymarket (MetaMask, WalletConnect, Coinbase)"
  - Click → apre modal Privy con `login({ loginMethods: ['wallet'] })`
- [ ] Test: login con MetaMask → wallet connesso, embedded NON creato (uses external)

**Acceptance**: utente con MetaMask installato può fare login via wallet. Branding wording include "account Polymarket" (modal Privy o callout esterno).

### Phase B — Auto-detect Polymarket creds esistenti (~1.5h)

**Goal**: dopo login con external wallet, controlliamo se ha già creds Polymarket → carichiamo o creiamo.

- [ ] `lib/polymarket/onboard.ts` — funzione `detectOrCreateApiCreds(signer)`:
  ```typescript
  async function detectOrCreateApiCreds(signer: WalletClient) {
    try {
      const creds = await clobClient.deriveApiKey({ signer })
      // Esistono → utente Polymarket esistente
      return { creds, isExistingPolymarketUser: true }
    } catch (err) {
      if (err.status === 404) {
        // Non esistono → utente nuovo
        const creds = await clobClient.createApiKey({ signer })
        return { creds, isExistingPolymarketUser: false }
      }
      throw err
    }
  }
  ```
- [ ] `app/api/v1/polymarket/onboard/route.ts` (modificare endpoint esistente):
  - Quando `signerType === 'external_wallet'` e creds non sono ancora salvate, chiama `detectOrCreateApiCreds`
  - Salva creds cifrate (riusa `lib/crypto/encrypt.ts`)
  - Ritorna `{ isExistingPolymarketUser: boolean, hasPusdBalance: number, hasOpenPositions: number }`
- [ ] `lib/stores/onboardStore.ts` (nuovo Zustand): traccia `isExistingPolymarketUser` per mostrare welcome banner

**Acceptance**: utente con account Polymarket esistente fa login con MetaMask → backend riconosce creds esistenti, le salva, ritorna flag `isExistingPolymarketUser: true`.

### Phase C — Welcome banner + onboarding skip (~1h)

**Goal**: utente Polymarket esistente vede banner + skippa step "wrap pUSD" (probabilmente ha già pUSD).

- [ ] `components/wallet/PolymarketImportBanner.tsx` (nuovo):
  - Mostrato solo se `isExistingPolymarketUser === true` E non ancora dismissed (localStorage `auktora.polymarket-banner-dismissed`)
  - Fetch live: `getPusdBalance(walletAddress)` + `listUserPositions(walletAddress)` + `countTradeHistory(walletAddress)`
  - Layout: gradient bg, icone, 2 CTA buttons + close
  - Mobile: full-width, stack buttons vertical
- [ ] `components/wallet/OnboardCard.tsx` — modifica:
  - Se `isExistingPolymarketUser && pusdBalance > 0` → skip "wrap USDC.e → pUSD" step
  - Se `isExistingPolymarketUser && pusdBalance === 0` → flow normale wrap (utente Polymarket potrebbe non avere ancora pUSD)
- [ ] Posizionamento: banner in cima alla home + dashboard `/me/positions` (one-time)

**Acceptance**: utente Polymarket esistente vede banner con dati reali (balance + posizioni), può chiuderlo, non riappare al refresh.

### Phase D — Posizioni unified view + testing (~1h)

**Goal**: `/me/positions` mostra correttamente posizioni di wallet esterno (non solo embedded).

- [ ] `lib/api/positions-client.ts` — verificare che `fetchOpenPositions(token, isDemo)` usi `walletAddress` derivato dal Privy user (sia embedded che external)
- [ ] `app/api/v1/positions/route.ts` — verificare che query Polymarket Data API funzioni con qualsiasi wallet address
- [ ] Test manuale:
  - Logout + login con MetaMask (wallet che ha posizioni Polymarket reali)
  - `/me/positions` deve mostrare le posizioni correttamente
  - Click "Vendi" deve funzionare (signature EIP-712 firmata da MetaMask, ordine sell posted)
- [ ] Test edge case:
  - Wallet con 0 posizioni → empty state corretto
  - Wallet con creds malformate (improbabile ma possibile) → fallback a "ricrea creds" con conferma utente

**Acceptance**: utente Polymarket esistente trade su Auktora con il proprio wallet, vede le sue posizioni reali, può vendere senza problemi.

---

## File da creare/modificare

### Nuovi

- `components/wallet/PolymarketImportBanner.tsx`
- `lib/stores/onboardStore.ts` (Zustand per `isExistingPolymarketUser` flag)

### Modificati

- `app/providers/PrivyProvider.tsx` — aggiungere external wallets
- `app/components/PrivyLoginButton.tsx` — custom label "Collega il tuo account Polymarket"
- `lib/polymarket/onboard.ts` o equivalente — funzione `detectOrCreateApiCreds`
- `app/api/v1/polymarket/onboard/route.ts` — gestire detect+create
- `components/wallet/OnboardCard.tsx` — skip wrap step se utente Polymarket esistente con pUSD>0

---

## Constants extra

Niente nuovi env. Privy dashboard già configurato in MA4.6.

---

## Audit post-sprint

- Smoke test manual:
  - Wallet test #1 (Polymarket esistente con pUSD + posizioni): login → banner mostrato → skip wrap → trade reale
  - Wallet test #2 (Polymarket esistente senza pUSD): login → banner mostrato → flow wrap normale
  - Wallet test #3 (wallet vergine, mai usato Polymarket): login → no banner → onboarding standard
  - Wallet test #4 (geo-blocked): login OK ma trade bloccato (403 da middleware)
- Privacy disclaimer: nel modal di firma EIP-712, messaggio chiaro "Stai firmando per autorizzare Auktora a leggere il tuo account Polymarket"
- Geo-block: rispettato anche per utenti import (33 paesi bloccati comunque per compliance)
- Validate verde, build pulito
- Update HANDOFF-LOG con fase chiusa
- Memoria: aggiornare `project_polymarket_account_import.md` con file effettivi creati

---

## Considerazioni post-sprint

### Marketing acquisition (post MA4.7)

- Twitter post: "Hai Polymarket? Accedi a signal AI + copy trading + community in 1 click. Stesso wallet, zero migrazione → auktora.com"
- Telegram outreach a @PolymarketWhales channel + Polymarket Discord
- Influencer prediction market spaces UAE/Asia: demo "import Polymarket → start copy trading"

### Metrica chiave

Aggiungere a dashboard admin: **% utenti totali con `isExistingPolymarketUser === true`**
Target sano: 30-50% nei primi 3 mesi post-MA4.7 launch.
Sotto 20% → marketing/acquisition Polymarket-existing user è sotto-investito.
