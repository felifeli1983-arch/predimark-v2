/**
 * Split + Merge outcome tokens — completa il set di operazioni CTF
 * descritte in Polymarket "Positions & Tokens":
 *
 *   SPLIT:  pUSD → Yes + No tokens (1:1, mantiene il valore totale)
 *   MERGE:  Yes + No tokens → pUSD (esce senza pagare lo spread CLOB)
 *   TRADE:  acquisto/vendita su orderbook (già in order-create/post.ts)
 *   REDEEM: winning tokens → pUSD post-resolution (già in redeem.ts)
 *
 * Use case Split: market making — il MM splitta pUSD in Yes+No e poi
 * mette ordini limit su entrambi i lati. Quando il book moves, ricompra
 * lo "scarto" o tiene la posizione netta.
 *
 * Use case Merge: exit alternativo se l'utente ha entrambi i lati
 * (es. comprato Yes a 0.30 + No a 0.30 per arbitrage). Merge converte
 * tutto in pUSD senza passare per CLOB → no spread, no slippage.
 *
 * On-chain: per neg-risk markets serve passare per il NegRiskAdapter
 * (route split/merge via adapter). Per markets standard, CTF diretto.
 */

import {
  encodeFunctionData,
  parseUnits,
  type WalletClient,
  type Address,
  type Hex,
} from 'viem'

import { POLYGON_V2, PUSD_DECIMALS } from './contracts'

const CTF_SPLIT_ABI = [
  {
    name: 'splitPosition',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'partition', type: 'uint256[]' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

const CTF_MERGE_ABI = [
  {
    name: 'mergePositions',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'partition', type: 'uint256[]' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

const NEG_RISK_SPLIT_ABI = [
  {
    name: 'splitPosition',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'conditionId', type: 'bytes32' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

const NEG_RISK_MERGE_ABI = [
  {
    name: 'mergePositions',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'conditionId', type: 'bytes32' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

const ZERO_BYTES32 = ('0x' + '0'.repeat(64)) as Hex
/** Binary partition: indexSet 1 (bit 0 = Yes) + indexSet 2 (bit 1 = No). */
const BINARY_PARTITION = [BigInt(1), BigInt(2)]

export interface SplitMergeInput {
  signer: WalletClient
  funderAddress: Address
  /** conditionId del market (bytes32 hex). */
  conditionId: string
  /** True se il market è neg-risk → routa via NegRiskAdapter. */
  negRisk: boolean
  /** Quantità in pUSD (decimal, es. 100.50). */
  amountPusd: number
}

export interface SplitMergeResult {
  txHash: `0x${string}`
}

/**
 * Split: brucia `amount` pUSD, conia `amount` Yes + `amount` No tokens.
 * Pre-condizione: utente deve avere `approve(amount)` per il CTF (o
 * NegRiskAdapter se neg-risk) — vedi `lib/polymarket/allowances.ts`.
 */
export async function splitPusdToOutcomeTokens(
  input: SplitMergeInput
): Promise<SplitMergeResult> {
  if (!input.conditionId.startsWith('0x')) {
    throw new Error('conditionId non valido')
  }
  const amountWei = parseUnits(input.amountPusd.toString(), PUSD_DECIMALS)
  if (amountWei <= BigInt(0)) {
    throw new Error('Importo split non valido')
  }

  const { to, data } = input.negRisk
    ? buildNegRiskSplitTx(input.conditionId, amountWei)
    : buildStandardSplitTx(input.conditionId, amountWei)

  const txHash = await input.signer.sendTransaction({
    account: input.funderAddress,
    chain: null,
    to,
    data,
  })
  return { txHash }
}

/**
 * Merge: brucia `amount` Yes + `amount` No tokens, restituisce
 * `amount` pUSD. Esce dalla posizione senza passare per CLOB.
 * Pre-condizione: utente deve avere `approve(amount)` per il CTF
 * (Yes+No tokens ERC1155).
 */
export async function mergeOutcomeTokensToPusd(
  input: SplitMergeInput
): Promise<SplitMergeResult> {
  if (!input.conditionId.startsWith('0x')) {
    throw new Error('conditionId non valido')
  }
  const amountWei = parseUnits(input.amountPusd.toString(), PUSD_DECIMALS)
  if (amountWei <= BigInt(0)) {
    throw new Error('Importo merge non valido')
  }

  const { to, data } = input.negRisk
    ? buildNegRiskMergeTx(input.conditionId, amountWei)
    : buildStandardMergeTx(input.conditionId, amountWei)

  const txHash = await input.signer.sendTransaction({
    account: input.funderAddress,
    chain: null,
    to,
    data,
  })
  return { txHash }
}

function buildStandardSplitTx(conditionId: string, amount: bigint) {
  return {
    to: POLYGON_V2.conditionalTokens as Address,
    data: encodeFunctionData({
      abi: CTF_SPLIT_ABI,
      functionName: 'splitPosition',
      args: [
        POLYGON_V2.pusdToken as Address,
        ZERO_BYTES32,
        conditionId as Hex,
        BINARY_PARTITION,
        amount,
      ],
    }),
  }
}

function buildStandardMergeTx(conditionId: string, amount: bigint) {
  return {
    to: POLYGON_V2.conditionalTokens as Address,
    data: encodeFunctionData({
      abi: CTF_MERGE_ABI,
      functionName: 'mergePositions',
      args: [
        POLYGON_V2.pusdToken as Address,
        ZERO_BYTES32,
        conditionId as Hex,
        BINARY_PARTITION,
        amount,
      ],
    }),
  }
}

function buildNegRiskSplitTx(conditionId: string, amount: bigint) {
  return {
    to: POLYGON_V2.negRiskAdapter as Address,
    data: encodeFunctionData({
      abi: NEG_RISK_SPLIT_ABI,
      functionName: 'splitPosition',
      args: [conditionId as Hex, amount],
    }),
  }
}

function buildNegRiskMergeTx(conditionId: string, amount: bigint) {
  return {
    to: POLYGON_V2.negRiskAdapter as Address,
    data: encodeFunctionData({
      abi: NEG_RISK_MERGE_ABI,
      functionName: 'mergePositions',
      args: [conditionId as Hex, amount],
    }),
  }
}
