import { PrivyClient } from '@privy-io/server-auth'

let _client: PrivyClient | null = null

function getPrivyClient(): PrivyClient {
  if (!_client) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
    const appSecret = process.env.PRIVY_APP_SECRET
    if (!appId || !appSecret) {
      throw new Error('NEXT_PUBLIC_PRIVY_APP_ID e PRIVY_APP_SECRET sono richiesti')
    }
    _client = new PrivyClient(appId, appSecret)
  }
  return _client
}

export interface VerifiedPrivyUser {
  privyDid: string
  email?: string
  walletAddress?: string
}

export async function verifyPrivyToken(token: string): Promise<VerifiedPrivyUser> {
  const client = getPrivyClient()
  const claims = await client.verifyAuthToken(token)

  return {
    privyDid: claims.userId,
  }
}

export async function getPrivyUser(privyDid: string): Promise<VerifiedPrivyUser> {
  const client = getPrivyClient()
  const user = await client.getUser(privyDid)

  return {
    privyDid: user.id,
    email: user.email?.address,
    walletAddress: user.wallet?.address,
  }
}
