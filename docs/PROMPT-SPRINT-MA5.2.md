# PROMPT — Sprint MA5.2 — Admin Panel Foundation

> **Quando eseguire**: post-MA5.1 (leaderboard + creators chiusi). Prima di MA6 (necessario per Creator approval workflow + fee config)
> **Priorità**: CRITICA — blocker launch pubblico (no admin = no compliance, no fee config, no creator approval)
> **Effort**: ~3-4 giorni (24-32h totali)

---

## Obiettivo

Implementare la foundation del pannello admin (Doc 04-6 wireframe descrive 36 sub-pages, MA5.2 chiude le 12 più critiche per MVP).

**MUST-HAVE per launch**:

1. `/admin` Dashboard KPI overview (DAU, Volume, Revenue, Active users, Signups, KYC pending, Refunds)
2. `/admin/users` lista utenti + ban/suspend
3. `/admin/users/[id]` profilo utente admin con tabs
4. `/admin/markets` lista markets + featured/hidden curate
5. `/admin/markets/featured` drag-drop curation
6. `/admin/fees` runtime fee config (builder fee Y1/Y2 + Creator share + per-Creator override)
7. `/admin/creators` lista verified creators
8. `/admin/creators/applications` queue review applications
9. `/admin/creators/[id]` dettaglio + approve/reject
10. `/admin/audit-log` log azioni admin
11. `/admin/compliance/geo-block` lista paesi bloccati + edit
12. `/admin/settings/team` gestione admin team (super-admin only)

**Out of scope MA5.2** (rinviati a MA8):

- `/admin/refunds`, `/admin/kyc`, `/admin/signals`, `/admin/notifications/*`, `/admin/analytics/*` advanced, `/admin/feature-flags`, `/admin/ab-tests`, `/admin/payouts`

---

## Auth + Permissions

- DB table `admin_users` esiste con roles: `super_admin`, `admin`, `moderator`, `viewer`
- Middleware `requireAdmin(role: AdminRole[])` server-side — verifica `admin_users.role` via JWT
- MFA obbligatorio per super_admin (TOTP via Privy o standalone)
- Audit log append-only per ogni azione admin (chi, quando, target, before, after, reason)

---

## Fasi sprint

### Fase A — Layout master + auth (~4h)

#### A1 — Layout admin master (~2h)

- [ ] `app/admin/layout.tsx`:
  - Sidebar fissa sinistra (240px) con sezioni collapsible
  - Top bar admin (background distintivo dark bordeaux)
  - Sidebar items: Dashboard, Users, Markets, Fees, Creators, Compliance, Audit Log, Settings
  - Badge counter su sezioni con queue (Creators pending, ecc.)
  - Active state evidenziato
  - Mobile: hamburger collapsible
- [ ] `components/admin/AdminSidebar.tsx`
- [ ] `components/admin/AdminTopBar.tsx`
- [ ] `components/admin/AdminLayout.tsx`

#### A2 — Auth middleware + admin_users sync (~1h)

- [ ] `lib/admin/auth.ts`:
  - Function `requireAdmin(role: AdminRole[])` — verifica JWT + admin_users.role
  - Function `getCurrentAdmin()` — ritorna admin user con role
  - Throw 403 se non admin
- [ ] `middleware.ts` (estendi MA4.7 Fase 1):
  - Aggiungere check `/admin/*` routes → require admin role
  - Redirect a 404 se non admin (no leak che esiste un admin panel)

#### A3 — Audit log middleware (~1h)

- [ ] `lib/admin/audit.ts`:
  - Function `logAdminAction(actor, action, target, before, after, reason)` → INSERT in `audit_log` table partitioned
  - Wrapper per tutte le mutation admin: ogni POST/PUT/DELETE admin chiama questa
- [ ] Test: tutti i log loggati con campi corretti

### Fase B — Dashboard + KPI (~3h)

- [ ] `app/admin/page.tsx`:
  - 8 KPI cards (DAU, Volume, Revenue, Active, Signups, Trades, KYC pending, Refunds)
  - Period selector 24h / 7d / 30d / All-time
  - Alerts bar (revenue spike, latency anomaly, queue stuck)
  - Charts: Volume over time + Revenue breakdown (pie)
  - Recent activity (ultimi 10 azioni admin)
- [ ] `app/api/v1/admin/analytics/route.ts`:
  - Aggrega DAU, volume, revenue da DB
  - Cache 5 min
- [ ] `components/admin/KPICard.tsx`, `AlertsBar.tsx`, `RecentActivity.tsx`

### Fase C — Users management (~4h)

#### C1 — Lista utenti `/admin/users` (~1.5h)

- [ ] `app/admin/users/page.tsx`:
  - Pattern 1 (tabella search + filter + bulk action)
  - Filtri: Active / Banned / Suspended / KYC pending / Verified Creator / External wallet
  - Search: nome, email, address, ID
  - Sort: signup date / volume / last activity
  - Colonne: ID, avatar, name, email, volume, status, last activity, actions [⋯]
  - Bulk: Export CSV / Send notification / Bulk ban (super-admin only)
- [ ] `app/api/v1/admin/users/route.ts` (GET con filters/sort/pagination)

#### C2 — Profilo utente admin `/admin/users/[id]` (~1.5h)

- [ ] `app/admin/users/[id]/page.tsx`:
  - Hero: avatar, name, ID, status, joined date
  - Tabs: Overview / Trades / KYC / Notifications / Audit
  - Bottoni azione: Edit (super-admin), Suspend (con reason+duration), Ban (con reason note obbligatoria), Send notification, Refund, Reset password
- [ ] `app/api/v1/admin/users/[id]/route.ts` (GET, PUT, DELETE)
- [ ] `app/api/v1/admin/users/[id]/ban/route.ts` (POST con reason)
- [ ] `app/api/v1/admin/users/[id]/suspend/route.ts` (POST con duration)

#### C3 — Conferma azioni distruttive (~1h)

- [ ] `components/admin/ConfirmDialog.tsx`:
  - Mostrato prima di Ban / Refund / Fee change
  - Reason textarea obbligatoria per audit log
  - Conferma esplicita

### Fase D — Markets curation (~3h)

#### D1 — Lista markets `/admin/markets` (~1h)

- [ ] `app/admin/markets/page.tsx`:
  - Pattern 1: tabella markets con colonne ID, title, category, volume, status, liquidity, end date
  - Actions per row: View on Polymarket / Hide / Feature / Override resolution / Add reward

#### D2 — Featured curation `/admin/markets/featured` (~2h)

- [ ] `app/admin/markets/featured/page.tsx`:
  - Drag-and-drop interface (use `@dnd-kit/sortable` or similar)
  - 4 sezioni: Hero carousel (top 3-5), Hot Now (top 5-10), Top Picks, Per categoria
  - Click "Save" → applica live a tutti gli utenti (cache invalidation via webhook)
- [ ] `app/api/v1/admin/markets/featured/route.ts` (GET/PUT featured ordering)

### Fase E — Fees runtime config (~3h)

#### E1 — `/admin/fees` form configurazione (~2h)

- [ ] `app/admin/fees/page.tsx`:
  - Pattern 3 (form configurazione)
  - Section "Builder Fee Configuration":
    - Builder fee normal trades (Y1/Y2 toggle + valore in bps)
    - Builder fee copy trades (default 100 bps, range 0-200)
  - Section "Creator Revenue Share":
    - Default Creator share (default 30%, range 0-50%)
    - "Manage individual Creator overrides →" link a `/admin/creators` con filter "with override"
  - Section "External Traders Revenue Share":
    - Read-only "0% (sempre 100% Auktora)"
  - Section "Other config":
    - Min payout threshold ($1)
    - Period payout (monthly / weekly)
  - Audit info: "Last modified: 2026-04-29 14:25 by Feliciano (super-admin)"
  - Reason textarea (obbligatorio per save)
  - Save → confirm dialog → update `app_settings` + log
- [ ] `app/api/v1/admin/fees/route.ts` (GET, PUT)
- [ ] `app/api/v1/admin/fees/history/route.ts` (GET storico cambi)

#### E2 — `/admin/fees/history` (~1h)

- [ ] `app/admin/fees/history/page.tsx`:
  - Lista cronologica cambi fee
  - Colonne: when, who, before, after, reason, [Vedi diff]

### Fase F — Creators approval (~3h)

#### F1 — `/admin/creators` lista (~30min)

- [ ] `app/admin/creators/page.tsx`:
  - Tabella: username, score, tier, followers, copiers, total_earnings, status
  - Filtri: pending / verified / suspended

#### F2 — `/admin/creators/applications` queue (~1.5h)

- [ ] `app/admin/creators/applications/page.tsx`:
  - Pattern 4 (queue review)
  - Card per ogni application pending con:
    - User profile (avatar, name, email)
    - Polymarket stats (verified via Data API): pnl_total, win_rate, trades_count
    - Application data: bio, twitter, discord, specialization
    - 3 bottoni: Reject (con reason obbligatoria), Request more info, Approve
  - Notification automatica via email a Creator dopo decisione
- [ ] `app/api/v1/admin/creators/applications/route.ts` (GET pending)
- [ ] `app/api/v1/admin/creators/[id]/approve/route.ts` (POST)
- [ ] `app/api/v1/admin/creators/[id]/reject/route.ts` (POST con reason)

#### F3 — `/admin/creators/[id]` detail (~1h)

- [ ] `app/admin/creators/[id]/page.tsx`:
  - Pattern 2 detail con tabs: Overview / Profile / Followers / Earnings / Audit
  - Bottoni: Edit, Suspend (reason), Remove from program, Send notification
  - Edit campo `fee_share_override_bps` (super-admin only)

### Fase G — Audit log + Compliance + Team (~3h)

#### G1 — `/admin/audit-log` (~1.5h)

- [ ] `app/admin/audit-log/page.tsx`:
  - Pattern 1 con search + filter
  - Filtri: actor, action type, target, date range
  - Colonne: timestamp, actor, action, target, before, after, reason, [Expand]
  - Click "Expand" mostra full diff JSON

#### G2 — `/admin/compliance/geo-block` (~1h)

- [ ] `app/admin/compliance/geo-block/page.tsx`:
  - Lista paesi bloccati (default: 31 + 4 close-only + 4 region)
  - Status (blocked/restricted/allowed)
  - Restriction type (full block / KYC required / paper trading only)
  - Effective date
  - Bottoni "Add country" / "Edit" / "Remove block" (super-admin only)
- [ ] `app/api/v1/admin/compliance/geo-block/route.ts` (GET, PUT)

#### G3 — `/admin/settings/team` (~30min, super-admin only)

- [ ] `app/admin/settings/team/page.tsx`:
  - Lista admin team con role, last_login
  - Bottone "Invite team member" (email + role pre-selezionato)
  - Edit role per riga (super-admin only)
- [ ] `app/api/v1/admin/team/route.ts` (GET, POST invite)

### Fase H — Smoke test + audit (~2h)

- [ ] Test E2E:
  - Login come super_admin → vede sidebar completa
  - Login come moderator → vede solo /admin/users + audit-log (no fees, no settings)
  - Login come user normale → 404 su /admin/\*
  - Cambio fee → log in audit_log + applicato live
  - Approve creator pending → status='verified' + email notification
  - Edit geo-block → applicato in middleware MA4.7 Fase 1
  - Drag featured market → applicato a tutti utenti
- [ ] Test 3 breakpoint (mobile esperienza ridotta ma funzionale)
- [ ] `npm run validate` verde
- [ ] Update HANDOFF-LOG con MA5.2 chiuso
- [ ] Commit unico

---

## File da creare

**Routes** (~25):

- `app/admin/layout.tsx` + `app/admin/page.tsx`
- `app/admin/users/page.tsx` + `[id]/page.tsx`
- `app/admin/markets/page.tsx` + `featured/page.tsx`
- `app/admin/fees/page.tsx` + `history/page.tsx`
- `app/admin/creators/page.tsx` + `applications/page.tsx` + `[id]/page.tsx`
- `app/admin/audit-log/page.tsx`
- `app/admin/compliance/geo-block/page.tsx`
- `app/admin/settings/team/page.tsx`
- `app/api/v1/admin/*` (~15 endpoints)

**Components** (~12):

- `AdminSidebar`, `AdminTopBar`, `AdminLayout`, `KPICard`, `AlertsBar`, `RecentActivity`, `AdminTable`, `AdminFormConfirm`, `QueueReviewCard`, `AuditLogEntry`, `FeatureMarketsDnD`, `GeoBlockEditor`

---

## Acceptance globale MA5.2

- [ ] Tutti i 12 routes admin core implementati
- [ ] Auth middleware funzionante (super_admin / admin / moderator differenziati)
- [ ] Audit log popolato per ogni azione mutation
- [ ] Fee config runtime applicato live (test con copy trade post-cambio)
- [ ] Creator approval workflow E2E funzionante
- [ ] Geo-block edit applicato al middleware MA4.7
- [ ] HANDOFF-LOG aggiornato

---

## Dipendenze critiche

- **MA4.7 Fase 1 (geoblock middleware)** deve essere chiuso (admin geo-block edit alimenta middleware)
- **MA5.1 (creators)** deve essere chiuso (admin Creator approval gestisce applications create da `/creator/apply`)
- **DB `admin_users`** deve essere popolato con almeno 1 super_admin (Feliciano) — manual SQL pre-sprint
