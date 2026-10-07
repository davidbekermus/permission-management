import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      usePolling: process.env.DOCKER_DEV === 'true',
    },
    proxy: {
      '/auth': apiProxyTarget,
      '/users': apiProxyTarget,
      '/role-submissions': apiProxyTarget,
      '/store': apiProxyTarget,
      '/products': apiProxyTarget,
    },
  },
})
