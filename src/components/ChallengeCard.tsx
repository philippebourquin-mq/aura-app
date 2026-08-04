import { Check } from 'lucide-react'
import type { Challenge } from '../types'
import { categoryById } from '../data/categories'
import { categoryIcons } from '../lib/categoryIcons'

interface Props {
  challenge: Challenge
  validated?: boolean
  className?: string
}

/** Full-size card, proportioned like the physical poker-format cards (63x90mm). */
export function ChallengeCard({ challenge, validated = false, className = '' }: Props) {
  const category = categoryById(challenge.categoryId)
  if (!category) return null

  const Icon = categoryIcons[challenge.categoryId]

  return (
    <div
      className={`relative flex aspect-[63/90] w-64 flex-col overflow-hidden rounded-[1.75rem] border-2 border-black/10 bg-cream shadow-[0_14px_34px_-10px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-neutral-900 ${
        validated ? 'grayscale' : ''
      } ${className}`}
    >
      {validated && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold text-cream shadow-md">
          <Check size={12} /> validé
        </div>
      )}
      <div
        className="flex items-start justify-between px-5 pb-4 pt-5"
        style={{ backgroundColor: category.hex }}
      >
        <div>
          <p className="font-rounded text-[11px] font-semibold uppercase tracking-wide text-black/80">
            {category.name}
          </p>
          <h3 className="font-display mt-1 text-lg leading-tight text-black">
            {challenge.title}
          </h3>
        </div>
        <Icon size={20} className="mt-1 flex-shrink-0 text-black/70" />
      </div>

      <div className="flex flex-1 flex-col justify-between px-5 py-4">
        <p className="font-rounded text-sm leading-relaxed text-black/80 dark:text-cream/80">
          {challenge.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-rounded text-[10px] tracking-[0.35em] text-black/20 dark:text-cream/20">
            AURA
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-black"
            style={{ backgroundColor: category.hex }}
          >
            +{challenge.points}
          </span>
        </div>
      </div>
    </div>
  )
}
