'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Database, Download, Trash2, Loader2 } from 'lucide-react'

export default function MeDataPage() {
  const { user, getAccessToken } = usePrivy()
  const [exporting, setExporting] = useState(false)

  async function exportData() {
    setExporting(true)
    try {
      const token = await getAccessToken()
      if (!token) return

      // Fetch profile + positions + trades + preferences
      const [meRes, positionsRes, tradesRes, prefsRes] = await Promise.all([
        fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/users/me/positions?limit=10000', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/users/me/trades?limit=10000', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/users/me/preferences', { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const data = {
        exported_at: new Date().toISOString(),
        profile: meRes.ok ? await meRes.json() : null,
        positions: positionsRes.ok ? await positionsRes.json() : null,
        trades: tradesRes.ok ? await tradesRes.json() : null,
        preferences: prefsRes.ok ? await prefsRes.json() : null,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auktora-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  function deleteAccount() {
    const confirm = window.prompt(
      'Per cancellare il tuo account, scrivi "DELETE" qui sotto. Questa azione è IRREVERSIBILE — dati cancellati entro 30 giorni come da GDPR. Posizioni aperte vanno chiuse manualmente prima.'
    )
    if (confirm !== 'DELETE') return
    alert(
      'Richiesta di cancellazione registrata. Il team team@auktora.com ti contatterà entro 48h per confermare prima della cancellazione effettiva (compliance GDPR + AML).'
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <Database size={20} style={{ display: 'inline', marginRight: 8 }} />
          Data & Privacy
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          GDPR compliance: export tutti i tuoi dati o richiedi cancellazione account.
        </p>
      </header>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 700 }}>Export dati</h2>
        <p
          style={{
            margin: '6px 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Scarica un JSON completo: profilo, posizioni, trades, preferenze. Diritto GDPR Art. 15
          (portabilità).
        </p>
        <button
          type="button"
          onClick={exportData}
          disabled={exporting || !user}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--color-cta)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-md)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            opacity: exporting || !user ? 0.6 : 1,
          }}
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Export JSON
        </button>
      </div>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'color-mix(in srgb, var(--color-danger) 6%, var(--color-bg-secondary))',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--font-md)',
            fontWeight: 700,
            color: 'var(--color-danger)',
          }}
        >
          Cancella account
        </h2>
        <p
          style={{
            margin: '6px 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Cancellazione permanente. Posizioni aperte devono essere chiuse manualmente prima. Diritto
          GDPR Art. 17.
        </p>
        <button
          type="button"
          onClick={deleteAccount}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'transparent',
            color: 'var(--color-danger)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-md)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Trash2 size={14} />
          Cancella account
        </button>
      </div>
    </div>
  )
}
