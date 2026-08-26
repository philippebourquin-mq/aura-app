import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge } from '../types'

// Fully opaque at every depth — a translucent back card let the page background show
// through underneath it, which read as a gap rather than a solid pile of paper.
const DEPTH_STYLE = [
  { y: 0, scale: 1 },
  { y: 12, scale: 0.95 },
  { y: 24, scale: 0.88 },
] as const

const ROTATE_RANGE = 220 // px of drag over which rotation reaches its max, matches useTransform below

// Shared timing for the two "settles onto / tucks under the deck" moves, so a forward
// and a backward swipe read as the same gesture, just reversed.
const TUCK_TRANSITION = { duration: 0.22, ease: 'easeOut' } as const

// The resting *pose* of the back of the pile — where a forward swipe's outgoing card
// ends up. z-index is handled separately (it can't be smoothly tweened, so animating
// it here would fight that).
const BEHIND_STACK = { x: 0, y: DEPTH_STYLE[2].y, scale: DEPTH_STYLE[2].scale, rotate: 0 }

// The "peek" card (the one a backward drag pulls from underneath the pile) has to
// trail the front card's own drag position by more than just their width difference,
// or it never actually pokes out past the front card's edge — it just stays hidden
// underneath, covered the whole time. This range is tuned so a full-length drag
// reveals a clear ~70-90px sliver on the left.
const PEEK_DRAG_RANGE: [number, number] = [-160, 0]
const PEEK_X_RANGE: [number, number] = [-340, 0]

function peekXFor(frontX: number) {
  const [inLo, inHi] = PEEK_DRAG_RANGE
  const [outLo, outHi] = PEEK_X_RANGE
  const t = Math.max(0, Math.min(1, (frontX - inLo) / (inHi - inLo)))
  return outLo + t * (outHi - outLo)
}

const clampedRotate = (x: number) => {
  const clamped = Math.max(-ROTATE_RANGE, Math.min(ROTATE_RANGE, x))
  return (clamped / ROTATE_RANGE) * 14
}

interface StackCardProps {
  challenge: Challenge
  depth: number
  validated: boolean
  /** A run is already in progress — browsing still works, but tapping can't pick. */
  locked: boolean
  /** Carries the live drag position/rotation at release, so a forward exit picks up
   *  from exactly where the card visually was instead of resetting to center first. */
  onSwipe: (direction: 1 | -1, fromX: number) => void
  /** Fires on every change to the front card's own live x — lets the parent mirror it
   *  into the "peek" card's position while dragging backward. */
  onDragLive: (x: number) => void
  onChoose: () => void
  /** A validated card can't be picked again — tapping it opens its read-only detail instead. */
  onViewDetail: () => void
  /** Play a one-shot wiggle to teach the drag gesture — only the very first card of a session. */
  hint: boolean
  onHintPlayed: () => void
  /** True while a "rising from the peek position" ghost (rendered separately by
   *  SwipeDeck) is covering this exact card — kept fully invisible and at rest (x, y,
   *  scale never touched) until the ghost finishes, then fades in. A draggable card
   *  that had ANY transform — even on an ancestor, even one that settles back to
   *  identity — applied to it before its first real drag permanently stops recognizing
   *  drags afterward (confirmed by extensive A/B testing against the previous commit,
   *  reproducible under rapid repeated swiping). Routing the entrance motion through a
   *  disposable sibling ghost instead keeps this card itself untouched until it's safe
   *  to become interactive. */
  hiddenBehindGhost: boolean
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
  onDragLive,
  onChoose,
  onViewDetail,
  hint,
  onHintPlayed,
  hiddenBehindGhost,
}: StackCardProps) {
  const isFront = depth === 0
  // The one motion value drag ever touches — never set by anything else, ever (see the
  // hiddenBehindGhost note above for why that matters).
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-ROTATE_RANGE, ROTATE_RANGE], [-14, 14])
  // A tap that ends a real drag must never also fire the pick action — track actual
  // movement explicitly rather than relying solely on framer-motion's own tap/drag split.
  const draggedRef = useRef(false)

  // Fires on every change to x — drag-driven AND the elastic snap-back after a
  // cancelled drag — so the peek card mirrors it continuously, not just on drag ticks.
  useMotionValueEvent(x, 'change', (latest) => {
    if (isFront) onDragLive(latest)
  })

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
  const zIndex = hiddenBehindGhost ? 0 : 3 - depth

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
      // x/rotate are absent from `initial` — this card must always MOUNT at x=0 (see
      // the note above on why). They're back in `animate`, though: once a card has
      // actually been dragged and released without crossing the swipe threshold, it
      // demotes to a lower depth but framer's own elastic drag-release snap-back can get
      // abandoned mid-flight when `drag` flips to false on the very next render (which
      // happens immediately, since the depth/isFront change is synchronous with the
      // release) — leaving x stuck at whatever nonzero offset the drag last reached.
      // That stuck offset is what showed up as a second, misaligned card riding above
      // the real stack. Declaring x/rotate here too gives every demoted card an explicit
      // path back to rest, exactly like every card already had before the ghost
      // rework — animating x back to 0 on an already-dragged card was never the unsafe
      // case; only ever mounting one away from 0 was.
      initial={{ y: style.y, scale: style.scale, opacity: hiddenBehindGhost ? 0 : 1 }}
      animate={{ x: 0, y: style.y, scale: style.scale, opacity: hiddenBehindGhost ? 0 : 1, rotate: 0 }}
      // opacity gets its own near-instant switch, not the shared spring — the ghost
      // above it lands in exactly the same final pose, so a lingering cross-fade just
      // double-exposes the real card fading in over whatever's behind it (looked like
      // grabbing a second, stray card). A hard cut reads as the same seamless reveal
      // z-index already does, since nothing actually needs to visibly cross-fade here.
      transition={{
        default: { type: 'spring', stiffness: 420, damping: 34, mass: 0.6 },
        opacity: { duration: 0.06 },
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

interface EnteringGhost {
  token: number
  id: string
  challenge: Challenge
  fromX: number
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
  // A disposable "rises from the peek position" ghost, rendered above the real stack
  // while the real front card stays hidden and untouched — see the note on
  // hiddenBehindGhost in StackCard for why the real card can never carry this motion
  // itself. Mirrors the `exiting` ghost above: a transient overlay, cleared by its own
  // onAnimationComplete (with a token guard against a stale completion clearing a newer
  // ghost spawned by a fast follow-up swipe).
  const [enteringGhost, setEnteringGhost] = useState<EnteringGhost | null>(null)
  const ghostTokenRef = useRef(0)
  // onAnimationComplete is the fast path for clearing the ghost, but it isn't a hard
  // guarantee — under load (or in a throttled/slow environment) a nominally-220ms
  // transition can visibly run past its own duration before the callback fires. Until
  // it does, the real front card stays hidden while whatever's still settling beneath
  // it (the demoted previous card, mid-spring, still rotated/offset) is what's actually
  // visible — reading as a stray, misaligned "extra card". This timeout is a hard upper
  // bound so that mismatch can never linger indefinitely.
  useEffect(() => {
    if (!enteringGhost) return
    const token = enteringGhost.token
    const t = setTimeout(() => {
      setEnteringGhost((current) => (current?.token === token ? null : current))
    }, TUCK_TRANSITION.duration * 1000 + 150)
    return () => clearTimeout(t)
  }, [enteringGhost])
  const hasHintedRef = useRef(false)
  const tokenRef = useRef(0)
  const prevIndexRef = useRef(index)
  const prevPoolRef = useRef(pool)
  // True for exactly one effect run after a pool swap (a category filter switch) — the
  // very next index change is usually the picker's own "land on a random card of the
  // new pool" reset, whose numeric value has no relationship to the OLD pool's index
  // space. Without this guard, prevIndex (still sized for the old, often much larger,
  // pool) can pass the forward/backward modulo check against the new pool's length by
  // sheer coincidence and spawn an exit for prevPool[prevIndex] — out of bounds on a
  // shrunk pool, undefined, which crashed the render tree entirely.
  const poolJustChangedRef = useRef(false)
  // The index value handleSwipe already animated synchronously — the effect below skips
  // it, so a drag-driven swipe never gets a second, redundant animation spawned for it.
  const selfHandledRef = useRef<number | null>(null)
  // Mirrors the front card's own live x while it's being dragged backward, so the
  // "peek" card underneath can trail it in real time.
  const liveDragX = useMotionValue(0)
  const peekX = useTransform(liveDragX, PEEK_DRAG_RANGE, PEEK_X_RANGE, { clamp: true })
  // Stable across renders — useMotionValueEvent inside StackCard resubscribes whenever
  // this reference changes, and a fresh closure on every SwipeDeck render (points
  // counter ticking, etc.) was tearing that subscription down and rebuilding it mid-
  // gesture under rapid swiping.
  const onDragLive = useCallback((v: number) => liveDragX.set(v), [liveDragX])

  // fromX is where the card actually was at release (0 for a non-drag change, e.g. the
  // arrows) — the exit continues from there instead of resetting to center first, which
  // is what made a released card look like it snapped back before flying away.
  const spawnExit = (challenge: Challenge, fromX = 0) => {
    setExiting({ token: ++tokenRef.current, challenge, fromX, fromRotate: clampedRotate(fromX) })
  }

  const spawnEnteringGhost = (challenge: Challenge, fromX: number) => {
    setEnteringGhost({ token: ++ghostTokenRef.current, id: challenge.id, challenge, fromX })
  }

  // Forward (direction 1): the dragged front card is truly leaving the visible window —
  // it gets the transient "tucks in behind the deck" exit. Backward (direction -1): the
  // dragged front card doesn't leave at all, it demotes to depth 1, which the persisted
  // stack already animates smoothly on its own — what's new is the card entering at the
  // front, covered by a ghost that continues from wherever its "peek" sliver was.
  const handleSwipe = (direction: 1 | -1, fromX: number) => {
    if (pool.length === 0) return
    const target = (index + direction + pool.length) % pool.length
    hasHintedRef.current = true
    selfHandledRef.current = target
    if (direction === 1) {
      spawnExit(pool[index], fromX)
    } else {
      const entering = pool[target]
      if (entering) spawnEnteringGhost(entering, peekXFor(fromX))
    }
    onIndexChange(target)
  }

  // Any other index change (the prev/next arrows, an external reset) mirrors the same
  // forward/backward treatment, just without a live drag position to continue from — a
  // filter switch (new pool) snaps instead, fresh context.
  useEffect(() => {
    const prevIndex = prevIndexRef.current
    const prevPool = prevPoolRef.current
    const poolJustChanged = poolJustChangedRef.current
    prevIndexRef.current = index
    prevPoolRef.current = pool
    if (pool !== prevPool) {
      poolJustChangedRef.current = true
      return
    }
    poolJustChangedRef.current = false
    // Skip the very next index change too, not just the pool-change render itself —
    // that's the picker's own post-switch random reset, and prevIndex at that point
    // still belongs to the old pool's index space (see the note on poolJustChangedRef).
    if (poolJustChanged || index === prevIndex) return
    if (selfHandledRef.current === index) {
      selfHandledRef.current = null
      return
    }
    if (prevPool.length > 1 && (prevIndex + 1) % prevPool.length === index) {
      const leaving = prevPool[prevIndex]
      if (leaving) spawnExit(leaving)
    } else if (prevPool.length > 1 && (prevIndex - 1 + prevPool.length) % prevPool.length === index) {
      const entering = pool[index]
      if (entering) spawnEnteringGhost(entering, 0)
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

  // The live drag mirror is only meaningful for the render right after a real front-
  // card change — reset here, keyed on the front card's own identity so an unrelated
  // re-render mid-drag (e.g. the points counter ticking) can't zero the live position
  // out from under an in-progress gesture.
  const frontId = stack[0]?.challenge.id
  useEffect(() => {
    liveDragX.set(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontId])

  const peekChallenge = pool.length > 1 ? pool[(index - 1 + pool.length) % pool.length] : null

  return (
    <div className="relative mx-auto h-[23.5rem] w-64">
      {peekChallenge && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ x: peekX, y: BEHIND_STACK.y, scale: BEHIND_STACK.scale, zIndex: 0 }}
        >
          <ChallengeCard challenge={peekChallenge} validated={validatedChallengeIds.includes(peekChallenge.id)} />
        </motion.div>
      )}

      {stack.map(({ challenge, depth }) => (
        <StackCard
          key={challenge.id}
          challenge={challenge}
          depth={depth}
          validated={validatedChallengeIds.includes(challenge.id)}
          locked={locked}
          onSwipe={handleSwipe}
          onDragLive={onDragLive}
          onChoose={() => onPick(challenge.id)}
          onViewDetail={() => onViewDetail(challenge.id)}
          hint={depth === 0 && !hasHintedRef.current}
          onHintPlayed={() => {
            hasHintedRef.current = true
          }}
          hiddenBehindGhost={depth === 0 && enteringGhost?.id === challenge.id}
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

      {enteringGhost && (
        <motion.div
          key={`enter-${enteringGhost.token}`}
          className="pointer-events-none absolute inset-0"
          // Sits above the whole stack — it's covering the real front card, which is
          // holding still underneath at opacity 0 until this finishes.
          style={{ zIndex: 4 }}
          initial={{ x: enteringGhost.fromX, y: BEHIND_STACK.y, scale: BEHIND_STACK.scale, opacity: 1 }}
          animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={TUCK_TRANSITION}
          onAnimationComplete={() =>
            setEnteringGhost((current) => (current?.token === enteringGhost.token ? null : current))
          }
        >
          <ChallengeCard
            challenge={enteringGhost.challenge}
            validated={validatedChallengeIds.includes(enteringGhost.challenge.id)}
          />
        </motion.div>
      )}
    </div>
  )
}
