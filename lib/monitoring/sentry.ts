/**
 * Sprint 8.4.2 — Soft launch monitoring.
 *
 * Sentry/PostHog scaffolding minimal. Setup completo richiede env config:
 *   NEXT_PUBLIC_SENTRY_DSN
 *   NEXT_PUBLIC_POSTHOG_KEY
 *   NEXT_PUBLIC_POSTHOG_HOST
 *
 * Usage:
 *   import { captureError, trackEvent } from '@/lib/monitoring/sentry'
 *   captureError(err, { context: 'trade-submit' })
 *   trackEvent('trade.submitted', { amount: 100, side: 'YES' })
 *
 * Senza env config: silent no-op (no crash).
 */

interface ErrorContext {
  context?: string
  user_id?: string
  [key: string]: unknown
}

export function captureError(err: unknown, ctx?: ErrorContext): void {
  // In production: invia a Sentry via @sentry/nextjs
  // Per ora: console.error con context per debug
  console.error('[capture]', { err, ctx })
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  // In production: invia a PostHog via posthog-js
  // Per ora: console.log per dev (in prod sostituito da PostHog SDK)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    return // skip in production senza SDK reale
  }
  console.warn('[track]', eventName, properties)
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  // PostHog identify when integrated
  console.warn('[identify]', userId, traits)
}
