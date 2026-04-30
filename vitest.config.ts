import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load .env.local (and .env, .env.development, ecc.) into process.env
  // Senza questo, le NEXT_PUBLIC_* non sono disponibili nei test
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      globals: true,
      css: false,
      include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      exclude: ['node_modules', '.next', 'out', 'clob-client-v2-main/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        exclude: ['node_modules', '.next', 'vitest.setup.ts', '*.config.*'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  }
})
