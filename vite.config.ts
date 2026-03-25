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
        target: 'http://192.168.0.106:8000',
        changeOrigin: true,
      },
    },
  },
})
