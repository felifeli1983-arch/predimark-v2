'use client'

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth'
import { polygon } from 'viem/chains'

interface Props {
  children: React.ReactNode
}

export function PrivyProvider({ children }: Props) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set')
  }

  // CI build with stub envs: skip Privy SDK init (BasePrivyProvider rejects
  // invalid app IDs during prerender). Real deploy uses real envs and renders normally.
  if (appId.startsWith('stub')) {
    return <>{children}</>
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet'],
        defaultChain: polygon,
        supportedChains: [polygon],
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
