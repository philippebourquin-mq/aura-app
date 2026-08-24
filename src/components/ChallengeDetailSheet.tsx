import { motion } from 'framer-motion'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge } from '../types'

interface Props {
  challenge: Challenge
  done: boolean
  onClose: () => void
}

/**
 * Read-only view of a card's full content — reachable from any tile, including
 * completed ones, since a validated challenge shouldn't become impossible to reopen.
 */
export function ChallengeDetailSheet({ challenge, done, onClose }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/40 px-0 backdrop-blur-sm sm:justify-center sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col items-center gap-5 rounded-t-[2rem] bg-cream px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 dark:bg-neutral-950 sm:rounded-[2rem] sm:pb-6"
      >
        <ChallengeCard challenge={challenge} validated={done} />
        <button
          onClick={onClose}
          className="font-rounded w-full rounded-full border border-black/15 py-3 text-sm font-semibold text-black/70 dark:border-white/15 dark:text-cream/70"
        >
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
