import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/copy-lint/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
})
