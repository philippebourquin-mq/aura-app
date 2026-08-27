import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleDashed, ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from '../data/categories'
import { challenges } from '../data/challenges'
import { SwipeDeck } from './SwipeDeck'
import type { CategoryId, Challenge } from '../types'

type DoneFilter = 'all' | 'todo' | 'done'

interface Props {
  validatedChallengeIds: string[]
  /** Team-created cards, merged into the same deck as the physical catalog. */
  customChallenges?: Challenge[]
  onPick: (challengeId: string) => void
  /** Opens the read-only detail sheet for an already-validated card. */
  onViewDetail: (challengeId: string) => void
  /** A run is already in progress — the deck stays browsable, but picking is disabled. */
  locked?: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ChallengePicker({
  validatedChallengeIds,
  customChallenges = [],
  onPick,
  onViewDetail,
  locked = false,
}: Props) {
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const [doneFilter, setDoneFilter] = useState<DoneFilter>('all')
  const [index, setIndex] = useState(0)

  const allChallenges = useMemo(() => [...challenges, ...customChallenges], [customChallenges])

  // "Toutes" mixes every category together instead of appearing grouped block by block —
  // a single-category filter has nothing to mix, so it keeps the catalog's own order.
  const categoryPool = useMemo(
    () =>
      filter === 'all' ? shuffle(allChallenges) : allChallenges.filter((c) => c.categoryId === filter),
    [filter, allChallenges],
  )

  // Layered on top instead of folded into the shuffle above — this only narrows the
  // already-shuffled order, it never re-shuffles it just because a challenge somewhere
  // got validated while browsing.
  const pool = useMemo(() => {
    if (doneFilter === 'all') return categoryPool
    return categoryPool.filter((c) => validatedChallengeIds.includes(c.id) === (doneFilter === 'done'))
  }, [categoryPool, doneFilter, validatedChallengeIds])

  // A random landing card each time — so the deck doesn't always open on the same
  // first card of a category (or the catalog) — not on every render, only when the
  // pool itself actually changes (a filter switch, or a new custom challenge).
  useEffect(() => {
    setIndex(pool.length > 0 ? Math.floor(Math.random() * pool.length) : 0)
  }, [pool])

  const current = pool[index]
  const currentIsValidated = current ? validatedChallengeIds.includes(current.id) : false

  return (
    <div>
      <p className="font-rounded mb-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-black/35 dark:text-cream/35">
        Filtrer par catégorie
      </p>
      <div className="mb-2 flex flex-wrap justify-center gap-2.5">
        <motion.button
          whileHover={{ scale: 1.15, boxShadow: '0 0 0 3px rgba(0,0,0,0.25)' }}
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            setFilter('all')
            setDoneFilter('all')
          }}
          aria-label="Toutes les catégories"
          title="Toutes"
          className="relative h-7 w-7 flex-shrink-0 rounded-full border border-black/25 bg-transparent dark:border-cream/25"
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
            whileHover={{ scale: 1.15, boxShadow: `0 0 0 3px ${c.hex}80` }}
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
        <motion.button
          whileHover={{ scale: 1.15, boxShadow: '0 0 0 3px rgba(0,0,0,0.25)' }}
          whileTap={{ scale: 0.85 }}
          onClick={() => setDoneFilter((d) => (d === 'done' ? 'all' : 'done'))}
          aria-label="Défis déjà faits"
          title="Faits"
          className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-black/25 bg-transparent text-black/60 dark:border-cream/25 dark:text-cream/60"
        >
          <Check size={13} strokeWidth={2.5} />
          {doneFilter === 'done' && (
            <motion.span
              layoutId="done-filter-ring"
              className="absolute -inset-1.5 rounded-full border-2 border-black dark:border-cream"
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15, boxShadow: '0 0 0 3px rgba(0,0,0,0.25)' }}
          whileTap={{ scale: 0.85 }}
          onClick={() => setDoneFilter((d) => (d === 'todo' ? 'all' : 'todo'))}
          aria-label="Défis à faire"
          title="À faire"
          className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-black/25 bg-transparent text-black/60 dark:border-cream/25 dark:text-cream/60"
        >
          <CircleDashed size={13} strokeWidth={2.5} />
          {doneFilter === 'todo' && (
            <motion.span
              layoutId="done-filter-ring"
              className="absolute -inset-1.5 rounded-full border-2 border-black dark:border-cream"
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
        </motion.button>
      </div>

      <div className="mb-5 flex h-4 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {filter !== 'all' && (
            <motion.p
              key={filter}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.18 }}
              className="font-rounded text-center text-[11px] italic text-black/50 dark:text-cream/50"
            >
              {categories.find((c) => c.id === filter)?.tagline}
            </motion.p>
          )}
        </AnimatePresence>
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
            onViewDetail={onViewDetail}
            locked={locked}
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

          <p className="font-rounded mt-4 text-center text-xs text-black/40 dark:text-cream/40">
            {locked
              ? 'Un défi est déjà en cours — regarde en attendant'
              : currentIsValidated
                ? 'Déjà validé — tape la carte pour voir le détail'
                : 'Tape la carte pour la choisir'}
          </p>
        </>
      )}
    </div>
  )
}
