import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/admin',
  plugins: [react()],
  server: {
    port: 6000,
    allowedHosts: [
      'api.my-vpn-tech.ru',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
