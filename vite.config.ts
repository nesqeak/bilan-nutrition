import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le site fonctionne aussi bien à la racine que sous /bilan-nutrition/ (GitHub Pages).
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    // AI Studio désactive le HMR (variable DISABLE_HMR) pour éviter le scintillement
    // pendant les modifications de l'agent. Ne pas modifier.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {}
  }
});
