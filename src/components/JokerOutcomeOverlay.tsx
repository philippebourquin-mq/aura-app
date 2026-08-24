import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { JOKER_HEX } from '../data/categories'

interface Props {
  title: string
  blurb: string
  Icon: LucideIcon
  onContinue: () => void
}

/**
 * The closing beat after a joker is played. Spending one is final and rare — three
 * cards, one use each — so it gets its own explicit acknowledgment instead of
 * silently dropping back to whatever screen comes next underneath.
 */
export function JokerOutcomeOverlay({ title, blurb, Icon, onContinue }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-cream px-6 text-center dark:bg-neutral-950"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: JOKER_HEX }}
      >
        <Icon size={28} className="text-black/80" />
      </motion.div>

      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-display text-3xl leading-tight text-black dark:text-cream"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="font-rounded max-w-xs text-sm font-normal text-black/60 dark:text-cream/60"
      >
        {blurb}
      </motion.p>

      <motion.button
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="font-rounded mt-4 rounded-full bg-black px-8 py-3 text-sm font-bold text-cream"
      >
        Continuer
      </motion.button>
    </motion.div>
  )
}
