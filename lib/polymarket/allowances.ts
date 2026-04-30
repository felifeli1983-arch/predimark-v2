'use client'

import { type PublicClient, type WalletClient, maxUint256, type Address } from 'viem'

/**
 * Allowance approvals per trading Polymarket V2 — adattato da
 * clob-client-v2-main/examples/account/approveAllowances.ts +
 * approveNegRiskAllowances.ts.
 *
 * Prima di poter fare buy/sell con un wallet EOA, l'utente deve
 * `approve(maxUint256)` per:
 *   - pUSD → CTF Exchange V2 (per acquistare outcome tokens)
 *   - pUSD → CTF (per merge/split posizioni)
 *   - CTF → CTF Exchange V2 (per vendere outcome tokens)
 *
 * Per neg-risk markets servono ALTRE approval:
 *   - pUSD → NegRisk Exchange V2
 *   - pUSD → NegRisk Adapter
 *   - CTF → NegRisk Exchange V2
 *   - CTF → NegRisk Adapter
 *
 * Ogni approval è una tx Polygon (~0.01-0.05 cents). L'utente firma una
 * tx alla volta dal wallet (Privy embedded o connesso esterno).
 */

// --- Contract addresses (Polygon mainnet, chain 137) ---
// Fonte: clob-client-v2-main/src/config.ts → MATIC_CONTRACTS
export const POLYMARKET_CONTRACTS = {
  collateral: '0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB' as Address, // pUSD/USDC
  conditionalTokens: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045' as Address,
  exchangeV2: '0xE111180000d2663C0091e4f400237545B87B996B' as Address,
  negRiskExchangeV2: '0xe2222d279d744050d28e00520010520000310F59' as Address,
  negRiskAdapter: '0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296' as Address,
}

// --- Minimal ABI fragments ---
const usdcAbi = [
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
] as const

const ctfAbi = [
  {
    constant: false,
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const

export interface AllowanceStatus {
  usdcExchange: bigint
  usdcNegRiskExchange: bigint
  usdcNegRiskAdapter: bigint
  ctfExchange: boolean
  ctfNegRiskExchange: boolean
  ctfNegRiskAdapter: boolean
}

/**
 * Legge tutte le allowance correnti (read-only, niente firma utente).
 * Utile per mostrare uno stato "Setup richiesto" all'utente prima del primo trade.
 */
export async function readAllowances(
  publicClient: PublicClient,
  account: Address
): Promise<AllowanceStatus> {
  const [
    usdcExchange,
    usdcNegRiskExchange,
    usdcNegRiskAdapter,
    ctfExchange,
    ctfNegRiskExchange,
    ctfNegRiskAdapter,
  ] = await Promise.all([
    publicClient.readContract({
      address: POLYMARKET_CONTRACTS.collateral,
      abi: usdcAbi,
      functionName: 'allowance',
      args: [account, POLYMARKET_CONTRACTS.exchangeV2],
    }),
    publicClient.readContract({
      address: POLYMARKET_CONTRACTS.collateral,
      abi: usdcAbi,
      functionName: 'allowance',
      args: [account, POLYMARKET_CONTRACTS.negRiskExchangeV2],
    }),
    publicClient.readContract({
      address: POLYMARKET_CONTRACTS.collateral,
      abi: usdcAbi,
      functionName: 'allowance',
      args: [account, POLYMARKET_CONTRACTS.negRiskAdapter],
    }),
    publicClient.readContract({
      address: POLYMARKET_CONTRACTS.conditionalTokens,
      abi: ctfAbi,
      functionName: 'isApprovedForAll',
      args: [account, POLYMARKET_CONTRACTS.exchangeV2],
    }),
    publicClient.readContract({
      address: POLYMARKET_CONTRACTS.conditionalTokens,
      abi: ctfAbi,
      functionName: 'isApprovedForAll',
      args: [account, POLYMARKET_CONTRACTS.negRiskExchangeV2],
    }),
    publicClient.readContract({
      address: POLYMARKET_CONTRACTS.conditionalTokens,
      abi: ctfAbi,
      functionName: 'isApprovedForAll',
      args: [account, POLYMARKET_CONTRACTS.negRiskAdapter],
    }),
  ])
  return {
    usdcExchange: usdcExchange as bigint,
    usdcNegRiskExchange: usdcNegRiskExchange as bigint,
    usdcNegRiskAdapter: usdcNegRiskAdapter as bigint,
    ctfExchange: ctfExchange as boolean,
    ctfNegRiskExchange: ctfNegRiskExchange as boolean,
    ctfNegRiskAdapter: ctfNegRiskAdapter as boolean,
  }
}

export interface AllowanceMissing {
  usdcExchange: boolean
  usdcNegRiskExchange: boolean
  usdcNegRiskAdapter: boolean
  ctfExchange: boolean
  ctfNegRiskExchange: boolean
  ctfNegRiskAdapter: boolean
  any: boolean
}

export function diffAllowances(s: AllowanceStatus): AllowanceMissing {
  const usdcExchange = !(s.usdcExchange > BigInt(0))
  const usdcNegRiskExchange = !(s.usdcNegRiskExchange > BigInt(0))
  const usdcNegRiskAdapter = !(s.usdcNegRiskAdapter > BigInt(0))
  const ctfExchange = !s.ctfExchange
  const ctfNegRiskExchange = !s.ctfNegRiskExchange
  const ctfNegRiskAdapter = !s.ctfNegRiskAdapter
  return {
    usdcExchange,
    usdcNegRiskExchange,
    usdcNegRiskAdapter,
    ctfExchange,
    ctfNegRiskExchange,
    ctfNegRiskAdapter,
    any:
      usdcExchange ||
      usdcNegRiskExchange ||
      usdcNegRiskAdapter ||
      ctfExchange ||
      ctfNegRiskExchange ||
      ctfNegRiskAdapter,
  }
}

/**
 * Esegue tutte le approvals mancanti. Una tx alla volta — l'utente firma
 * fino a 6 transazioni dal wallet (max). Salta quelle già fatte.
 *
 * Throw se l'utente cancella una firma. Ritorna i tx hashes per UI.
 */
export async function approveMissingAllowances(
  walletClient: WalletClient,
  account: Address,
  missing: AllowanceMissing
): Promise<string[]> {
  const hashes: string[] = []
  const chain = walletClient.chain
  if (!chain) throw new Error('walletClient senza chain configurata')

  // viem writeContract è strict-typed sul abi/args coupling; per non
  // duplicare il blocco per ogni combinazione (abi, fn) usiamo un cast
  // controllato. I valori passati sono validati dai constants e dai
  // params chiamanti.
  const submit = async (
    address: Address,
    abi: typeof usdcAbi | typeof ctfAbi,
    functionName: 'approve' | 'setApprovalForAll',
    args: readonly [Address, bigint] | readonly [Address, boolean]
  ) => {
    const hash = await (
      walletClient.writeContract as unknown as (params: Record<string, unknown>) => Promise<string>
    )({
      address,
      abi,
      functionName,
      args,
      account,
      chain,
    })
    hashes.push(hash)
  }

  if (missing.usdcExchange) {
    await submit(POLYMARKET_CONTRACTS.collateral, usdcAbi, 'approve', [
      POLYMARKET_CONTRACTS.exchangeV2,
      maxUint256,
    ])
  }
  if (missing.usdcNegRiskExchange) {
    await submit(POLYMARKET_CONTRACTS.collateral, usdcAbi, 'approve', [
      POLYMARKET_CONTRACTS.negRiskExchangeV2,
      maxUint256,
    ])
  }
  if (missing.usdcNegRiskAdapter) {
    await submit(POLYMARKET_CONTRACTS.collateral, usdcAbi, 'approve', [
      POLYMARKET_CONTRACTS.negRiskAdapter,
      maxUint256,
    ])
  }
  if (missing.ctfExchange) {
    await submit(POLYMARKET_CONTRACTS.conditionalTokens, ctfAbi, 'setApprovalForAll', [
      POLYMARKET_CONTRACTS.exchangeV2,
      true,
    ])
  }
  if (missing.ctfNegRiskExchange) {
    await submit(POLYMARKET_CONTRACTS.conditionalTokens, ctfAbi, 'setApprovalForAll', [
      POLYMARKET_CONTRACTS.negRiskExchangeV2,
      true,
    ])
  }
  if (missing.ctfNegRiskAdapter) {
    await submit(POLYMARKET_CONTRACTS.conditionalTokens, ctfAbi, 'setApprovalForAll', [
      POLYMARKET_CONTRACTS.negRiskAdapter,
      true,
    ])
  }

  return hashes
}
