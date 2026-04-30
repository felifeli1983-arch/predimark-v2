/**
 * Redeem winning outcome tokens (Yes/No) into pUSD dopo che un market è
 * risolto. Implementa Polymarket "Positions & Tokens" Redeem step:
 *
 *   "After a market resolves, exchange winning tokens for pUSD."
 *
 * Due path on-chain:
 *  - Standard CTF: `ConditionalTokens.redeemPositions(collateral, parent,
 *    conditionId, indexSets)` — markets binary semplici.
 *  - Neg-risk: `NegRiskAdapter.redeemPositions(conditionId, amounts)` —
 *    markets winner-takes-all multi-candidato (es. elezioni). L'adapter
 *    gestisce il payout vs il vincente del meta-market.
 *
 * Tutte e due idempotenti: se l'utente ha 0 winning tokens, no-op.
 */

import {
  encodeFunctionData,
  type WalletClient,
  type Address,
  type Hex,
} from 'viem'

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

/**
 * NegRiskAdapter ABI:
 *   redeemPositions(bytes32 conditionId, uint256[] amounts) returns (uint256 payout)
 * Source: https://github.com/Polymarket/neg-risk-ctf-adapter (verified
 * 2026-04-30 via Polygonscan write tab di 0xd91E80cF...).
 *
 * `amounts` è la quantità di tokens da redimere per ogni outcome slot.
 * Per binary 2-outcome: [yesAmount, noAmount]. Passiamo maxUint256 per
 * entrambi → l'adapter consuma quello che l'utente ha effettivamente.
 */
const NEG_RISK_REDEEM_ABI = [
  {
    name: 'redeemPositions',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'conditionId', type: 'bytes32' },
      { name: 'amounts', type: 'uint256[]' },
    ],
    outputs: [{ name: 'payout', type: 'uint256' }],
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

/**
 * MaxUint256 come "tutto disponibile" per NegRiskAdapter — l'adapter
 * legge il balance ERC1155 effettivo e consuma solo quello.
 */
const MAX_UINT256 = BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
)
const NEG_RISK_REDEEM_AMOUNTS = [MAX_UINT256, MAX_UINT256]

export interface RedeemInput {
  signer: WalletClient
  funderAddress: Address
  /** conditionId del market risolto (bytes32 hex string). */
  conditionId: string
  /** True se il market è neg-risk (Polymarket `neg_risk` flag dalla CLOB API). */
  negRisk: boolean
}

export interface RedeemResult {
  txHash: `0x${string}`
}

export async function redeemWinningTokens(input: RedeemInput): Promise<RedeemResult> {
  if (!input.conditionId || !input.conditionId.startsWith('0x')) {
    throw new Error('conditionId mancante o non valido')
  }

  const { to, data } = input.negRisk
    ? buildNegRiskRedeemTx(input.conditionId)
    : buildStandardRedeemTx(input.conditionId)

  const txHash = await input.signer.sendTransaction({
    account: input.funderAddress,
    chain: null,
    to,
    data,
  })

  return { txHash }
}

function buildStandardRedeemTx(conditionId: string): { to: Address; data: Hex } {
  return {
    to: POLYGON_V2.conditionalTokens as Address,
    data: encodeFunctionData({
      abi: CTF_REDEEM_ABI,
      functionName: 'redeemPositions',
      args: [
        POLYGON_V2.pusdToken as Address,
        ZERO_BYTES32,
        conditionId as Hex,
        BINARY_INDEX_SETS,
      ],
    }),
  }
}

function buildNegRiskRedeemTx(conditionId: string): { to: Address; data: Hex } {
  return {
    to: POLYGON_V2.negRiskAdapter as Address,
    data: encodeFunctionData({
      abi: NEG_RISK_REDEEM_ABI,
      functionName: 'redeemPositions',
      args: [conditionId as Hex, NEG_RISK_REDEEM_AMOUNTS],
    }),
  }
}
