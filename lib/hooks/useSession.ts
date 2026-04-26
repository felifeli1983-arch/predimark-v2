'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useState, useCallback } from 'react'

export interface SessionUser {
  id: string
  wallet_address: string | null
  username: string | null
  email: string | null
  country_code: string | null
  geo_block_status: string | null
  language: string | null
  onboarding_completed: boolean | null
}

export interface SessionData {
  user: SessionUser
  session: { expires_at: string }
}

export type SessionStatus = 'idle' | 'loading' | 'ok' | 'error'

export function useSession() {
  const { getAccessToken } = usePrivy()
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [data, setData] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    setStatus('loading')
    setError(null)

    try {
      const token = await getAccessToken()
      if (!token) {
        setStatus('error')
        setError('JWT Privy non disponibile — sei loggato?')
        return
      }

      const res = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const body = await res.json()

      if (!res.ok) {
        setStatus('error')
        setError(body?.error?.message ?? `HTTP ${res.status}`)
        return
      }

      setData(body as SessionData)
      setStatus('ok')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    }
  }, [getAccessToken])

  return { status, data, error, fetchSession }
}
