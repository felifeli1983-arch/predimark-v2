import type { MetadataRoute } from 'next'

/**
 * Sprint 8.4.x — PWA setup base.
 * Manifest per install prompt + branded splash su iOS/Android.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Auktora',
    short_name: 'Auktora',
    description: 'Prediction markets platform — powered by Polymarket',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#00E5FF',
    orientation: 'portrait',
    scope: '/',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
