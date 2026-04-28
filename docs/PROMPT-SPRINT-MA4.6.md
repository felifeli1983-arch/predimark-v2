# PROMPT — Sprint MA4.6 — Funding & Withdraw

> **Quando eseguire**: subito post-MA4.4 chiuso (lifecycle REAL completo già funziona, ma utenti non hanno modo di depositare)
> **Priorità**: ALTA — sblocca acquisizione utenti (senza depositare non possono tradare REAL)
> **Effort**: 4-6h totali in 3 sub-fasi

---

## Obiettivo

Permettere agli utenti di:

1. **Depositare** USD via carta/Apple Pay/Google Pay/AstroPay → riceve USDC.e su Polygon nel proprio wallet (Privy embedded)
2. **Wrappare** USDC.e → pUSD (già implementato in MA4.4 Phase B, integriamo nel flow)
3. **Prelevare** pUSD → USDC.e on-chain → off-ramp a banca/carta
4. **Vedere portfolio dashboard** con P&L summary, pill cliccabili (parzialmente già fatto)

Out of scope: chart prezzi 1G/1S/1M (MA8 deep polish), limit orders (Phase D).

---

## Riferimenti tecnici

- Privy `useFundWallet()` hook: https://docs.privy.io/guide/react/wallets/usage/embedded/funding
  - Supporta MoonPay, Coinbase Onramp, Stripe out-of-the-box
  - Provider configurabili (cards, Apple Pay, Google Pay, bank transfer)
  - Privy gestisce KYC/compliance del provider — noi solo UI wrapper
- Polymarket usa Fun.xyz come aggregator (alternativa a Privy useFundWallet) — opzionale
- Off-ramp: MoonPay sell-to-bank o Coinbase off-ramp via Privy o link diretto

---

## Fasi sprint

### Phase A — Deposit modal (2-3h)

**Goal**: bottone "Deposit" funzionale che apre modal Polymarket-style con fee preview.

- [ ] `components/funding/DepositModal.tsx`:
  - Tabs "Use Cash" / "Use Crypto"
  - **Cash tab**: opzioni AstroPay, Card, Apple Pay, Google Pay (via Privy useFundWallet)
  - **Crypto tab**: address QR + copy + supported tokens (USDC, USDT, DAI, MATIC)
  - Importo input + quick amounts ($100, $200, $500, $1k)
  - Fee preview breakdown (commissione provider + spread + network)
  - "Continua" → triggera Privy useFundWallet con provider scelto
- [ ] Wire bottone Deposit nell'header (HeaderActions.tsx)
- [ ] Wire pill "Contanti" → opens DepositModal anche
- [ ] Mobile responsive: full-screen sheet stile Polymarket

**Acceptance**: click Deposit nell'header → modal si apre → user può completare deposito test (carta o Apple Pay) → balance aggiorna.

### Phase B — Withdraw modal (1-2h)

**Goal**: utente onboardato può prelevare pUSD → conto bancario.

- [ ] `components/funding/WithdrawModal.tsx`:
  - Mostra balance pUSD attuale
  - Importo input (default = max disponibile)
  - Destination tabs: "Sul tuo conto" / "Su altro wallet crypto"
  - Bank: chiama Privy + MoonPay sell-to-bank
  - Wallet: input address + chain → trasferimento on-chain semplice
  - Fee preview (off-ramp 1-2% + gas trascurabile su Polygon)
  - "Conferma" → flow off-ramp
- [ ] Bottone "Preleva" su `/me/wallet` accanto a balance pUSD
- [ ] Logica unwrap pUSD → USDC.e: chiama `Offramp.unwrap()` (parallelo a wrap già esistente)

**Acceptance**: balance pUSD diminuisce, utente riceve fondi su conto/wallet esterno.

### Phase C — Portfolio dashboard polish (1h)

**Goal**: la pagina `/me/positions` diventa un mini dashboard portfolio Polymarket-style.

- [ ] Aggiungere summary card in cima a `/me/positions` con:
  - Total Portfolio Value (sum of currentValue)
  - P&L last day (placeholder fino a chart MA8)
  - Total Volume (real_volume_total + demo_volume_total)
  - Bottoni grandi "Deposit" + "Preleva" → aprono modal
- [ ] Tab counter: "Posizioni (5) · Storico (12)" come Polymarket
- [ ] Mobile: stack vertical, bottoni full-width

**Acceptance**: pagina sembra una dashboard, no più solo "lista posizioni".

---

## File da creare/modificare

### Nuovi

- `components/funding/DepositModal.tsx`
- `components/funding/WithdrawModal.tsx`
- `lib/polymarket/pusd-unwrap.ts` (parallelo a pusd-wrap)

### Modificati

- `components/layout/header/HeaderActions.tsx` — wire Deposit button
- `components/wallet/OnboardCard.tsx` — aggiungi bottone "Preleva"
- `components/me/PositionsList.tsx` — summary card + bottoni Deposit/Preleva

---

## Constants extra

Niente nuovi env: usiamo Privy useFundWallet che gestisce la config provider in dashboard Privy.

Optional: `NEXT_PUBLIC_FUNDING_PROVIDER` per fallback a Fun.xyz se Privy non basta (ipotetico).

---

## Audit post-sprint

- Smoke test: deposit $100 via Apple Pay test mode → arriva USDC nel wallet (~30 sec) → wrap pUSD → trade REAL
- Withdraw $50 pUSD → off-ramp a carta test → balance Polymarket diminuisce
- Validate verde, build pulito
- Update HANDOFF-LOG con fase chiusa
