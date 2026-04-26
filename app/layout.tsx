import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PrivyProvider } from '@/providers/PrivyProvider'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ReactQueryProvider>
          <PrivyProvider>
            <ThemeProvider>
              <Header />
              <main style={{ paddingBottom: '64px' }}>{children}</main>
              <BottomNav />
            </ThemeProvider>
          </PrivyProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
