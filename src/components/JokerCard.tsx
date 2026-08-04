import { motion } from 'framer-motion'
import type { JokerDef } from '../types'

interface Props {
  joker: JokerDef
  onClick: () => void
}

/** Mini card mirroring the physical joker cards: "joker" label, name, usage-once badge. */
export function JokerCard({ joker, onClick }: Props) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={joker.effect}
      className="bg-aura-joker flex aspect-[63/90] w-24 flex-col justify-between overflow-hidden rounded-2xl border-2 border-black/10 p-2.5 text-left shadow-[0_6px_16px_-6px_rgba(0,0,0,0.3)] dark:border-white/10"
    >
      <span className="font-rounded text-[9px] font-semibold lowercase tracking-wide text-black/60">
        joker
      </span>
      <span className="font-display text-[13px] leading-tight text-black">{joker.name}</span>
      <span className="font-rounded self-start rounded-full bg-black/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-black/60">
        usage unique
      </span>
    </motion.button>
  )
}
