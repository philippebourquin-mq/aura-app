import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getLevelProgress, levels } from '../data/levels'

interface Props {
  points: number
  onClose: () => void
}

export function LevelPathModal({ points, onClose }: Props) {
  const { current } = getLevelProgress(points)

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-[2rem] bg-cream p-6 shadow-2xl dark:bg-neutral-900"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-black dark:text-cream">Les paliers d'Aura</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-black/40 transition hover:bg-black/5 hover:text-black dark:text-cream/40 dark:hover:bg-white/10 dark:hover:text-cream"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative space-y-6 pb-2 pl-1">
          <div className="absolute bottom-5 left-[1.35rem] top-5 w-0.5 bg-black/10 dark:bg-white/10" />
          {levels.map((level) => {
            const reached = points >= level.minPoints
            const isCurrent = level.name === current.name
            return (
              <div key={level.name} className="relative flex items-start gap-4">
                <div
                  className={`relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 text-xl transition ${
                    reached
                      ? 'border-black bg-white dark:border-cream dark:bg-neutral-900'
                      : 'border-black/15 bg-black/5 grayscale dark:border-white/15 dark:bg-white/5'
                  } ${isCurrent ? 'ring-4 ring-amber-400/50' : ''}`}
                >
                  {level.emoji}
                </div>
                <div className="pt-1.5">
                  <p
                    className={`font-display flex items-center gap-2 text-base ${
                      reached ? 'text-black dark:text-cream' : 'text-black/40 dark:text-cream/40'
                    }`}
                  >
                    {level.name}
                    {isCurrent && (
                      <span className="font-rounded rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-cream dark:bg-cream dark:text-black">
                        actuel
                      </span>
                    )}
                  </p>
                  <p className="font-rounded text-xs text-black/50 dark:text-cream/50">
                    {level.minPoints} pts · {level.blurb}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
