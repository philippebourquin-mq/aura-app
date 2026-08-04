import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const pool = useMemo(() => {
    const all = availableChallenges(validatedChallengeIds)
    if (lockedCategoryId) return all.filter((c) => c.categoryId === lockedCategoryId)
    return filter === 'all' ? all : all.filter((c) => c.categoryId === filter)
  }, [validatedChallengeIds, lockedCategoryId, filter])

  useEffect(() => {
    setIndex(0)
    trackRef.current?.scrollTo({ left: 0, behavior: 'auto' })
  }, [pool])

  const handleScroll = () => {
    const el = trackRef.current
    if (!el) return
    const containerCenter = el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2
    let closest = 0
    let closestDist = Infinity
    Array.from(el.children).forEach((child, i) => {
      const rect = (child as HTMLElement).getBoundingClientRect()
      const dist = Math.abs(rect.left + rect.width / 2 - containerCenter)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setIndex(closest)
  }

  const scrollToIndex = (i: number) => {
    const el = trackRef.current
    const card = el?.children[i] as HTMLElement | undefined
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

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
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ paddingLeft: 'calc(50% - 8rem)', paddingRight: 'calc(50% - 8rem)' }}
          >
            {pool.map((challenge) => (
              <div key={challenge.id} className="snap-center flex-shrink-0">
                <ChallengeCard challenge={challenge} />
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-center gap-4">
            <button
              onClick={() => scrollToIndex(Math.max(0, index - 1))}
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
              onClick={() => scrollToIndex(Math.min(pool.length - 1, index + 1))}
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
              className="font-rounded sticky bottom-4 z-20 mx-auto mt-4 block w-full max-w-xs rounded-full bg-black py-3 text-sm font-semibold text-cream shadow-xl transition hover:bg-black/80"
            >
              Choisir « {current.title} » · +{current.points}
            </motion.button>
          )}
        </>
      )}
    </div>
  )
}
