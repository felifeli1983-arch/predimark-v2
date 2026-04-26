# Predimark V2 — Documentation Index

Questa cartella contiene **tutta la documentazione** di Predimark V2.

## Come usare questa documentazione

**Se sei Cowork (Claude desktop)**:
1. Leggi prima `10-PROJECT-MEMO.md` per overview completa
2. Poi `01-VISION-AND-PRODUCT-v3.md` per capire il prodotto
3. Quindi `09-ROADMAP-AND-SPRINT-PLAN-v2.md` per la roadmap operativa
4. Consulta gli altri Doc quando preparando prompt specifici per Claude in VS Code

**Se sei Claude in VS Code**:
1. Leggi `10-PROJECT-MEMO.md` Parte 3 (Istruzioni per te)
2. Aspetta i prompt di Feliciano
3. Consulta i Doc referenziati nei prompt

**Se sei Feliciano (founder)**:
1. Apri `HANDOFF-LOG.md` per vedere stato corrente progetto
2. Apri Cowork e dagli inputs strategici
3. Copy-paste i prompt di Cowork in VS Code

---

## Indice documenti

| File | Cosa contiene | Audience principale |
|---|---|---|
| `01-VISION-AND-PRODUCT-v3.md` | Vision, target user, modello economico, 5 pilastri | Tutti |
| `02-USER-STORIES.md` (v2) | 51 user stories in 14 flussi, priorità V1/V1.1/V1.2 | Cowork |
| `03-SITEMAP.md` (v2) | ~110 routes del prodotto | Cowork + Claude VS Code |
| `04-WIREFRAMES-pagina1-home-v2.md` | Layout Home (5 CardKind, hero, sidebar) | Cowork + Claude VS Code |
| `04-WIREFRAMES-pagina2-evento-v3.md` | Pagina evento (5 layout dedicati) | Cowork + Claude VS Code |
| `04-WIREFRAMES-pagina3-profilo.md` | Profilo `/me` + sub-pages + demo separation | Cowork + Claude VS Code |
| `04-WIREFRAMES-pagina4-creator.md` | Profilo creator/trader (Verified vs External) | Cowork + Claude VS Code |
| `04-WIREFRAMES-pagina5-leaderboard.md` | Leaderboard ibrida adattiva | Cowork + Claude VS Code |
| `04-WIREFRAMES-pagina6-admin.md` | Admin panel (36 sub-pages) | Cowork + Claude VS Code |
| `04-WIREFRAMES-pagina7-signup.md` | Signup + onboarding flow | Cowork + Claude VS Code |
| `05-TECH-STACK-AND-ARCHITETTURA.md` | Next 16 + Supabase + Privy stack completo | Cowork + Claude VS Code |
| `06-DATABASE-SCHEMA.md` | 25 tabelle SQL + RLS policies | Cowork + Claude VS Code |
| `07-API-DESIGN.md` | ~80 endpoint REST + WebSocket | Cowork + Claude VS Code |
| `08-DESIGN-SYSTEM.md` | Design tokens, componenti, accessibility | Cowork + Claude VS Code |
| `09-ROADMAP-AND-SPRINT-PLAN-v2.md` | 92 sprint operativi in 8 macro aree | Cowork |
| `10-PROJECT-MEMO.md` | Overview, ruoli, glossario, FAQ | Tutti |
| `HANDOFF-LOG.md` | Log dinamico stato sprint | Cowork mantiene |

---

## Versioning

Le decisioni in questi documenti sono **stabili e cross-coerenti**. Non modificare a caso.

Se durante l'esecuzione si scopre che un Doc va aggiornato:
1. Cowork segnala a Feliciano
2. Feliciano approva
3. Cowork aggiorna il Doc + bump version (es. v2 → v3)
4. Cowork segnala il cambio in `HANDOFF-LOG.md` sezione "Decisioni prese in corsa"

---

## Source of truth per ogni topic

Quando i Doc sembrano dare risposte diverse, questi sono i **riferimenti definitivi**:

| Topic | Source of truth |
|---|---|
| Vision e prodotto | Doc 1 v3 |
| User stories e priorità | Doc 2 v2 |
| Routes dell'app | Doc 3 v2 |
| Wireframes UI | Doc 4 (7 pagine) |
| Stack tecnologico | Doc 5 |
| Schema database | Doc 6 |
| API contracts | Doc 7 |
| Design tokens e componenti | Doc 8 |
| Roadmap esecuzione | Doc 9 v2 |
| Workflow operativo | Doc 10 |

---

## Stato progetto

- **Documentazione**: ✅ completata (10 documenti)
- **Codice**: ⏳ da scrivere (0 sprint completati su 92)
- **Lancio target**: ottobre 2026 (con buffer realistico ~14-18 settimane di sviluppo)

**Prossimo step**: Cowork prepara prompt per Sprint 1.1.1 (vedi Doc 9 v2 — Setup credenziali GitHub e Supabase).

---

*Buon lavoro al team. Costruite qualcosa di buono.*
