# PROMPT — Fix 3.3.1-A — next/image in EventCardHeader e HeroCard

> **Quando eseguire**: subito — violazione architetturale documentata
> **Priorità**: ALTA — performance degradata e violazione doc 5

---

## Problema

`EventCardHeader.tsx` e `HeroCard.tsx` usano `<img>` raw con `// eslint-disable-next-line @next/next/no-img-element`.

Doc 5 dice esplicitamente:

> "**Foto eventi**: `next/image` con priority above-the-fold"
> "**Lazy load** immagini (`next/image`)"
> "**next/image** con AVIF + WebP fallback"

Usare `<img>` raw significa: nessun lazy loading automatico, nessuna ottimizzazione AVIF/WebP, nessun controllo dimensioni, nessun blurDataURL placeholder. Su mobile con connessione lenta è la differenza tra un'app lenta e una fluida.

---

## Riferimenti da leggere prima

- `docs/05-TECH-STACK-AND-ARCHITETTURA.md` — sezione "Image optimization"
- `components/markets/EventCardHeader.tsx` — riga 58-64 (l'`<img>` raw con eslint-disable)
- `components/home/HeroCard.tsx` — riga 63-77 (l'`<img>` raw con eslint-disable)

---

## Cosa modificare

### `components/markets/EventCardHeader.tsx`

Sostituire `<img>` con `next/image`:

- Importare `Image` da `next/image`
- Dimensioni fisse: `width={40}` `height={40}` (il contenitore è già 40x40px)
- `objectFit="cover"` → `style={{ objectFit: 'cover' }}`
- Rimuovere `// eslint-disable-next-line @next/next/no-img-element`
- `onError` non è disponibile su `next/image` direttamente — usare `unoptimized` per le immagini esterne Polymarket o gestire tramite `onError` solo se necessario

**Nota per le immagini esterne Polymarket**: gli URL delle immagini provengono da `event.image` che sono URL CDN Polymarket. Per usare `next/image` con domini esterni, aggiungere il dominio in `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'polymarket-upload.s3.us-east-2.amazonaws.com' },
    { protocol: 'https', hostname: 'i.imgur.com' },
    { protocol: 'https', hostname: 'res.cloudinary.com' },
  ],
}
```

### `components/home/HeroCard.tsx`

Sostituire `<img>` con `next/image`:

- Importare `Image` da `next/image`
- La hero image è `position: absolute; inset: 0` — usare `fill` prop di next/image al posto di width/height
- `style={{ objectFit: 'cover', opacity: 0.4, mixBlendMode: 'overlay' }}`
- Wrapper ha già `position: relative; overflow: hidden` — `fill` funziona
- Aggiungere `priority` per le hero above-the-fold (size="big")
- Rimuovere eslint-disable

---

## Acceptance criteria

- [ ] Nessun `<img>` raw rimasto in EventCardHeader.tsx o HeroCard.tsx
- [ ] Nessun `eslint-disable @next/next/no-img-element` rimasto
- [ ] `next.config.ts` ha i `remotePatterns` per i domini Polymarket
- [ ] HeroCard con `size="big"` ha `priority` prop
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa (lint no errors)
- [ ] Commit: `git commit -m "fix: next/image in EventCardHeader + HeroCard — performance + architettura (3.3.1-A)" && git push origin main`

---

## Note

- Se durante lo sviluppo emergono altri domini CDN Polymarket non in lista, aggiungerli ai remotePatterns
- Non rimuovere l'handler `onError` / `imgFailed` fallback — è un'UX importante quando l'immagine non esiste
