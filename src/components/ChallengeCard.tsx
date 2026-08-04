import { motion } from 'framer-motion'
import type { Challenge } from '../types'
import { categoryById } from '../data/categories'
import { categoryIcons } from '../lib/categoryIcons'
import { CheckCircle2, Clock3 } from 'lucide-react'

export type ChallengeCardBadge = 'submitted' | 'validated' | null

interface Props {
  challenge: Challenge
  badge?: ChallengeCardBadge
  actionLabel?: string
  onAction?: () => void
}

const badgeMap: Record<Exclude<ChallengeCardBadge, null>, { label: string; icon: React.ReactNode }> = {
  submitted: { label: 'à valider', icon: <Clock3 size={14} /> },
  validated: { label: 'validé', icon: <CheckCircle2 size={14} /> },
}

export function ChallengeCard({ challenge, badge = null, actionLabel, onAction }: Props) {
  const category = categoryById(challenge.categoryId)
  if (!category) return null

  const Icon = categoryIcons[challenge.categoryId]

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-card border border-black/10 bg-cream shadow-lg shadow-black/5 dark:border-white/10 dark:bg-neutral-900">
      <div
        className="flex items-start justify-between px-5 py-4"
        style={{ backgroundColor: category.hex }}
      >
        <div>
          <p className="font-rounded text-xs font-semibold uppercase tracking-wide text-black/80">
            {category.name}
          </p>
          <h3 className="font-display mt-1 text-xl leading-tight text-black">
            {challenge.title}
          </h3>
        </div>
        <Icon size={22} className="mt-1 flex-shrink-0 text-black/70" />
      </div>

      <div className="px-5 py-5">
        <p className="font-rounded text-sm leading-relaxed text-black/80 dark:text-cream/80">
          {challenge.description}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="font-rounded text-xs tracking-[0.3em] text-black/20 dark:text-cream/20">
            AURA
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-black"
            style={{ backgroundColor: category.hex }}
          >
            +{challenge.points}
          </span>
        </div>

        {badge && (
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-black/60 dark:text-cream/60">
            {badgeMap[badge].icon}
            {badgeMap[badge].label}
          </div>
        )}

        {onAction && actionLabel && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className="mt-4 w-full rounded-full bg-black py-2.5 text-sm font-semibold text-cream transition hover:bg-black/80"
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
    </div>
  )
}
