import { useCallback, useEffect, useState } from 'react'
import type { ChallengeStatus, JokerId } from '../types'
import { challenges } from '../data/challenges'

const STORAGE_KEY = 'aura-game-state-v1'

export interface ChallengeState {
  status: ChallengeStatus
  completedAt?: string
}

export interface GameState {
  challengeStates: Record<string, ChallengeState>
  jokersUsed: JokerId[]
}

const initialState = (): GameState => ({
  challengeStates: Object.fromEntries(
    challenges.map((c) => [c.id, { status: 'todo' as ChallengeStatus }]),
  ),
  jokersUsed: [],
})

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as GameState
    // merge with defaults in case new challenges were added since last save
    const merged = initialState()
    for (const [id, state] of Object.entries(parsed.challengeStates ?? {})) {
      if (merged.challengeStates[id]) merged.challengeStates[id] = state
    }
    merged.jokersUsed = parsed.jokersUsed ?? []
    return merged
  } catch {
    return initialState()
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const markPending = useCallback((challengeId: string) => {
    setState((s) => ({
      ...s,
      challengeStates: {
        ...s.challengeStates,
        [challengeId]: { status: 'pending', completedAt: new Date().toISOString() },
      },
    }))
  }, [])

  const validate = useCallback((challengeId: string) => {
    setState((s) => ({
      ...s,
      challengeStates: {
        ...s.challengeStates,
        [challengeId]: { ...s.challengeStates[challengeId], status: 'validated' },
      },
    }))
  }, [])

  const reject = useCallback((challengeId: string) => {
    setState((s) => ({
      ...s,
      challengeStates: {
        ...s.challengeStates,
        [challengeId]: { status: 'todo' },
      },
    }))
  }, [])

  const consumeJoker = useCallback((jokerId: JokerId) => {
    setState((s) => ({ ...s, jokersUsed: [...new Set([...s.jokersUsed, jokerId])] }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState())
  }, [])

  return { state, markPending, validate, reject, consumeJoker, reset }
}
