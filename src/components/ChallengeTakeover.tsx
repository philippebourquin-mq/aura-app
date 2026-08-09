import { motion } from 'framer-motion'
import { ChevronDown, Repeat, ThumbsDown, ThumbsUp, TimerReset } from 'lucide-react'
import { ChallengeCard } from './ChallengeCard'
import { useCountdown } from '../lib/countdown'
import type { Challenge, Role, RunOrigin } from '../types'

interface Props {
  challenge: Challenge
  origin: RunOrigin
  expiresAt?: string
  role: Role
  onValidate: () => void
  onDeny: () => void
  onGiveUp: () => void
  onMinimize: () => void
  onSwitchRole: (role: Role) => void
}

/**
 * Full-screen focus mode for an accepted, running challenge. Once Lucas commits,
 * this is the only thing on screen — no gauge, no grid, no jokers. The real 24h
 * clock lives here, along with the real stakes: validate earns (doubled if Lucas
 * picked it himself), deny or give-up lose the points.
 */
export function ChallengeTakeover({
  challenge,
  origin,
  expiresAt,
  role,
  onValidate,
  onDeny,
  onGiveUp,
  onMinimize,
  onSwitchRole,
}: Props) {
  const { label, expired } = useCountdown(expiresAt)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-cream dark:bg-neutral-950"
    >
      <div className="flex items-center justify-between px-5 pt-5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMinimize}
          className="font-rounded inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-black/50 hover:bg-black/5 dark:text-cream/50 dark:hover:bg-white/10"
        >
          <ChevronDown size={15} /> Réduire
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSwitchRole(role === 'lucas' ? 'team' : 'lucas')}
          className="font-rounded inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black/50 hover:bg-black/5 dark:border-white/10 dark:text-cream/50 dark:hover:bg-white/10"
        >
          <Repeat size={13} /> Voir côté {role === 'lucas' ? 'Team' : 'Lucas'}
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8">
        <div
          className={`font-rounded inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            expired
              ? 'bg-black/10 text-black/40 dark:bg-white/10 dark:text-cream/40'
              : 'bg-black text-cream'
          }`}
        >
          <TimerReset size={13} /> {expired ? 'Temps écoulé' : `Expire dans ${label}`}
        </div>

        <motion.div
          key={challenge.id}
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChallengeCard challenge={challenge} size="lg" />
        </motion.div>

        {origin === 'lucas' && (
          <span className="font-rounded rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-black/60 dark:bg-white/10 dark:text-cream/60">
            Choisi librement — points x2 si validé
          </span>
        )}

        {role === 'lucas' && (
          <div className="flex flex-col items-center gap-3">
            <p className="font-rounded max-w-xs text-center text-base font-semibold text-black/70 dark:text-cream/70">
              Fais ton défi dans la vraie vie — ta team validera. 💪
            </p>
            <button
              onClick={onGiveUp}
              className="font-rounded text-xs font-semibold text-black/40 hover:text-black/60 dark:text-cream/40 dark:hover:text-cream/60"
            >
              Abandonner — perd {challenge.points} pts
            </button>
          </div>
        )}

        {role === 'team' && (
          <div className="flex flex-col items-center gap-4">
            <p className="font-rounded text-sm text-black/50 dark:text-cream/50">
              Résolution — à tout moment
            </p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onValidate}
                className="font-rounded inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-base font-bold text-cream shadow-lg"
              >
                <ThumbsUp size={18} /> Valider
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onDeny}
                className="font-rounded inline-flex items-center gap-2 rounded-full border border-black/20 px-5 py-3.5 text-sm font-semibold text-black/60 hover:bg-black/5 dark:border-white/20 dark:text-cream/60 dark:hover:bg-white/10"
              >
                <ThumbsDown size={16} /> Refuser
              </motion.button>
            </div>
            <p className="font-rounded text-xs text-black/40 dark:text-cream/40">
              Refuser fait perdre {challenge.points} pts à Lucas
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
