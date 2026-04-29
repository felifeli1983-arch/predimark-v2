'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeStore } from '@/lib/stores/themeStore'

/**
 * Sprint 5.4.1 — Routes /me/demo/* parallele.
 * Implementazione pragmatica: ogni `/me/demo/*` setta isDemo=true nel themeStore
 * e redirect a `/me/*` corrispondente. Il flag is_demo nel themeStore controlla
 * tutte le query (positions, history, wallet, stats) che già filtrano per is_demo.
 *
 * NB: questa pattern evita duplicazione di routes mantenendo equivalenza funzionale
 * con `/me/demo/positions` → `/me/positions` (con isDemo=true forzato).
 */
export default function MeDemoPage() {
  const router = useRouter()
  const setIsDemo = useThemeStore((s) => s.setIsDemo)

  useEffect(() => {
    setIsDemo(true)
    router.replace('/me/positions')
  }, [router, setIsDemo])

  return null
}
