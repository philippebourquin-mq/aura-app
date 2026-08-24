import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { JOKER_HEX } from '../data/categories'

interface Props {
  name: string
  effect: string
  Icon: LucideIcon
  onClick: () => void
}

/**
 * A miniature of the physical joker card's recto — same banner-over-body structure
 * as ChallengeTile, but in the joker's own blue-grey and with no points pill, since
 * jokers aren't worth anything — they're a free out.
 */
export function JokerTile({ name, effect, Icon, onClick }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={name}
      title={effect}
      className="flex h-24 w-20 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-cream shadow-sm dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="flex flex-col items-center justify-center gap-1 py-2.5" style={{ backgroundColor: JOKER_HEX }}>
        <Icon size={18} className="text-black/75" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-1">
        <span className="font-rounded text-[10.5px] font-bold leading-tight text-black/85 dark:text-cream/85">
          {name}
        </span>
        <span className="font-rounded text-[7px] font-bold uppercase tracking-[0.15em] text-black/30 dark:text-cream/30">
          joker
        </span>
      </div>
    </motion.button>
  )
}
