import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getLevelProgress, levels, TOTAL_POSSIBLE_POINTS, type Level } from '../data/levels'

interface Props {
  points: number
}

export function AuraGauge({ points }: Props) {
  const { current, next } = getLevelProgress(points)
  const pctTotal = Math.min(100, Math.round((points / TOTAL_POSSIBLE_POINTS) * 100))

  const prevPointsRef = useRef(points)
  const [celebrate, setCelebrate] = useState<Level | null>(null)

  useEffect(() => {
    const prev = prevPointsRef.current
    prevPointsRef.current = points
    if (points <= prev) return

    const crossed = levels.filter((l) => l.minPoints > prev && l.minPoints <= points)
    if (crossed.length === 0) return

    const reached = crossed[crossed.length - 1]
    setCelebrate(reached)
    confetti({ particleCount: 160, spread: 120, origin: { y: 0.5 } })
    const timer = setTimeout(() => setCelebrate(null), 2800)
    return () => clearTimeout(timer)
  }, [points])

  return (
    <div className="rounded-card border border-black/10 bg-white/60 p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-5xl">{current.emoji}</div>
      <p className="font-display mt-2 text-2xl text-black dark:text-cream">{current.name}</p>
      <p className="font-rounded text-xs text-black/50 dark:text-cream/50">
        {points} / {TOTAL_POSSIBLE_POINTS} pts
        {next ? ` · ${next.minPoints - points} pts avant ${next.name}` : ' · palier maximum atteint'}
      </p>

      <div className="relative mx-2 mt-5 h-2 rounded-full bg-black/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${pctTotal}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {levels.map((level) => {
          const leftPct = (level.minPoints / TOTAL_POSSIBLE_POINTS) * 100
          const reached = points >= level.minPoints
          const justReached = celebrate?.name === level.name
          return (
            <div
              key={level.name}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPct}%` }}
            >
              <motion.div
                animate={justReached ? { scale: [1, 1.8, 1] } : { scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 text-[9px] leading-none ${
                  reached
                    ? 'border-black bg-white dark:border-cream dark:bg-neutral-900'
                    : 'border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10'
                }`}
              >
                {reached ? level.emoji : ''}
              </motion.div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            className="font-rounded mt-4 inline-block rounded-full bg-black px-4 py-2 text-xs font-semibold text-cream"
          >
            🎉 Nouveau palier : {celebrate.emoji} {celebrate.name} !
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
