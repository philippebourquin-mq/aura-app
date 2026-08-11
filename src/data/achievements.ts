import { Rocket, Star, Trophy, Waves, type LucideIcon } from 'lucide-react'
import { categories } from './categories'
import { challenges, challengesByCategory } from './challenges'
import { categoryIcons } from '../lib/categoryIcons'
import type { GameState } from '../state/useGameState'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: LucideIcon
  /** Category color for category-specific badges — generic badges default to solid black. */
  hex?: string
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
    icon: Rocket,
    isUnlocked: (state) => validatedCount(state) >= 1,
  },
  ...categories.map((category) => ({
    id: `category-complete-${category.id}`,
    name: `Maître ${category.name}`,
    description: `Valide tous les défis de la catégorie « ${category.name} ».`,
    icon: categoryIcons[category.id],
    hex: category.hex,
    isUnlocked: (state: GameState) => {
      const total = challengesByCategory(category.id).length
      return total > 0 && validatedCount(state, category.id) === total
    },
  })),
  {
    id: 'halfway',
    name: 'Mi-parcours',
    description: 'Valide la moitié des défis du jeu.',
    icon: Star,
    isUnlocked: (state) => validatedCount(state) >= Math.ceil(challenges.length / 2),
  },
  {
    id: 'full-aura',
    name: "Pleine Aura",
    description: 'Valide tous les défis du jeu.',
    icon: Trophy,
    isUnlocked: (state) => validatedCount(state) === challenges.length,
  },
  {
    id: 'perseverant',
    name: 'Persévérant',
    description: "Tente 5 défis — validés ou non, l'important c'est d'essayer.",
    icon: Waves,
    isUnlocked: (state) => state.history.length >= 5,
  },
]
