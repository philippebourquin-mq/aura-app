import { motion } from 'framer-motion'
import { Hourglass, X } from 'lucide-react'
import { categoryById, jokers } from '../data/categories'
import { challenges } from '../data/challenges'
import { ChallengeCard } from './ChallengeCard'
import { JokerCard } from './JokerCard'
import type { useGameState } from '../state/useGameState'
import type { JokerId } from '../types'

type Game = ReturnType<typeof useGameState>

/**
 * Everything up to the moment Lucas commits: idle, and the 'received' decision
 * beat for a team-thrown challenge. 'active' is a full-screen takeover owned
 * by Home instead — nothing competes with it once Lucas is actually doing it.
 */
export function CurrentRun({ game }: { game: Game }) {
  const { state } = game
  const run = state.currentRun

  const allChallenges = [...challenges, ...state.customChallenges]
  const challenge = run ? allChallenges.find((c) => c.id === run.challengeId) : undefined
  const category = run ? categoryById(run.categoryId) : undefined

  if (!run) return null // Home's own CTA + category grid cover the idle entry points for both roles.

  if (run.status !== 'received' || !challenge) return null

  if (state.role !== 'lucas') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-black/10 bg-white/60 p-6 text-center dark:border-white/10 dark:bg-white/5">
        <Hourglass size={18} className="text-black/40 dark:text-cream/40" />
        <p className="font-rounded text-sm text-black/60 dark:text-cream/60">
          Défi envoyé — {category?.name}. En attente de la décision de Lucas...
        </p>
      </div>
    )
  }

  const availableJokers = jokers.filter((j) => !state.jokersUsed.includes(j.id as JokerId))
  const jokerChoices = availableJokers.filter((j) => j.id === 'switch' || run.origin === 'team')

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

      <p className="font-rounded text-center text-sm font-semibold text-black dark:text-cream">
        Ta team te lance ce défi. Tu as 24h une fois lancé.
      </p>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => game.lucasAcceptReceived()}
        className="font-rounded rounded-full bg-black px-8 py-3.5 text-sm font-bold text-cream shadow-lg"
      >
        Accepter →
      </motion.button>

      {jokerChoices.length > 0 && (
        <div>
          <p className="font-rounded mb-2 text-center text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-cream/50">
            Ou utilise un joker — gratuit, une seule fois chacun
          </p>
          <div className="flex justify-center gap-2">
            {jokerChoices.map((j) => (
              <JokerCard
                key={j.id}
                joker={j}
                onClick={() => {
                  if (j.id === 'switch') game.lucasSwitchReceived()
                  else game.lucasCloseWithJoker(j.id as 'boomerang' | 'flemme')
                }}
              />
            ))}
          </div>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => game.lucasDeclineHard()}
        className="font-rounded inline-flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black/60 dark:text-cream/40 dark:hover:text-cream/60"
      >
        <X size={14} /> Refuser sans joker — perd {challenge.points} pts
      </motion.button>
    </div>
  )
}
