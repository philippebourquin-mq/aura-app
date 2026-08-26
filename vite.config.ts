import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two deployments come out of this one project: `--mode lucas` builds the player's app
// at the site root; `--mode team` builds the Team app into a `team/` subfolder of the
// same `dist/`, so both end up on the same GitHub Pages origin (and therefore share
// localStorage) without a second repo or workflow.
export default defineConfig(({ mode }) => ({
  base: mode === 'team' ? '/aura-app/team/' : '/aura-app/',
  build: {
    outDir: mode === 'team' ? 'dist/team' : 'dist',
    emptyOutDir: true,
  },
  plugins: [react()],
}))
