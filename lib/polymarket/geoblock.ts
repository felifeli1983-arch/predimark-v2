/**
 * Geo-block helper Polymarket V2.
 *
 * Lista countries blocked / close-only mantenuta sincronizzata con
 * https://docs.polymarket.com/api-reference/geoblock e
 * https://help.polymarket.com/en/articles/13364163-geographic-restrictions
 *
 * Strategia Auktora:
 * 1. Cloudflare/Vercel header `x-vercel-ip-country` (free, sempre presente)
 * 2. Fallback: chiamata a `https://polymarket.com/api/geoblock` se header mancante
 * 3. Per regioni intra-paese (Ontario CA, Crimea UA) Vercel non basta —
 *    in questi casi forziamo il fallback all'endpoint Polymarket
 *
 * Da chiamare server-side PRIMA di accettare un REAL trade.
 */

/** Paesi completamente bloccati (sia open che close). */
export const BLOCKED_COUNTRIES = new Set<string>([
  'AU', // Australia
  'BE', // Belgio
  'BY', // Bielorussia
  'BI', // Burundi
  'CF', // Repubblica Centrafricana
  'CD', // Congo Dem.
  'CU', // Cuba
  'DE', // Germania
  'ET', // Etiopia
  'FR', // Francia
  'GB', // UK
  'IR', // Iran
  'IQ', // Iraq
  'IT', // Italia
  'JP', // Giappone (frontend-restricted, ma trattiamo come blocked)
  'KP', // Corea del Nord
  'LB', // Libano
  'LY', // Libia
  'MM', // Myanmar
  'NI', // Nicaragua
  'NL', // Olanda
  'RU', // Russia
  'SO', // Somalia
  'SS', // Sud Sudan
  'SD', // Sudan
  'SY', // Siria
  'UM', // US Minor Outlying Islands
  'US', // USA (sito principale Polymarket; us.polymarket.com è separato)
  'VE', // Venezuela
  'YE', // Yemen
  'ZW', // Zimbabwe
])

/** Paesi close-only: aperti possono solo CHIUDERE, no open. */
export const CLOSE_ONLY_COUNTRIES = new Set<string>([
  'PL', // Polonia
  'SG', // Singapore
  'TH', // Thailandia
  'TW', // Taiwan
])

/** Regioni intra-paese ristrette (richiedono check fine-grained). */
export const RESTRICTED_REGIONS: Array<{ country: string; region: string; reason: string }> = [
  { country: 'CA', region: 'ON', reason: 'Ontario gambling regulation' },
  { country: 'UA', region: 'Crimea', reason: 'OFAC sanction' },
  { country: 'UA', region: 'Donetsk', reason: 'OFAC sanction' },
  { country: 'UA', region: 'Luhansk', reason: 'OFAC sanction' },
]

export type GeoStatus =
  | { allowed: true; country: string; region: string | null }
  | {
      allowed: false
      reason: 'blocked' | 'close-only' | 'region-blocked'
      country: string
      region: string | null
    }

/**
 * Determina lo status geo dell'utente in base ai country/region codes.
 * Uso server-side: passa l'header `x-vercel-ip-country` o equivalente.
 */
export function evaluateGeoStatus(country: string | null, region: string | null): GeoStatus {
  if (!country) {
    // Fallback prudente: se non riusciamo a determinare, blocco.
    return { allowed: false, reason: 'blocked', country: 'UNKNOWN', region }
  }
  const cc = country.toUpperCase()
  const rg = region?.toUpperCase() ?? null

  if (BLOCKED_COUNTRIES.has(cc)) {
    return { allowed: false, reason: 'blocked', country: cc, region: rg }
  }

  // Region-level blocks (es. Ontario, Crimea)
  if (rg) {
    const regionMatch = RESTRICTED_REGIONS.some(
      (r) => r.country === cc && r.region.toUpperCase() === rg
    )
    if (regionMatch) {
      return { allowed: false, reason: 'region-blocked', country: cc, region: rg }
    }
  }

  if (CLOSE_ONLY_COUNTRIES.has(cc)) {
    return { allowed: false, reason: 'close-only', country: cc, region: rg }
  }

  return { allowed: true, country: cc, region: rg }
}

/**
 * Estrae country/region dagli header Vercel/Cloudflare/standard.
 * Vercel: `x-vercel-ip-country`, `x-vercel-ip-country-region`
 * Cloudflare: `cf-ipcountry`
 */
export function extractGeoFromHeaders(headers: Headers): {
  country: string | null
  region: string | null
} {
  const country =
    headers.get('x-vercel-ip-country') ??
    headers.get('cf-ipcountry') ??
    headers.get('x-country-code') ??
    null
  const region = headers.get('x-vercel-ip-country-region') ?? null
  return { country, region }
}

/**
 * Fallback: chiama l'endpoint Polymarket geoblock se header mancano.
 * Forwarda l'IP del client. Nota: richiede deploy production (l'endpoint
 * detecta dall'IP della request).
 */
export async function fetchPolymarketGeoblock(clientIp?: string): Promise<{
  blocked: boolean
  country: string | null
  region: string | null
} | null> {
  try {
    const res = await fetch('https://polymarket.com/api/geoblock', {
      method: 'GET',
      headers: clientIp ? { 'X-Forwarded-For': clientIp } : undefined,
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      blocked?: boolean
      country?: string
      region?: string
    }
    return {
      blocked: json.blocked ?? false,
      country: json.country ?? null,
      region: json.region ?? null,
    }
  } catch {
    return null
  }
}
