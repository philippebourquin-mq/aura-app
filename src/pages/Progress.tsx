import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, Flag, Lock, Plus, Shuffle, XCircle } from 'lucide-react'
import { categories, categoryById } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AppHeader } from '../components/AppHeader'
import { AuraGauge } from '../components/AuraGauge'
import { NewChallengeForm } from '../components/NewChallengeForm'
import { achievements } from '../data/achievements'
import { categoryIcons } from '../lib/categoryIcons'
import type { CategoryId, HistoryOutcome } from '../types'

const outcomeMeta: Record<HistoryOutcome, { label: string; icon: typeof CheckCircle2; className: string }> = {
  validated: { label: 'Validé', icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
  declined: { label: 'Refusé', icon: XCircle, className: 'text-rose-500/80 dark:text-rose-400/80' },
  'joker-out': { label: 'Joker', icon: Shuffle, className: 'text-black/40 dark:text-cream/40' },
  'gave-up': { label: 'Abandonné', icon: Flag, className: 'text-rose-500/80 dark:text-rose-400/80' },
  expired: { label: 'Expiré', icon: Clock, className: 'text-rose-500/80 dark:text-rose-400/80' },
  'not-validated': { label: 'Non validé', icon: XCircle, className: 'text-rose-500/80 dark:text-rose-400/80' },
}

export function Progress() {
  const game = useGameState()
  const { state, setRole } = game
  const [creatingFor, setCreatingFor] = useState<CategoryId | null>(null)
  const allChallenges = [...challenges, ...state.customChallenges]
  const creatingCategory = creatingFor ? categoryById(creatingFor) : null

  return (
    <div>
      <AppHeader points={state.totalPoints} role={state.role} onRoleChange={setRole} />

      <div className="mx-auto max-w-lg px-6 pt-3 pb-16">
        <Link
          to="/"
          className="font-rounded mb-5 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
        >
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="font-display text-2xl text-black dark:text-cream">Profil de Lucas</h1>

        <div className="mt-4">
          <AuraGauge points={state.totalPoints} />
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
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center ${
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

        <div className="mt-8 space-y-5">
          <h2 className="font-rounded text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
            Défis
          </h2>
          {categories.map((category) => {
            const list = [
              ...challengesByCategory(category.id),
              ...state.customChallenges.filter((c) => c.categoryId === category.id),
            ]
            const Icon = categoryIcons[category.id]
            return (
              <div key={category.id}>
                <div className="mb-2 flex items-center gap-1.5 px-0.5">
                  <Icon size={13} style={{ color: category.hex }} />
                  <span className="font-rounded text-xs font-semibold text-black/70 dark:text-cream/70">
                    {category.name}
                  </span>
                </div>
                <div className="relative -mx-6">
                <div className="flex gap-2.5 overflow-x-auto px-6 pb-1">
                  {list.map((challenge) => {
                    const done = state.validatedChallengeIds.includes(challenge.id)
                    return (
                      <div
                        key={challenge.id}
                        className={`relative flex h-28 w-24 flex-shrink-0 flex-col justify-between rounded-xl border border-black/10 p-2 text-left dark:border-white/10 ${done ? 'grayscale' : ''}`}
                        style={{ backgroundColor: `${category.hex}2E` }}
                      >
                        {done ? (
                          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-cream">
                            <CheckCircle2 size={11} />
                          </span>
                        ) : (
                          <Icon size={14} style={{ color: category.hex }} />
                        )}
                        <p className="font-rounded line-clamp-3 text-[10px] font-semibold leading-tight text-black/80 dark:text-cream/80">
                          {challenge.title}
                        </p>
                        <span className="font-rounded text-[9px] font-bold text-black/50 dark:text-cream/50">
                          +{challenge.points}
                        </span>
                      </div>
                    )
                  })}
                  {state.role === 'team' && (
                    <button
                      onClick={() => setCreatingFor(category.id)}
                      aria-label={`Créer un défi dans ${category.name}`}
                      className="flex h-28 w-24 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-black/20 text-black/30 transition hover:border-black/40 hover:text-black/50 dark:border-white/20 dark:text-cream/30 dark:hover:border-white/40 dark:hover:text-cream/50"
                    >
                      <Plus size={18} />
                      <span className="font-rounded text-[9px] font-bold">Créer</span>
                    </button>
                  )}
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-cream to-transparent dark:from-neutral-950" />
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
                const challenge = allChallenges.find((c) => c.id === entry.challengeId)
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
                      {entry.bonus && (
                        <span className="font-rounded flex-shrink-0 rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-black/40 dark:bg-white/10 dark:text-cream/40">
                          x2
                        </span>
                      )}
                    </span>
                    <span
                      className={`flex-shrink-0 font-semibold ${
                        entry.pointsDelta > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : entry.pointsDelta < 0
                            ? 'text-rose-500/80 dark:text-rose-400/80'
                            : 'text-black/40 dark:text-cream/40'
                      }`}
                    >
                      {entry.pointsDelta > 0 ? `+${entry.pointsDelta}` : entry.pointsDelta < 0 ? entry.pointsDelta : meta.label}
                    </span>
                  </motion.li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {creatingCategory && (
        <NewChallengeForm
          category={creatingCategory}
          onClose={() => setCreatingFor(null)}
          onCreate={(input) => {
            game.createCustomChallenge({ ...input, categoryId: creatingCategory.id })
            setCreatingFor(null)
          }}
        />
      )}
    </div>
  )
}
