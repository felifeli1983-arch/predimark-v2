'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useRef } from 'react'
import { syncUserToSupabase } from '@/lib/actions/syncUser'

export interface AuthUser {
  id: string
  email?: string
  walletAddress?: string
  isCreator: boolean
}

export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const hasSynced = useRef(false)

  useEffect(() => {
    if (!ready || !authenticated || !user || hasSynced.current) return
    hasSynced.current = true

    syncUserToSupabase({
      privyDid: user.id,
      email: user.email?.address,
      // Privy verifica l'email via OTP prima di associarla all'utente,
      // quindi se è presente è anche verificata.
      emailVerified: Boolean(user.email?.address),
      walletAddress: user.wallet?.address,
    }).catch((err: unknown) => {
      console.error('[useAuth] syncUserToSupabase failed:', err)
    })
  }, [ready, authenticated, user])

  useEffect(() => {
    if (!authenticated) hasSynced.current = false
  }, [authenticated])

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email?.address,
        walletAddress: user.wallet?.address,
        isCreator: false,
      }
    : null

  return { ready, authenticated, user: authUser, login, logout }
}
