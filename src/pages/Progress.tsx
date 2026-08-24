import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, Flag, Lock, Plus, RotateCcw, Shuffle, XCircle } from 'lucide-react'
import { categories, categoryById, jokers, JOKER_HEX } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { AppHeader } from '../components/AppHeader'
import { AuraGauge } from '../components/AuraGauge'
import { ChallengeDetailSheet } from '../components/ChallengeDetailSheet'
import { ChallengeTile } from '../components/ChallengeTile'
import { NewChallengeForm } from '../components/NewChallengeForm'
import { achievements } from '../data/achievements'
import { categoryIcons } from '../lib/categoryIcons'
import { jokerIcons } from '../lib/jokerIcons'
import type { useGameState } from '../state/useGameState'
import type { CategoryId, Challenge, HistoryOutcome, JokerId } from '../types'

type Game = ReturnType<typeof useGameState>

const outcomeMeta: Record<HistoryOutcome, { label: string; icon: typeof CheckCircle2; className: string }> = {
  validated: { label: 'Validé', icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
  declined: { label: 'Refusé', icon: XCircle, className: 'text-rose-500/80 dark:text-rose-400/80' },
  'joker-out': { label: 'Joker', icon: Shuffle, className: 'text-black/40 dark:text-cream/40' },
  'gave-up': { label: 'Abandonné', icon: Flag, className: 'text-rose-500/80 dark:text-rose-400/80' },
  expired: { label: 'Expiré', icon: Clock, className: 'text-rose-500/80 dark:text-rose-400/80' },
  'not-validated': { label: 'Non validé', icon: XCircle, className: 'text-rose-500/80 dark:text-rose-400/80' },
}

interface Props {
  game: Game
  openTakeover: () => void
}

export function Progress({ game, openTakeover }: Props) {
  const { state, setRole } = game
  const navigate = useNavigate()
  const [creatingFor, setCreatingFor] = useState<CategoryId | null>(null)
  const [viewingChallenge, setViewingChallenge] = useState<Challenge | null>(null)
  const [resetArmed, setResetArmed] = useState(false)
  const allChallenges = [...challenges, ...state.customChallenges]
  const creatingCategory = creatingFor ? categoryById(creatingFor) : null
  const run = state.currentRun
  const runChallenge = run ? allChallenges.find((c) => c.id === run.challengeId) : undefined

  // A tap arms the reset for a few seconds; a second tap within that window confirms it.
  // Deliberately not a browser confirm() dialog — it should feel like part of the app.
  useEffect(() => {
    if (!resetArmed) return
    const t = setTimeout(() => setResetArmed(false), 4000)
    return () => clearTimeout(t)
  }, [resetArmed])

  return (
    <div>
      <AppHeader
        points={state.totalPoints}
        role={state.role}
        onRoleChange={setRole}
        currentRun={run && runChallenge ? { run, challenge: runChallenge, onOpen: openTakeover } : undefined}
      />

      <div className="mx-auto max-w-lg px-6 pt-3 pb-16">
        <Link
          to="/"
          className="font-rounded mb-5 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
        >
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="font-display text-[2.1rem] leading-[1.05] text-black dark:text-cream">Profil de Lucas</h1>

        <div className="mt-4">
          <AuraGauge points={state.totalPoints} />
        </div>

        <div className="mt-10">
          <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
            Badges
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {achievements.map((a, i) => {
              const unlocked = a.isUnlocked(state)
              const Icon = a.icon
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  title={a.description}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center ${
                    unlocked
                      ? 'border-black/10 bg-white dark:border-white/10 dark:bg-white/10'
                      : 'border-black/5 bg-black/5 dark:border-white/5 dark:bg-white/5'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      unlocked ? '' : 'bg-black/5 dark:bg-white/10'
                    }`}
                    style={unlocked ? { backgroundColor: a.hex ?? '#111111' } : undefined}
                  >
                    {unlocked ? (
                      <Icon size={16} className={a.hex ? 'text-black/75' : 'text-cream'} />
                    ) : (
                      <Lock size={16} className="text-black/30 dark:text-cream/30" />
                    )}
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

        <div className="mt-10">
          <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
            Catégories
          </h2>
          <div className="space-y-2">
            {categories.map((c) => {
              const Icon = categoryIcons[c.id]
              return (
                <div
                  key={c.id}
                  className="font-rounded flex items-center gap-3 rounded-lg bg-white px-4 py-3 dark:bg-white/10"
                >
                  <span
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: c.hex }}
                  >
                    <Icon size={15} className="text-black/75" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold capitalize text-black dark:text-cream">{c.name}</p>
                    <p className="text-xs font-normal text-black/55 dark:text-cream/55">{c.tagline}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10 space-y-6">
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
                      <ChallengeTile
                        key={challenge.id}
                        challenge={challenge}
                        done={done}
                        onClick={() => setViewingChallenge(challenge)}
                      />
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

        <div className="mt-10">
          <h2 className="font-rounded mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-cream/60">
            Jokers
          </h2>
          <div className="space-y-2">
            {jokers.map((j) => {
              const used = state.jokersUsed.includes(j.id as JokerId)
              const Icon = jokerIcons[j.id as JokerId]
              return (
                <div
                  key={j.id}
                  className="font-rounded flex items-center justify-between gap-2 rounded-lg bg-white px-4 py-2.5 text-sm dark:bg-white/10"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: JOKER_HEX }}
                    >
                      <Icon size={13} className="text-black/75" />
                    </span>
                    <span className="font-semibold text-black dark:text-cream">{j.name}</span>
                  </span>
                  {used ? (
                    state.role === 'team' ? (
                      <button
                        onClick={() => game.requeueJoker(j.id as JokerId)}
                        className="font-rounded flex-shrink-0 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold text-black/60 hover:bg-black/5 dark:border-white/15 dark:text-cream/60 dark:hover:bg-white/10"
                      >
                        Remettre en jeu
                      </button>
                    ) : (
                      <span className="flex-shrink-0 text-xs font-semibold text-black/30 dark:text-cream/30">
                        Utilisé
                      </span>
                    )
                  ) : (
                    <span className="flex-shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Disponible
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {state.history.length > 0 && (
          <div className="mt-10">
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

        {state.role === 'team' && (
          <div className="mt-10 rounded-2xl border border-dashed border-black/15 p-4 dark:border-white/15">
            <h2 className="font-rounded mb-1 text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-cream/40">
              Zone test — visible en mode Team uniquement
            </h2>
            <p className="font-rounded mb-3 text-xs text-black/40 dark:text-cream/40">
              Outils réservés à la team pour tester l'app.
            </p>
            <button
              onClick={() => {
                if (resetArmed) {
                  game.reset()
                  setResetArmed(false)
                  navigate('/')
                } else {
                  setResetArmed(true)
                }
              }}
              className={`font-rounded flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition ${
                resetArmed
                  ? 'bg-rose-600 text-white'
                  : 'border border-black/15 text-black/70 dark:border-white/15 dark:text-cream/70'
              }`}
            >
              <RotateCcw size={15} />
              {resetArmed ? 'Confirmer : tout effacer et repartir de zéro' : 'Réinitialiser la partie'}
            </button>
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

      <AnimatePresence>
        {viewingChallenge && (
          <ChallengeDetailSheet
            challenge={viewingChallenge}
            done={state.validatedChallengeIds.includes(viewingChallenge.id)}
            canRequeue={state.role === 'team'}
            onRequeue={() => {
              game.requeueChallenge(viewingChallenge.id)
              setViewingChallenge(null)
            }}
            onClose={() => setViewingChallenge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
