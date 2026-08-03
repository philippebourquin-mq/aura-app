import { motion } from 'framer-motion'
import { getLevelProgress, TOTAL_POSSIBLE_POINTS } from '../data/levels'

interface Props {
  points: number
  compact?: boolean
}

export function AuraGauge({ points, compact = false }: Props) {
  const { current, next, pct, isMax } = getLevelProgress(points)

  return (
    <div
      className={
        compact
          ? 'flex items-center gap-3'
          : 'rounded-card border border-black/10 bg-white/60 p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5'
      }
    >
      <div className={compact ? 'text-3xl' : 'text-5xl'}>{current.emoji}</div>

      <div className={compact ? 'flex-1' : 'mt-2'}>
        <p
          className={
            compact
              ? 'font-display text-sm text-black dark:text-cream'
              : 'font-display text-2xl text-black dark:text-cream'
          }
        >
          {current.name}
        </p>
        <p className="font-rounded text-xs text-black/50 dark:text-cream/50">
          {points} pts {!isMax && next ? `· ${next.minPoints - points} pts avant ${next.name}` : `· ${TOTAL_POSSIBLE_POINTS} pts max`}
        </p>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}
