import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { categoryById } from '../data/categories'
import { categoryIcons } from '../lib/categoryIcons'
import { ChallengePicker } from '../components/ChallengePicker'
import { useGameState } from '../state/useGameState'

export function CategoryDraw() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const category = categoryId ? categoryById(categoryId) : undefined
  const { state, lucasPickChallenge } = useGameState()
  const navigate = useNavigate()

  if (!category) return <Navigate to="/" replace />

  // Only Lucas may pick freely here, and only when no run is already active.
  if (state.role !== 'lucas' || state.currentRun) return <Navigate to="/" replace />

  const Icon = categoryIcons[category.id]

  return (
    <div className="mx-auto max-w-lg px-6 pt-8 pb-16">
      <button
        onClick={() => navigate('/')}
        className="font-rounded mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
      >
        <ArrowLeft size={16} /> Retour
      </button>

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

      <ChallengePicker
        validatedChallengeIds={state.validatedChallengeIds}
        lockedCategoryId={category.id}
        onPick={(id) => {
          lucasPickChallenge(id)
          navigate('/')
        }}
      />
    </div>
  )
}
