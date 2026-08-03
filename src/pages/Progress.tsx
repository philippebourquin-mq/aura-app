import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { categories } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'

export function Progress() {
  const { state } = useGameState()

  const validatedChallenges = challenges.filter(
    (c) => state.challengeStates[c.id]?.status === 'validated',
  )
  const totalPoints = validatedChallenges.reduce((sum, c) => sum + c.points, 0)
  const pendingChallenges = challenges.filter(
    (c) => state.challengeStates[c.id]?.status === 'pending',
  )

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        to="/"
        className="font-rounded mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black"
      >
        <ArrowLeft size={16} /> Retour
      </Link>

      <h1 className="font-display text-3xl text-black">Ta progression</h1>

      <div className="mt-6 rounded-card border border-black/10 bg-cream p-6 text-center">
        <p className="font-rounded text-sm uppercase tracking-wide text-black/50">
          Score total
        </p>
        <p className="font-display mt-1 text-4xl text-black">{totalPoints} pts</p>
        <p className="font-rounded mt-1 text-sm text-black/50">
          {validatedChallenges.length}/{challenges.length} défis validés
        </p>
      </div>

      {pendingChallenges.length > 0 && (
        <div className="mt-6 rounded-card border border-black/10 bg-white p-5">
          <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60">
            En attente de validation ({pendingChallenges.length})
          </h2>
          <ul className="space-y-2">
            {pendingChallenges.map((c) => (
              <li key={c.id} className="font-rounded flex justify-between text-sm text-black/80">
                <span>{c.title}</span>
                <span className="text-black/40">+{c.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {categories.map((category) => {
          const list = challengesByCategory(category.id)
          const done = list.filter(
            (c) => state.challengeStates[c.id]?.status === 'validated',
          ).length
          const pct = list.length === 0 ? 0 : Math.round((done / list.length) * 100)
          return (
            <div key={category.id} className="flex items-center gap-4">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: category.hex }}
              />
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-rounded font-semibold text-black">
                    {category.name}
                  </span>
                  <span className="font-rounded text-black/50">
                    {done}/{list.length}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: category.hex }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {validatedChallenges.length > 0 && (
        <div className="mt-8">
          <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60">
            Journal des défis validés
          </h2>
          <ul className="space-y-2">
            {validatedChallenges.map((c) => (
              <li
                key={c.id}
                className="font-rounded flex justify-between rounded-lg bg-white px-4 py-2 text-sm text-black/80"
              >
                <span>{c.title}</span>
                <span className="font-semibold text-black/40">+{c.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
