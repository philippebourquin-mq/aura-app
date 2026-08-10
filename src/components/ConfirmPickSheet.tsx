import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge, Role } from '../types'

interface Props {
  challenge: Challenge
  role: Role
  onConfirm: () => void
  onCancel: () => void
}

/**
 * The one deliberate commit point for picking a card — reached from a tap on
 * the deck or a tap on a grid tile alike. Nothing picks a challenge without
 * landing here first, so a stray tap while scrolling/browsing can't commit
 * anything by accident.
 */
export function ConfirmPickSheet({ challenge, role, onConfirm, onCancel }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col items-center rounded-t-card bg-cream p-6 dark:bg-neutral-900 sm:rounded-card"
      >
        <div className="mb-4 flex w-full items-center justify-between">
          <h2 className="font-display text-lg text-black dark:text-cream">
            {role === 'lucas' ? 'Ce défi te tente ?' : 'Envoyer ce défi à Lucas ?'}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-full p-1.5 text-black/40 hover:bg-black/5 dark:text-cream/40 dark:hover:bg-white/10"
            aria-label="Annuler"
          >
            <X size={18} />
          </button>
        </div>

        <ChallengeCard challenge={challenge} />

        <div className="mt-5 flex w-full gap-3">
          <button
            onClick={onCancel}
            className="font-rounded flex-1 rounded-full border border-black/15 py-3 text-sm font-semibold text-black/70 dark:border-white/15 dark:text-cream/70"
          >
            Annuler
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="font-rounded flex-1 rounded-full bg-black py-3 text-sm font-bold text-cream"
          >
            {role === 'lucas' ? 'Confirmer' : 'Envoyer'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
