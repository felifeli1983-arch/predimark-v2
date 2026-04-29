/**
 * Sprint 6.4.1 — Score Predimark + Tier assignment.
 *
 * Score formula (range 0-1000):
 *   - 30% volume weight (caps at $1M)
 *   - 30% win_rate weight (caps at 70%)
 *   - 20% follower_count weight (caps at 5000)
 *   - 20% earnings weight (caps at $50k)
 *
 * Tier assignment:
 *   - 800-1000: legend
 *   - 600-799: pro
 *   - 400-599: rising
 *   - 200-399: rookie
 *   - 0-199: newcomer
 */

interface CreatorMetrics {
  total_volume_copied?: number
  win_rate?: number
  followers_count?: number
  total_earnings?: number
}

export function computeCreatorScore(m: CreatorMetrics): number {
  const volume = Math.min(Number(m.total_volume_copied ?? 0) / 1_000_000, 1) // cap $1M
  const winRate = Math.min(Math.max(Number(m.win_rate ?? 0), 0), 0.7) / 0.7 // cap 70%
  const followers = Math.min(Number(m.followers_count ?? 0) / 5_000, 1) // cap 5k
  const earnings = Math.min(Number(m.total_earnings ?? 0) / 50_000, 1) // cap $50k

  const score = volume * 300 + winRate * 300 + followers * 200 + earnings * 200
  return Math.round(score)
}

export type CreatorTier = 'legend' | 'pro' | 'rising' | 'rookie' | 'newcomer'

export function computeCreatorTier(score: number): CreatorTier {
  if (score >= 800) return 'legend'
  if (score >= 600) return 'pro'
  if (score >= 400) return 'rising'
  if (score >= 200) return 'rookie'
  return 'newcomer'
}
