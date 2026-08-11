import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { JOKER_HEX } from '../data/categories'

interface Props {
  name: string
  effect: string
  Icon: LucideIcon
  onDone: () => void
}

/**
 * The physical beat of playing a joker card: it pops up full-size, holds a moment
 * so its effect is legible, then flies off like a card being tossed onto the table.
 */
export function JokerPlayOverlay({ name, effect, Icon, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 950)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        initial={{ scale: 0.4, rotate: -10, opacity: 0, y: 30 }}
        animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
        exit={{ x: -440, rotate: -28, opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative flex aspect-[63/90] w-56 flex-col overflow-hidden rounded-[1.75rem] border-2 border-black/10 bg-cream shadow-2xl"
      >
        <div
          className="flex flex-col items-center gap-2 px-5 pb-5 pt-7"
          style={{ backgroundColor: JOKER_HEX }}
        >
          <Icon size={28} className="text-black/80" />
          <h3 className="font-display text-lg text-black">{name}</h3>
        </div>
        <div className="flex flex-1 items-center px-5 py-4">
          <p className="font-rounded text-center text-sm leading-relaxed text-black/80">{effect}</p>
        </div>
        <span className="font-rounded pb-3 text-center text-[10px] tracking-[0.35em] text-black/20">AURA</span>
      </motion.div>
    </motion.div>
  )
}
