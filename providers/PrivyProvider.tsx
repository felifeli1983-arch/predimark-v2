'use client'

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth'

interface Props {
  children: React.ReactNode
}

export function PrivyProvider({ children }: Props) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set')
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#00E5FF',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  )
}
