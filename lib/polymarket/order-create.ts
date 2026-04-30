import {
  ClobClient,
  Chain,
  Side,
  SignatureTypeV2,
  type SignedOrder,
  type UserOrderV2,
  type CreateOrderOptions,
  type TickSize,
} from '@polymarket/clob-client-v2'
import type { WalletClient } from 'viem'

import { CLOB_URL, BUILDER_CODE, getMarketDetails, getMarketDetailsByToken } from './clob'

/**
 * Tipo wallet utente — determina come Polymarket valida la firma:
 *  - 'eoa'              → SignatureTypeV2.EOA (0). Path B (BYO MetaMask) e
 *                         Path C (Privy embedded wallet). L'utente paga gas POL.
 *  - 'poly_proxy'       → SignatureTypeV2.POLY_PROXY (1). Path A (utente
 *                         esistente Polymarket.com con proxy multisig).
 *                         Gasless via relayer.
 *  - 'poly_gnosis_safe' → SignatureTypeV2.POLY_GNOSIS_SAFE (2). Polymarket
 *                         Gnosis Safe (legacy onboarding).
 *  - 'poly_1271'        → SignatureTypeV2.POLY_1271 (3). EIP-1271 per smart
 *                         contract wallets / vaults.
 */
export type WalletKind = 'eoa' | 'poly_proxy' | 'poly_gnosis_safe' | 'poly_1271'

function toSigType(kind: WalletKind): SignatureTypeV2 {
  if (kind === 'poly_proxy') return SignatureTypeV2.POLY_PROXY
  if (kind === 'poly_gnosis_safe') return SignatureTypeV2.POLY_GNOSIS_SAFE
  if (kind === 'poly_1271') return SignatureTypeV2.POLY_1271
  return SignatureTypeV2.EOA
}

export interface BuildOrderInput {
  signer: WalletClient
  /** Address che paga il trade. Per EOA = signer.account.address. Per
   *  POLY_PROXY = il proxy wallet (NON l'EOA owner). */
  funderAddress: string
  /** ERC-1155 conditional token id (Polymarket clobTokenIds[0] o [1] per outcome). */
  tokenId: string
  /** conditionId del market — opzionale; se mancante, tickSize/negRisk
   *  vengono fetchati via getTickSize/getNegRisk(tokenId). */
  conditionId?: string | null
  /** Per buy: 'yes'/'no'/etc. Solo informativo. */
  side: 'yes' | 'no' | string
  /** Prezzo cents come decimal (es. 0.27 per 27¢). */
  pricePerShare: number
  /** Importo USDC che user mette → size = amount/price. */
  amountUsdc: number
  /** Tipo wallet utente. Default 'eoa'. */
  walletKind?: WalletKind
  /** Override manuale tickSize (skip fetch). */
  tickSize?: TickSize
  /** Override manuale negRisk (skip fetch). */
  negRisk?: boolean
}

export interface BuildSellOrderInput {
  signer: WalletClient
  funderAddress: string
  tokenId: string
  conditionId?: string | null
  pricePerShare: number
  sharesToSell: number
  walletKind?: WalletKind
  tickSize?: TickSize
  negRisk?: boolean
}

/**
 * Build + sign un BUY order V2.
 * - Se tickSize/negRisk non sono passati, vengono fetchati da getMarket(conditionId)
 *   come prescritto dal Quickstart Polymarket — i mercati neg-risk hanno tick
 *   0.001 e i default 0.01/false fanno rigettare l'ordine.
 * - signatureType esplicito sul ClobClient costruttore (Quickstart): default
 *   EOA per Path B/C, POLY_PROXY per Path A (Polymarket import).
 */
export async function buildAndSignOrder(input: BuildOrderInput): Promise<SignedOrder> {
  const resolved = await resolveTickAndRisk(input)
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

  const options: CreateOrderOptions = { tickSize: resolved.tickSize, negRisk: resolved.negRisk }

  const client = new ClobClient({
    host: CLOB_URL,
    chain: Chain.POLYGON,
    signer: input.signer,
    funderAddress: input.funderAddress,
    signatureType: toSigType(input.walletKind ?? 'eoa'),
    throwOnError: true,
  })

  return await client.createOrder(userOrder, options)
}

/**
 * Build + sign un SELL order V2 (chiusura posizione).
 * Stessa logica del BUY: tickSize/negRisk auto-fetch + signatureType.
 */
export async function buildAndSignSellOrder(input: BuildSellOrderInput): Promise<SignedOrder> {
  const resolved = await resolveTickAndRisk(input)
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

  const options: CreateOrderOptions = { tickSize: resolved.tickSize, negRisk: resolved.negRisk }

  const client = new ClobClient({
    host: CLOB_URL,
    chain: Chain.POLYGON,
    signer: input.signer,
    funderAddress: input.funderAddress,
    signatureType: toSigType(input.walletKind ?? 'eoa'),
    throwOnError: true,
  })

  return await client.createOrder(userOrder, options)
}

async function resolveTickAndRisk(input: {
  tokenId: string
  conditionId?: string | null
  tickSize?: TickSize
  negRisk?: boolean
}): Promise<{ tickSize: TickSize; negRisk: boolean }> {
  // Se ENTRAMBI sono passati, niente fetch network
  if (input.tickSize !== undefined && input.negRisk !== undefined) {
    return { tickSize: input.tickSize, negRisk: input.negRisk }
  }
  // Preferisci conditionId (1 chiamata getMarket); fallback a tokenId
  // (2 chiamate getTickSize + getNegRisk, comunque fast)
  const details = input.conditionId
    ? await getMarketDetails(input.conditionId)
    : await getMarketDetailsByToken(input.tokenId)
  return {
    tickSize: (input.tickSize ?? details.tickSize) as TickSize,
    negRisk: input.negRisk ?? details.negRisk,
  }
}
