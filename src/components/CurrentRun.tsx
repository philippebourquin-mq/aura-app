import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Hourglass, Moon, Repeat2, Shuffle, X, type LucideIcon } from 'lucide-react'
import { categoryById, jokers } from '../data/categories'
import { challenges } from '../data/challenges'
import { ChallengeCard } from './ChallengeCard'
import { JokerPlayOverlay } from './JokerPlayOverlay'
import { JokerTile } from './JokerTile'
import type { useGameState } from '../state/useGameState'
import type { JokerDef, JokerId } from '../types'

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
  const [playingJoker, setPlayingJoker] = useState<JokerDef | null>(null)

  const allChallenges = [...challenges, ...state.customChallenges]
  const challenge = run ? allChallenges.find((c) => c.id === run.challengeId) : undefined
  const category = run ? categoryById(run.categoryId) : undefined

  if (!run) return null // Home's own deck covers the idle entry point for both roles.

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

      <div className="flex items-center gap-6">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => game.lucasDeclineHard()}
          aria-label="Refuser le défi"
          title={`Refuser — perd ${challenge.points} pts`}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/15 text-black/50 dark:border-white/15 dark:text-cream/50"
        >
          <X size={18} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => game.lucasAcceptReceived()}
          aria-label="Accepter le défi"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-cream shadow-lg"
        >
          <span className="font-rounded text-sm font-bold">OK</span>
        </motion.button>
      </div>
      <p className="font-rounded -mt-2 text-center text-[11px] text-black/40 dark:text-cream/40">
        Refuser perd {challenge.points} pts
      </p>

      {availableJokers.length > 0 && (
        <div className="w-full">
          <p className="font-rounded mb-2 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-black/30 dark:text-cream/30">
            Tes jokers — gratuits, une fois chacun
          </p>
          <div className="flex justify-center gap-2.5">
            {availableJokers.map((j) => (
              <JokerTile
                key={j.id}
                name={j.name}
                effect={j.effect}
                Icon={jokerIcons[j.id as JokerId]}
                onClick={() => setPlayingJoker(j)}
              />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {playingJoker && (
          <JokerPlayOverlay
            name={playingJoker.name}
            effect={playingJoker.effect}
            Icon={jokerIcons[playingJoker.id as JokerId]}
            onDone={() => {
              if (playingJoker.id === 'switch') game.lucasSwitchReceived()
              else game.lucasCloseWithJoker(playingJoker.id as 'boomerang' | 'flemme')
              setPlayingJoker(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
