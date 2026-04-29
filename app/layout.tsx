import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PrivyProvider } from '@/providers/PrivyProvider'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'
import { DemoModeBanner } from '@/components/layout/DemoModeBanner'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { WatchlistHydrator } from '@/components/WatchlistHydrator'
import { BalanceHydrator } from '@/components/BalanceHydrator'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://auktora.com'

export const metadata: Metadata = {
  title: {
    default: 'Auktora',
    template: '%s | Auktora',
  },
  description: 'Prediction markets platform — powered by Polymarket.',
  metadataBase: new URL(appUrl),
  openGraph: {
    title: 'Auktora',
    description: 'Prediction markets platform — powered by Polymarket.',
    url: appUrl,
    siteName: 'Auktora',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auktora',
    description: 'Prediction markets platform — powered by Polymarket.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Inline script che legge il theme dallo storage (`auktora-theme`) PRIMA
 * dell'hydration React e setta `data-theme` sul tag html. Evita il flash
 * dark→light (o viceversa) tra SSR e client mount.
 */
const themeBootstrap = `
(function(){
  try {
    var raw = localStorage.getItem('auktora-theme');
    if (!raw) return;
    var state = JSON.parse(raw);
    var theme = state && state.state && state.state.theme;
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (_) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={inter.variable}>
        <ReactQueryProvider>
          <PrivyProvider>
            <ThemeProvider>
              {/*
               * PWA App Shell — struttura rigida a schermo intero.
               * html + body = overflow:hidden (non scrollano mai).
               * Solo <main> scrolla — Header e BottomNav sono in flow, sempre visibili.
               * Nessun position:fixed → zero jank su mobile.
               */}
              <div
                style={{
                  height: '100dvh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  background: 'var(--color-bg-primary)',
                }}
              >
                <Header />
                <DemoModeBanner />
                <main
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {children}
                  <Footer />
                </main>
                <BottomNav />
                <WatchlistHydrator />
                <BalanceHydrator />
                <OnboardingModal />
              </div>
            </ThemeProvider>
          </PrivyProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
