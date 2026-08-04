import { useCallback, useEffect, useState } from 'react'
import type { ChallengeRun, HistoryEntry, JokerId, Role } from '../types'
import { challenges, challengesByCategory } from '../data/challenges'

const STORAGE_KEY = 'aura-game-state-v2'

export interface GameState {
  role: Role
  currentRun: ChallengeRun | null
  validatedChallengeIds: string[]
  jokersUsed: JokerId[]
  history: HistoryEntry[]
}

const initialState = (): GameState => ({
  role: 'lucas',
  currentRun: null,
  validatedChallengeIds: [],
  jokersUsed: [],
  history: [],
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

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function availableChallenges(validatedChallengeIds: string[]) {
  return challenges.filter((c) => !validatedChallengeIds.includes(c.id))
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const setRole = useCallback((role: Role) => {
    setState((s) => ({ ...s, role }))
  }, [])

  /** Team member kicks off "I want to challenge Lucas" — Flow B, step 1. */
  const teamStartChallenge = useCallback(() => {
    setState((s) => {
      if (s.currentRun) return s
      const run: ChallengeRun = {
        id: uid(),
        origin: 'team',
        status: 'awaiting-category',
        createdAt: new Date().toISOString(),
      }
      return { ...s, currentRun: run }
    })
  }, [])

  /** Lucas picks the theme for a team-thrown challenge — Flow B, step 2. */
  const lucasPickTheme = useCallback((categoryId: import('../types').CategoryId) => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.origin !== 'team' || s.currentRun.status !== 'awaiting-category') {
        return s
      }
      return {
        ...s,
        currentRun: { ...s.currentRun, categoryId, status: 'awaiting-card' },
      }
    })
  }, [])

  /** Team picks the specific card within the chosen theme — Flow B, step 3. Lands on the reveal beat. */
  const teamAssignCard = useCallback((challengeId: string) => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.origin !== 'team' || s.currentRun.status !== 'awaiting-card') {
        return s
      }
      return {
        ...s,
        currentRun: { ...s.currentRun, challengeId, status: 'revealed' },
      }
    })
  }, [])

  /** Lucas freely picks any available challenge — Flow A, step 1. Only when no run is active. */
  const lucasPickChallenge = useCallback((challengeId: string) => {
    setState((s) => {
      if (s.currentRun) return s
      const challenge = challenges.find((c) => c.id === challengeId)
      if (!challenge) return s
      const run: ChallengeRun = {
        id: uid(),
        origin: 'lucas',
        status: 'revealed',
        categoryId: challenge.categoryId,
        challengeId: challenge.id,
        createdAt: new Date().toISOString(),
      }
      return { ...s, currentRun: run }
    })
  }, [])

  /** Lucas accepts the revealed card — commits to it, no more jokers past this point. */
  const lucasAcceptChallenge = useCallback(() => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.status !== 'revealed') return s
      return { ...s, currentRun: { ...s.currentRun, status: 'in-progress' } }
    })
  }, [])

  /** Switch joker: swap for another card in the same category — always available at reveal. */
  const switchCard = useCallback(() => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.status !== 'revealed' || !s.currentRun.categoryId) return s
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

  /**
   * Boomerang / Flemme: close the run without penalty, challenge stays available.
   * Only valid on a team-thrown run — "refile-le à ta team" / "attendra demain" only
   * make sense as a reaction to a challenge Lucas received, not one he picked himself.
   */
  const closeWithJoker = useCallback((jokerId: 'boomerang' | 'flemme') => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.status !== 'revealed' || s.currentRun.origin !== 'team') return s
      if (s.jokersUsed.includes(jokerId)) return s
      const entry: HistoryEntry = {
        id: uid(),
        origin: s.currentRun.origin,
        outcome: 'skipped',
        challengeId: s.currentRun.challengeId,
        categoryId: s.currentRun.categoryId,
        jokerUsed: jokerId,
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

  /** Team validates the in-progress challenge directly — Lucas never has to declare he's done. */
  const teamValidate = useCallback(() => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.status !== 'in-progress' || !s.currentRun.challengeId) return s
      const challenge = challenges.find((c) => c.id === s.currentRun?.challengeId)
      const entry: HistoryEntry = {
        id: uid(),
        origin: s.currentRun.origin,
        outcome: 'validated',
        challengeId: s.currentRun.challengeId,
        categoryId: s.currentRun.categoryId,
        points: challenge?.points,
        at: new Date().toISOString(),
      }
      return {
        ...s,
        validatedChallengeIds: [...s.validatedChallengeIds, s.currentRun.challengeId],
        currentRun: null,
        history: [entry, ...s.history],
      }
    })
  }, [])

  const teamReject = useCallback(() => {
    setState((s) => {
      if (!s.currentRun || s.currentRun.status !== 'in-progress') return s
      const entry: HistoryEntry = {
        id: uid(),
        origin: s.currentRun.origin,
        outcome: 'rejected',
        challengeId: s.currentRun.challengeId,
        categoryId: s.currentRun.categoryId,
        at: new Date().toISOString(),
      }
      return { ...s, currentRun: null, history: [entry, ...s.history] }
    })
  }, [])

  const reset = useCallback(() => {
    setState(initialState())
  }, [])

  return {
    state,
    setRole,
    teamStartChallenge,
    lucasPickTheme,
    teamAssignCard,
    lucasPickChallenge,
    lucasAcceptChallenge,
    switchCard,
    closeWithJoker,
    teamValidate,
    teamReject,
    reset,
  }
}
