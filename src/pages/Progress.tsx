import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { categories } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AuraGauge } from '../components/AuraGauge'
import { achievements } from '../data/achievements'
import { categoryIcons } from '../lib/categoryIcons'

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
    <div className="mx-auto max-w-2xl px-6 pt-8">
      <Link
        to="/"
        className="font-rounded mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
      >
        <ArrowLeft size={16} /> Retour
      </Link>

      <h1 className="font-display text-3xl text-black dark:text-cream">Ton profil</h1>

      <div className="mt-6">
        <AuraGauge points={totalPoints} />
      </div>

      {pendingChallenges.length > 0 && (
        <div className="mt-6 rounded-card border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
          <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
            En attente de validation ({pendingChallenges.length})
          </h2>
          <ul className="space-y-2">
            {pendingChallenges.map((c) => (
              <li
                key={c.id}
                className="font-rounded flex justify-between text-sm text-black/80 dark:text-cream/80"
              >
                <span>{c.title}</span>
                <span className="text-black/40 dark:text-cream/40">+{c.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
          Badges
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {achievements.map((a, i) => {
            const unlocked = a.isUnlocked(state)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                title={a.description}
                className={`flex flex-col items-center gap-1 rounded-card border p-3 text-center ${
                  unlocked
                    ? 'border-black/10 bg-white dark:border-white/10 dark:bg-white/10'
                    : 'border-black/5 bg-black/5 dark:border-white/5 dark:bg-white/5'
                }`}
              >
                <span className={`text-2xl ${unlocked ? '' : 'opacity-20 grayscale'}`}>
                  {unlocked ? a.emoji : <Lock size={20} className="mx-auto text-black/30 dark:text-cream/30" />}
                </span>
                <span
                  className={`font-rounded text-[11px] font-semibold leading-tight ${
                    unlocked ? 'text-black dark:text-cream' : 'text-black/30 dark:text-cream/30'
                  }`}
                >
                  {a.name}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="font-rounded text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
          Avancement par catégorie
        </h2>
        {categories.map((category) => {
          const list = challengesByCategory(category.id)
          const done = list.filter(
            (c) => state.challengeStates[c.id]?.status === 'validated',
          ).length
          const pct = list.length === 0 ? 0 : Math.round((done / list.length) * 100)
          const Icon = categoryIcons[category.id]
          return (
            <div key={category.id} className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: category.hex }}
              >
                <Icon size={16} className="text-black/70" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-rounded font-semibold text-black dark:text-cream">
                    {category.name}
                  </span>
                  <span className="font-rounded text-black/50 dark:text-cream/50">
                    {done}/{list.length}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: category.hex }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {validatedChallenges.length > 0 && (
        <div className="mt-8 pb-4">
          <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
            Journal des défis validés
          </h2>
          <ul className="space-y-2">
            {validatedChallenges.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="font-rounded flex justify-between rounded-lg bg-white px-4 py-2 text-sm text-black/80 dark:bg-white/10 dark:text-cream/80"
              >
                <span>{c.title}</span>
                <span className="font-semibold text-black/40 dark:text-cream/40">
                  +{c.points}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
