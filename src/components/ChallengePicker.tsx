import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { categories } from '../data/categories'
import { availableChallenges } from '../state/useGameState'
import { ChallengeCard } from './ChallengeCard'
import type { CategoryId } from '../types'

interface Props {
  validatedChallengeIds: string[]
  /** Lock the picker to a single category (used when the team assigns a card within Lucas's chosen theme). */
  lockedCategoryId?: CategoryId
  onPick: (challengeId: string) => void
}

export function ChallengePicker({ validatedChallengeIds, lockedCategoryId, onPick }: Props) {
  const [filter, setFilter] = useState<CategoryId | 'all'>(lockedCategoryId ?? 'all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const pool = useMemo(() => {
    const all = availableChallenges(validatedChallengeIds)
    if (lockedCategoryId) return all.filter((c) => c.categoryId === lockedCategoryId)
    return filter === 'all' ? all : all.filter((c) => c.categoryId === filter)
  }, [validatedChallengeIds, lockedCategoryId, filter])

  const selected = pool.find((c) => c.id === selectedId) ?? null

  return (
    <div>
      {!lockedCategoryId && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              setFilter('all')
              setSelectedId(null)
            }}
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
              onClick={() => {
                setFilter(c.id)
                setSelectedId(null)
              }}
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
        <div className="flex flex-col items-center gap-4 pb-4">
          {pool.map((challenge) => {
            const isSelected = challenge.id === selectedId
            return (
              <motion.button
                key={challenge.id}
                layout
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedId(isSelected ? null : challenge.id)}
                className="relative"
              >
                <div
                  className={`rounded-[1.75rem] transition ${
                    isSelected ? 'ring-4 ring-black ring-offset-2 ring-offset-cream dark:ring-cream dark:ring-offset-neutral-950' : ''
                  }`}
                >
                  <ChallengeCard challenge={challenge} />
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black text-cream shadow-lg dark:bg-cream dark:text-black"
                  >
                    <Check size={18} />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      )}

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 z-20 mx-auto flex w-full max-w-xs items-center gap-2 rounded-full border border-black/10 bg-cream p-1.5 shadow-xl dark:border-white/10 dark:bg-neutral-900"
        >
          <button
            onClick={() => setSelectedId(null)}
            className="font-rounded flex-shrink-0 px-3 py-2 text-xs font-semibold text-black/50 hover:text-black dark:text-cream/50 dark:hover:text-cream"
          >
            Annuler
          </button>
          <button
            onClick={() => onPick(selected.id)}
            className="font-rounded flex-1 rounded-full bg-black py-2.5 text-sm font-semibold text-cream transition hover:bg-black/80"
          >
            Confirmer « {selected.title} »
          </button>
        </motion.div>
      )}
    </div>
  )
}
