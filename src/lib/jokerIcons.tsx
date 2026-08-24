import { Moon, Repeat2, Shuffle, type LucideIcon } from 'lucide-react'
import type { JokerId } from '../types'

export const jokerIcons: Record<JokerId, LucideIcon> = {
  switch: Shuffle,
  boomerang: Repeat2,
  flemme: Moon,
}

export const jokerOutcomeCopy: Record<JokerId, { title: string; blurb: string }> = {
  switch: { title: 'Nouvelle carte piochée', blurb: "Regarde ce que le sort t'a donné cette fois." },
  boomerang: { title: 'Boomerang joué', blurb: 'Ce défi est confié à ta team — à eux de le relever.' },
  flemme: { title: 'Flemme jouée', blurb: 'Pas grave. Ce défi attendra un autre jour.' },
}
