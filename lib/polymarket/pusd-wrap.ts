/**
 * Wrap USDC.e → pUSD via Collateral Onramp on Polygon.
 *
 * Flow on-chain (richiede gas MATIC, paga utente):
 *   1. ERC-20 approve(usdc.e, onramp, amount) — solo prima volta o se allowance bassa
 *   2. Onramp.wrap(amount) → mints pUSD all'utente
 *
 * USDC.e address: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 (Polygon)
 * pUSD: 0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB
 * Onramp: 0x93070a847efEf7F70739046A929D47a521F5B8ee
 *
 * Tutte le funzioni client-side, eseguite tramite viem WalletClient da Privy
 * embedded wallet. L'utente deve avere MATIC per pagare gas.
 */

import { encodeFunctionData, parseUnits, type WalletClient, type Address } from 'viem'

import { POLYGON_V2, PUSD_DECIMALS } from './contracts'

/** USDC.e su Polygon. */
export const USDCE_TOKEN: Address = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

/** Minimal ABI per ERC-20 approve. */
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
 * Onramp wrap function ABI — 3 args secondo doc Polymarket "pUSD":
 *   wrap(address _asset, address _to, uint256 _amount)
 * `_asset` = USDC.e address (richiesto dal contract perché Onramp può
 * supportare più underlying assets in futuro). `_to` = recipient pUSD,
 * non necessariamente msg.sender.
 *
 * BUGFIX: la versione precedente passava solo (amount) → selector
 * mismatch + tx revert. Ora aderente al deployed contract.
 */
const ONRAMP_WRAP_ABI = [
  {
    name: 'wrap',
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

export interface WrapInput {
  signer: WalletClient
  funderAddress: Address
  /** Importo USDC.e da wrappare in pUSD (decimal, es. 100.50). */
  amountUsdc: number
}

export interface WrapResult {
  approveTxHash: `0x${string}` | null
  wrapTxHash: `0x${string}`
  amountWrapped: bigint
}

/**
 * Esegue approve(USDC.e → Onramp) + Onramp.wrap(amount).
 * Restituisce i tx hash. L'utente paga gas in MATIC su Polygon.
 *
 * Per MVP: approve sempre (max uint256 per evitare ri-approve futuri).
 */
export async function wrapUsdcToPusd(input: WrapInput): Promise<WrapResult> {
  const amountWei = parseUnits(input.amountUsdc.toString(), PUSD_DECIMALS)
  if (amountWei <= BigInt(0)) {
    throw new Error('Importo wrap non valido')
  }

  // Step 1: approve (max uint256 per non rifare approve)
  const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
  const approveData = encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [POLYGON_V2.collateralOnramp as Address, MAX_UINT256],
  })

  const approveTxHash = await input.signer.sendTransaction({
    account: input.funderAddress,
    chain: null,
    to: USDCE_TOKEN,
    data: approveData,
  })

  // Step 2: wrap(_asset, _to, _amount). `_to = funderAddress` perché
  // l'utente vuole pUSD sul proprio wallet.
  const wrapData = encodeFunctionData({
    abi: ONRAMP_WRAP_ABI,
    functionName: 'wrap',
    args: [USDCE_TOKEN, input.funderAddress, amountWei],
  })

  const wrapTxHash = await input.signer.sendTransaction({
    account: input.funderAddress,
    chain: null,
    to: POLYGON_V2.collateralOnramp as Address,
    data: wrapData,
  })

  return {
    approveTxHash,
    wrapTxHash,
    amountWrapped: amountWei,
  }
}
