import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { categories } from '../data/categories'
import { challenges } from '../data/challenges'
import { categoryIcons } from '../lib/categoryIcons'
import { SwipeDeck } from './SwipeDeck'
import type { CategoryId, Challenge } from '../types'

interface Props {
  validatedChallengeIds: string[]
  /** Team-created cards, merged into the same deck as the physical catalog. */
  customChallenges?: Challenge[]
  onPick: (challengeId: string) => void
  /** A run is already in progress — the deck stays browsable, but picking is disabled. */
  locked?: boolean
}

const LONG_PRESS_MS = 450

/** What the info popover needs, whichever dot it came from. */
interface InfoCard {
  name: string
  tagline: string
  hex: string
  Icon: (typeof categoryIcons)[CategoryId]
}

const ALL_INFO: InfoCard = {
  name: 'Toutes les catégories',
  tagline: 'Tous les défis, toutes catégories confondues.',
  hex: '#111111',
  Icon: LayoutGrid,
}

export function ChallengePicker({ validatedChallengeIds, customChallenges = [], onPick, locked = false }: Props) {
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const [index, setIndex] = useState(0)
  const [infoCard, setInfoCard] = useState<InfoCard | null>(null)

  // A long-press on a filter dot shows its category's description without changing the
  // filter — the click handler that follows checks this flag and skips the filter change.
  const longPressTimer = useRef<number | null>(null)
  const longPressFiredRef = useRef(false)
  const startLongPress = (card: InfoCard) => {
    longPressFiredRef.current = false
    longPressTimer.current = window.setTimeout(() => {
      longPressFiredRef.current = true
      setInfoCard(card)
    }, LONG_PRESS_MS)
  }
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  useEffect(() => {
    if (!infoCard) return
    const t = setTimeout(() => setInfoCard(null), 3500)
    return () => clearTimeout(t)
  }, [infoCard])

  const allChallenges = useMemo(() => [...challenges, ...customChallenges], [customChallenges])

  const pool = useMemo(
    () => (filter === 'all' ? allChallenges : allChallenges.filter((c) => c.categoryId === filter)),
    [filter, allChallenges],
  )

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
      {/* Echoes the physical game's rules card, which lists all 5 categories — a long
          press on any dot recalls that category's description, same as flipping to it. */}
      <div className="mb-10 rounded-card border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="font-rounded mb-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-black/35 dark:text-cream/35">
          Catégories
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              if (longPressFiredRef.current) {
                longPressFiredRef.current = false
                return
              }
              setFilter('all')
            }}
            onPointerDown={() => startLongPress(ALL_INFO)}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onPointerCancel={cancelLongPress}
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
              onClick={() => {
                if (longPressFiredRef.current) {
                  longPressFiredRef.current = false
                  return
                }
                setFilter(c.id)
              }}
              onPointerDown={() => startLongPress({ name: c.name, tagline: c.tagline, hex: c.hex, Icon: categoryIcons[c.id] })}
              onPointerUp={cancelLongPress}
              onPointerLeave={cancelLongPress}
              onPointerCancel={cancelLongPress}
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

        <AnimatePresence>
          {infoCard && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className="mt-3.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{ backgroundColor: `${infoCard.hex}1F` }}
              >
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: infoCard.hex }}
                >
                  <infoCard.Icon size={13} className={infoCard.hex === '#111111' ? 'text-cream' : 'text-black/70'} />
                </span>
                <div className="min-w-0">
                  <p className="font-rounded text-xs font-bold capitalize text-black dark:text-cream">
                    {infoCard.name}
                  </p>
                  <p className="font-rounded text-[11px] font-normal text-black/60 dark:text-cream/60">
                    {infoCard.tagline}
                  </p>
                </div>
              </div>
            </motion.div>
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
            locked={locked}
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
            {locked
              ? 'Un défi est déjà en cours — regarde en attendant'
              : currentIsValidated
                ? 'Déjà validé — glisse pour voir la suite'
                : 'Tape la carte pour la choisir'}
          </p>
        </>
      )}
    </div>
  )
}
