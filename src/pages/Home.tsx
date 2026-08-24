import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'
import { categoryById } from '../data/categories'
import { challenges } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AppHeader } from '../components/AppHeader'
import { CelebrationOverlay } from '../components/CelebrationOverlay'
import { ChallengePicker } from '../components/ChallengePicker'
import { ChallengeTakeover } from '../components/ChallengeTakeover'
import { ConfirmPickSheet } from '../components/ConfirmPickSheet'
import { CurrentRun } from '../components/CurrentRun'
import { JokerConfirmSheet } from '../components/JokerConfirmSheet'
import { JokerOutcomeOverlay } from '../components/JokerOutcomeOverlay'
import { JokerPlayOverlay } from '../components/JokerPlayOverlay'
import { LossOverlay } from '../components/LossOverlay'
import { jokerIcons, jokerOutcomeCopy } from '../lib/jokerIcons'
import type { Category, Challenge, HistoryOutcome, JokerDef, JokerId } from '../types'

type LossState = { outcome: Exclude<HistoryOutcome, 'validated' | 'joker-out'>; title: string; pointsLost: number }

/** Playing a joker is single-use and final, so it gets a real beginning, middle, and end —
 * this lives on Home (not CurrentRun) because closing the run mid-flow would otherwise
 * unmount the outcome screen before the user ever sees it. */
type JokerStep = 'confirm' | 'playing' | 'outcome'

/**
 * Home IS the "choisis un défi" screen — the deck is the first thing either
 * role sees, not something reached through a CTA. When a run exists there's
 * nothing to pick, so this swaps to that run's own status instead.
 */
export function Home() {
  const game = useGameState()
  const { state } = game
  const navigate = useNavigate()
  const [takeoverOpen, setTakeoverOpen] = useState(true)
  const [pendingPick, setPendingPick] = useState<Challenge | null>(null)
  const [celebration, setCelebration] = useState<{ challenge: Challenge; category: Category; amount: number } | null>(
    null,
  )
  const [loss, setLoss] = useState<LossState | null>(null)
  const [jokerFlow, setJokerFlow] = useState<{ joker: JokerDef; step: JokerStep } | null>(null)

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
    if (latest.outcome === 'joker-out') return // has its own JokerOutcomeOverlay, driven by jokerFlow instead
    if (latest.outcome === 'validated') {
      const cat = categoryById(latest.categoryId)
      if (c && cat) setCelebration({ challenge: c, category: cat, amount: latest.pointsDelta })
      return
    }
    setLoss({ outcome: latest.outcome, title: c?.title ?? 'Défi', pointsLost: -latest.pointsDelta })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.history])

  const canPickFreely = !state.currentRun

  // Tapping the deck only opens a confirmation — nothing commits on a bare tap, so a stray
  // tap while scrolling or an ambiguous drag can never pick something by accident.
  const handlePick = (challengeId: string) => {
    const challenge = allChallenges.find((c) => c.id === challengeId)
    if (challenge) setPendingPick(challenge)
  }

  const commitPick = () => {
    if (!pendingPick) return
    if (state.role === 'lucas') game.lucasPickChallenge(pendingPick.id)
    else game.teamSendChallenge(pendingPick.id)
    setPendingPick(null)
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
        {jokerFlow?.step === 'confirm' && (
          <JokerConfirmSheet
            name={jokerFlow.joker.name}
            effect={jokerFlow.joker.effect}
            Icon={jokerIcons[jokerFlow.joker.id as JokerId]}
            onCancel={() => setJokerFlow(null)}
            onConfirm={() => setJokerFlow({ joker: jokerFlow.joker, step: 'playing' })}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {jokerFlow?.step === 'playing' && (
          <JokerPlayOverlay
            name={jokerFlow.joker.name}
            effect={jokerFlow.joker.effect}
            Icon={jokerIcons[jokerFlow.joker.id as JokerId]}
            onDone={() => {
              const jokerId = jokerFlow.joker.id as JokerId
              if (jokerId === 'switch') game.lucasSwitchReceived()
              else game.lucasCloseWithJoker(jokerId as 'boomerang' | 'flemme')
              setJokerFlow({ joker: jokerFlow.joker, step: 'outcome' })
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {jokerFlow?.step === 'outcome' && (
          <JokerOutcomeOverlay
            title={jokerOutcomeCopy[jokerFlow.joker.id as JokerId].title}
            blurb={jokerOutcomeCopy[jokerFlow.joker.id as JokerId].blurb}
            Icon={jokerIcons[jokerFlow.joker.id as JokerId]}
            onContinue={() => setJokerFlow(null)}
          />
        )}
      </AnimatePresence>
    </>
  )

  return (
    <>
      <AppHeader points={state.totalPoints} role={state.role} onRoleChange={game.setRole} wordmark={!canPickFreely} />

      <div className="mx-auto max-w-lg px-5 pt-2 pb-10">
        <AnimatePresence mode="wait" initial={false}>
          {!canPickFreely ? (
            <motion.div
              key="run"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {run?.status === 'active' && activeChallenge ? (
                !takeoverOpen && (
                  <motion.button
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTakeoverOpen(true)}
                    className="font-rounded flex w-full items-center justify-between rounded-card border border-black/10 bg-white/70 px-4 py-3 text-left text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <span className="font-semibold text-black dark:text-cream">Reprendre le défi en cours</span>
                    <ChevronUp size={16} className="text-black/40 dark:text-cream/40" />
                  </motion.button>
                )
              ) : (
                <CurrentRun game={game} onPlayJoker={(joker) => setJokerFlow({ joker, step: 'confirm' })} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="picker"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display mb-10 mt-2 text-[2.1rem] leading-[1.05] text-black dark:text-cream">
                {state.role === 'lucas' ? 'Choisis ton prochain défi' : 'Choisis un défi pour Lucas'}
              </h1>

              <ChallengePicker
                validatedChallengeIds={state.validatedChallengeIds}
                customChallenges={state.customChallenges}
                onPick={handlePick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {overlays}
    </>
  )
}
