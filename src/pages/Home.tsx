import { categories } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AuraGauge } from '../components/AuraGauge'
import { categoryIcons } from '../lib/categoryIcons'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function Home() {
  const { state } = useGameState()

  const totalPoints = challenges
    .filter((c) => state.challengeStates[c.id]?.status === 'validated')
    .reduce((sum, c) => sum + c.points, 0)

  return (
    <div className="mx-auto max-w-4xl px-5 pt-8">
      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl tracking-[0.3em] text-black dark:text-cream">
          A U R A
        </h1>
        <p className="font-rounded mx-auto mt-2 max-w-sm text-sm text-black/60 dark:text-cream/60">
          Enchaîne les défis des 5 catégories. Ton but : plus confiant, plus toi, plus d'aura
          auprès des autres.
        </p>
      </header>

      <AuraGauge points={totalPoints} />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories.map((category, i) => {
          const list = challengesByCategory(category.id)
          const done = list.filter(
            (c) => state.challengeStates[c.id]?.status === 'validated',
          ).length
          const pct = Math.round((done / list.length) * 100)
          const Icon = categoryIcons[category.id]

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                to={`/categorie/${category.id}`}
                className="group flex h-full flex-col justify-between rounded-card border border-black/10 bg-white/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
              >
                <div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: category.hex }}
                  >
                    <Icon size={20} className="text-black" />
                  </div>
                  <h3 className="font-display mt-3 text-base leading-tight text-black dark:text-cream">
                    {category.name}
                  </h3>
                  <p className="font-rounded mt-1 text-xs text-black/50 dark:text-cream/50">
                    {category.tagline}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: category.hex }}
                    />
                  </div>
                  <p className="font-rounded mt-1 text-[11px] text-black/40 dark:text-cream/40">
                    {done}/{list.length} validés
                  </p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
