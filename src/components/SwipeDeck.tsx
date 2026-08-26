import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge } from '../types'

const DEPTH_STYLE = [
  { y: 0, scale: 1, opacity: 1 },
  { y: 12, scale: 0.95, opacity: 0.8 },
  { y: 24, scale: 0.88, opacity: 0.5 },
] as const

const ROTATE_RANGE = 220 // px of drag over which rotation reaches its max, matches useTransform below

interface StackCardProps {
  challenge: Challenge
  depth: number
  validated: boolean
  /** A run is already in progress — browsing still works, but tapping can't pick. */
  locked: boolean
  /** Carries the live drag position/rotation at release, so the exit picks up from
   *  exactly where the card visually was instead of resetting to center first. */
  onSwipe: (direction: 1 | -1, fromX: number) => void
  onChoose: () => void
  /** A validated card can't be picked again — tapping it opens its read-only detail instead. */
  onViewDetail: () => void
  /** Play a one-shot wiggle to teach the drag gesture — only the very first card of a session. */
  hint: boolean
  onHintPlayed: () => void
}

/**
 * One persisted element per challenge in the visible window — it stays mounted as it
 * moves through depths 2 -> 1 -> 0, so a promotion is a single continuous transform
 * (position/scale/opacity tweening to the new depth's target) instead of a fresh card
 * popping in. Only the front (depth 0) card is draggable/tappable.
 */
function StackCard({
  challenge,
  depth,
  validated,
  locked,
  onSwipe,
  onChoose,
  onViewDetail,
  hint,
  onHintPlayed,
}: StackCardProps) {
  const isFront = depth === 0
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-ROTATE_RANGE, ROTATE_RANGE], [-14, 14])
  // A tap that ends a real drag must never also fire the pick action — track actual
  // movement explicitly rather than relying solely on framer-motion's own tap/drag split.
  const draggedRef = useRef(false)

  useEffect(() => {
    if (!hint || !isFront) return
    const t = setTimeout(() => {
      if (draggedRef.current) return
      animate(x, [0, 18, -12, 6, 0], { duration: 1, ease: 'easeInOut' })
      onHintPlayed()
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const style = DEPTH_STYLE[Math.min(depth, DEPTH_STYLE.length - 1)]

  return (
    <motion.div
      className="absolute inset-0 select-none"
      style={{ x, rotate, zIndex: 3 - depth, touchAction: isFront ? 'pan-y' : 'auto' }}
      drag={isFront ? 'x' : false}
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
        if (!isFront) return
        if (info.offset.x > 100 || info.velocity.x > 400) onSwipe(1, x.get())
        else if (info.offset.x < -100 || info.velocity.x < -400) onSwipe(-1, x.get())
      }}
      onTap={() => {
        if (!isFront || draggedRef.current) return
        if (validated) onViewDetail()
        else if (!locked) onChoose()
      }}
      initial={{ opacity: 0, y: style.y, scale: style.scale }}
      animate={{ x: 0, y: style.y, scale: style.scale, opacity: style.opacity }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.6 }}
    >
      <ChallengeCard
        challenge={challenge}
        validated={validated}
        className={isFront && !validated ? 'cursor-grab active:cursor-grabbing' : ''}
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

interface ExitingCard {
  token: number
  challenge: Challenge
  fromX: number
  fromRotate: number
  exitX: number
}

const clampedRotate = (x: number) => {
  const clamped = Math.max(-ROTATE_RANGE, Math.min(ROTATE_RANGE, x))
  return (clamped / ROTATE_RANGE) * 14
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
  const [exiting, setExiting] = useState<ExitingCard | null>(null)
  const hasHintedRef = useRef(false)
  const tokenRef = useRef(0)
  const prevIndexRef = useRef(index)
  const prevPoolRef = useRef(pool)
  // The index value handleSwipe already animated synchronously — the effect below skips
  // it, so a drag-driven swipe never gets a second, redundant exit spawned for it.
  const selfHandledRef = useRef<number | null>(null)

  // fromX is where the card actually was at release (0 for a non-drag change, e.g. the
  // arrows) — the exit continues from there instead of resetting to center first, which
  // is what made a released card look like it snapped back before flying away.
  const spawnExit = (challenge: Challenge, exitX: number, fromX = 0) => {
    setExiting({ token: ++tokenRef.current, challenge, fromX, fromRotate: clampedRotate(fromX), exitX })
  }

  // The outgoing card's exit and the rest of the stack's promotion are set up in this
  // one synchronous handler, so both animations start on the very same render — a real
  // flick, not a slide-away followed by a delayed catch-up underneath it.
  const handleSwipe = (direction: 1 | -1, fromX: number) => {
    if (pool.length === 0) return
    const leaving = pool[index]
    const target = (index + direction + pool.length) % pool.length
    hasHintedRef.current = true
    selfHandledRef.current = target
    spawnExit(leaving, direction * Math.max(420, Math.abs(fromX) + 260), fromX)
    onIndexChange(target)
  }

  // Any other index change (the prev/next arrows, an external reset) still gets a
  // graceful exit for the card that falls out of the window, direction derived from
  // the index delta — a filter switch (new pool) snaps instead, fresh context. There's
  // no drag here, so it's a plain fade in place if the delta isn't a simple +/-1 step.
  useEffect(() => {
    const prevIndex = prevIndexRef.current
    const prevPool = prevPoolRef.current
    prevIndexRef.current = index
    prevPoolRef.current = pool
    if (pool !== prevPool || index === prevIndex) return
    if (selfHandledRef.current === index) {
      selfHandledRef.current = null
      return
    }
    const leaving = prevPool[prevIndex]
    if (!leaving) return
    let exitX = 0
    if (prevPool.length > 1) {
      if ((prevIndex + 1) % prevPool.length === index) exitX = 420
      else if ((prevIndex - 1 + prevPool.length) % prevPool.length === index) exitX = -420
    }
    spawnExit(leaving, exitX)
  }, [index, pool])

  // Built fresh from `index` every render, no gating — the promotion of each card
  // underneath is what makes the exit read as coordinated instead of sequential.
  const stack: { challenge: Challenge; depth: number }[] = []
  const seen = new Set<string>()
  for (let depth = 0; depth < 3 && depth < pool.length; depth++) {
    const challenge = pool[(index + depth) % pool.length]
    if (seen.has(challenge.id)) break
    seen.add(challenge.id)
    stack.push({ challenge, depth })
  }

  return (
    <div className="relative mx-auto h-[23.5rem] w-64">
      {stack.map(({ challenge, depth }) => (
        <StackCard
          key={challenge.id}
          challenge={challenge}
          depth={depth}
          validated={validatedChallengeIds.includes(challenge.id)}
          locked={locked}
          onSwipe={handleSwipe}
          onChoose={() => onPick(challenge.id)}
          onViewDetail={() => onViewDetail(challenge.id)}
          hint={depth === 0 && !hasHintedRef.current}
          onHintPlayed={() => {
            hasHintedRef.current = true
          }}
        />
      ))}

      {exiting && (
        <motion.div
          key={`exit-${exiting.token}`}
          className="absolute inset-0"
          style={{ zIndex: 4 }}
          initial={{ x: exiting.fromX, rotate: exiting.fromRotate, opacity: 1, scale: 1 }}
          animate={{ x: exiting.exitX, rotate: exiting.fromRotate, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onAnimationComplete={() =>
            setExiting((current) => (current?.token === exiting.token ? null : current))
          }
        >
          <ChallengeCard
            challenge={exiting.challenge}
            validated={validatedChallengeIds.includes(exiting.challenge.id)}
          />
        </motion.div>
      )}
    </div>
  )
}
