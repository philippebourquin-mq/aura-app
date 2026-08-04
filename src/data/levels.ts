import { challenges } from './challenges'

export const TOTAL_POSSIBLE_POINTS = challenges.reduce((sum, c) => sum + c.points, 0)

export interface Level {
  name: string
  emoji: string
  minPoints: number
  blurb: string
}

export const levels: Level[] = [
  { name: "Graine d'Aura", emoji: '🌱', minPoints: 0, blurb: "Le tout début de l'aventure." },
  {
    name: 'Aura en éveil',
    emoji: '✨',
    minPoints: Math.round(TOTAL_POSSIBLE_POINTS * 0.15),
    blurb: 'Tu commences à sortir de ta zone de confort.',
  },
  {
    name: 'Aura confiante',
    emoji: '💪',
    minPoints: Math.round(TOTAL_POSSIBLE_POINTS * 0.35),
    blurb: 'Ça devient naturel.',
  },
  {
    name: 'Aura affirmée',
    emoji: '🔥',
    minPoints: Math.round(TOTAL_POSSIBLE_POINTS * 0.55),
    blurb: 'Tu assumes qui tu es.',
  },
  {
    name: 'Pleine Aura',
    emoji: '👑',
    minPoints: Math.round(TOTAL_POSSIBLE_POINTS * 0.8),
    blurb: "Le sommet. Rien ne t'arrête.",
  },
]

export function getLevelProgress(points: number) {
  let currentIndex = 0
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].minPoints) currentIndex = i
  }
  const current = levels[currentIndex]
  const next = levels[currentIndex + 1]
  const span = next ? next.minPoints - current.minPoints : 1
  const withinLevel = next ? points - current.minPoints : span
  const pct = next ? Math.min(100, Math.round((withinLevel / span) * 100)) : 100

  return { current, next, pct, isMax: !next }
}
