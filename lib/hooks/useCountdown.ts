'use client'

import { useEffect, useState } from 'react'

export interface CountdownState {
  /** Display formattato MM:SS o HH:MM:SS */
  display: string
  /** Secondi residui (può essere 0 o negativo) */
  secondsLeft: number
  /** True quando endDate è nel passato */
  expired: boolean
}

function format(secondsLeft: number): string {
  if (secondsLeft < 0) return '00:00'
  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  if (hours > 0) {
    const hh = String(hours).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  return `${mm}:${ss}`
}

function compute(endDate: Date | null): CountdownState {
  if (!endDate || Number.isNaN(endDate.getTime())) {
    return { display: '--:--', secondsLeft: 0, expired: true }
  }
  const diffMs = endDate.getTime() - Date.now()
  const secondsLeft = Math.max(0, Math.floor(diffMs / 1000))
  return {
    display: format(secondsLeft),
    secondsLeft,
    expired: diffMs <= 0,
  }
}

/**
 * Hook React: ritorna countdown live verso `endDate`.
 * Aggiorna ogni secondo via setInterval, cleanup automatico su unmount/cambio.
 *
 * Passa `null` per disattivare.
 */
export function useCountdown(endDate: Date | null): CountdownState {
  const [state, setState] = useState<CountdownState>(() => compute(endDate))

  useEffect(() => {
    if (!endDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ display: '--:--', secondsLeft: 0, expired: true })
      return
    }

    setState(compute(endDate))
    const id = setInterval(() => setState(compute(endDate)), 1000)
    return () => clearInterval(id)
  }, [endDate])

  return state
}
