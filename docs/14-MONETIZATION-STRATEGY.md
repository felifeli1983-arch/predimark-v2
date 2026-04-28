# Doc 14 — Monetization Strategy

> **Versione**: 1.0 — 2026-04-29
> **Status**: Approvato (decisioni MA4.6 chiuso, prima di MA5/MA6)
> **Owner**: Auktora team

---

## Obiettivo

Definire il modello di monetization completo per Auktora, copertura tutti gli sprint da MA4 a MA8.

Tre pilastri di revenue, in ordine di priorità di rollout:

1. **Builder code Polymarket** — passive revenue su trading volume (attivo da MA4.4)
2. **Copy trading fee** — revenue + acquisition incentive via Creator Program (MA6)
3. **Premium subscription "Auktora Pro"** — Signal AI + analytics (MA5+, attivata SOLO dopo validation)

---

## 1. Builder code Polymarket — baseline revenue

### Strategia 2-fase (allineata HANDOFF 2026-04-28)

**Y1 (acquisition phase, ~prime 12 mesi)**: builder fee = **0 bps** (zero) sui trade normali. Strategia: matchare Betmoar zero-fee per attrarre utenti senza barriera psicologica. La revenue arriva esclusivamente dal copy trading 1% (vedi sezione 2).

**Y2 (post-KYC builder profile, ~mese 12+)**: builder fee = **30 bps** (0.3%) sui trade normali, attivata solo dopo:

- KYC builder profile completato manualmente su `polymarket.com/settings` (1-time setup utente, vedi blockers HANDOFF)
- Validation che il prodotto è preferito da utenti per feature uniche (signal AI + copy trading + community), NON per fee zero

### Tariffe finali

- **Trade normali Y1**: builder fee **0 bps** (zero)
- **Trade normali Y2**: builder fee **30 bps** (0.3%)
- **Trade copy trading**: builder fee **100 bps** (1%) sempre (sia Y1 che Y2)

### Implementazione

Configurato in `lib/polymarket/order-create.ts` quando si firma l'ordine EIP-712. Letto runtime da `app_settings`:

```typescript
buildAndSignOrder({
  // ...
  builderCode: AUKTORA_BUILDER_CODE, // 0xc520...e0db92475
  builderFeeBps: isCopyTrade ? 100 : await getAppSetting('builder_fee_default_bps'), // 100 vs 0/30
})
```

`app_settings.builder_fee_default_bps`:

- Y1: `0`
- Y2: `30` (admin lo cambia post-KYC)

### Revenue stimato

#### Y1 — solo copy trading + nessuna fee su trade normali

| Stadio                  | Volume normali | Volume copy | Revenue (solo copy 1%) |
| ----------------------- | -------------- | ----------- | ---------------------- |
| MVP (100 utenti)        | $50k           | $0          | $0                     |
| Crescita (1.000 utenti) | $500k          | $20k        | $200/mese              |
| Scale (10.000 utenti)   | $5M            | $1M         | $7-10k/mese (split)    |
| Mass (100k utenti)      | $50M           | $10M        | $70-100k/mese (split)  |

#### Y2 — fee 30 bps su trade normali ATTIVA

| Stadio             | Volume normali | Builder fee 0.3% | Volume copy | Revenue copy (split) | Revenue totale Auktora |
| ------------------ | -------------- | ---------------- | ----------- | -------------------- | ---------------------- |
| Mass (100k utenti) | $50M           | $150k/mese       | $10M        | ~$70k/mese           | **$220k/mese**         |

### Caveat

- **Y1 acquisition strategy**: 0 bps è scelta strategica (matching Betmoar) — NON limitazione tecnica. Possibile invertire a 30 bps dal giorno 1 se il traffic non risponde alla "zero fee" come differenziatore
- Polymarket può modificare unilateralmente la builder fee policy → tenere monitorato changelog Polymarket
- Builder code Auktora: `0xc520127a2cf8777bd6f063c252f42aeb04fbaebcace2382b06fbecae0db92475`
- API code Auktora: `019db1bc-...` (vedi env)
- **Builder profile KYC**: prerequisito per Y2 — bloccante che Feliciano deve eseguire manualmente su polymarket.com/settings (vedi blockers HANDOFF)

---

## 2. Copy trading fee — Creator Program (MA6)

### Decisione finale 2026-04-29

- **Builder fee fissa 1%** su tutti i copy trade (NO tier per Creator, semplificazione UX)
- **Split default**: 30% Creator opt-in / 70% Auktora
- **No subscription** per copy trading di base — fee al transaction è il revenue model

### Admin override (configurabile runtime)

I valori 1% builder fee e 30% creator share **NON sono hardcoded** ma configurabili dal pannello admin (`/admin/fees`, vedi Doc 04 wireframe admin riga 596-627):

- **Builder fee copy trades**: range 0-2%, default 1%
- **Creator revenue share**: range 0-50%, default 30%
- **Per-Creator override** (super-admin only): possibilità di settare un % diverso per Creator specifici (es. partnership strategiche, top performer bonus)

Cambio fee = applicato LIVE a tutti i nuovi copy trade. Audit log obbligatorio (chi, quando, before→after, reason note).

**Tabella DB**: `app_settings` (singleton key-value) + `creators.fee_share_override_bps` (NULL = usa default globale).

### External Traders — copy senza opt-in (estensione modello)

Oltre ai Creator opt-in, Auktora supporta **2 tipi di trader sorgente** per il copy trading:

#### Tipo 1 — Verified Creators (opt-in)

- Registrazione esplicita via `/me/profile/become-creator`
- Skin in the game on-chain
- Split fee: **30% Creator / 70% Auktora**
- Acquisition organica via promozione Creator

#### Tipo 2 — External Traders (no opt-in)

- Top wallet Polymarket auto-discoverabili (cron job daily fetch da Polymarket Data API)
- Popolati in tabella `external_traders` (già esistente in production)
- Ranking by ROI / volume / win rate (rank_today, rank_7d, rank_30d, rank_all_time)
- Split fee: **0% trader / 100% Auktora**
- User vede leaderboard "Top Polymarket Traders" affianco a "Verified Creators"

#### Why questa strategia

- **Inventory immediata**: copy trading lanciabile day 1 con top 100 wallet Polymarket, senza aspettare opt-in
- **Revenue maggiore su External**: 100% vs 70% su Creator
- **Migration path**: top External Traders invitabili esplicitamente a diventare Creator (offrendo loro 30% revenue share = ulteriore acquisition Creator funnel)

#### Trasparenza UI

**Modal copy da Creator**:

```
Importo:           $100
Fee copy (1%):     $1.00
  └─ Creator X:    $0.30
  └─ Auktora:      $0.70
```

**Modal copy da External Trader**:

```
Importo:           $100
Fee copy (1%):     $1.00
  └─ Auktora:      $1.00 (External Trader, no revenue share)
```

#### Scaling table revisionata (mix Creator + External)

| Scenario                    | Volume mensile | Fee 1% | Auktora share | Creator share               |
| --------------------------- | -------------- | ------ | ------------- | --------------------------- |
| 100% Creator (5k follower)  | $1M            | $10k   | $7k (70%)     | $3k (30% split tra Creator) |
| 100% External (5k follower) | $1M            | $10k   | $10k (100%)   | $0                          |
| Mix 50/50                   | $1M            | $10k   | $8.5k         | $1.5k                       |

**Schema DB ready**: `external_traders` table esiste con tutti i campi necessari (wallet_address, polymarket_nickname, pnl_total, win_rate, ranking 4 timeframe, is_active, last_synced_at).

### Creator Program — opt-in esplicito

**NON** premium per "top trader" generici.
Il trader si registra esplicitamente come Creator dal proprio profilo.

#### Requisiti opt-in

- Storico minimo: **30 trade reali** dimostrati on-chain (anti-bot/anti-fake)
- Wallet verificato (firma EIP-712 di registrazione)
- Skin in the game obbligatorio: Creator esegue il trade prima/contemporaneamente al copy → verificato on-chain

#### Cosa ottiene il Creator

- **0.3% del volume copiato** (= 30% del builder fee 1%)
- Profilo pubblico con stats (followers, AUM totale, win rate, avg ROI)
- Leaderboard discovery (ranking per volume, ROI, follower count)
- Più follower = più revenue (lineare, no cap)

#### Distribuzione revenue

- Bot mensile: il 1° del mese, distribuisce ai Creator wallet le fee accumulate del mese precedente
- On-chain transfer in pUSD (no custodial holding)
- Audit log pubblico via Polygonscan

### Scaling table

| Follower per Creator | Volume mensile | Fee 1% totale | Creator (0.3%) | Auktora (0.7%) |
| -------------------- | -------------- | ------------- | -------------- | -------------- |
| 50                   | $10k           | $100          | $30            | $70            |
| 500                  | $100k          | $1.000        | $300           | $700           |
| 5.000                | $1M            | $10.000       | $3.000         | $7.000         |
| 20.000               | $4M            | $40.000       | $12.000        | $28.000        |

**Top Creator** con community grossa: $1k-3k/mese — incentivo solido per promuovere Auktora su Twitter/Telegram/Discord (acquisition organica gratis).

**Auktora** a scala 5k-20k follower aggregati: $7k-28k/mese — sostenibile per coprire infra + future feature dev.

### Trasparenza UI obbligatoria

Modal "Conferma copy trade" mostra esplicitamente:

```
Importo:           $100
Fee copy (1%):     $1.00
  └─ Creator X:    $0.30
  └─ Auktora:      $0.70
Eseguito a:        $0.34 (fee inclusa)
Trader X riceve:   $0.30 dal tuo trade
```

Niente fee nascoste. Polymarket community è iper-sensibile a builder fee opache.

### Layer execution copy trading (3 layer)

#### Layer 1 — Sizing proporzionale al bankroll del follower

Mai valore assoluto. Sempre % del proprio capitale.

- Creator $100k bankroll, mette $10k = 10% suo capitale
- Follower con $1.000 → suggerito $100 (10% del suo)
- Follower con $10.000 → suggerito $1.000

#### Layer 2 — Slippage cap obbligatorio

Default: **2%** rispetto al prezzo eseguito dal Creator.

Se ordine non si riempie entro 2% → trade **abort** + notifica push:

> "⚠️ Liquidity insufficiente — il prezzo si è mosso troppo dal trade originale"

Follower può alzare cap manualmente (high-conviction trade) — ma rischio è suo.

#### Layer 3 — Esecuzione: 2 modalità

**Modalità A — Manual confirm (MA6 base)**

- Creator esegue trade → push notification ai follower in <2 sec
- Follower vede modal: "TraderX ha comprato YES a $0.32. Copia con $100 (10% del tuo bankroll)?"
- 1-click conferma → ordine eseguito standard
- ✅ Zero custodial risk
- ❌ Slippage 1-3% inevitable (Creator già ha mosso il mercato)

**Modalità B — Auto-copy (MA6.1 advanced)**

- Follower pre-autorizza session key con limite spending ($X/giorno)
- Bot Auktora aggrega tutti i copy orders → unico batch order **simultaneo** all'ordine Creator (atomic block)
- Pro-rata fill: tutti hanno stesso prezzo del Creator (fair execution)
- ✅ Zero slippage, fair
- ❌ Tecnicamente complesso (relayer + session keys)

**Strategia rollout**: Modalità A in MA6 base, Modalità B in MA6.1 dopo validation con utenti reali.

### Edge case — high-impact trade

Scenario: Creator $100k mette $10k su market con orderbook depth $20k → sweep totale del book → prezzo si muove 5%+.

**Detection automatica**:

- Se ordine Creator > **30%** di orderbook depth → flag "high impact trade"
- Notifica follower: "⚠️ Trade ad alto impatto, slippage atteso 5%+. Vuoi procedere?"
- Suggested size: ridotta a 50% del proporzionale, oppure skip

**Hard rule**:

- Slippage atteso > **10%** → trade auto-abortito anche se cap utente è più alto
- Notifica: "Trade saltato per protezione capitale (slippage > 10%)"

---

## 3. Premium subscription "Auktora Pro" (MA5+)

### Status: NON attivabile finché Signal AI non ha track record

#### Razionale

Non possiamo monetizzare (sub €9.99/mese) signal AI senza:

- **Track record dimostrato**: minimo 3-6 mesi di operatività
- **Win rate**: >55% (statistically significant edge vs 50% random)
- **ROI medio**: >10% annualizzato (al netto delle fee)

Lanciare sub prima = customer churn alto + danno reputazionale + class action risk se signal sotto-performano.

### Strategia rollout MA5

**Fase 1 — Beta gratuita (MA5 launch)**

- Signal AI mostrato in homepage + dashboard
- Badge "🔬 Auktora Pro — Beta Gratuita"
- Logging completo di ogni signal: timestamp, market, predizione, prezzo emissione, prezzo target, esito
- Periodo: **6 mesi minimum**

**Fase 2 — Soft validation (mese 6-9)**

- Pubblicazione public dashboard track record (transparenza totale)
- A/B test: chiedere a beta users feedback sulla willingness-to-pay
- Decisione go/no-go sub a fine mese 9

**Fase 3 — Sub €9.99/mese (mese 9+, IF validation OK)**

- Free tier: signal limitati (3/giorno)
- Pro tier €9.99/mese: signal unlimited, push alert, position size suggestion, integrazione copy trading auto-execute, analytics avanzate

### Pricing benchmark

| Competitor                    | Tier     | Prezzo                     |
| ----------------------------- | -------- | -------------------------- |
| TradingView (signal/screener) | Pro      | $14.95/mese                |
| Bloomberg Terminal            | Standard | $2.000/mese                |
| Polymarket Elite (futuro)     | TBD      | TBD                        |
| eToro (copy trading premium)  | n/a      | gratis (revenue da spread) |

Auktora Pro a €9.99 → posizionamento "consumer prosumer", non istituzionale. Coerente con target geografico (UAE/Asia/LATAM/Turchia).

---

## 4. Revenue model riassuntivo per stadio

### MVP (post-MA4.7, ~100 utenti attivi)

- Builder code 0.01% trade normali: ~$5/mese
- Copy trading: non attivo
- Sub: non attiva
- **Totale**: ~$5/mese (costi infra ≈ $200/mese → in perdita, ok per MVP)

### Crescita (post-MA6, ~1.000 utenti, 200 in copy trading)

- Builder code 0.01%: ~$50/mese
- Copy trading 0.7% Auktora share: ~$200/mese (4 Creator × 50 follower × $200 vol/follower = $40k vol → $280 fee → $196 Auktora)
- Sub: non attiva ancora
- **Totale**: ~$250/mese (costi infra ≈ $500/mese → ancora in perdita)

### Scale (post-MA7+MA8, ~10.000 utenti, 3.000 in copy trading)

- Builder code 0.01%: ~$500/mese
- Copy trading 0.7%: ~$4.200/mese (15 Creator × 200 follower × $200 vol = $600k → $4.2k Auktora share)
- Sub Auktora Pro €9.99/mese × 500 paganti (5%): ~€5.000/mese
- **Totale**: ~$9.700/mese (costi infra ≈ $2k/mese → **profitable**)

### Mass (post-MA8, ~100.000 utenti, 30.000 in copy trading)

- Builder code 0.01%: ~$5.000/mese
- Copy trading 0.7%: ~$42.000/mese
- Sub Auktora Pro: ~€50.000/mese (5.000 paganti)
- **Totale**: ~$97.000/mese

---

## 5. Comparativa competitor

| Platform            | Modello primario | Fee user                 | Trader/Creator earn           |
| ------------------- | ---------------- | ------------------------ | ----------------------------- |
| Polymarket nativo   | spread implicit  | ~0% (CLOB)               | 0% (no copy)                  |
| Auktora             | builder fee      | 0.01% normal / 1% copy   | 0.3% volume copiato           |
| Slingshot           | builder fee      | ~0.5-1%                  | 0%                            |
| Limitless           | builder fee      | ~1-2%                    | 0%                            |
| Bitget Copy Trading | performance fee  | 8-10% del profit         | 8-10% del follower profit     |
| eToro               | spread + fee     | 1-3% spread + management | $200-25.000/mese (basato AUM) |

**Posizionamento Auktora**: fee tra le più basse del mercato. Edge competitivo vs Bitget/eToro = costo molto inferiore + crypto-native UX. Edge vs Slingshot/Limitless = copy trading + signal AI feature uniche.

---

## 6. Geographic targeting & compliance

### Paesi target (priorità acquisition)

1. **UAE** (Dubai/Abu Dhabi) — alta penetrazione crypto, no ban prediction markets
2. **Asia** (Singapore escluso, Hong Kong/Filippine/Vietnam/Tailandia)
3. **LATAM** (Brasile, Messico, Argentina, Colombia)
4. **Turchia** — alta inflazione → utenti cercano hedge crypto

### Paesi bloccati

33 paesi totali (vedi `lib/polymarket/geoblock.ts`):

- USA, UK, Italia, Francia, Belgio, Germania, Spagna, Olanda
- Canada, Australia
- Cina, Singapore, India, Pakistan
- Iran, Russia, Bielorussia, Cuba, Corea del Nord, Siria, Sudan, Myanmar
- Eritrea, Etiopia, Iraq, Libano, Libia, Yemen, Zimbabwe
- Crimea, Donbas, Lugansk, Donetsk (regioni)

### Implicazioni revenue

Geo-block riduce mercato addressabile vs competitor globali, ma:

- Riduce rischi compliance (no MSB license USA, no FCA UK, no CONSOB IT)
- Concentra acquisition su mercati con friction minore
- Apre porta a partnership locali (Telegram channel UAE, influencer LATAM)

---

## 7. Roadmap revenue activation

| Sprint | Revenue stream                                                            | Stato      |
| ------ | ------------------------------------------------------------------------- | ---------- |
| MA4.4  | Builder code 0.01%                                                        | ✅ Attivo  |
| MA4.6  | Funding flow (no fee, ma sblocca acquisition)                             | ✅ Attivo  |
| MA4.7  | Polymarket account import (no fee, acquisition multiplier)                | 📋 Planned |
| MA5    | Signal AI gratis (raccolta dati per future sub)                           | 📋 Planned |
| MA6    | Copy trading 1% builder fee + Creator program 30/70                       | 📋 Planned |
| MA6.1  | Auto-copy con session keys + relayer                                      | 📋 Planned |
| MA7    | Telegram bot (acquisition + retention)                                    | 📋 Planned |
| MA8    | Discord bot + design polish + Auktora Pro sub €9.99 (IF Signal AI valida) | 📋 Planned |

---

## 8. Decisioni open / future

1. **Subscription tier Pro Plus** (€19.99/mese): copy trading auto-execute + signal AI premium + early access ai market nuovi. Da decidere post-MA8.
2. **Token Auktora $AUK**: emissione token utility (riduzione fee per holder, governance Creator program). Da valutare post-mass scale (post-100k users). High regulatory risk, low priority per ora.
3. **Affiliate program** per non-Creator (referral link → 10% delle fee del referred per primi 6 mesi). Considerare se acquisition organica via Creator non basta.
4. **B2B tier** per fund/desk istituzionali (white-label dashboard, API access). Post-MA8.
