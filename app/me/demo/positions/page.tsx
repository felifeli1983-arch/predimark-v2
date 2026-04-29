'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeStore } from '@/lib/stores/themeStore'

export default function MeDemoPositionsPage() {
  const router = useRouter()
  const setIsDemo = useThemeStore((s) => s.setIsDemo)
  useEffect(() => {
    setIsDemo(true)
    router.replace('/me/positions')
  }, [router, setIsDemo])
  return null
}
