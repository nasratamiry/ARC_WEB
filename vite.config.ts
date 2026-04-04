import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Auth API (users app) lives on a different server in dev.
      '/api/auth': {
        target: 'http://167.86.71.135:8000',
        changeOrigin: true,
      },
      '/api': {
        // Keep all non-auth API routes on the same reachable backend host in dev.
        target: 'http://167.86.71.135:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://167.86.71.135:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://167.86.71.135:8000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
