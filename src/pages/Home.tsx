import { categories } from '../data/categories'
import { challengesByCategory } from '../data/challenges'
import { CategoryTile } from '../components/CategoryTile'
import { useGameState } from '../state/useGameState'
import { Link } from 'react-router-dom'

export function Home() {
  const { state } = useGameState()

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl tracking-widest text-black">A U R A</h1>
        <p className="font-rounded mt-3 text-black/60">
          Enchaîne les défis des 5 catégories. Ton but : plus confiant, plus toi, plus d'aura
          auprès des autres.
        </p>
        <Link
          to="/progression"
          className="font-rounded mt-4 inline-block text-sm font-semibold underline underline-offset-4"
        >
          Voir ma progression
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const list = challengesByCategory(category.id)
          const done = list.filter(
            (c) => state.challengeStates[c.id]?.status === 'validated',
          ).length
          return (
            <CategoryTile key={category.id} category={category} done={done} total={list.length} />
          )
        })}
      </div>
    </div>
  )
}
