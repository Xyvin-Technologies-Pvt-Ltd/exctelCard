import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['base64-js'],
    esbuildOptions: {
      resolveExtensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
    },
  },
  resolve: {
    dedupe: ['base64-js'],
  },
  build: {
    commonjsOptions: {
      include: [/base64-js/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
