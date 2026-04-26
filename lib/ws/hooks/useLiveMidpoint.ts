'use client'

import { useEffect, useState } from 'react'
import { subscribeToPriceChange } from '../clob'

export interface MidpointData {
  midpoint: number | null
  /** Variazione percentuale dal primo midpoint osservato in questa sessione (in %) */
  change: number | null
}

/**
 * Hook React: ritorna midpoint live + variazione % per un singolo asset CLOB.
 * Passa `null` come assetId per disattivare la subscription.
 *
 * Una connessione WS viene riusata da tutti gli hook attivi sullo stesso endpoint
 * (vedi SingletonWS).
 */
export function useLiveMidpoint(assetId: string | null): MidpointData {
  const [midpoint, setMidpoint] = useState<number | null>(null)
  const [initial, setInitial] = useState<number | null>(null)

  useEffect(() => {
    if (!assetId) {
      // Reset quando il subscriber si disattiva (pattern subscription, non cascading)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMidpoint(null)
      setInitial(null)
      return
    }

    // Reset baseline al cambio di asset
    setMidpoint(null)
    setInitial(null)

    const unsubscribe = subscribeToPriceChange([assetId], (event) => {
      const price = parseFloat(event.price)
      if (!Number.isFinite(price)) return
      setMidpoint(price)
      setInitial((prev) => prev ?? price)
    })

    return unsubscribe
  }, [assetId])

  const change =
    midpoint !== null && initial !== null && initial > 0
      ? ((midpoint - initial) / initial) * 100
      : null

  return { midpoint, change }
}
