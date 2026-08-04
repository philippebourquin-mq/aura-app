import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { categories } from '../data/categories'
import { categoryIcons } from '../lib/categoryIcons'
import { availableChallenges } from '../state/useGameState'
import type { CategoryId, Challenge } from '../types'

interface Props {
  validatedChallengeIds: string[]
  /** Lock the picker to a single category (used when the team assigns a card within Lucas's chosen theme). */
  lockedCategoryId?: CategoryId
  onPick: (challengeId: string) => void
}

function MiniCard({ challenge, delay, onClick }: { challenge: Challenge; delay: number; onClick: () => void }) {
  const category = categories.find((c) => c.id === challenge.categoryId)!
  const Icon = categoryIcons[challenge.categoryId]

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex aspect-[63/90] flex-col overflow-hidden rounded-2xl border-2 border-black/10 bg-cream text-left shadow-[0_6px_16px_-6px_rgba(0,0,0,0.3)] dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="flex justify-end px-2.5 pt-2.5 pb-2" style={{ backgroundColor: category.hex }}>
        <Icon size={14} className="text-black/70" />
      </div>
      <div className="flex flex-1 flex-col justify-between px-2.5 py-2">
        <p className="font-display line-clamp-3 text-[12px] leading-tight text-black dark:text-cream">
          {challenge.title}
        </p>
        <span
          className="self-end rounded-full px-2 py-0.5 text-[10px] font-bold text-black"
          style={{ backgroundColor: category.hex }}
        >
          +{challenge.points}
        </span>
      </div>
    </motion.button>
  )
}

export function ChallengePicker({ validatedChallengeIds, lockedCategoryId, onPick }: Props) {
  const [filter, setFilter] = useState<CategoryId | 'all'>(lockedCategoryId ?? 'all')

  const pool = useMemo(() => {
    const all = availableChallenges(validatedChallengeIds)
    if (lockedCategoryId) return all.filter((c) => c.categoryId === lockedCategoryId)
    return filter === 'all' ? all : all.filter((c) => c.categoryId === filter)
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
        <div className="grid grid-cols-3 gap-2.5">
          {pool.map((challenge, i) => (
            <MiniCard
              key={challenge.id}
              challenge={challenge}
              delay={i * 0.02}
              onClick={() => onPick(challenge.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
