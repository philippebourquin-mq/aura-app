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
  /** A validated card can't be picked again — tapping it opens its read-only detail instead. */
  onViewDetail: () => void
  /** Play a one-shot wiggle to teach the drag gesture — only the very first card of a session. */
  hint: boolean
  onHintPlayed: () => void
}

function DraggableCard({
  challenge,
  validated,
  locked,
  exitX,
  onSwipe,
  onChoose,
  onViewDetail,
  hint,
  onHintPlayed,
}: DraggableProps) {
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
        if (draggedRef.current) return
        if (validated) onViewDetail()
        else if (!locked) onChoose()
      }}
      initial={{ scale: 0.96, opacity: 0.85, y: 4 }}
      animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.18, ease: 'easeOut' } }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.6 }}
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
  /** Opens the read-only detail sheet for an already-validated card. */
  onViewDetail: (challengeId: string) => void
  /** A run is already in progress — browsing still works, but tapping can't pick a new one. */
  locked?: boolean
}

/** A Tinder-style stacked deck: drag the top card away to browse, tap it to choose it. */
export function SwipeDeck({
  pool,
  validatedChallengeIds,
  index,
  onIndexChange,
  onPick,
  onViewDetail,
  locked = false,
}: Props) {
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
      <AnimatePresence>
        {behind2 && (
          <motion.div
            key={behind2.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-6 scale-[0.88]"
          >
            <ChallengeCard challenge={behind2} validated={validatedChallengeIds.includes(behind2.id)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {behind1 && (
          <motion.div
            key={behind1.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-3 scale-[0.95]"
          >
            <ChallengeCard challenge={behind1} validated={validatedChallengeIds.includes(behind1.id)} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* mode="wait" forces each card's exit to finish before the next one mounts. Without it,
          index changes faster than the ~0.32s exit duration (an entirely normal swiping pace)
          leave old cards stuck in the DOM instead of being removed, and a real touch/drag can
          land on one of those dead leftovers instead of the live top card — silently swallowing
          the gesture, which reads as the deck "getting stuck". */}
      <AnimatePresence initial={false} mode="wait">
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
            onViewDetail={() => onViewDetail(current.id)}
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
