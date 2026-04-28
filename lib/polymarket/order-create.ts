import {
  ClobClient,
  Chain,
  Side,
  type SignedOrder,
  type UserOrderV2,
  type CreateOrderOptions,
  type TickSize,
} from '@polymarket/clob-client-v2'
import type { WalletClient } from 'viem'

import { CLOB_URL, BUILDER_CODE } from './clob'

export interface BuildOrderInput {
  signer: WalletClient
  funderAddress: string
  /** ERC-1155 conditional token id (Polymarket clobTokenIds[0] or [1] per outcome). */
  tokenId: string
  /** Per buy: 'yes'/'no'/etc. Solo informativo. */
  side: 'yes' | 'no' | string
  /** Prezzo cents come decimal (es. 0.27 per 27¢). */
  pricePerShare: number
  /** Importo USDC che user mette → size = amount/price. */
  amountUsdc: number
  /** Tick size del market (default 0.01). MA8 fetch from CLOB API per-market. */
  tickSize?: TickSize
  /** True se neg-risk market (multi-outcome). MA8 fetch from CLOB API. */
  negRisk?: boolean
}

export interface BuildSellOrderInput {
  signer: WalletClient
  funderAddress: string
  /** Token id che si sta vendendo. */
  tokenId: string
  /** Prezzo a cui si vende (decimal 0-1). */
  pricePerShare: number
  /** Quante shares si stanno vendendo. */
  sharesToSell: number
  tickSize?: TickSize
  negRisk?: boolean
}

/**
 * Build + sign un BUY order V2 client-side via Privy embedded wallet.
 * Il SignedOrder ritornato va poi inviato al server per il post a CLOB
 * (server ha le L2 API creds dell'utente).
 */
export async function buildAndSignOrder(input: BuildOrderInput): Promise<SignedOrder> {
  const tickSize: TickSize = input.tickSize ?? '0.01'
  const negRisk = input.negRisk ?? false

  // size = amount USDC / pricePerShare. Es: $5 a 27¢ = 5/0.27 = 18.5185 shares.
  const size = input.amountUsdc / input.pricePerShare
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('Importo o prezzo non validi')
  }

  const userOrder: UserOrderV2 = {
    tokenID: input.tokenId,
    price: input.pricePerShare,
    size,
    side: Side.BUY,
    builderCode: BUILDER_CODE,
  }

  const options: CreateOrderOptions = { tickSize, negRisk }

  const client = new ClobClient({
    host: CLOB_URL,
    chain: Chain.POLYGON,
    signer: input.signer,
    funderAddress: input.funderAddress,
    throwOnError: true,
  })

  return await client.createOrder(userOrder, options)
}

/**
 * Build + sign un SELL order V2 (chiusura posizione esistente).
 *
 * Polymarket V2: per chiudere una posizione si crea un SELL order sullo
 * stesso tokenID del side che si possiede, dimensionato sulle shares da
 * vendere. Il post va al CLOB con stesso flow del buy.
 */
export async function buildAndSignSellOrder(input: BuildSellOrderInput): Promise<SignedOrder> {
  const tickSize: TickSize = input.tickSize ?? '0.01'
  const negRisk = input.negRisk ?? false

  if (
    !Number.isFinite(input.sharesToSell) ||
    input.sharesToSell <= 0 ||
    !Number.isFinite(input.pricePerShare) ||
    input.pricePerShare <= 0 ||
    input.pricePerShare >= 1
  ) {
    throw new Error('sharesToSell o pricePerShare non validi')
  }

  const userOrder: UserOrderV2 = {
    tokenID: input.tokenId,
    price: input.pricePerShare,
    size: input.sharesToSell,
    side: Side.SELL,
    builderCode: BUILDER_CODE,
  }

  const options: CreateOrderOptions = { tickSize, negRisk }

  const client = new ClobClient({
    host: CLOB_URL,
    chain: Chain.POLYGON,
    signer: input.signer,
    funderAddress: input.funderAddress,
    throwOnError: true,
  })

  return await client.createOrder(userOrder, options)
}
