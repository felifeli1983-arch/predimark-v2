import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  animationsEnabled: boolean
  /** REAL = trading reale, DEMO = paper money */
  isDemo: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setAnimationsEnabled: (enabled: boolean) => void
  setIsDemo: (v: boolean) => void
  toggleDemo: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      animationsEnabled: true,
      isDemo: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      setIsDemo: (v) => set({ isDemo: v }),
      toggleDemo: () => set({ isDemo: !get().isDemo }),
    }),
    {
      name: 'auktora-theme',
    }
  )
)
