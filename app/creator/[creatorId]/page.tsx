import { notFound } from 'next/navigation'
import { MessageCircle, Globe, AtSign } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { FollowButton } from '@/components/creator/FollowButton'

interface Props {
  params: Promise<{ creatorId: string }>
}

export default async function CreatorProfilePage({ params }: Props) {
  const { creatorId } = await params
  const supabase = createAdminClient()
  const { data: creator, error } = await supabase
    .from('creators')
    .select(
      'user_id, score, tier, followers_count, copiers_active, total_earnings, bio_creator, website_url, twitter_handle, discord_handle, specialization, show_positions, show_history, verified_at, is_verified, is_public, is_suspended'
    )
    .eq('user_id', creatorId)
    .maybeSingle()

  if (error || !creator || !creator.is_verified || creator.is_suspended || !creator.is_public) {
    notFound()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-cta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 'var(--font-2xl)',
            }}
          >
            {(creator.twitter_handle ?? creator.user_id).slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'var(--font-xl)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                {creator.twitter_handle
                  ? `@${creator.twitter_handle}`
                  : creator.user_id.slice(0, 8)}
              </h1>
              <span
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  background: 'color-mix(in srgb, var(--color-cta) 16%, transparent)',
                  color: 'var(--color-cta)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
              >
                VERIFIED CREATOR
              </span>
              {creator.tier && (
                <span
                  style={{
                    fontSize: 9,
                    padding: '2px 6px',
                    background: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}
                >
                  {creator.tier.toUpperCase()}
                </span>
              )}
            </div>
            {creator.bio_creator && (
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 'var(--font-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {creator.bio_creator}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {creator.twitter_handle && (
                <a
                  href={`https://twitter.com/${creator.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLink}
                >
                  <AtSign size={12} /> {creator.twitter_handle}
                </a>
              )}
              {creator.discord_handle && (
                <span style={socialLink}>
                  <MessageCircle size={12} /> {creator.discord_handle}
                </span>
              )}
              {creator.website_url && (
                <a
                  href={creator.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLink}
                >
                  <Globe size={12} /> {creator.website_url.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
          <FollowButton targetType="creator" targetId={creator.user_id} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'var(--space-2)',
          }}
        >
          <Stat label="Followers" value={creator.followers_count ?? 0} />
          <Stat label="Copiers attivi" value={creator.copiers_active ?? 0} />
          <Stat
            label="Earnings totali"
            value={`$${(creator.total_earnings ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          />
          <Stat label="Score" value={creator.score ?? '—'} />
        </div>

        {creator.specialization && creator.specialization.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {creator.specialization.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 'var(--font-xs)',
                  padding: '2px 8px',
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        Posizioni e storico trade saranno disponibili in MA6 — copy trading.
        {creator.show_positions === false &&
          ' (Questo Creator ha disabilitato la visibilità delle posizioni)'}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 'var(--space-2)',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-md)',
          color: 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}

const socialLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 'var(--font-xs)',
  color: 'var(--color-text-muted)',
  textDecoration: 'none',
}
