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
 * Lifecycle of the single active challenge slot.
 *
 * lucas flow:  (none) -> in-progress -> submitted -> (cleared, validated/rejected)
 * team flow:   (none) -> awaiting-category -> awaiting-card -> in-progress -> submitted -> (cleared)
 */
export type RunStatus = 'awaiting-category' | 'awaiting-card' | 'in-progress' | 'submitted'

export interface ChallengeRun {
  id: string
  origin: RunOrigin
  status: RunStatus
  categoryId?: CategoryId
  challengeId?: string
  createdAt: string
  submittedAt?: string
}

export type HistoryOutcome = 'validated' | 'rejected' | 'skipped'

export interface HistoryEntry {
  id: string
  origin: RunOrigin
  outcome: HistoryOutcome
  challengeId?: string
  categoryId?: CategoryId
  jokerUsed?: JokerId
  points?: number
  at: string
}
