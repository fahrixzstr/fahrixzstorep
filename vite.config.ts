import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/fahrixzstorep/' : './',
  plugins: [
    react(),
    mode === 'development' ? inspectAttr() : null,
  ].filter(Boolean),
  resolve: { ... }
}))
