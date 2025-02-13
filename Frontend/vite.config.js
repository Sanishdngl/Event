import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: '/',
  server: {
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: command === 'serve' ? 'http://localhost:4001' : '/api',
        changeOrigin: true,
        secure: false,
        timeout: 30000
      },
      '/uploads': { 
        target: command === 'serve' ? 'http://localhost:4001' : '/uploads',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'recharts']
        }
      }
    }
  }
}))