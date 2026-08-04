import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lock, RotateCcw, SkipForward } from 'lucide-react'
import { categories } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AuraGauge } from '../components/AuraGauge'
import { RoleSwitcher } from '../components/RoleSwitcher'
import { achievements } from '../data/achievements'
import { categoryIcons } from '../lib/categoryIcons'

const outcomeMeta = {
  validated: { label: 'Validé', icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
  rejected: { label: 'Remis en jeu', icon: RotateCcw, className: 'text-black/40 dark:text-cream/40' },
  skipped: { label: 'Joker utilisé', icon: SkipForward, className: 'text-black/40 dark:text-cream/40' },
}

export function Progress() {
  const { state, setRole } = useGameState()

  const validatedChallenges = challenges.filter((c) => state.validatedChallengeIds.includes(c.id))
  const totalPoints = validatedChallenges.reduce((sum, c) => sum + c.points, 0)

  return (
    <div>
      <RoleSwitcher role={state.role} onChange={setRole} />

      <div className="mx-auto max-w-2xl px-6 pt-4 pb-16">
        <Link
          to="/"
          className="font-rounded mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
        >
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="font-display text-3xl text-black dark:text-cream">Profil de Lucas</h1>

        <div className="mt-6">
          <AuraGauge points={totalPoints} />
        </div>

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
            const done = list.filter((c) => state.validatedChallengeIds.includes(c.id)).length
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

        {state.history.length > 0 && (
          <div className="mt-8">
            <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
              Journal
            </h2>
            <ul className="space-y-2">
              {state.history.map((entry, i) => {
                const challenge = challenges.find((c) => c.id === entry.challengeId)
                const meta = outcomeMeta[entry.outcome]
                const Icon = meta.icon
                return (
                  <motion.li
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="font-rounded flex items-center justify-between gap-2 rounded-lg bg-white px-4 py-2 text-sm text-black/80 dark:bg-white/10 dark:text-cream/80"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon size={14} className={meta.className} />
                      <span className="truncate">{challenge?.title ?? 'Défi'}</span>
                    </span>
                    <span className="flex-shrink-0 font-semibold text-black/40 dark:text-cream/40">
                      {entry.outcome === 'validated' ? `+${entry.points}` : meta.label}
                    </span>
                  </motion.li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
