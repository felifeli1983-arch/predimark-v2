# Doc 11 — Community & Bot Strategy

> **Scope**: strategia growth Auktora via bot Telegram (primario) + Discord (secondario) + community marketing.
> **Decisione utente**: 2026-04-28 — drop Italia, target UAE + crypto-friendly markets EN-first.
> **Status**: pianificato MA7 (Telegram) → MA8 (Discord). Esecuzione post-MA4.4 + MA5/MA6.

---

## 1. Mercati target rivisti

Drop Italia. Focus paesi senza geo-block Polymarket + alta crypto adoption + reddito disponibile.

| Tier                     | Paesi                              | Lingua app    | Razionale                                                                  |
| ------------------------ | ---------------------------------- | ------------- | -------------------------------------------------------------------------- |
| **1 (priorità massima)** | UAE 🇦🇪                             | EN, AR fase 2 | Dubai crypto hub, zero attrito regolatorio, alto reddito, English-friendly |
| **2**                    | Singapore 🇸🇬, Hong Kong 🇭🇰         | EN            | Crypto natives top-3 mondo, financial hubs, alto reddito                   |
| **3**                    | Brasile 🇧🇷, Argentina 🇦🇷           | PT, ES        | Volume retail enorme, iperinflazione → crypto-native                       |
| **4**                    | Turchia 🇹🇷                         | TR            | Top-10 crypto adoption per fuga inflazione                                 |
| **5**                    | Polonia 🇵🇱, Romania 🇷🇴             | PL, RO        | Crescita crypto, EU senza eccesso regolazione                              |
| **— Out**                | USA, UK, Italia, Francia, Germania | —             | Bloccati o regolati troppo                                                 |

**Lingua app MVP**: inglese. Localizzazioni successive guidate da volume per paese.

---

## 2. Strategia bot — perché Telegram prima di Discord

### Razionale

Discord domina USA / UE crypto, ma in **UAE / Asia / LATAM / Turchia Telegram batte Discord 5-a-1** tra crypto traders. Dato che il target è UAE/crypto-friendly EN-first, Telegram è il canale primario.

Discord resta importante per onboarding utenti USA-flavored (community Polymarket internazionali), ma è secondario.

### Comparazione effort

|                                 | Telegram                                      | Discord                                   |
| ------------------------------- | --------------------------------------------- | ----------------------------------------- |
| Bot SDK                         | aiogram (Python) / Telegraf (Node) — semplice | discord.js / discord.py — più boilerplate |
| Hosting                         | VPS / serverless (Railway, Fly.io)            | idem                                      |
| Effort MVP                      | 3-4 settimane                                 | 4-6 settimane                             |
| Audience match (UAE/Asia/LATAM) | alta                                          | media                                     |
| Audience match (USA/EU)         | media                                         | alta                                      |

**Ordine implementazione**: Telegram (MA7) → Discord (MA8). Stesso backend, stesse feature, due frontend bot.

---

## 3. Telegram bot — specifica MVP

### Bot username

`@AuktoraBot` (privato, comandi diretti)
`@AuktoraSignals` — channel broadcast (signal del giorno)
`@AuktoraNews` — channel news taggate ai mercati

### Comandi minimi MVP (Telegram)

| Comando                  | Funzione                                                       | Auth richiesta |
| ------------------------ | -------------------------------------------------------------- | -------------- |
| `/start`                 | onboarding + link wallet via deeplink web app                  | nessuna        |
| `/connect`               | linka account Auktora (Privy JWT)                              | sì             |
| `/market <slug>`         | chart + book + holders + outcome attuali                       | no             |
| `/whale`                 | top 5 whale moves ultime 24h                                   | no             |
| `/news`                  | feed news taggate, top mercati impattati                       | no             |
| `/signal`                | signal AI del giorno (quota free 1/giorno, premium illimitati) | sì se premium  |
| `/portfolio`             | stato position aperte, P&L, balance                            | sì             |
| `/buy <amount> <market>` | apre deeplink Auktora → signing Privy → submit order           | sì             |
| `/sell <position_id>`    | apre deeplink Auktora → sell flow                              | sì             |
| `/copy <creator>`        | abilita copy trading da uno specifico creator                  | sì + premium   |
| `/leaderboard`           | top creator per ROI / volume settimana                         | no             |
| `/settings`              | preferenze notifiche                                           | sì             |

### Push notifications (alert automatici)

| Trigger                                              | Audience                | Frequenza limit        |
| ---------------------------------------------------- | ----------------------- | ---------------------- |
| Whale alert (>$10K position su mercato in watchlist) | watchlist owner         | unlimited              |
| Signal AI generato                                   | premium subscriber      | 5-10/giorno            |
| News taggata su position aperta                      | position owner          | unlimited              |
| Mercato risolto su position aperta                   | position owner          | unlimited (settlement) |
| Creator seguito apre/chiude position                 | follower                | unlimited              |
| Daily digest (top movers, watchlist update)          | tutti gli utenti opt-in | 1/giorno (08:00 UAE)   |

### Architettura tecnica

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│ Telegram users  │ ⇄  │  @AuktoraBot     │ ⇄  │  Backend Auktora    │
│ (UAE / Asia /   │     │  (aiogram bot)   │     │  - Supabase DB      │
│  LATAM / Tur)   │     │  Hosting:        │     │  - Polymarket CLOB  │
└─────────────────┘     │  Railway/Fly.io  │     │  - Signal AI engine │
                        └──────────────────┘     └────────────────────┘
```

- Bot stateless: ogni comando query Supabase (stesso DB della web app)
- Auth utente: Telegram user_id ↔ Auktora user via tabella `telegram_links`
- Trading flow: bot manda **deeplink** alla web app (`/buy?market=X&amount=Y`) → utente firma su web → torna al bot conferma
- Push: workers cron ogni 30s monitorano DB position/markets → emit Telegram message via Bot API

### Migration DB necessaria (al lancio MA7)

```sql
CREATE TABLE telegram_links (
  user_id uuid REFERENCES users(id) PRIMARY KEY,
  telegram_user_id bigint UNIQUE NOT NULL,
  username text,
  premium_until timestamptz,
  notification_settings jsonb DEFAULT '{}',
  linked_at timestamptz DEFAULT now()
);

CREATE TABLE telegram_alerts_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id bigint NOT NULL,
  alert_type text NOT NULL,
  payload jsonb,
  sent_at timestamptz DEFAULT now()
);
```

### Effort

| Phase                                 | Settimane          | Output                               |
| ------------------------------------- | ------------------ | ------------------------------------ |
| MVP commands (8 comandi base)         | 2                  | bot risponde a query, niente trading |
| Trading deeplink integration          | 1                  | `/buy` e `/sell` funzionanti         |
| Push notifications + cron workers     | 1                  | alert whale + signal + position      |
| Channel broadcast (`@AuktoraSignals`) | 0.5                | broadcast giornaliero                |
| **Totale**                            | **~4-5 settimane** | bot completo                         |

---

## 4. Discord bot — replica Telegram, post-MA8

Stesso backend, frontend Discord (discord.js). Comandi identici eccetto:

- Discord non supporta deeplink web → trading via embed con button "Trade su Auktora.com" (apre browser)
- Discord ha **slash commands** type-safe, UX leggermente migliore di Telegram per power users
- Discord ha **voice channels** → TTS announcements possibili (come Betmoar)

### Strategia distribuzione Discord

Replica Betmoar:

1. Costruisci bot
2. Submit a [polymark.et](https://polymark.et) directory (free placement nel ecosystem Polymarket)
3. Outreach 50-100 server Discord crypto/prediction markets per partnership
4. Bot ufficiale "Auktora" badge da Polymarket (se raggiungiamo Verified+ tier)

**Effort**: 4-6 settimane post-Telegram (riutilizza 70% del backend).

---

## 5. Community marketing — primi 90 giorni post-MA4.4

### Principi

- **Organic > paid**: paid acquisition in crypto è 80% bot, 20% retail. Bruci cash, retention zero.
- **Founder-led**: tu sei la voce di Auktora. Non agency, non ghostwriter. Crypto sniffa fake da 1km.
- **Value first**: ogni post deve dare insight, non chiedere niente. CTA solo dopo aver costruito autorità.
- **Track record verificabile**: post pubblici di trade reali (P&L on-chain), niente dichiarazioni "fidatevi".

### Playbook 90 giorni

| Settimane | Azione                                                                                      | Costo                        | Output target                               |
| --------- | ------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------- |
| **1-2**   | Daily 5-10 trade pubblici via Auktora founder account, screenshot + analisi su X/Twitter    | $500-2K (capitale operativo) | track record verificabile, 100-300 follower |
| **3-4**   | Daily threads X/Twitter su mercati Polymarket interessanti — UAE/world events angle         | $0                           | 500-1000 follower                           |
| **5-8**   | Outreach 20 micro-influencer crypto (3K-30K follower) — early access + 20% revenue share Y1 | $500-2K (commission setup)   | 5-10 partnership stipulate                  |
| **9-12**  | Lancio `@AuktoraSignals` Telegram channel: 3-5 signal/giorno gratis (1 premium)             | $0                           | 500-2000 subscriber                         |
| **9-12**  | Submit listing su polymark.et + builders directory Polymarket                               | $0                           | placement gratuito ecosystem                |

**Budget totale 90gg**: $1.5K-4K + tempo founder dedicato (almeno 4h/giorno).

### Do / Don't

✅ Da fare:

- Post P&L pubblico (anche perdite) — autenticità
- Risposte tecniche su Polymarket / prediction markets in thread X — autorità
- Partnership influencer micro con commission ($100-500/mese + 20% revenue da loro followers)
- Sponsor analytics gratuiti tipo "Top 10 movers this week" — value-first
- Early access via Telegram channel a 100-500 power users selezionati

❌ Da NON fare:

- Spam DM "Try Auktora!" — bannato istantaneo
- Bot mass-DM — fingerprint anti-spam brucia account
- "Refer 10 friends, earn $50" — attrae fake/farm, retention zero
- Paid post influencer top-tier ($5K-50K) senza track record proprio — ROI negativo
- Comprare follower / engagement — algoritmi rilevano, demolisce reach organico

---

## 6. Modello revenue rivisto

Confermato — drop Italia + builder fee 0 bps Y1 + premium subscription:

```
Y1 (post-MA4.4 → fine 2026):
- Builder fee: 0 bps (matchare competitor zero-fee Betmoar/Polym.trade)
- Polymarket weekly USDC rewards: variabile su volume
- Signal Premium: €9.99/mese (free tier 1/signal/giorno, premium illimitati)
- Copy Trading: 10% success fee su trade vincenti

Y2 (2027):
- Builder fee: 30 bps (post moat costruito)
- Premium subscription: €19.99/mese tier "Pro" + €49.99/mese "Whale"
- Copy trading creator revenue split: 70% creator / 20% platform / 10% Polymarket builder pool

Y3 (2028+):
- $POLY token allocazione (tesi forte: top-10 builder by cumulative volume)
- Acquisition opportunity (Polymarket / Kalshi / FanDuel International)
```

### Numeri target conservativi

| Metrica                 | Y1 (Q4 2026)       | Y2 (Q4 2027)      |
| ----------------------- | ------------------ | ----------------- |
| Utenti registrati       | 5K-15K             | 50K-150K          |
| Utenti attivi mensili   | 1K-3K              | 10K-30K           |
| Volume tradato/mese     | $500K-2M           | $5M-20M           |
| Premium subscriber      | 100-500 (€10/mese) | 2K-10K (€15/mese) |
| Revenue mensile (mid-Y) | $2K-8K             | $50K-200K         |

**Tesi token launch**: anche con $1M/mese di volume Y1, contribuiamo $12M cumulativi al lancio token. Allocazione probabile $50K-300K in $POLY (FDV $1B-5B scenario).

---

## 7. Roadmap aggiornata MA5+

Vecchia roadmap aveva: MA5 Signal → MA6 Copy → MA7 Stats → MA8 Marketing.

**Nuova proposta**:

| Macro Area           | Cosa                                                  | Effort   | Priorità |
| -------------------- | ----------------------------------------------------- | -------- | -------- |
| **MA4.4 (in corso)** | CLOB V2 real trading                                  | 2-3 sett | ALTA     |
| **MA5**              | Signal AI engine + premium subscription               | 3-4 sett | ALTA     |
| **MA6**              | Copy trading (creator profile + auto-replicate trade) | 4-5 sett | ALTA     |
| **MA7**              | Telegram bot + `@AuktoraSignals` channel              | 4-5 sett | ALTA     |
| **MA8**              | Discord bot + ecosystem submission                    | 3-4 sett | MEDIA    |
| **MA9**              | Localizzazioni AR + ES + PT                           | 2-3 sett | MEDIA    |
| **MA10**             | Mobile app (React Native + Expo)                      | 6-8 sett | BASSA Y1 |

**Timeline target**:

- MA4.4 → fine maggio 2026
- MA5+MA6 → fine luglio 2026 (signal + copy = launch ready)
- MA7 → fine agosto 2026 (Telegram bot live)
- MA8 → metà ottobre 2026 (Discord bot)
- MA9-10 → 2027

Public launch UAE/EN: **agosto 2026** con web app + Telegram bot + signal premium + copy trading.

---

## 8. Open questions / decisioni rinviate

1. **KYC requirements UAE**: serve KYC compliance per residenti UAE? Verificare Dubai VARA framework. Probabilmente NO per Polymarket-as-passthrough (Auktora è interfaccia, non custodian) ma da confermare.
2. **Hosting bot**: Railway vs Fly.io vs Hetzner VPS? Decisione operativa, $20-100/mese costo.
3. **AI signal model**: GPT-4o / Claude / fine-tuned local? Trade-off cost / quality / latency.
4. **Pricing tier premium**: €9.99 / $14.99 USD? Convertire al primo lancio (UAE-EN target paga in USD).
5. **Token allocation strategy**: aspettare $POLY launch (TBD) o costruire token Auktora separato? Sconsigliato il secondo (regolazione MiCA, token frenetici 2026).

---

## Riferimenti

- [Polymarket Builder Program](https://docs.polymarket.com/builders/overview)
- [Polymarket Builder Fees](https://docs.polymarket.com/builders/fees)
- [Polymarket Builder Tiers](https://docs.polymarket.com/builders/tiers)
- [Betmoar competitor reference](https://www.betmoar.fun/)
- [Polym.trade competitor reference](https://polym.trade/)
- [Polymark.et ecosystem directory](https://polymark.et/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Discord.js docs](https://discord.js.org/)
