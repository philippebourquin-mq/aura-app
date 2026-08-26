import { useCallback, useEffect, useState } from 'react'
import type { CategoryId, Challenge, ChallengeRun, HistoryEntry, HistoryOutcome, JokerId, Role } from '../types'
import { challenges, challengesByCategory } from '../data/challenges'
import { CHALLENGE_DURATION_MS } from '../lib/countdown'
import { LOCKED_ROLE } from '../lib/roleLock'

const STORAGE_KEY = 'aura-game-state-v3'

export interface GameState {
  role: Role
  currentRun: ChallengeRun | null
  validatedChallengeIds: string[]
  jokersUsed: JokerId[]
  history: HistoryEntry[]
  totalPoints: number
  customChallenges: Challenge[]
}

const initialState = (): GameState => ({
  role: 'lucas',
  currentRun: null,
  validatedChallengeIds: [],
  jokersUsed: [],
  history: [],
  totalPoints: 0,
  customChallenges: [],
})

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<GameState>
    return { ...initialState(), ...parsed }
  } catch {
    return initialState()
  }
}

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10)
}

function inFuture(ms: number) {
  return new Date(Date.now() + ms).toISOString()
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const allChallenges = (custom: Challenge[]) => [...challenges, ...custom]

  const setRole = useCallback((role: Role) => {
    if (LOCKED_ROLE) return // this deployment is dedicated to one role — nothing to switch
    setState((s) => ({ ...s, role }))
  }, [])

  /** Closes the current run for a real loss: points subtracted (floored at 0), recorded in history. */
  const closeWithLoss = useCallback((outcome: HistoryOutcome, requiredStatus?: 'received' | 'active') => {
    setState((s) => {
      const run = s.currentRun
      if (!run) return s
      if (requiredStatus && run.status !== requiredStatus) return s
      const challenge = allChallenges(s.customChallenges).find((c) => c.id === run.challengeId)
      const applied = Math.min(challenge?.points ?? 0, s.totalPoints)
      const entry: HistoryEntry = {
        id: uid(),
        origin: run.origin,
        outcome,
        challengeId: run.challengeId,
        categoryId: run.categoryId,
        pointsDelta: -applied,
        at: new Date().toISOString(),
      }
      return {
        ...s,
        totalPoints: s.totalPoints - applied,
        currentRun: null,
        history: [entry, ...s.history],
      }
    })
  }, [])

  /** Lucas freely picks any available challenge — goes straight to 'active', no decision beat. */
  const lucasPickChallenge = useCallback((challengeId: string) => {
    setState((s) => {
      if (s.currentRun) return s
      const challenge = allChallenges(s.customChallenges).find((c) => c.id === challengeId)
      if (!challenge) return s
      const run: ChallengeRun = {
        id: uid(),
        origin: 'lucas',
        status: 'active',
        categoryId: challenge.categoryId,
        challengeId: challenge.id,
        createdAt: new Date().toISOString(),
        expiresAt: inFuture(CHALLENGE_DURATION_MS),
      }
      return { ...s, currentRun: run }
    })
  }, [])

  /** Team sends a card directly to Lucas — lands on 'received', awaiting his decision. */
  const teamSendChallenge = useCallback((challengeId: string) => {
    setState((s) => {
      if (s.currentRun) return s
      const challenge = allChallenges(s.customChallenges).find((c) => c.id === challengeId)
      if (!challenge) return s
      const run: ChallengeRun = {
        id: uid(),
        origin: 'team',
        status: 'received',
        categoryId: challenge.categoryId,
        challengeId: challenge.id,
        createdAt: new Date().toISOString(),
      }
      return { ...s, currentRun: run }
    })
  }, [])

  /** Lucas accepts a received challenge — commits, starts the 24h clock. */
  const lucasAcceptReceived = useCallback(() => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.status !== 'received') return s
      return {
        ...s,
        currentRun: { ...s.currentRun, status: 'active', expiresAt: inFuture(CHALLENGE_DURATION_MS) },
      }
    })
  }, [])

  /** Lucas says he's done — flags the run so the team sees it needs checking. Purely informational. */
  const lucasSubmitForValidation = useCallback(() => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.status !== 'active') return s
      return { ...s, currentRun: { ...s.currentRun, submittedForValidation: true } }
    })
  }, [])

  /** Switch joker: swap for another card in the same category, stay on 'received'. */
  const lucasSwitchReceived = useCallback(() => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.status !== 'received') return s
      if (s.jokersUsed.includes('switch')) return s
      const pool = challengesByCategory(s.currentRun.categoryId).filter(
        (c) => !s.validatedChallengeIds.includes(c.id) && c.id !== s.currentRun?.challengeId,
      )
      if (pool.length === 0) return s
      const next = pool[Math.floor(Math.random() * pool.length)]
      return {
        ...s,
        jokersUsed: [...s.jokersUsed, 'switch'],
        currentRun: { ...s.currentRun, challengeId: next.id },
      }
    })
  }, [])

  /** Boomerang / Flemme: close a received challenge for free — that's what a joker is for. */
  const lucasCloseWithJoker = useCallback((jokerId: 'boomerang' | 'flemme') => {
    setState((s) => {
      const run = s.currentRun
      if (!run || run.status !== 'received' || run.origin !== 'team') return s
      if (s.jokersUsed.includes(jokerId)) return s
      const entry: HistoryEntry = {
        id: uid(),
        origin: run.origin,
        outcome: 'joker-out',
        challengeId: run.challengeId,
        categoryId: run.categoryId,
        jokerUsed: jokerId,
        pointsDelta: 0,
        at: new Date().toISOString(),
      }
      return {
        ...s,
        jokersUsed: [...s.jokersUsed, jokerId],
        currentRun: null,
        history: [entry, ...s.history],
      }
    })
  }, [])

  /** A bare refusal, no joker spent — costs points, always available on a received challenge. */
  const lucasDeclineHard = useCallback(() => {
    closeWithLoss('declined', 'received')
  }, [closeWithLoss])

  /** Lucas bails mid-challenge. */
  const lucasGiveUp = useCallback(() => {
    closeWithLoss('gave-up', 'active')
  }, [closeWithLoss])

  /** Team validates the active challenge — full points, doubled if Lucas picked it himself. */
  const teamValidate = useCallback(() => {
    setState((s) => {
      const run = s.currentRun
      if (!run || run.status !== 'active') return s
      const challenge = allChallenges(s.customChallenges).find((c) => c.id === run.challengeId)
      if (!challenge) return s
      const bonus = run.origin === 'lucas'
      const amount = challenge.points * (bonus ? 2 : 1)
      const entry: HistoryEntry = {
        id: uid(),
        origin: run.origin,
        outcome: 'validated',
        challengeId: run.challengeId,
        categoryId: run.categoryId,
        pointsDelta: amount,
        bonus,
        at: new Date().toISOString(),
      }
      return {
        ...s,
        totalPoints: s.totalPoints + amount,
        validatedChallengeIds: [...s.validatedChallengeIds, run.challengeId],
        currentRun: null,
        history: [entry, ...s.history],
      }
    })
  }, [])

  /** Team denies a completed challenge. */
  const teamDeny = useCallback(() => {
    closeWithLoss('not-validated', 'active')
  }, [closeWithLoss])

  /** Auto-resolve an expired 'active' run — checked periodically, no user action required. */
  useEffect(() => {
    const check = () => {
      setState((s) => {
        const run = s.currentRun
        if (!run || run.status !== 'active' || !run.expiresAt) return s
        if (new Date(run.expiresAt).getTime() > Date.now()) return s
        const challenge = allChallenges(s.customChallenges).find((c) => c.id === run.challengeId)
        const applied = Math.min(challenge?.points ?? 0, s.totalPoints)
        const entry: HistoryEntry = {
          id: uid(),
          origin: run.origin,
          outcome: 'expired',
          challengeId: run.challengeId,
          categoryId: run.categoryId,
          pointsDelta: -applied,
          at: new Date().toISOString(),
        }
        return {
          ...s,
          totalPoints: s.totalPoints - applied,
          currentRun: null,
          history: [entry, ...s.history],
        }
      })
    }
    check()
    const id = setInterval(check, 15000)
    return () => clearInterval(id)
  }, [])

  const createCustomChallenge = useCallback(
    (input: { title: string; description: string; categoryId: CategoryId; points: number }) => {
      setState((s) => {
        const challenge: Challenge = {
          id: uid('custom-'),
          categoryId: input.categoryId,
          title: input.title,
          description: input.description,
          points: input.points,
          custom: true,
        }
        return { ...s, customChallenges: [...s.customChallenges, challenge] }
      })
    },
    [],
  )

  const reset = useCallback(() => {
    setState(initialState())
  }, [])

  /** Team's admin tool: put a validated challenge back into the pool, at their discretion. */
  const requeueChallenge = useCallback((challengeId: string) => {
    setState((s) => ({ ...s, validatedChallengeIds: s.validatedChallengeIds.filter((id) => id !== challengeId) }))
  }, [])

  /** Team's admin tool: give a spent joker back, at their discretion. */
  const requeueJoker = useCallback((jokerId: JokerId) => {
    setState((s) => ({ ...s, jokersUsed: s.jokersUsed.filter((id) => id !== jokerId) }))
  }, [])

  // The Lucas and Team deployments share the same localStorage (same origin, different
  // path), so the persisted role is only meaningful in the unlocked (dev) build — here it's
  // overridden with the deployment's fixed role, transparently, for every `state.role` read
  // across the app.
  return {
    state: LOCKED_ROLE ? { ...state, role: LOCKED_ROLE } : state,
    setRole,
    lucasPickChallenge,
    teamSendChallenge,
    lucasAcceptReceived,
    lucasSubmitForValidation,
    lucasSwitchReceived,
    lucasCloseWithJoker,
    lucasDeclineHard,
    lucasGiveUp,
    teamValidate,
    teamDeny,
    createCustomChallenge,
    reset,
    requeueChallenge,
    requeueJoker,
  }
}
