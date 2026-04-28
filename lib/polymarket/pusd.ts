import { POLYGON_V2, PUSD_DECIMALS } from './contracts'

const RPC_URL = process.env.POLYGON_RPC_URL ?? 'https://polygon-rpc.com'

/** ERC-20 `balanceOf(address)` selector. */
const BALANCE_OF_SELECTOR = '0x70a08231'

interface RpcResponse<T> {
  jsonrpc: string
  id: number
  result?: T
  error?: { code: number; message: string }
}

async function jsonRpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
  const json = (await res.json()) as RpcResponse<T>
  if (json.error) throw new Error(`RPC ${json.error.code}: ${json.error.message}`)
  if (json.result === undefined) throw new Error('RPC empty result')
  return json.result
}

/** Pad un address EVM (20 bytes) a 32 bytes hex senza 0x. */
function padAddress(address: string): string {
  const clean = address.toLowerCase().replace(/^0x/, '')
  if (clean.length !== 40) throw new Error(`Address invalido: ${address}`)
  return clean.padStart(64, '0')
}

/**
 * Ritorna il balance pUSD on-chain (Polygon) di un address come bigint
 * con base unit pUSD (decimals = 6).
 */
export async function getPusdBalance(address: string): Promise<bigint> {
  const data = BALANCE_OF_SELECTOR + padAddress(address)
  const result = await jsonRpcCall<string>('eth_call', [
    { to: POLYGON_V2.pusdToken, data },
    'latest',
  ])
  if (!result || result === '0x') return BigInt(0)
  return BigInt(result)
}

/** Converte un balance bigint pUSD → numero decimale USD-equivalent. */
export function formatPusdBalance(raw: bigint): number {
  const divisor = BigInt(10) ** BigInt(PUSD_DECIMALS)
  const whole = Number(raw / divisor)
  const fraction = Number(raw % divisor) / Number(divisor)
  return whole + fraction
}
