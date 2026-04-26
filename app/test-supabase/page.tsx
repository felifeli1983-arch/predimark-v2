'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [info, setInfo] = useState<string>('')

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data, error } = await supabase.from('achievements').select('id, name').limit(3)

        if (error) throw error

        setStatus('ok')
        setInfo(JSON.stringify(data, null, 2))
      } catch (err) {
        setStatus('error')
        setInfo(err instanceof Error ? err.message : String(err))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Test Supabase — connessione
      </h1>

      <div className="space-y-4">
        <div style={{ color: 'var(--color-text-secondary)' }}>
          Status:{' '}
          <span
            style={{
              color:
                status === 'ok'
                  ? 'var(--color-success)'
                  : status === 'error'
                    ? 'var(--color-danger)'
                    : 'var(--color-warning)',
            }}
          >
            {status}
          </span>
        </div>

        <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
          URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
        </div>

        {info && (
          <div className="p-4 rounded" style={{ background: 'var(--color-bg-secondary)' }}>
            <pre style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>{info}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
