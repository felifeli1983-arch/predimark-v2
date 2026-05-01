#!/usr/bin/env tsx
/**
 * Derive (o crea) API credentials Polymarket per il Builder owner address.
 * Doc L1 Methods → createOrDeriveApiKey.
 *
 * Use case: la UI Polymarket Builder Settings NON espone le API creds
 * (key/secret/passphrase). Le ricaviamo via SDK direttamente con la
 * private key del builder owner.
 *
 * USAGE:
 *   $ BUILDER_PRIVATE_KEY=0xabc123... npx tsx scripts/derive-builder-creds.ts
 *
 * Output:
 *   API Key: 019db1bc-...
 *   Secret: 1Ug7w30II...
 *   Passphrase: 9cc492102...
 *
 * Copia i 3 valori in:
 *  1. .env.local (POLYMARKET_BUILDER_API_KEY/SECRET/PASSPHRASE)
 *  2. Vercel Settings → Environment Variables (stessi 3 nomi)
 *
 * IMPORTANTE: la private key NON viene salvata. Lo script la legge solo
 * da env var transitoria; il comando non finisce in shell history se hai
 * `HISTCONTROL=ignorespace` e prefisso il command con uno spazio.
 */

import { ClobClient, Chain } from '@polymarket/clob-client-v2'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'

const CLOB_HOST = process.env.POLYMARKET_CLOB_URL ?? 'https://clob.polymarket.com'
const EXPECTED_OWNER = '0x89afabea870c4f17332ef6549659f6ebb9529ce9'

async function main(): Promise<void> {
  const pk = process.env.BUILDER_PRIVATE_KEY
  if (!pk) {
    console.error('❌ BUILDER_PRIVATE_KEY env var richiesta')
    console.error(
      '   Esempio: BUILDER_PRIVATE_KEY=0xabc123... npx tsx scripts/derive-builder-creds.ts'
    )
    process.exit(1)
  }
  if (!pk.startsWith('0x') || pk.length !== 66) {
    console.error('❌ BUILDER_PRIVATE_KEY non valida (deve essere 0x + 64 hex char)')
    process.exit(1)
  }

  const account = privateKeyToAccount(pk as `0x${string}`)
  console.warn(`Wallet derivato dalla private key: ${account.address}`)

  if (account.address.toLowerCase() !== EXPECTED_OWNER.toLowerCase()) {
    console.warn(
      `⚠️  WARNING: address derivato (${account.address}) NON coincide con BUILDER_OWNER atteso (${EXPECTED_OWNER}).`
    )
    console.warn(`   Procedo comunque, ma le creds saranno per ${account.address}.`)
  }

  const signer = createWalletClient({
    account,
    chain: polygon,
    transport: http(),
  })

  const client = new ClobClient({
    host: CLOB_HOST,
    chain: Chain.POLYGON,
    signer,
  })

  console.warn(`\nChiamando createOrDeriveApiKey() su ${CLOB_HOST}...`)
  let creds
  try {
    creds = await client.createOrDeriveApiKey()
  } catch (err) {
    console.error('❌ createOrDeriveApiKey fallita:', err instanceof Error ? err.message : err)
    process.exit(1)
  }

  console.warn('\n✅ Creds ricavate con successo:\n')
  console.warn(`   POLYMARKET_BUILDER_API_KEY=${creds.key}`)
  console.warn(`   POLYMARKET_BUILDER_API_SECRET=${creds.secret}`)
  console.warn(`   POLYMARKET_BUILDER_API_PASSPHRASE=${creds.passphrase}`)
  console.warn('\nCopia queste 3 righe in:')
  console.warn('  1) .env.local (sovrascrivi i valori esistenti)')
  console.warn('  2) Vercel Settings → Environment Variables')
  console.warn('\nDopo Vercel: redeploy per pickup.')
}

void main()
