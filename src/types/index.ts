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

export type ChallengeStatus =
  | 'todo' // not drawn / not attempted yet
  | 'pending' // marked done by the player, awaiting validation
  | 'validated' // approved by a parent
  | 'rejected' // put back in the deck

export type JokerId = 'switch' | 'boomerang' | 'flemme'

export interface JokerDef {
  id: JokerId
  name: string
  effect: string
}
