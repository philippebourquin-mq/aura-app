import { motion } from 'framer-motion'
import { CloudRain } from 'lucide-react'
import type { HistoryOutcome } from '../types'

interface Props {
  outcome: Exclude<HistoryOutcome, 'validated' | 'joker-out'>
  challengeTitle: string
  pointsLost: number
  onContinue: () => void
}

const copy: Record<Props['outcome'], { title: string; blurb: string }> = {
  declined: { title: 'Défi refusé', blurb: 'Pas cette fois — tu pourras retenter plus tard.' },
  'gave-up': { title: 'Défi abandonné', blurb: 'Ça arrive. Retente quand tu es prêt.' },
  expired: { title: 'Temps écoulé', blurb: "Le défi a expiré avant d'être terminé." },
  'not-validated': { title: 'Pas validé', blurb: "Ta team n'a pas validé ce défi cette fois." },
}

/**
 * A real but quiet moment: points are genuinely lost, so it deserves acknowledgment —
 * but it stays muted and brief on purpose, nowhere near the celebration's energy.
 */
export function LossOverlay({ outcome, challengeTitle, pointsLost, onContinue }: Props) {
  const { title, blurb } = copy[outcome]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-cream px-6 text-center dark:bg-neutral-950"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
      >
        <CloudRain size={24} className="text-black/40 dark:text-cream/40" />
      </motion.div>

      <motion.h1
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl text-black/80 dark:text-cream/80"
      >
        {title}
      </motion.h1>

      <p className="font-rounded max-w-xs text-sm text-black/50 dark:text-cream/50">{challengeTitle}</p>
      <p className="font-rounded max-w-xs text-sm text-black/50 dark:text-cream/50">{blurb}</p>

      {pointsLost > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-rounded rounded-full bg-black/5 px-4 py-1.5 text-sm font-bold text-black/50 dark:bg-white/10 dark:text-cream/50"
        >
          -{pointsLost} pts
        </motion.div>
      )}

      <motion.button
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="font-rounded mt-2 rounded-full border border-black/15 px-7 py-2.5 text-sm font-semibold text-black/70 dark:border-white/15 dark:text-cream/70"
      >
        Continuer
      </motion.button>
    </motion.div>
  )
}
