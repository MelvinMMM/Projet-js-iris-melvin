import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss({
      // Disable Lightning CSS optimization
      optimize: false,
    }),
  ],
})