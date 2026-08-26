import type { Role } from '../types'

/**
 * Set at build time (VITE_APP_ROLE, via `npm run build` vs `npm run build:team`) so the
 * Lucas and Team deployments are each locked to their own side — no in-app switcher,
 * no way to accidentally land on the wrong role. Unset in dev, where the switcher still
 * works so both sides stay easy to test from one browser.
 */
const raw = import.meta.env.VITE_APP_ROLE
export const LOCKED_ROLE: Role | null = raw === 'lucas' || raw === 'team' ? raw : null
