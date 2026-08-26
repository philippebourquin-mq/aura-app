import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge } from '../types'

// Fully opaque at every depth — a translucent back card let the page background show
// through underneath it, which read as a gap rather than a solid pile of paper.
const DEPTH_STYLE = [
  { y: 0, scale: 1, opacity: 1 },
  { y: 12, scale: 0.95, opacity: 1 },
  { y: 24, scale: 0.88, opacity: 1 },
] as const

const ROTATE_RANGE = 220 // px of drag over which rotation reaches its max, matches useTransform below

// Shared timing for the two "goes under / comes from under the deck" moves, so a
// forward and a backward swipe read as the same gesture, just reversed.
const TUCK_TRANSITION = { duration: 0.22, ease: 'easeOut' } as const

// The resting *pose* of the back of the pile — where a forward swipe's outgoing card
// ends up, and where a backward swipe's incoming card starts from. z-index is handled
// separately (it can't be smoothly tweened, so animating it here would fight that).
const BEHIND_STACK = { x: 0, y: DEPTH_STYLE[2].y, scale: DEPTH_STYLE[2].scale, rotate: 0 }

interface StackCardProps {
  challenge: Challenge
  depth: number
  validated: boolean
  /** A run is already in progress — browsing still works, but tapping can't pick. */
  locked: boolean
  /** Carries the live drag position/rotation at release, so a forward exit picks up
   *  from exactly where the card visually was instead of resetting to center first. */
  onSwipe: (direction: 1 | -1, fromX: number) => void
  onChoose: () => void
  /** A validated card can't be picked again — tapping it opens its read-only detail instead. */
  onViewDetail: () => void
  /** Play a one-shot wiggle to teach the drag gesture — only the very first card of a session. */
  hint: boolean
  onHintPlayed: () => void
  /** True only for a card that just became the front by a backward swipe — it starts
   *  tucked behind the deck and rises into place, mirroring how a forward swipe's
   *  outgoing card tucks in behind. Captured once at mount, never reapplied later. */
  enterFromBehind: boolean
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
  enterFromBehind,
}: StackCardProps) {
  const isFront = depth === 0
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-ROTATE_RANGE, ROTATE_RANGE], [-14, 14])
  // A tap that ends a real drag must never also fire the pick action — track actual
  // movement explicitly rather than relying solely on framer-motion's own tap/drag split.
  const draggedRef = useRef(false)
  // Locked in at construction time — later re-renders (depth changes etc.) must never
  // flip this back on for a card that already made its one-time entrance.
  const [startedFromBehind] = useState(enterFromBehind)
  // z-index can't be smoothly tweened (it just switches), so a card rising from behind
  // the deck is kept behind the whole stack for the entire rise — otherwise it'd pop to
  // the front instantly and grow on top of everything, instead of visibly emerging —
  // and only takes the front z-index once that rise has actually finished.
  const [revealed, setRevealed] = useState(!startedFromBehind)

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
  const zIndex = revealed ? 3 - depth : 0

  return (
    <motion.div
      className="absolute inset-0 select-none"
      style={{ x, rotate, zIndex, touchAction: isFront ? 'pan-y' : 'auto' }}
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
      initial={startedFromBehind ? { ...BEHIND_STACK, opacity: 1 } : { y: style.y, scale: style.scale, opacity: 1 }}
      animate={{ x: 0, y: style.y, scale: style.scale, opacity: 1, rotate: 0 }}
      transition={startedFromBehind ? TUCK_TRANSITION : { type: 'spring', stiffness: 420, damping: 34, mass: 0.6 }}
      onAnimationComplete={() => {
        if (startedFromBehind) setRevealed(true)
      }}
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
  // it, so a drag-driven swipe never gets a second, redundant animation spawned for it.
  const selfHandledRef = useRef<number | null>(null)
  // The id of the card that should render its one-time "rising from behind the deck"
  // entrance on this pass — set right before the index change that makes it the front,
  // read once by that StackCard at mount, then cleared.
  const enteringIdRef = useRef<string | null>(null)

  // fromX is where the card actually was at release (0 for a non-drag change, e.g. the
  // arrows) — the exit continues from there instead of resetting to center first, which
  // is what made a released card look like it snapped back before flying away.
  const spawnExit = (challenge: Challenge, fromX = 0) => {
    setExiting({ token: ++tokenRef.current, challenge, fromX, fromRotate: clampedRotate(fromX) })
  }

  // Forward (direction 1): the dragged front card is truly leaving the visible window —
  // it gets the transient "tucks in behind the deck" exit. Backward (direction -1): the
  // dragged front card doesn't leave at all, it demotes to depth 1, which the persisted
  // stack already animates smoothly on its own — what's new is the card entering at the
  // front, which rises from behind the deck to meet it, set up here for its own mount.
  const handleSwipe = (direction: 1 | -1, fromX: number) => {
    if (pool.length === 0) return
    const target = (index + direction + pool.length) % pool.length
    hasHintedRef.current = true
    selfHandledRef.current = target
    if (direction === 1) {
      spawnExit(pool[index], fromX)
    } else {
      enteringIdRef.current = pool[target]?.id ?? null
    }
    onIndexChange(target)
  }

  // Any other index change (the prev/next arrows, an external reset) mirrors the same
  // forward/backward treatment, just without a live drag position to continue from — a
  // filter switch (new pool) snaps instead, fresh context.
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
    if (prevPool.length > 1 && (prevIndex + 1) % prevPool.length === index) {
      spawnExit(prevPool[prevIndex])
    } else if (prevPool.length > 1 && (prevIndex - 1 + prevPool.length) % prevPool.length === index) {
      enteringIdRef.current = pool[index]?.id ?? null
    }
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

  // The entering flag is only meaningful for the render right after it was set — a
  // StackCard reads it once via lazy useState at mount, so it's safe to clear here for
  // every render after, including this same one for any card that isn't freshly mounting.
  useEffect(() => {
    enteringIdRef.current = null
  })

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
          enterFromBehind={depth === 0 && challenge.id === enteringIdRef.current}
        />
      ))}

      {exiting && (
        <motion.div
          key={`exit-${exiting.token}`}
          className="absolute inset-0"
          // Sits below every stack card the whole time — while it's still out near the
          // drag's release point nothing else overlaps it there, and by the time its own
          // motion brings it back near center it has also shrunk to the back card's
          // exact pose, so the real (opaque) stack simply covers it, no fade needed.
          style={{ zIndex: 0 }}
          initial={{ x: exiting.fromX, y: 0, rotate: exiting.fromRotate, scale: 1 }}
          animate={BEHIND_STACK}
          transition={TUCK_TRANSITION}
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
