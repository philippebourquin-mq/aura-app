import { useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge } from '../types'

interface DraggableProps {
  challenge: Challenge
  validated: boolean
  exitX: number
  onSwipe: (direction: 1 | -1) => void
  onChoose: () => void
}

function DraggableCard({ challenge, validated, exitX, onSwipe, onChoose }: DraggableProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-14, 14])

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100 || info.velocity.x > 400) onSwipe(1)
        else if (info.offset.x < -100 || info.velocity.x < -400) onSwipe(-1)
      }}
      onTap={() => {
        if (!validated) onChoose()
      }}
      initial={{ scale: 0.94, opacity: 0.7, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.32, ease: 'easeOut' } }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.9 }}
    >
      <ChallengeCard
        challenge={challenge}
        validated={validated}
        className={validated ? '' : 'cursor-grab active:cursor-grabbing'}
      />
    </motion.div>
  )
}

interface Props {
  pool: Challenge[]
  validatedChallengeIds: string[]
  index: number
  onIndexChange: (index: number) => void
  onPick: (challengeId: string) => void
}

/** A Tinder-style stacked deck: drag the top card away to browse, tap it to choose it. */
export function SwipeDeck({ pool, validatedChallengeIds, index, onIndexChange, onPick }: Props) {
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
        <div className="absolute inset-x-0 top-6 scale-[0.88] opacity-50">
          <ChallengeCard challenge={behind2} validated={validatedChallengeIds.includes(behind2.id)} />
        </div>
      )}
      {behind1 && (
        <div className="absolute inset-x-0 top-3 scale-[0.95] opacity-80">
          <ChallengeCard challenge={behind1} validated={validatedChallengeIds.includes(behind1.id)} />
        </div>
      )}
      <AnimatePresence initial={false}>
        {current && (
          <DraggableCard
            key={current.id}
            challenge={current}
            validated={validatedChallengeIds.includes(current.id)}
            exitX={exitX}
            onSwipe={handleSwipe}
            onChoose={() => onPick(current.id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
