import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy } from 'lucide-react'
import { getLevelProgress, levels, TOTAL_POSSIBLE_POINTS, type Level } from '../data/levels'
import { LevelPathModal } from './LevelPathModal'

interface Props {
  points: number
}

/** Trophy + points, then a plain dot-track — matches the "status" wireframe. */
export function AuraGauge({ points }: Props) {
  const { current } = getLevelProgress(points)

  const prevPointsRef = useRef(points)
  const [celebrate, setCelebrate] = useState<Level | null>(null)
  const [showPath, setShowPath] = useState(false)

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
    <>
      <button onClick={() => setShowPath(true)} className="block w-full py-2 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <Trophy size={28} className="text-black/70 dark:text-cream/70" />
          <span className="font-display text-4xl text-black dark:text-cream">{points}</span>
        </div>
        <p className="font-rounded mt-1 text-sm font-semibold text-black/60 dark:text-cream/60">
          {current.emoji} {current.name}
        </p>

        <div className="relative mx-6 mt-5 h-px bg-black/15 dark:bg-white/15">
          {levels.map((level) => {
            const leftPct = (level.minPoints / TOTAL_POSSIBLE_POINTS) * 100
            const reached = points >= level.minPoints
            const isCurrent = level.name === current.name
            const justReached = celebrate?.name === level.name
            return (
              <div
                key={level.name}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${leftPct}%` }}
              >
                <motion.div
                  animate={justReached ? { scale: [1, 1.9, 1] } : { scale: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`h-2.5 w-2.5 rounded-full ${
                    isCurrent
                      ? 'bg-amber-500'
                      : reached
                        ? 'bg-black dark:bg-cream'
                        : 'bg-black/20 dark:bg-white/20'
                  }`}
                />
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
              className="font-rounded mt-3 inline-block rounded-full bg-black px-4 py-2 text-xs font-semibold text-cream"
            >
              🎉 Nouveau palier : {celebrate.emoji} {celebrate.name} !
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {showPath && <LevelPathModal points={points} onClose={() => setShowPath(false)} />}
    </>
  )
}
