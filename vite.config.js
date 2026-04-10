import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Projet-js-iris-melvin/',
  plugins: [
    tailwindcss({
      // Disable Lightning CSS optimization
      optimize: false,
    }),
  ],
})