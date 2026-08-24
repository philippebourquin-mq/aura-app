import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronUp } from 'lucide-react'
import { categories, categoryById } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AppHeader } from '../components/AppHeader'
import { CelebrationOverlay } from '../components/CelebrationOverlay'
import { ChallengeDetailSheet } from '../components/ChallengeDetailSheet'
import { ChallengeTakeover } from '../components/ChallengeTakeover'
import { ChallengeTile } from '../components/ChallengeTile'
import { ConfirmPickSheet } from '../components/ConfirmPickSheet'
import { CurrentRun } from '../components/CurrentRun'
import { LossOverlay } from '../components/LossOverlay'
import { ChallengePicker } from '../components/ChallengePicker'
import { categoryIcons } from '../lib/categoryIcons'
import type { Category, CategoryId, Challenge, HistoryOutcome } from '../types'

type LossState = { outcome: Exclude<HistoryOutcome, 'validated' | 'joker-out'>; title: string; pointsLost: number }

export function Home() {
  const game = useGameState()
  const { state } = game
  const navigate = useNavigate()
  const [browsing, setBrowsing] = useState<CategoryId | 'all' | null>(null)
  const [takeoverOpen, setTakeoverOpen] = useState(true)
  const [pendingPick, setPendingPick] = useState<Challenge | null>(null)
  const [viewingChallenge, setViewingChallenge] = useState<Challenge | null>(null)
  const [celebration, setCelebration] = useState<{ challenge: Challenge; category: Category; amount: number } | null>(
    null,
  )
  const [loss, setLoss] = useState<LossState | null>(null)

  const run = state.currentRun
  const allChallenges = [...challenges, ...state.customChallenges]
  const activeChallenge = run ? allChallenges.find((c) => c.id === run.challengeId) : undefined

  // Re-open the takeover whenever a fresh run goes active, or Lucas requests validation —
  // even if a previous one was minimized.
  const prevStatusRef = useRef(run?.status)
  const prevSubmittedRef = useRef(run?.submittedForValidation)
  useEffect(() => {
    const prevStatus = prevStatusRef.current
    const prevSubmitted = prevSubmittedRef.current
    prevStatusRef.current = run?.status
    prevSubmittedRef.current = run?.submittedForValidation
    if (run?.status === 'active' && prevStatus !== 'active') {
      setTakeoverOpen(true)
    }
    if (run?.submittedForValidation && !prevSubmitted) {
      setTakeoverOpen(true)
    }
  }, [run?.status, run?.submittedForValidation])

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

  // Tapping a card (deck or grid tile) only opens a confirmation — nothing commits on a bare tap,
  // so a stray tap while scrolling or an ambiguous drag can never pick something by accident.
  const handlePick = (challengeId: string) => {
    const challenge = allChallenges.find((c) => c.id === challengeId)
    if (challenge) setPendingPick(challenge)
  }

  // A done or already-locked tile can't be picked, but its content must stay reachable —
  // tapping it opens a read-only view instead of silently doing nothing.
  const handleTileTap = (challenge: Challenge, done: boolean, locked: boolean) => {
    if (done || locked) setViewingChallenge(challenge)
    else handlePick(challenge.id)
  }

  const commitPick = () => {
    if (!pendingPick) return
    if (state.role === 'lucas') game.lucasPickChallenge(pendingPick.id)
    else game.teamSendChallenge(pendingPick.id)
    setPendingPick(null)
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
            submitted={run.submittedForValidation}
            role={state.role}
            points={state.totalPoints}
            onValidate={game.teamValidate}
            onDeny={game.teamDeny}
            onGiveUp={game.lucasGiveUp}
            onSubmitForValidation={game.lucasSubmitForValidation}
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
            onContinue={() => {
              setCelebration(null)
              navigate('/progression')
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingPick && (
          <ConfirmPickSheet
            challenge={pendingPick}
            role={state.role}
            onConfirm={commitPick}
            onCancel={() => setPendingPick(null)}
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
      <AnimatePresence>
        {viewingChallenge && (
          <ChallengeDetailSheet
            challenge={viewingChallenge}
            done={state.validatedChallengeIds.includes(viewingChallenge.id)}
            onClose={() => setViewingChallenge(null)}
          />
        )}
      </AnimatePresence>
    </>
  )

  return (
    <>
      <AppHeader points={state.totalPoints} role={state.role} onRoleChange={game.setRole} wordmark={!isBrowsing} />

      <AnimatePresence mode="wait" initial={false}>
        {isBrowsing ? (
          <motion.div
            key="browsing"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-lg px-6 pt-3 pb-10"
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-lg px-5 pb-10"
          >
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

          <div className="mt-6 space-y-5">
            {categories.map((category, i) => {
              const list = [
                ...challengesByCategory(category.id),
                ...state.customChallenges.filter((c) => c.categoryId === category.id),
              ]
              const Icon = categoryIcons[category.id]
              const locked = !canPickFreely

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <div className="mb-2 flex items-center gap-1.5 px-0.5">
                    <Icon size={13} style={{ color: category.hex }} />
                    <span className="font-rounded text-xs font-semibold text-black/70 dark:text-cream/70">
                      {category.name}
                    </span>
                  </div>
                  <div className="relative -mx-5">
                    <div className="flex gap-2.5 overflow-x-auto px-5 pb-1">
                      {list.map((challenge) => {
                        const done = state.validatedChallengeIds.includes(challenge.id)
                        return (
                          <ChallengeTile
                            key={challenge.id}
                            challenge={challenge}
                            done={done}
                            locked={locked}
                            onClick={() => handleTileTap(challenge, done, locked)}
                          />
                        )
                      })}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-cream to-transparent dark:from-neutral-950" />
                  </div>
                </motion.div>
              )
            })}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
      {overlays}
    </>
  )
}
