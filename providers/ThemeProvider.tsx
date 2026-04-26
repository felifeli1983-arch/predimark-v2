'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/stores/themeStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, animationsEnabled } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    if (animationsEnabled) {
      root.classList.remove('no-animations')
    } else {
      root.classList.add('no-animations')
    }
  }, [theme, animationsEnabled])

  return <>{children}</>
}
