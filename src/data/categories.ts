import type { Category, JokerDef } from '../types'

export const categories: Category[] = [
  {
    id: 'stranger-things',
    name: 'stranger things',
    tagline: 'dépasser la gêne de parler aux inconnus',
    colorVar: 'aura-strangerthings',
    hex: '#F0501E',
  },
  {
    id: 'mode-machine',
    name: 'mode machine',
    tagline: 'se sentir fier de ses capacités physiques',
    colorVar: 'aura-modemachine',
    hex: '#0F7EA3',
  },
  {
    id: 'cash-sans-clash',
    name: 'cash sans clash',
    tagline: 'affirmer ses goûts, faire ses propres choix',
    colorVar: 'aura-cashsansclash',
    hex: '#F2C230',
  },
  {
    id: 'ya-quoi',
    name: 'ya quoi ?',
    tagline: "ne pas se cacher, être remarqué, s'afficher",
    colorVar: 'aura-yaquoi',
    hex: '#9C4F9C',
  },
  {
    id: 'numero-10',
    name: 'numero 10',
    tagline: 'prendre le lead, décider pour le groupe',
    colorVar: 'aura-numero10',
    hex: '#2CA6A0',
  },
  {
    id: 'bonus',
    name: 'bonus',
    tagline: 'défis transverses, hors catégorie',
    colorVar: 'aura-bonus',
    hex: '#C7A06E',
  },
]

export const categoryById = (id: string) =>
  categories.find((c) => c.id === id)

/** The physical joker cards' signature blue-grey — distinct from every category color. */
export const JOKER_HEX = '#8CACB6'

export const jokers: JokerDef[] = [
  {
    id: 'switch',
    name: 'Switch',
    effect: 'Ce défi ne te tente pas ? Pioche une autre carte de la même catégorie.',
  },
  {
    id: 'boomerang',
    name: 'Boomerang',
    effect: "Ce défi ne sera pas pour toi. Refile-le à un membre de ta team, qui le fera à ta place !",
  },
  {
    id: 'flemme',
    name: 'Flemme',
    effect: 'Pas la motivation... Ce défi attendra demain.',
  },
]
