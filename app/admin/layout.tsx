'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2 } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopBar } from '@/components/admin/AdminTopBar'

// Tutte le admin page richiedono auth + Privy hooks → no SSG prerender.
export const dynamic = 'force-dynamic'

interface AdminMe {
  role: 'super_admin' | 'admin' | 'moderator' | 'viewer'
  user_id: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, getAccessToken } = usePrivy()
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminMe | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      router.replace('/login')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) throw new Error('No token')
        const res = await fetch('/api/v1/admin/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 404 || res.status === 403) {
          router.replace('/')
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as AdminMe
        if (!cancelled) setAdmin(data)
      } catch {
        router.replace('/')
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken, router])

  if (!ready || checking) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    )
  }

  if (!admin) return null

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AdminTopBar role={admin.role} email={user?.email?.address ?? user?.wallet?.address} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <AdminSidebar />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-4)',
            background: 'var(--color-bg-primary)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
