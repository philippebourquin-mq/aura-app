import { motion } from 'framer-motion'
import { ChevronDown, Repeat, ThumbsDown, ThumbsUp } from 'lucide-react'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge, Role } from '../types'

interface Props {
  challenge: Challenge
  role: Role
  onValidate: () => void
  onReject: () => void
  onMinimize: () => void
  onSwitchRole: (role: Role) => void
}

/**
 * Full-screen focus mode for an accepted challenge. Once Lucas commits, this is
 * the only thing on screen — no gauge, no grid, no jokers competing for attention.
 * The role switcher underneath is fully covered, so a compact one lives here too —
 * this prototype simulates two devices with one, and the takeover can't lock that out.
 */
export function ChallengeTakeover({ challenge, role, onValidate, onReject, onMinimize, onSwitchRole }: Props) {
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

      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 py-8">
        <motion.div
          key={challenge.id}
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChallengeCard challenge={challenge} size="lg" />
        </motion.div>

        {role === 'lucas' && (
          <p className="font-rounded max-w-xs text-center text-base font-semibold text-black/70 dark:text-cream/70">
            Fais ton défi dans la vraie vie — ta team validera. 💪
          </p>
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
                onClick={onReject}
                className="font-rounded inline-flex items-center gap-2 rounded-full border border-black/20 px-5 py-3.5 text-sm font-semibold text-black/60 hover:bg-black/5 dark:border-white/20 dark:text-cream/60 dark:hover:bg-white/10"
              >
                <ThumbsDown size={16} /> Remettre en jeu
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
