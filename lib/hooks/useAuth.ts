'use client'

import { usePrivy } from '@privy-io/react-auth'

export interface AuthUser {
  id: string
  email?: string
  walletAddress?: string
  isCreator: boolean
}

export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email?.address,
        walletAddress: user.wallet?.address,
        isCreator: false,
      }
    : null

  return {
    ready,
    authenticated,
    user: authUser,
    login,
    logout,
  }
}
