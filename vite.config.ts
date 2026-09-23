import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  // The API sends no CORS headers, so a browser cannot call it directly from
  // localhost. When VITE_DEV_API_TARGET is set, the dev server proxies
  // /api/* to it and VITE_API_BASE_URL stays a relative path.
  const devApiTarget = env.VITE_DEV_API_TARGET

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': '/src' },
    },
    server: devApiTarget
      ? { proxy: { '/api': { target: devApiTarget, changeOrigin: true, secure: true } } }
      : undefined,
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})
