/**
 * Unwrap pUSD → USDC.e via Collateral Offramp on Polygon.
 *
 * Flow on-chain (richiede gas MATIC, paga utente):
 *   1. ERC-20 approve(pUSD, offramp, amount) — solo prima volta o se allowance bassa
 *   2. Offramp.unwrap(amount) → burns pUSD, restituisce USDC.e all'utente
 *
 * Offramp address: 0x2957922Eb93258b93368531d39fAcCA3B4dC5854
 * Speculare al wrap (lib/polymarket/pusd-wrap.ts).
 */

import { encodeFunctionData, parseUnits, type WalletClient, type Address } from 'viem'

import { POLYGON_V2, PUSD_DECIMALS } from './contracts'

const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

const OFFRAMP_UNWRAP_ABI = [
  {
    name: 'unwrap',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

export interface UnwrapInput {
  signer: WalletClient
  funderAddress: Address
  /** Importo pUSD da unwrappare in USDC.e (decimal, es. 100.50). */
  amountPusd: number
}

export interface UnwrapResult {
  approveTxHash: `0x${string}` | null
  unwrapTxHash: `0x${string}`
  amountUnwrapped: bigint
}

/**
 * Esegue approve(pUSD → Offramp) + Offramp.unwrap(amount).
 * Approve sempre con MAX_UINT256 per evitare ri-approve futuri.
 */
export async function unwrapPusdToUsdc(input: UnwrapInput): Promise<UnwrapResult> {
  const amountWei = parseUnits(input.amountPusd.toString(), PUSD_DECIMALS)
  if (amountWei <= BigInt(0)) {
    throw new Error('Importo unwrap non valido')
  }

  const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
  const approveData = encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [POLYGON_V2.collateralOfframp as Address, MAX_UINT256],
  })

  const approveTxHash = await input.signer.sendTransaction({
    account: input.funderAddress,
    chain: null,
    to: POLYGON_V2.pusdToken as Address,
    data: approveData,
  })

  const unwrapData = encodeFunctionData({
    abi: OFFRAMP_UNWRAP_ABI,
    functionName: 'unwrap',
    args: [amountWei],
  })

  const unwrapTxHash = await input.signer.sendTransaction({
    account: input.funderAddress,
    chain: null,
    to: POLYGON_V2.collateralOfframp as Address,
    data: unwrapData,
  })

  return {
    approveTxHash,
    unwrapTxHash,
    amountUnwrapped: amountWei,
  }
}
