/**
 * Indirizzi contract Polymarket V2 — fonte ufficiale:
 * https://docs.polymarket.com/resources/contracts (verificato 2026-04-28).
 *
 * L'SDK `@polymarket/clob-client-v2@1.0.2` ha già hardcoded `MATIC_CONTRACTS`
 * con la maggior parte; teniamo qui i valori extra (Onramp/Offramp/Permissioned)
 * non esposti dall'SDK.
 */

export const POLYGON_V2 = {
  /** ERC-20 pUSD proxy (collateral V2). Decimals = 6. */
  pusdToken: '0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB',
  /** Implementation pUSD (per upgrade tracking). */
  pusdImpl: '0x6bBCef9f7ef3B6C592c99e0f206a0DE94Ad0925f',
  /** Wrap USDC.e → pUSD (`wrap(uint256 amount)`). */
  collateralOnramp: '0x93070a847efEf7F70739046A929D47a521F5B8ee',
  /** Unwrap pUSD → USDC.e. */
  collateralOfframp: '0x2957922Eb93258b93368531d39fAcCA3B4dC5854',
  /** Exchange standard V2 (EIP-712 verifyingContract). */
  exchangeStandard: '0xE111180000d2663C0091e4f400237545B87B996B',
  /** Exchange neg-risk V2. */
  exchangeNegRisk: '0xe2222d279d744050d28e00520010520000310F59',
  /** Adapter neg-risk. */
  negRiskAdapter: '0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296',
  /** Conditional Tokens Framework (Polygon mainnet). */
  conditionalTokens: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
  /** Permissioned Onramp (per builder/relayer flows). */
  permissionedRamp: '0xebC2459Ec962869ca4c0bd1E06368272732BCb08',
  /** Adapter ERC-1155 ↔ ERC-20 collateral. */
  ctfCollateralAdapter: '0xADa100874d00e3331D00F2007a9c336a65009718',
  /** Adapter ERC-1155 ↔ ERC-20 collateral neg-risk. */
  negRiskCtfCollateralAdapter: '0xAdA200001000ef00D07553cEE7006808F895c6F1',
} as const

/** Decimals di pUSD (uguali a USDC.e). */
export const PUSD_DECIMALS = 6
