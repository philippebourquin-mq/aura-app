import { motion } from 'framer-motion'
import { Hourglass, Sparkles } from 'lucide-react'
import { categories, categoryById, jokers } from '../data/categories'
import { challenges } from '../data/challenges'
import { ChallengeCard } from './ChallengeCard'
import { ChallengePicker } from './ChallengePicker'
import { JokerCard } from './JokerCard'
import type { useGameState } from '../state/useGameState'
import type { JokerId } from '../types'

type Game = ReturnType<typeof useGameState>

/**
 * Everything up to the moment Lucas commits: idle, theme/card selection for a
 * team-thrown challenge, and the reveal/decision beat. Once a run is
 * 'in-progress' it becomes a full-screen takeover, owned by Home instead.
 */
export function CurrentRun({ game }: { game: Game }) {
  const { state } = game
  const run = state.currentRun

  const usedJokers = state.jokersUsed
  const challenge = run?.challengeId ? challenges.find((c) => c.id === run.challengeId) : undefined
  const category = run?.categoryId ? categoryById(run.categoryId) : undefined

  // Nothing going on: let the current role kick something off.
  if (!run) {
    if (state.role === 'team') {
      return (
        <div className="rounded-card border border-black/10 bg-white/60 p-6 text-center dark:border-white/10 dark:bg-white/5">
          <p className="font-rounded mb-3 text-sm text-black/60 dark:text-cream/60">
            Aucun défi en cours pour Lucas.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => game.teamStartChallenge()}
            className="font-rounded inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-cream"
          >
            <Sparkles size={16} /> Lancer un défi à Lucas
          </motion.button>
        </div>
      )
    }
    return null // Lucas: the category grid below already offers the free-choice entry point.
  }

  // --- team-initiated: waiting on Lucas to pick a theme ---
  if (run.status === 'awaiting-category') {
    if (state.role === 'lucas') {
      return (
        <div className="rounded-card border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
          <p className="font-rounded mb-3 text-center text-sm font-semibold text-black dark:text-cream">
            🎯 On te lance un défi ! Choisis un thème.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => game.lucasPickTheme(c.id)}
                className="font-rounded rounded-full px-3 py-1.5 text-xs font-semibold text-black transition hover:-translate-y-0.5"
                style={{ backgroundColor: c.hex }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center gap-2 rounded-card border border-black/10 bg-white/60 p-6 text-center dark:border-white/10 dark:bg-white/5">
        <Hourglass size={18} className="text-black/40 dark:text-cream/40" />
        <p className="font-rounded text-sm text-black/60 dark:text-cream/60">
          En attente : Lucas choisit un thème...
        </p>
      </div>
    )
  }

  // --- team-initiated: waiting on the team to assign a specific card ---
  if (run.status === 'awaiting-card') {
    if (state.role === 'team') {
      return (
        <div>
          <p className="font-rounded mb-4 text-center text-sm font-semibold text-black dark:text-cream">
            Choisis une carte pour Lucas — thème « {category?.name} »
          </p>
          <ChallengePicker
            validatedChallengeIds={state.validatedChallengeIds}
            lockedCategoryId={run.categoryId}
            onPick={(id) => game.teamAssignCard(id)}
          />
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center gap-2 rounded-card border border-black/10 bg-white/60 p-6 text-center dark:border-white/10 dark:bg-white/5">
        <Hourglass size={18} className="text-black/40 dark:text-cream/40" />
        <p className="font-rounded text-sm text-black/60 dark:text-cream/60">
          Thème choisi : {category?.name}. En attente que ta team choisisse ta carte...
        </p>
      </div>
    )
  }

  if (!challenge) return null

  // --- revealed: the decision beat. Jokers live here and nowhere else. ---
  if (run.status === 'revealed') {
    if (state.role !== 'lucas') {
      return (
        <div className="flex flex-col items-center gap-3 rounded-card border border-black/10 bg-white/60 p-6 text-center dark:border-white/10 dark:bg-white/5">
          <Hourglass size={18} className="text-black/40 dark:text-cream/40" />
          <p className="font-rounded text-sm text-black/60 dark:text-cream/60">
            Carte révélée à Lucas. En attente de sa décision...
          </p>
        </div>
      )
    }

    const availableJokers = jokers.filter((j) => !usedJokers.includes(j.id as JokerId))
    // Boomerang / Flemme only make sense as a reaction to a challenge Lucas received.
    const reactionJokers = availableJokers.filter(
      (j) => j.id === 'switch' || run.origin === 'team',
    )

    return (
      <div className="flex flex-col items-center gap-5">
        <motion.div
          key={challenge.id}
          initial={{ rotateY: -110, opacity: 0, scale: 0.9 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
        >
          <ChallengeCard challenge={challenge} />
        </motion.div>

        {reactionJokers.length > 0 && (
          <div>
            <p className="font-rounded mb-2 text-center text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-cream/50">
              {run.origin === 'team' ? 'Une carte te tente pas ?' : 'Cette carte te tente pas ?'}
            </p>
            <div className="flex justify-center gap-2">
              {reactionJokers.map((j) => (
                <JokerCard
                  key={j.id}
                  joker={j}
                  onClick={() => {
                    if (j.id === 'switch') game.switchCard()
                    else game.closeWithJoker(j.id as 'boomerang' | 'flemme')
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => game.lucasAcceptChallenge()}
          className="font-rounded rounded-full bg-black px-8 py-3.5 text-sm font-bold text-cream shadow-lg"
        >
          C'est parti →
        </motion.button>
      </div>
    )
  }

  return null
}
