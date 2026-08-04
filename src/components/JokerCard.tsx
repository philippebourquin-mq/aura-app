import { motion } from 'framer-motion'
import { Moon, Repeat2, Shuffle, type LucideIcon } from 'lucide-react'
import type { JokerDef, JokerId } from '../types'

const jokerIcons: Record<JokerId, LucideIcon> = {
  switch: Shuffle,
  boomerang: Repeat2,
  flemme: Moon,
}

interface Props {
  joker: JokerDef
  onClick: () => void
}

/** Mirrors the physical joker cards: colored header with "joker" label + bold name,
 * character illustration straddling the header/body line, effect text, usage-once badge. */
export function JokerCard({ joker, onClick }: Props) {
  const Icon = jokerIcons[joker.id]

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-aura-joker/95 flex aspect-[63/90] w-28 flex-col overflow-hidden rounded-2xl border-2 border-black/10 text-left shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)] dark:border-white/10"
    >
      <div className="bg-aura-joker px-2.5 pb-6 pt-2.5">
        <span className="font-rounded block text-[8px] font-semibold lowercase tracking-wide text-black/70">
          joker
        </span>
        <span className="font-display block text-[13px] leading-none text-black">{joker.name}</span>
      </div>

      <div className="-mt-5 flex justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream shadow-sm dark:bg-neutral-900">
          <Icon size={18} className="text-black/70 dark:text-cream/70" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between bg-cream px-2.5 pb-2 pt-1 dark:bg-neutral-900">
        <p className="font-rounded line-clamp-3 text-[8px] leading-snug text-black/70 dark:text-cream/70">
          {joker.effect}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-rounded text-[6px] tracking-[0.2em] text-black/20 dark:text-cream/20">AURA</span>
          <span className="bg-aura-joker rounded-full px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wide text-black">
            unique
          </span>
        </div>
      </div>
    </motion.button>
  )
}
