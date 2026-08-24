import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Progress } from './pages/Progress'
import { useGameState } from './state/useGameState'
import { categoryById } from './data/categories'
import { challenges } from './data/challenges'
import { CelebrationOverlay } from './components/CelebrationOverlay'
import { ChallengeTakeover } from './components/ChallengeTakeover'
import { JokerConfirmSheet } from './components/JokerConfirmSheet'
import { JokerOutcomeOverlay } from './components/JokerOutcomeOverlay'
import { JokerPlayOverlay } from './components/JokerPlayOverlay'
import { LossOverlay } from './components/LossOverlay'
import { jokerIcons, jokerOutcomeCopy } from './lib/jokerIcons'
import type { Category, Challenge, HistoryOutcome, JokerDef, JokerId } from './types'

type Game = ReturnType<typeof useGameState>
type LossState = { outcome: Exclude<HistoryOutcome, 'validated' | 'joker-out'>; title: string; pointsLost: number }
/** Playing a joker is single-use and final, so it gets a real beginning, middle, and end. */
type JokerStep = 'confirm' | 'playing' | 'outcome'

function AnimatedRoutes({ game, openTakeover }: { game: Game; openTakeover: () => void }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home game={game} openTakeover={openTakeover} />} />
          <Route path="/progression" element={<Progress game={game} openTakeover={openTakeover} />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * The current run's full-screen view (and the joker/celebration/loss moments that
 * hang off it) lives here, above the routed pages, instead of inside Home — so it
 * survives navigating to the profile and back, and both pages can reopen it via
 * the persistent CurrentRunBar in the header.
 */
function AppShell() {
  const game = useGameState()
  const { state } = game
  const navigate = useNavigate()
  const [takeoverOpen, setTakeoverOpen] = useState(true)
  const [jokerFlow, setJokerFlow] = useState<{ joker: JokerDef; step: JokerStep } | null>(null)
  const [celebration, setCelebration] = useState<{ challenge: Challenge; category: Category; amount: number } | null>(
    null,
  )
  const [loss, setLoss] = useState<LossState | null>(null)

  const run = state.currentRun
  const allChallenges = [...challenges, ...state.customChallenges]

  // Auto-open the takeover whenever a fresh run appears, goes active, or Lucas submits —
  // so it's seen once without asking; after that, reopening it is on the persistent bar.
  const prevRunIdRef = useRef(run?.id)
  const prevStatusRef = useRef(run?.status)
  const prevSubmittedRef = useRef(run?.submittedForValidation)
  useEffect(() => {
    const prevRunId = prevRunIdRef.current
    const prevStatus = prevStatusRef.current
    const prevSubmitted = prevSubmittedRef.current
    prevRunIdRef.current = run?.id
    prevStatusRef.current = run?.status
    prevSubmittedRef.current = run?.submittedForValidation
    if (run?.id && run.id !== prevRunId) setTakeoverOpen(true)
    if (run?.status === 'active' && prevStatus !== 'active') setTakeoverOpen(true)
    if (run?.submittedForValidation && !prevSubmitted) setTakeoverOpen(true)
  }, [run?.id, run?.status, run?.submittedForValidation])

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

  return (
    <>
      <AnimatedRoutes game={game} openTakeover={() => setTakeoverOpen(true)} />

      <AnimatePresence>
        {run && takeoverOpen && (
          <ChallengeTakeover
            game={game}
            run={run}
            onMinimize={() => setTakeoverOpen(false)}
            onSwitchRole={game.setRole}
            onPlayJoker={(joker) => setJokerFlow({ joker, step: 'confirm' })}
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
}

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-cream pb-8 dark:bg-neutral-950">
        <AppShell />
      </div>
    </HashRouter>
  )
}

export default App
