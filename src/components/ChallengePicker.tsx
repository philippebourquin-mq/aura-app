import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from '../data/categories'
import { availableChallenges } from '../state/useGameState'
import { SwipeDeck } from './SwipeDeck'
import type { CategoryId } from '../types'

interface Props {
  validatedChallengeIds: string[]
  /** Lock the picker to a single category (used when the team assigns a card within Lucas's chosen theme). */
  lockedCategoryId?: CategoryId
  onPick: (challengeId: string) => void
}

export function ChallengePicker({ validatedChallengeIds, lockedCategoryId, onPick }: Props) {
  const [filter, setFilter] = useState<CategoryId | 'all'>(lockedCategoryId ?? 'all')
  const [index, setIndex] = useState(0)

  const pool = useMemo(() => {
    const all = availableChallenges(validatedChallengeIds)
    if (lockedCategoryId) return all.filter((c) => c.categoryId === lockedCategoryId)
    return filter === 'all' ? all : all.filter((c) => c.categoryId === filter)
  }, [validatedChallengeIds, lockedCategoryId, filter])

  useEffect(() => setIndex(0), [pool])

  const current = pool[index]

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
        <>
          <SwipeDeck pool={pool} index={index} onIndexChange={setIndex} />

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="rounded-full border border-black/10 p-2 text-black/50 transition hover:bg-black/5 disabled:opacity-30 dark:border-white/10 dark:text-cream/50 dark:hover:bg-white/10"
              aria-label="Carte précédente"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-rounded text-xs text-black/40 dark:text-cream/40">
              {index + 1} / {pool.length}
            </span>
            <button
              onClick={() => setIndex((i) => Math.min(pool.length - 1, i + 1))}
              disabled={index === pool.length - 1}
              className="rounded-full border border-black/10 p-2 text-black/50 transition hover:bg-black/5 disabled:opacity-30 dark:border-white/10 dark:text-cream/50 dark:hover:bg-white/10"
              aria-label="Carte suivante"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {current && (
            <motion.button
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onPick(current.id)}
              className="font-rounded sticky bottom-4 z-20 mx-auto mt-5 block w-full max-w-xs rounded-full bg-black py-3 text-sm font-semibold text-cream shadow-xl transition hover:bg-black/80"
            >
              Choisir « {current.title} » · +{current.points}
            </motion.button>
          )}
        </>
      )}
    </div>
  )
}
