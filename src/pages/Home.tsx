import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { categories, categoryById } from '../data/categories'
import { challenges, challengesByCategory } from '../data/challenges'
import { useGameState } from '../state/useGameState'
import { AuraGauge } from '../components/AuraGauge'
import { CurrentRun } from '../components/CurrentRun'
import { RoleSwitcher } from '../components/RoleSwitcher'
import { ChallengePicker } from '../components/ChallengePicker'
import { categoryIcons } from '../lib/categoryIcons'
import type { CategoryId } from '../types'

export function Home() {
  const game = useGameState()
  const { state } = game
  const [browsing, setBrowsing] = useState<CategoryId | null>(null)

  const totalPoints = challenges
    .filter((c) => state.validatedChallengeIds.includes(c.id))
    .reduce((sum, c) => sum + c.points, 0)

  const canPickFreely = state.role === 'lucas' && !state.currentRun
  const browsingCategory = browsing ? categoryById(browsing) : null

  // Free-choice browsing happens inline, right here on the home screen — no page navigation.
  if (canPickFreely && browsingCategory) {
    const Icon = categoryIcons[browsingCategory.id]
    return (
      <div>
        <RoleSwitcher role={state.role} onChange={game.setRole} showProfileLink />
        <div className="mx-auto max-w-lg px-6 pt-4 pb-10">
          <button
            onClick={() => setBrowsing(null)}
            className="font-rounded mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black dark:text-cream/60 dark:hover:text-cream"
          >
            <ArrowLeft size={16} /> Retour aux thèmes
          </button>

          <div className="mb-8 flex items-center justify-center gap-3 text-center">
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
          </div>

          <ChallengePicker
            validatedChallengeIds={state.validatedChallengeIds}
            lockedCategoryId={browsingCategory.id}
            onPick={(id) => {
              game.lucasPickChallenge(id)
              setBrowsing(null)
            }}
          />
        </div>
      </div>
    )
  }

  return (
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

        <AuraGauge points={totalPoints} />

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentRun?.id ?? 'idle'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CurrentRun game={game} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8">
          {canPickFreely && (
            <p className="font-rounded mb-3 text-center text-sm font-semibold text-black/70 dark:text-cream/70">
              Ou choisis toi-même un défi par thème :
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map((category, i) => {
              const list = challengesByCategory(category.id)
              const done = list.filter((c) => state.validatedChallengeIds.includes(c.id)).length
              const pct = Math.round((done / list.length) * 100)
              const Icon = categoryIcons[category.id]
              const locked = state.role === 'lucas' && !!state.currentRun

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
                  {state.role === 'lucas' && !locked ? (
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
  )
}
