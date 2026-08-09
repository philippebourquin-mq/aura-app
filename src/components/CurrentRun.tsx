import { motion } from 'framer-motion'
import { Hourglass, Moon, Repeat2, Shuffle, X, type LucideIcon } from 'lucide-react'
import { categoryById, jokers } from '../data/categories'
import { challenges } from '../data/challenges'
import { ChallengeCard } from './ChallengeCard'
import type { useGameState } from '../state/useGameState'
import type { JokerId } from '../types'

type Game = ReturnType<typeof useGameState>

const jokerIcons: Record<JokerId, LucideIcon> = {
  switch: Shuffle,
  boomerang: Repeat2,
  flemme: Moon,
}

/**
 * Everything up to the moment Lucas commits: idle, and the 'received' decision
 * beat for a team-thrown challenge — "On t'a lancé un défi" in the wireframe,
 * with its Accepter / Joker / Refuser row. 'active' is a full-screen takeover
 * owned by Home instead.
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
        On t'a lancé un défi. Tu as 24h une fois accepté.
      </p>

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => game.lucasAcceptReceived()}
          aria-label="Accepter le défi"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-cream shadow-lg"
        >
          <span className="font-rounded text-xs font-bold">OK</span>
        </motion.button>

        {availableJokers.map((j) => {
          const Icon = jokerIcons[j.id as JokerId]
          return (
            <motion.button
              key={j.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (j.id === 'switch') game.lucasSwitchReceived()
                else game.lucasCloseWithJoker(j.id as 'boomerang' | 'flemme')
              }}
              aria-label={j.name}
              title={j.effect}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black/15 text-black/60 dark:border-white/15 dark:text-cream/60"
            >
              <Icon size={18} />
            </motion.button>
          )
        })}

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => game.lucasDeclineHard()}
          aria-label="Refuser le défi"
          title={`Refuser — perd ${challenge.points} pts`}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-cream shadow-lg"
        >
          <X size={20} />
        </motion.button>
      </div>

      <p className="font-rounded text-center text-[11px] text-black/40 dark:text-cream/40">
        Jokers gratuits, une fois chacun · refuser perd {challenge.points} pts
      </p>
    </div>
  )
}
