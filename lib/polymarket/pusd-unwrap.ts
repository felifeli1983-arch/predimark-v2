/**
 * Unwrap pUSD → USDC.e via Collateral Offramp on Polygon.
 *
 * Flow on-chain (richiede gas MATIC, paga utente):
 *   1. ERC-20 approve(pUSD, offramp, amount) — solo prima volta o se allowance bassa
 *   2. Offramp.unwrap(USDC.e, recipient, amount) → burns pUSD, restituisce
 *      USDC.e al recipient (di solito = funderAddress)
 *
 * Offramp address: 0x2957922Eb93258b93368531d39fAcCA3B4dC5854
 * Speculare al wrap (lib/polymarket/pusd-wrap.ts).
 */

import { encodeFunctionData, parseUnits, type WalletClient, type Address } from 'viem'

import { POLYGON_V2, PUSD_DECIMALS } from './contracts'
import { USDCE_TOKEN } from './pusd-wrap'

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

/**
 * Offramp unwrap function ABI — 3 args secondo doc Polymarket "pUSD":
 *   unwrap(address _asset, address _to, uint256 _amount)
 *
 * BUGFIX: la versione precedente passava solo (amount) → selector
 * mismatch + tx revert. Ora aderente al deployed contract.
 */
const OFFRAMP_UNWRAP_ABI = [
  {
    name: 'unwrap',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_asset', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
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

  // unwrap(_asset, _to, _amount): _asset = USDC.e, _to = funderAddress
  // (l'utente riceve i USDC.e sul proprio wallet).
  const unwrapData = encodeFunctionData({
    abi: OFFRAMP_UNWRAP_ABI,
    functionName: 'unwrap',
    args: [USDCE_TOKEN, input.funderAddress, amountWei],
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
