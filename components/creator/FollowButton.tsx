'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Plus, Check, Loader2 } from 'lucide-react'

interface Props {
  targetType: 'creator' | 'external'
  targetId: string
  initialFollowing?: boolean
  onChange?: (following: boolean) => void
}

export function FollowButton({ targetType, targetId, initialFollowing = false, onChange }: Props) {
  const { authenticated, login, getAccessToken } = usePrivy()
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (!authenticated) {
      login()
      return
    }
    setBusy(true)
    const optimistic = !following
    setFollowing(optimistic)
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Sessione scaduta')
      const body = targetType === 'creator' ? { creator_id: targetId } : { external_id: targetId }
      const res = await fetch('/api/v1/follows', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { following?: boolean }
      const realFollowing = data.following ?? optimistic
      setFollowing(realFollowing)
      onChange?.(realFollowing)
    } catch (err) {
      console.error('[follow]', err)
      setFollowing(!optimistic)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={following ? 'Smetti di seguire' : 'Segui'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 'var(--space-1) var(--space-3)',
        background: following ? 'var(--color-bg-tertiary)' : 'var(--color-cta)',
        color: following ? 'var(--color-text-primary)' : '#fff',
        border: following ? '1px solid var(--color-border-subtle)' : 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-sm)',
        fontWeight: 600,
        cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.7 : 1,
      }}
    >
      {busy ? (
        <Loader2 size={12} className="animate-spin" />
      ) : following ? (
        <>
          <Check size={12} /> Segui
        </>
      ) : (
        <>
          <Plus size={12} /> Segui
        </>
      )}
    </button>
  )
}
