import { categories } from './categories'
import { challenges, challengesByCategory } from './challenges'
import type { GameState } from '../state/useGameState'

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  isUnlocked: (state: GameState) => boolean
}

function validatedCount(state: GameState, categoryId?: string) {
  const pool = categoryId ? challengesByCategory(categoryId) : challenges
  return pool.filter((c) => state.validatedChallengeIds.includes(c.id)).length
}

export const achievements: Achievement[] = [
  {
    id: 'first-step',
    name: 'Premier pas',
    description: 'Valide ton premier défi.',
    emoji: '🚀',
    isUnlocked: (state) => validatedCount(state) >= 1,
  },
  ...categories.map((category) => ({
    id: `category-complete-${category.id}`,
    name: `Maître ${category.name}`,
    description: `Valide tous les défis de la catégorie « ${category.name} ».`,
    emoji: '🏅',
    isUnlocked: (state: GameState) => {
      const total = challengesByCategory(category.id).length
      return total > 0 && validatedCount(state, category.id) === total
    },
  })),
  {
    id: 'halfway',
    name: 'Mi-parcours',
    description: 'Valide la moitié des défis du jeu.',
    emoji: '⭐',
    isUnlocked: (state) => validatedCount(state) >= Math.ceil(challenges.length / 2),
  },
  {
    id: 'full-aura',
    name: "Pleine Aura",
    description: 'Valide tous les défis du jeu.',
    emoji: '👑',
    isUnlocked: (state) => validatedCount(state) === challenges.length,
  },
]
