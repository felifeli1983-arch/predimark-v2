/**
 * Redeem winning outcome tokens (Yes/No) into pUSD dopo che un market è
 * risolto. Implementa Polymarket "Positions & Tokens" Redeem step:
 *
 *   "After a market resolves, exchange winning tokens for pUSD."
 *
 * On-chain: chiama `CTF.redeemPositions(collateral, parent, condition, indexSets)`.
 * Idempotente: se l'utente ha 0 winning tokens (già reedimati o losing),
 * la chiamata è no-op senza errori.
 *
 * Per market neg-risk si dovrebbe usare il NegRiskAdapter, ma per V1 MVP
 * ci limitiamo al CTF standard. Markets neg-risk richiedono fix dedicato
 * (ToDo: vedi project_polymarket_redeem_gap.md memory).
 */

import { encodeFunctionData, type WalletClient, type Address, type Hex } from 'viem'

import { POLYGON_V2 } from './contracts'

const CTF_REDEEM_ABI = [
  {
    name: 'redeemPositions',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'indexSets', type: 'uint256[]' },
    ],
    outputs: [],
  },
] as const

/** parentCollectionId = bytes32(0) per markets non-nested (la stragrande maggioranza). */
const ZERO_BYTES32 = ('0x' + '0'.repeat(64)) as Hex

/**
 * Per un market binary (Yes/No outcomes) con 2 outcome slots:
 *  - indexSet 1 = bit 0 = Yes/Up
 *  - indexSet 2 = bit 1 = No/Down
 * Passare entrambi: CTF paga solo il lato vincente, ignora i token a $0.
 */
const BINARY_INDEX_SETS = [BigInt(1), BigInt(2)]

export interface RedeemInput {
  signer: WalletClient
  funderAddress: Address
  /** conditionId del market risolto (bytes32 hex string). */
  conditionId: string
}

export interface RedeemResult {
  txHash: `0x${string}`
}

export async function redeemWinningTokens(input: RedeemInput): Promise<RedeemResult> {
  if (!input.conditionId || !input.conditionId.startsWith('0x')) {
    throw new Error('conditionId mancante o non valido')
  }

  const data = encodeFunctionData({
    abi: CTF_REDEEM_ABI,
    functionName: 'redeemPositions',
    args: [
      POLYGON_V2.pusdToken as Address,
      ZERO_BYTES32,
      input.conditionId as Hex,
      BINARY_INDEX_SETS,
    ],
  })

  const txHash = await input.signer.sendTransaction({
    account: input.funderAddress,
    chain: null,
    to: POLYGON_V2.conditionalTokens as Address,
    data,
  })

  return { txHash }
}
