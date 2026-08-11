import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from '../data/categories'
import { challenges } from '../data/challenges'
import { SwipeDeck } from './SwipeDeck'
import type { CategoryId, Challenge } from '../types'

interface Props {
  validatedChallengeIds: string[]
  /** Lock the picker to a single category (used when browsing in from a category tile). */
  lockedCategoryId?: CategoryId
  /** Team-created cards, merged into the same deck as the physical catalog. */
  customChallenges?: Challenge[]
  onPick: (challengeId: string) => void
}

export function ChallengePicker({ validatedChallengeIds, lockedCategoryId, customChallenges = [], onPick }: Props) {
  const [filter, setFilter] = useState<CategoryId | 'all'>(lockedCategoryId ?? 'all')
  const [index, setIndex] = useState(0)

  const allChallenges = useMemo(() => [...challenges, ...customChallenges], [customChallenges])

  const pool = useMemo(() => {
    const activeFilter = lockedCategoryId ?? filter
    return activeFilter === 'all' ? allChallenges : allChallenges.filter((c) => c.categoryId === activeFilter)
  }, [lockedCategoryId, filter, allChallenges])

  useEffect(() => setIndex(0), [pool])

  const current = pool[index]
  const currentIsValidated = current ? validatedChallengeIds.includes(current.id) : false

  return (
    <div>
      {!lockedCategoryId && (
        <div className="mb-5 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setFilter('all')}
            aria-label="Toutes les catégories"
            title="Toutes"
            className={`h-6 w-6 flex-shrink-0 rounded-full border-2 bg-black transition ${
              filter === 'all' ? 'border-black scale-110 dark:border-cream' : 'border-transparent opacity-40'
            }`}
          />
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              aria-label={c.name}
              title={c.name}
              className={`h-6 w-6 flex-shrink-0 rounded-full border-2 transition ${
                filter === c.id ? 'scale-110 border-black dark:border-cream' : 'border-transparent opacity-40'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      )}

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

          <div className="mt-4 flex items-center justify-center gap-4">
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

          <p className="font-rounded mt-3 text-center text-xs text-black/40 dark:text-cream/40">
            {currentIsValidated ? 'Déjà validé — glisse pour voir la suite' : 'Tape la carte pour la choisir'}
          </p>
        </>
      )}
    </div>
  )
}
