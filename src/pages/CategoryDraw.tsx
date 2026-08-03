import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { categoryById, jokers } from '../data/categories'
import { challengesByCategory } from '../data/challenges'
import { categoryIcons } from '../lib/categoryIcons'
import { ChallengeCard } from '../components/ChallengeCard'
import { useGameState } from '../state/useGameState'
import { ArrowLeft, PartyPopper, Shuffle } from 'lucide-react'
import type { JokerId } from '../types'

export function CategoryDraw() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const category = categoryId ? categoryById(categoryId) : undefined
  const { state, markPending, consumeJoker } = useGameState()
  const [drawnId, setDrawnId] = useState<string | null>(null)

  const categoryChallenges = useMemo(
    () => (categoryId ? challengesByCategory(categoryId) : []),
    [categoryId],
  )

  const pool = useMemo(
    () =>
      categoryChallenges.filter(
        (c) => (state.challengeStates[c.id]?.status ?? 'todo') === 'todo',
      ),
    [categoryChallenges, state.challengeStates],
  )

  if (!category) return <Navigate to="/" replace />

  const Icon = categoryIcons[category.id]

  // Once drawn, keep showing the card (with its updated status) even after
  // it leaves the "todo" pool, so marking it done doesn't make it vanish.
  const drawn = categoryChallenges.find((c) => c.id === drawnId) ?? null

  const drawRandom = () => {
    if (pool.length === 0) return
    const candidates = pool.filter((c) => c.id !== drawnId)
    const from = candidates.length > 0 ? candidates : pool
    const next = from[Math.floor(Math.random() * from.length)]
    setDrawnId(next.id)
  }

  const availableJokers = jokers.filter((j) => !state.jokersUsed.includes(j.id as JokerId))

  const handleJoker = (jokerId: JokerId) => {
    consumeJoker(jokerId)
    if (jokerId === 'switch') {
      drawRandom()
    } else {
      // boomerang / flemme: challenge is set aside for later, just clear the draw
      setDrawnId(null)
    }
  }

  const handleMarkDone = () => {
    if (!drawn) return
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: [category.hex, '#111111', '#F5EFDE'],
    })
    markPending(drawn.id)
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col px-6 pt-8">
      <Link
        to="/"
        className="font-rounded mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
      >
        <ArrowLeft size={16} /> Retour
      </Link>

      <div
        className="mb-8 flex items-center justify-center gap-3 rounded-card px-5 py-4 text-center"
        style={{ backgroundColor: category.hex }}
      >
        <Icon size={22} className="text-black/70" />
        <div>
          <h1 className="font-display text-2xl text-black">{category.name}</h1>
          <p className="font-rounded text-sm text-black/70">{category.tagline}</p>
        </div>
      </div>

      {pool.length === 0 && !drawn && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-16 text-center">
          <PartyPopper className="text-black/40 dark:text-cream/40" size={40} />
          <p className="font-rounded text-black/60 dark:text-cream/60">
            Bravo, tous les défis de cette catégorie sont validés ou en attente !
          </p>
        </div>
      )}

      {!drawn && pool.length > 0 && (
        <div className="flex flex-1 flex-col items-center justify-center pb-16">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={drawRandom}
            className="font-rounded flex items-center gap-2 rounded-full bg-black px-6 py-3 text-cream shadow-lg transition hover:bg-black/80"
          >
            <Shuffle size={18} /> Piocher un défi
          </motion.button>
          <p className="font-rounded mt-3 text-xs text-black/40 dark:text-cream/40">
            {pool.length} défi{pool.length > 1 ? 's' : ''} restant{pool.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {drawn && (
        <div className="flex flex-1 flex-col items-center gap-6 pb-16" style={{ perspective: 1200 }}>
          <motion.div
            key={drawn.id}
            initial={{ rotateY: -110, opacity: 0, scale: 0.9 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <ChallengeCard
              challenge={drawn}
              status={state.challengeStates[drawn.id]?.status ?? 'todo'}
              onMarkDone={handleMarkDone}
            />
          </motion.div>

          {state.challengeStates[drawn.id]?.status === 'todo' && availableJokers.length > 0 && (
            <div className="w-full max-w-xs">
              <p className="font-rounded mb-2 text-center text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-cream/50">
                Jokers disponibles
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {availableJokers.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => handleJoker(j.id as JokerId)}
                    title={j.effect}
                    className="rounded-full border border-black/20 bg-white px-3 py-1 text-xs font-semibold text-black/70 hover:bg-black/5 dark:border-white/20 dark:bg-white/5 dark:text-cream/70 dark:hover:bg-white/10"
                  >
                    {j.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.challengeStates[drawn.id]?.status === 'pending' && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-rounded text-center text-sm font-semibold text-black/70 dark:text-cream/70"
            >
              Bien joué ! En attente de validation par ta team. 🎉
            </motion.p>
          )}

          {state.challengeStates[drawn.id]?.status === 'pending' && pool.length > 0 && (
            <button
              onClick={() => setDrawnId(null)}
              className="font-rounded text-sm font-semibold text-black/60 underline underline-offset-4 hover:text-black dark:text-cream/60 dark:hover:text-cream"
            >
              Piocher un autre défi
            </button>
          )}
        </div>
      )}
    </div>
  )
}
