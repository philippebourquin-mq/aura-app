import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { categoryById, jokers } from '../data/categories'
import { challengesByCategory } from '../data/challenges'
import { ChallengeCard } from '../components/ChallengeCard'
import { useGameState } from '../state/useGameState'
import { ArrowLeft, Shuffle } from 'lucide-react'
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

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link
        to="/"
        className="font-rounded mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black"
      >
        <ArrowLeft size={16} /> Retour
      </Link>

      <div
        className="mb-6 rounded-card px-5 py-4 text-center"
        style={{ backgroundColor: category.hex }}
      >
        <h1 className="font-display text-2xl text-black">{category.name}</h1>
        <p className="font-rounded text-sm text-black/70">{category.tagline}</p>
      </div>

      {pool.length === 0 && !drawn && (
        <p className="font-rounded text-center text-black/60">
          Bravo, tous les défis de cette catégorie sont validés ou en attente ! 🎉
        </p>
      )}

      {!drawn && pool.length > 0 && (
        <button
          onClick={drawRandom}
          className="font-rounded mx-auto flex items-center gap-2 rounded-full bg-black px-6 py-3 text-cream transition hover:bg-black/80"
        >
          <Shuffle size={18} /> Piocher un défi
        </button>
      )}

      {drawn && (
        <div className="flex flex-col items-center gap-6">
          <ChallengeCard
            challenge={drawn}
            status={state.challengeStates[drawn.id]?.status ?? 'todo'}
            onMarkDone={() => markPending(drawn.id)}
          />

          {state.challengeStates[drawn.id]?.status === 'todo' && availableJokers.length > 0 && (
            <div className="w-full max-w-xs">
              <p className="font-rounded mb-2 text-center text-xs font-semibold uppercase tracking-wide text-black/50">
                Jokers disponibles
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {availableJokers.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => handleJoker(j.id as JokerId)}
                    title={j.effect}
                    className="rounded-full border border-black/20 bg-white px-3 py-1 text-xs font-semibold text-black/70 hover:bg-black/5"
                  >
                    {j.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.challengeStates[drawn.id]?.status === 'pending' && pool.length > 0 && (
            <button
              onClick={() => setDrawnId(null)}
              className="font-rounded text-sm font-semibold text-black/60 underline underline-offset-4 hover:text-black"
            >
              Piocher un autre défi
            </button>
          )}
        </div>
      )}
    </div>
  )
}
