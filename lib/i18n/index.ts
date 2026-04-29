/**
 * Sprint 8.3.1 — Setup i18n base.
 *
 * MVP: dictionary loader senza next-intl complete (lighter footprint).
 * Espansione 5 lingue (EN/ES/PT/IT/FR) in MA8 polish con next-intl o i18next.
 *
 * Usage:
 *   import { t, getDict } from '@/lib/i18n'
 *   t('home.title') → "Markets" (default en)
 *   getDict('it').home.title → "Mercati"
 */

import enDict from '@/messages/en.json'
import itDict from '@/messages/it.json'

export type Locale = 'en' | 'it' | 'es' | 'pt' | 'fr'
export type Dict = typeof enDict

const DICTS: Record<string, Dict> = {
  en: enDict,
  it: itDict,
  // es, pt, fr → fallback en finché traduzioni MA8 polish
}

export const SUPPORTED_LOCALES: Locale[] = ['en', 'it', 'es', 'pt', 'fr']
export const DEFAULT_LOCALE: Locale = 'en'

export function getDict(locale: string = DEFAULT_LOCALE): Dict {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE]!
}

/**
 * Translate dot-path key. Es: t('home.title', 'it') → 'Mercati'
 * Fallback: ritorna key string se path missing.
 */
export function t(path: string, locale: string = DEFAULT_LOCALE): string {
  const dict = getDict(locale)
  const parts = path.split('.')
  let cur: unknown = dict
  for (const p of parts) {
    if (typeof cur === 'object' && cur !== null && p in cur) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return path
    }
  }
  return typeof cur === 'string' ? cur : path
}
