import {
  ClobClient,
  Chain,
  OrderType,
  type SignedOrder,
  type ApiKeyCreds,
} from '@polymarket/clob-client-v2'

import { CLOB_URL } from './clob'

export interface PostOrderResult {
  orderID: string
  /** "matched" | "live" | etc — stato Polymarket */
  status: string
  /** Trades fillati immediatamente (su market order). */
  takingAmount?: string
  makingAmount?: string
}

/**
 * Posta un SignedOrder al CLOB V2 server-side, usando le L2 API creds
 * dell'utente (caricate decifrate da DB). Ritorna l'orderID assegnato.
 *
 * MA4.4 Phase C-2 — server-only, mai chiamare lato client (esporrebbe creds).
 */
export async function postSignedOrder(
  signedOrder: SignedOrder,
  creds: ApiKeyCreds,
  orderType: OrderType = OrderType.GTC
): Promise<PostOrderResult> {
  const client = new ClobClient({
    host: CLOB_URL,
    chain: Chain.POLYGON,
    creds,
    throwOnError: true,
  })

  const res = (await client.postOrder(signedOrder, orderType)) as {
    orderID?: string
    status?: string
    takingAmount?: string
    makingAmount?: string
  }
  if (!res?.orderID) {
    throw new Error(`CLOB post failed (no orderID): ${JSON.stringify(res)}`)
  }
  return {
    orderID: res.orderID,
    status: res.status ?? 'unknown',
    takingAmount: res.takingAmount,
    makingAmount: res.makingAmount,
  }
}
