import { motion } from 'framer-motion'
import { X, type LucideIcon } from 'lucide-react'
import { JOKER_HEX } from '../data/categories'

interface Props {
  name: string
  effect: string
  Icon: LucideIcon
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Jokers are single-use and irreversible, so playing one deserves the same deliberate
 * commit point as picking a challenge — never a bare tap-to-fire — and the card is shown
 * at real size here, not the compact tile, so the moment reads as significant.
 */
export function JokerConfirmSheet({ name, effect, Icon, onConfirm, onCancel }: Props) {
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
          <h2 className="font-display text-lg text-black dark:text-cream">Jouer ce joker ?</h2>
          <button
            onClick={onCancel}
            className="rounded-full p-1.5 text-black/40 hover:bg-black/5 dark:text-cream/40 dark:hover:bg-white/10"
            aria-label="Annuler"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative flex aspect-[63/90] w-64 flex-col overflow-hidden rounded-[1.75rem] border-2 border-black/10 bg-cream shadow-[0_14px_34px_-10px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-neutral-900">
          <div className="flex flex-col items-center gap-2 px-5 pb-5 pt-7" style={{ backgroundColor: JOKER_HEX }}>
            <Icon size={30} className="text-black/80" />
            <h3 className="font-display text-xl text-black">{name}</h3>
          </div>
          <div className="flex flex-1 items-center px-5 py-4">
            <p className="font-rounded text-center text-sm font-normal leading-relaxed text-black/80 dark:text-cream/80">
              {effect}
            </p>
          </div>
          <span className="font-rounded pb-3 text-center text-[10px] tracking-[0.35em] text-black/20 dark:text-cream/20">
            AURA
          </span>
        </div>

        <p className="font-rounded mt-3 text-center text-[11px] text-black/40 dark:text-cream/40">
          Usage unique — impossible à annuler une fois joué.
        </p>

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
            className="font-rounded flex-1 rounded-full py-3 text-sm font-bold text-black"
            style={{ backgroundColor: JOKER_HEX }}
          >
            Jouer {name}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
