import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge } from '../types'

interface DraggableProps {
  challenge: Challenge
  validated: boolean
  /** A run is already in progress — browsing still works, but tapping can't pick. */
  locked: boolean
  exitX: number
  onSwipe: (direction: 1 | -1) => void
  onChoose: () => void
  /** Play a one-shot wiggle to teach the drag gesture — only the very first card of a session. */
  hint: boolean
  onHintPlayed: () => void
}

function DraggableCard({ challenge, validated, locked, exitX, onSwipe, onChoose, hint, onHintPlayed }: DraggableProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-14, 14])
  // A tap that ends a real drag must never also fire the pick action — track actual
  // movement explicitly rather than relying solely on framer-motion's own tap/drag split.
  const draggedRef = useRef(false)

  useEffect(() => {
    if (!hint) return
    const t = setTimeout(() => {
      if (draggedRef.current) return
      animate(x, [0, 18, -12, 6, 0], { duration: 1, ease: 'easeInOut' })
      onHintPlayed()
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      className="absolute inset-0 touch-pan-y select-none"
      style={{ x, rotate, touchAction: 'pan-y' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      dragMomentum={false}
      onTapStart={() => {
        draggedRef.current = false
      }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) > 8) draggedRef.current = true
      }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100 || info.velocity.x > 400) onSwipe(1)
        else if (info.offset.x < -100 || info.velocity.x < -400) onSwipe(-1)
      }}
      onTap={() => {
        if (!validated && !locked && !draggedRef.current) onChoose()
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
  /** A run is already in progress — browsing still works, but tapping can't pick a new one. */
  locked?: boolean
}

/** A Tinder-style stacked deck: drag the top card away to browse, tap it to choose it. */
export function SwipeDeck({ pool, validatedChallengeIds, index, onIndexChange, onPick, locked = false }: Props) {
  const [exitX, setExitX] = useState(0)
  const hasHintedRef = useRef(false)

  const current = pool[index]
  const behind1 = pool[index + 1]
  const behind2 = pool[index + 2]

  // Wraps around at both ends — the deck is a loop, like flipping through the physical stack.
  const handleSwipe = (direction: 1 | -1) => {
    if (pool.length === 0) return
    const target = (index + direction + pool.length) % pool.length
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
            locked={locked}
            exitX={exitX}
            onSwipe={(direction) => {
              hasHintedRef.current = true
              handleSwipe(direction)
            }}
            onChoose={() => onPick(current.id)}
            hint={!hasHintedRef.current}
            onHintPlayed={() => {
              hasHintedRef.current = true
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
