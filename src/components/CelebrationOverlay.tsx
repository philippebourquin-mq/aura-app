import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Sparkles } from 'lucide-react'
import type { Category, Challenge } from '../types'

interface Props {
  challenge: Challenge
  category: Category
  amount: number
  bonus?: boolean
  onContinue: () => void
}

/**
 * The payoff screen. Validating a challenge is the one moment in the app worth
 * a full takeover — bigger and louder than anything else in the flow.
 */
export function CelebrationOverlay({ challenge, category, amount, bonus, onContinue }: Props) {
  useEffect(() => {
    const colors = [category.hex, '#111111', '#F5EFDE']
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.35 }, colors })
    const timer = setTimeout(
      () => confetti({ particleCount: 140, spread: 130, origin: { y: 0.5 }, colors }),
      180,
    )
    return () => clearTimeout(timer)
  }, [category.hex])

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
        style={{ backgroundColor: category.hex }}
      >
        <Sparkles size={28} className="text-black" />
      </motion.div>

      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-display text-4xl text-black dark:text-cream"
      >
        Validé !
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="font-rounded max-w-xs text-sm text-black/60 dark:text-cream/60"
      >
        {challenge.title}
      </motion.p>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 16 }}
        className="rounded-full px-6 py-2.5 text-lg font-bold text-black"
        style={{ backgroundColor: category.hex }}
      >
        +{amount} pts{bonus ? ' · x2' : ''}
      </motion.div>

      <motion.button
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="font-rounded mt-4 rounded-full bg-black px-8 py-3 text-sm font-bold text-cream"
      >
        Continuer
      </motion.button>
    </motion.div>
  )
}
