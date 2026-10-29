import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/usuarios': { target: 'http://localhost:8080', changeOrigin: true },
      '/filiais': { target: 'http://localhost:8080', changeOrigin: true },
      '/contasBancarias': { target: 'http://localhost:8080', changeOrigin: true },
      '/operacoes': { target: 'http://localhost:8080', changeOrigin: true },
      '/dashboard/kpis': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
