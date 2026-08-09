import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronUp } from 'lucide-react'
import { categories, categoryById } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AuraGauge } from '../components/AuraGauge'
import { CelebrationOverlay } from '../components/CelebrationOverlay'
import { ChallengeTakeover } from '../components/ChallengeTakeover'
import { CurrentRun } from '../components/CurrentRun'
import { LossOverlay } from '../components/LossOverlay'
import { RoleSwitcher } from '../components/RoleSwitcher'
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
    const Icon = browsingCategory ? categoryIcons[browsingCategory.id] : null
    return (
      <>
        <div>
          <RoleSwitcher role={state.role} onChange={game.setRole} showProfileLink />
          <div className="mx-auto max-w-lg px-6 pt-4 pb-10">
            <button
              onClick={() => setBrowsing(null)}
              className="font-rounded mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
            >
              <ArrowLeft size={16} /> Retour
            </button>

            <div className="mb-8 flex items-center justify-center gap-3 text-center">
              {browsingCategory && Icon ? (
                <>
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: browsingCategory.hex }}
                  >
                    <Icon size={20} className="text-black/70" />
                  </div>
                  <div className="text-left">
                    <h1 className="font-display text-2xl text-black dark:text-cream">{browsingCategory.name}</h1>
                    <p className="font-rounded text-sm text-black/60 dark:text-cream/60">{browsingCategory.tagline}</p>
                  </div>
                </>
              ) : (
                <h1 className="font-display text-2xl text-black dark:text-cream">
                  {state.role === 'lucas' ? 'Choisis un défi à réaliser' : 'Choisis un défi pour Lucas'}
                </h1>
              )}
            </div>

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
        <RoleSwitcher role={state.role} onChange={game.setRole} showProfileLink />

        <div className="mx-auto max-w-4xl px-5 pt-4">
          <header className="mb-6 text-center">
            <h1 className="font-display text-3xl tracking-[0.3em] text-black dark:text-cream">
              A U R A
            </h1>
            <p className="font-rounded mx-auto mt-2 max-w-sm text-sm text-black/60 dark:text-cream/60">
              {state.role === 'lucas'
                ? "Choisis un défi, ou attends que ta team t'en lance un."
                : "Suis la progression de Lucas, lance-lui un défi ou valide ce qu'il a fait."}
            </p>
          </header>

          <AuraGauge points={state.totalPoints} />

          {canPickFreely && (
            <div className="mt-6 flex justify-center">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setBrowsing('all')}
                className="font-rounded inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-cream shadow-lg"
              >
                {state.role === 'lucas' ? 'Lance-toi un défi →' : 'Lance un défi à Lucas →'}
              </motion.button>
            </div>
          )}

          <div className="mt-6">
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

          <div className="mt-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {categories.map((category, i) => {
                const list = [...challengesByCategory(category.id), ...state.customChallenges.filter((c) => c.categoryId === category.id)]
                const done = list.filter((c) => state.validatedChallengeIds.includes(c.id)).length
                const pct = list.length === 0 ? 0 : Math.round((done / list.length) * 100)
                const Icon = categoryIcons[category.id]
                const locked = !canPickFreely

                const content = (
                  <>
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
                  </>
                )

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, filter: locked ? 'grayscale(60%)' : 'grayscale(0%)' }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileTap={locked ? undefined : { scale: 0.96 }}
                  >
                    {!locked ? (
                      <button
                        onClick={() => setBrowsing(category.id)}
                        className="flex h-full w-full flex-col justify-between rounded-card border border-black/10 bg-white/60 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="flex h-full flex-col justify-between rounded-card border border-black/10 bg-white/60 p-4 opacity-60 dark:border-white/10 dark:bg-white/5">
                        {content}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {overlays}
    </>
  )
}
