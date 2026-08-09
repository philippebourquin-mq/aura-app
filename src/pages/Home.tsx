import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, ChevronUp } from 'lucide-react'
import { categories, categoryById } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AppHeader } from '../components/AppHeader'
import { CelebrationOverlay } from '../components/CelebrationOverlay'
import { ChallengeTakeover } from '../components/ChallengeTakeover'
import { CurrentRun } from '../components/CurrentRun'
import { LossOverlay } from '../components/LossOverlay'
import { ChallengePicker } from '../components/ChallengePicker'
import { categoryIcons } from '../lib/categoryIcons'
import type { Category, CategoryId, Challenge, HistoryOutcome } from '../types'

type LossState = { outcome: Exclude<HistoryOutcome, 'validated' | 'joker-out'>; title: string; pointsLost: number }

export function Home() {
  const game = useGameState()
  const { state } = game
  const [browsing, setBrowsing] = useState<CategoryId | 'all' | null>(null)
  const [takeoverOpen, setTakeoverOpen] = useState(true)
  const [celebration, setCelebration] = useState<{ challenge: Challenge; category: Category; amount: number } | null>(
    null,
  )
  const [loss, setLoss] = useState<LossState | null>(null)

  const run = state.currentRun
  const allChallenges = [...challenges, ...state.customChallenges]
  const activeChallenge = run ? allChallenges.find((c) => c.id === run.challengeId) : undefined

  // Re-open the takeover whenever a fresh run goes active, even if a previous one was minimized.
  const prevStatusRef = useRef(run?.status)
  useEffect(() => {
    const prevStatus = prevStatusRef.current
    prevStatusRef.current = run?.status
    if (run?.status === 'active' && prevStatus !== 'active') {
      setTakeoverOpen(true)
    }
  }, [run?.status])

  // Every outcome carries what its overlay needs, so drive both from the journal directly —
  // this also catches auto-expiry, which fires from a background timer, not a button.
  const lastHistoryIdRef = useRef(state.history[0]?.id)
  useEffect(() => {
    const latest = state.history[0]
    if (!latest || latest.id === lastHistoryIdRef.current) return
    lastHistoryIdRef.current = latest.id
    const c = allChallenges.find((ch) => ch.id === latest.challengeId)
    if (latest.outcome === 'joker-out') return // free and quiet, by design
    if (latest.outcome === 'validated') {
      const cat = categoryById(latest.categoryId)
      if (c && cat) setCelebration({ challenge: c, category: cat, amount: latest.pointsDelta })
      return
    }
    setLoss({ outcome: latest.outcome, title: c?.title ?? 'Défi', pointsLost: -latest.pointsDelta })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.history])

  const canPickFreely = !state.currentRun
  const browsingCategory = browsing && browsing !== 'all' ? categoryById(browsing) : null
  const isBrowsing = canPickFreely && browsing !== null

  const handlePick = (challengeId: string) => {
    if (state.role === 'lucas') game.lucasPickChallenge(challengeId)
    else game.teamSendChallenge(challengeId)
    setBrowsing(null)
  }

  const overlays = (
    <>
      <AnimatePresence>
        {run?.status === 'active' && activeChallenge && takeoverOpen && (
          <ChallengeTakeover
            challenge={activeChallenge}
            origin={run.origin}
            expiresAt={run.expiresAt}
            role={state.role}
            points={state.totalPoints}
            onValidate={game.teamValidate}
            onDeny={game.teamDeny}
            onGiveUp={game.lucasGiveUp}
            onMinimize={() => setTakeoverOpen(false)}
            onSwitchRole={game.setRole}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {celebration && (
          <CelebrationOverlay
            challenge={celebration.challenge}
            category={celebration.category}
            amount={celebration.amount}
            bonus={celebration.amount > celebration.challenge.points}
            onContinue={() => setCelebration(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {loss && (
          <LossOverlay
            outcome={loss.outcome}
            challengeTitle={loss.title}
            pointsLost={loss.pointsLost}
            onContinue={() => setLoss(null)}
          />
        )}
      </AnimatePresence>
    </>
  )

  // Free-choice browsing happens inline, right here on the home screen — no page navigation.
  if (isBrowsing) {
    return (
      <>
        <div>
          <AppHeader points={state.totalPoints} role={state.role} onRoleChange={game.setRole} />
          <div className="mx-auto max-w-lg px-6 pt-3 pb-10">
            <button
              onClick={() => setBrowsing(null)}
              className="font-rounded mb-5 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
            >
              <ArrowLeft size={16} /> Retour
            </button>

            <h1 className="font-display mb-6 text-2xl text-black dark:text-cream">
              {state.role === 'lucas' ? 'Choisis un défi à réaliser' : 'Choisis un défi pour Lucas'}
            </h1>

            <ChallengePicker
              validatedChallengeIds={state.validatedChallengeIds}
              lockedCategoryId={browsingCategory?.id}
              customChallenges={state.customChallenges}
              onPick={handlePick}
            />
          </div>
        </div>
        {overlays}
      </>
    )
  }

  return (
    <>
      <div>
        <AppHeader points={state.totalPoints} role={state.role} onRoleChange={game.setRole} wordmark />

        <div className="mx-auto max-w-lg px-5 pb-10">
          {canPickFreely && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setBrowsing('all')}
              className="font-rounded mt-4 flex w-full items-center justify-between rounded-card border border-black/10 bg-white/60 px-4 py-3.5 text-left dark:border-white/10 dark:bg-white/5"
            >
              <span className="text-sm font-bold text-black dark:text-cream">
                {state.role === 'lucas' ? 'Lance-toi un défi' : 'Lance un défi à Lucas'}
              </span>
              <span className="flex h-8 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black text-cream">
                <ArrowRight size={15} />
              </span>
            </motion.button>
          )}

          <div className="mt-5">
            {run?.status === 'active' && activeChallenge ? (
              !takeoverOpen && (
                <motion.button
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTakeoverOpen(true)}
                  className="font-rounded flex w-full items-center justify-between rounded-card border border-black/10 bg-white/70 px-4 py-3 text-left text-sm dark:border-white/10 dark:bg-white/5"
                >
                  <span className="font-semibold text-black dark:text-cream">
                    Reprendre le défi en cours
                  </span>
                  <ChevronUp size={16} className="text-black/40 dark:text-cream/40" />
                </motion.button>
              )
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={run?.id ?? 'idle'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CurrentRun game={game} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {categories.map((category, i) => {
              const list = [
                ...challengesByCategory(category.id),
                ...state.customChallenges.filter((c) => c.categoryId === category.id),
              ]
              const done = list.filter((c) => state.validatedChallengeIds.includes(c.id)).length
              const complete = list.length > 0 && done === list.length
              const Icon = categoryIcons[category.id]
              const locked = !canPickFreely

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, filter: locked ? 'grayscale(60%)' : 'grayscale(0%)' }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <button
                    onClick={() => !locked && setBrowsing(category.id)}
                    disabled={locked}
                    aria-label={category.name}
                    className={`relative flex aspect-square w-full items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 ${
                      locked ? 'opacity-50' : 'transition hover:-translate-y-0.5'
                    }`}
                    style={{ backgroundColor: `${category.hex}2E` }}
                  >
                    <Icon size={22} style={{ color: category.hex }} />
                    {complete && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-cream">
                        <Check size={10} />
                      </span>
                    )}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
      {overlays}
    </>
  )
}
