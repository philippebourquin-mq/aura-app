export type CategoryId =
  | 'stranger-things'
  | 'mode-machine'
  | 'cash-sans-clash'
  | 'ya-quoi'
  | 'numero-10'
  | 'bonus'

export interface Category {
  id: CategoryId
  name: string
  tagline: string
  colorVar: string // tailwind color token, e.g. 'aura-strangerthings'
  hex: string
}

export interface Challenge {
  id: string
  categoryId: CategoryId
  title: string
  description: string
  points: number
  /** Created by the team from the "new" screen, rather than the physical card catalog. */
  custom?: boolean
}

export type JokerId = 'switch' | 'boomerang' | 'flemme'

export interface JokerDef {
  id: JokerId
  name: string
  effect: string
}

/** Who is using the app right now: the player, or someone validating/throwing challenges. */
export type Role = 'lucas' | 'team'

/** Who kicked off the current challenge run. */
export type RunOrigin = 'lucas' | 'team'

/**
 * Lifecycle of the single active challenge slot, per docs/ARCHITECTURE.md.
 *
 * 'received' only exists for team-thrown runs: a card has been sent, Lucas
 * hasn't decided yet. Jokers live here (Switch redraws and stays; Boomerang/
 * Flemme close the run for free — no point loss — since that's what a joker
 * is for; a bare decline closes it too but loses points).
 *
 * 'active' is the committed, running challenge — a real 24h clock, reached
 * either straight from a free pick or after accepting a received one.
 *
 * lucas flow:  (none) -> active -> (cleared: validated / gave-up / expired / not-validated)
 * team flow:   (none) -> received -> active -> (cleared, same outcomes + declined)
 */
export type RunStatus = 'received' | 'active'

export interface ChallengeRun {
  id: string
  origin: RunOrigin
  status: RunStatus
  categoryId: CategoryId
  challengeId: string
  createdAt: string
  /** Set once the run becomes 'active' — ISO timestamp, 24h out. */
  expiresAt?: string
}

/**
 * 'joker-out' (Boomerang/Flemme) costs nothing — that's the point of a joker.
 * Every other non-'validated' outcome subtracts the challenge's points (floored at 0).
 */
export type HistoryOutcome = 'validated' | 'declined' | 'joker-out' | 'gave-up' | 'expired' | 'not-validated'

export interface HistoryEntry {
  id: string
  origin: RunOrigin
  outcome: HistoryOutcome
  challengeId: string
  categoryId: CategoryId
  jokerUsed?: JokerId
  /** Points earned (positive) or lost (negative) by this entry. */
  pointsDelta: number
  bonus?: boolean
  at: string
}
