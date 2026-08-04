import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ChevronRight } from 'lucide-react'
import { getLevelProgress, levels, TOTAL_POSSIBLE_POINTS, type Level } from '../data/levels'
import { LevelPathModal } from './LevelPathModal'

interface Props {
  points: number
}

export function AuraGauge({ points }: Props) {
  const { current, next } = getLevelProgress(points)
  const pctTotal = Math.min(100, Math.round((points / TOTAL_POSSIBLE_POINTS) * 100))

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
      <button
        onClick={() => setShowPath(true)}
        className="group relative block w-full overflow-hidden rounded-[2rem] border border-black/10 bg-gradient-to-br from-white/90 via-cream to-amber-100/40 p-6 text-center shadow-[0_20px_45px_-24px_rgba(0,0,0,0.35)] transition hover:shadow-[0_24px_55px_-20px_rgba(0,0,0,0.4)] dark:border-white/10 dark:from-white/10 dark:via-neutral-900 dark:to-neutral-900"
      >
        <div className="text-5xl drop-shadow-sm">{current.emoji}</div>
        <p className="font-display mt-2 text-2xl text-black dark:text-cream">{current.name}</p>
        <p className="font-rounded text-xs text-black/50 dark:text-cream/50">
          {points} / {TOTAL_POSSIBLE_POINTS} pts
          {next ? ` · ${next.minPoints - points} pts avant ${next.name}` : ' · palier maximum atteint'}
        </p>

        <div className="relative mx-2 mt-5 h-2.5 rounded-full bg-black/10 shadow-inner dark:bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]"
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

        <p className="font-rounded mt-4 inline-flex items-center gap-0.5 text-[11px] font-semibold text-black/40 transition group-hover:text-black/70 dark:text-cream/40 dark:group-hover:text-cream/70">
          Voir tous les paliers <ChevronRight size={13} />
        </p>

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
