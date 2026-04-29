'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeStore } from '@/lib/stores/themeStore'

export default function MeDemoWalletPage() {
  const router = useRouter()
  const setIsDemo = useThemeStore((s) => s.setIsDemo)
  useEffect(() => {
    setIsDemo(true)
    router.replace('/me/wallet')
  }, [router, setIsDemo])
  return null
}
