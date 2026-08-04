import { useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge } from '../types'

interface DraggableProps {
  challenge: Challenge
  exitX: number
  onSwipe: (direction: 1 | -1) => void
}

function DraggableCard({ challenge, exitX, onSwipe }: DraggableProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-16, 16])

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.75}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110 || info.velocity.x > 500) onSwipe(1)
        else if (info.offset.x < -110 || info.velocity.x < -500) onSwipe(-1)
      }}
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      <ChallengeCard challenge={challenge} className="cursor-grab active:cursor-grabbing" />
    </motion.div>
  )
}

interface Props {
  pool: Challenge[]
  index: number
  onIndexChange: (index: number) => void
}

/** A Tinder-style stacked deck: drag the top card away to move through the pile. */
export function SwipeDeck({ pool, index, onIndexChange }: Props) {
  const [exitX, setExitX] = useState(0)

  const current = pool[index]
  const behind1 = pool[index + 1]
  const behind2 = pool[index + 2]

  const handleSwipe = (direction: 1 | -1) => {
    const target = index + direction
    if (target < 0 || target >= pool.length) return
    setExitX(direction * 420)
    onIndexChange(target)
  }

  return (
    <div className="relative mx-auto h-[23.5rem] w-64">
      {behind2 && (
        <div className="absolute inset-x-0 top-4 scale-[0.88] opacity-40">
          <ChallengeCard challenge={behind2} />
        </div>
      )}
      {behind1 && (
        <div className="absolute inset-x-0 top-2 scale-[0.94] opacity-70">
          <ChallengeCard challenge={behind1} />
        </div>
      )}
      <AnimatePresence initial={false}>
        {current && <DraggableCard key={current.id} challenge={current} exitX={exitX} onSwipe={handleSwipe} />}
      </AnimatePresence>
    </div>
  )
}
