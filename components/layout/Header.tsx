'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useThemeStore } from '@/lib/stores/themeStore'
import { DesktopNav } from './header/DesktopNav'
import { DesktopSearch } from './header/DesktopSearch'
import { MobileDrawer } from './header/MobileDrawer'
import { HeaderActions } from './header/HeaderActions'
import { HEADER_OUTER, HEADER_INNER, HAMBURGER, LOGO } from './header/styles'

export function Header() {
  const { ready, authenticated, user, login, logout } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header style={HEADER_OUTER}>
        <div style={HEADER_INNER}>
          <button
            className="flex md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Apri menu"
            style={HAMBURGER}
          >
            <Menu size={20} />
          </button>
          <Link href="/" style={LOGO}>
            Auktora
          </Link>
          <DesktopNav pathname={pathname} />
          <DesktopSearch />
          <div className="md:hidden" style={{ flex: 1 }} />
          <HeaderActions
            ready={ready}
            authenticated={authenticated}
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
            login={login}
            logout={logout}
            isDemo={isDemo}
            onDemoToggle={() => setIsDemo((v) => !v)}
          />
        </div>
      </header>
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
      />
    </>
  )
}
