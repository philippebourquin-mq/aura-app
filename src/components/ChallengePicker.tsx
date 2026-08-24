import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from '../data/categories'
import { challenges } from '../data/challenges'
import { SwipeDeck } from './SwipeDeck'
import type { CategoryId, Challenge } from '../types'

interface Props {
  validatedChallengeIds: string[]
  /** Team-created cards, merged into the same deck as the physical catalog. */
  customChallenges?: Challenge[]
  onPick: (challengeId: string) => void
}

export function ChallengePicker({ validatedChallengeIds, customChallenges = [], onPick }: Props) {
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const [index, setIndex] = useState(0)

  const allChallenges = useMemo(() => [...challenges, ...customChallenges], [customChallenges])

  const pool = useMemo(
    () => (filter === 'all' ? allChallenges : allChallenges.filter((c) => c.categoryId === filter)),
    [filter, allChallenges],
  )

  useEffect(() => setIndex(0), [pool])

  const current = pool[index]
  const currentIsValidated = current ? validatedChallengeIds.includes(current.id) : false

  return (
    <div>
      <p className="font-rounded mb-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-black/35 dark:text-cream/35">
        Filtrer par catégorie
      </p>
      <div className="mb-10 flex flex-wrap justify-center gap-3.5">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setFilter('all')}
          aria-label="Toutes les catégories"
          title="Toutes"
          className="relative h-7 w-7 flex-shrink-0 rounded-full bg-black ring-1 ring-black/10 dark:ring-white/20"
        >
          {filter === 'all' && (
            <motion.span
              layoutId="category-filter-ring"
              className="absolute -inset-1.5 rounded-full border-2 border-black dark:border-cream"
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
        </motion.button>
        {categories.map((c) => (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.85 }}
            onClick={() => setFilter(c.id)}
            aria-label={c.name}
            title={c.name}
            className="relative h-7 w-7 flex-shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/20"
            style={{ backgroundColor: c.hex }}
          >
            {filter === c.id && (
              <motion.span
                layoutId="category-filter-ring"
                className="absolute -inset-1.5 rounded-full border-2 border-black dark:border-cream"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {pool.length === 0 ? (
        <p className="font-rounded py-8 text-center text-sm text-black/50 dark:text-cream/50">
          Aucun défi ici.
        </p>
      ) : (
        <>
          <SwipeDeck
            pool={pool}
            validatedChallengeIds={validatedChallengeIds}
            index={index}
            onIndexChange={setIndex}
            onPick={onPick}
          />

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setIndex((i) => (i - 1 + pool.length) % pool.length)}
              className="rounded-full border border-black/10 p-2 text-black/50 transition hover:bg-black/5 dark:border-white/10 dark:text-cream/50 dark:hover:bg-white/10"
              aria-label="Carte précédente"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-rounded text-xs text-black/40 dark:text-cream/40">
              {index + 1} / {pool.length}
            </span>
            <button
              onClick={() => setIndex((i) => (i + 1) % pool.length)}
              className="rounded-full border border-black/10 p-2 text-black/50 transition hover:bg-black/5 dark:border-white/10 dark:text-cream/50 dark:hover:bg-white/10"
              aria-label="Carte suivante"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <p className="font-rounded mt-4 text-center text-xs text-black/40 dark:text-cream/40">
            {currentIsValidated ? 'Déjà validé — glisse pour voir la suite' : 'Tape la carte pour la choisir'}
          </p>
        </>
      )}
    </div>
  )
}
