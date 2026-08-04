import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { categories } from '../data/categories'
import { categoryIcons } from '../lib/categoryIcons'
import { availableChallenges } from '../state/useGameState'
import type { CategoryId } from '../types'

interface Props {
  validatedChallengeIds: string[]
  /** Lock the picker to a single category (used when the team assigns a card within Lucas's chosen theme). */
  lockedCategoryId?: CategoryId
  onPick: (challengeId: string) => void
}

export function ChallengePicker({ validatedChallengeIds, lockedCategoryId, onPick }: Props) {
  const [filter, setFilter] = useState<CategoryId | 'all'>(lockedCategoryId ?? 'all')

  const pool = useMemo(() => {
    const all = availableChallenges(validatedChallengeIds)
    const byCategory = lockedCategoryId
      ? all.filter((c) => c.categoryId === lockedCategoryId)
      : filter === 'all'
        ? all
        : all.filter((c) => c.categoryId === filter)
    return byCategory
  }, [validatedChallengeIds, lockedCategoryId, filter])

  return (
    <div>
      {!lockedCategoryId && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`font-rounded rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === 'all'
                ? 'border-black bg-black text-cream'
                : 'border-black/20 text-black/60 hover:bg-black/5 dark:border-white/20 dark:text-cream/60 dark:hover:bg-white/10'
            }`}
          >
            Toutes
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`font-rounded rounded-full border px-3 py-1 text-xs font-semibold transition ${
                filter === c.id
                  ? 'text-black'
                  : 'border-black/20 text-black/60 hover:bg-black/5 dark:border-white/20 dark:text-cream/60 dark:hover:bg-white/10'
              }`}
              style={filter === c.id ? { backgroundColor: c.hex, borderColor: c.hex } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {pool.length === 0 ? (
        <p className="font-rounded py-8 text-center text-sm text-black/50 dark:text-cream/50">
          Plus aucun défi disponible ici. 🎉
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {pool.map((challenge, i) => {
            const category = categories.find((c) => c.id === challenge.categoryId)!
            const Icon = categoryIcons[challenge.categoryId]
            return (
              <motion.button
                key={challenge.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onPick(challenge.id)}
                className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: category.hex }}
                >
                  <Icon size={16} className="text-black/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-rounded truncate text-sm font-semibold text-black dark:text-cream">
                    {challenge.title}
                  </p>
                  <p className="font-rounded truncate text-xs text-black/40 dark:text-cream/40">
                    {category.name}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-black"
                  style={{ backgroundColor: category.hex }}
                >
                  +{challenge.points}
                </span>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
