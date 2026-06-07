import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // В dev режиме Vite проксирует эти пути на бэк
    // В production это делает Nginx
    proxy: {
      '/categories': 'http://localhost:3000',
      '/questions': 'http://localhost:3000',
      '/answers': 'http://localhost:3000',
      '/sessions': 'http://localhost:3000',
      '/mock': 'http://localhost:3000',
    }
  }
})