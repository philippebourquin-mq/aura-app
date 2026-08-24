import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppHeader } from '../components/AppHeader'
import { ChallengeDetailSheet } from '../components/ChallengeDetailSheet'
import { ChallengePicker } from '../components/ChallengePicker'
import { ConfirmPickSheet } from '../components/ConfirmPickSheet'
import { challenges } from '../data/challenges'
import type { useGameState } from '../state/useGameState'
import type { Challenge } from '../types'

type Game = ReturnType<typeof useGameState>

interface Props {
  game: Game
  openTakeover: () => void
}

/**
 * Home IS the "choisis un défi" screen — the deck is always here, browsable even
 * while a run is in progress (picking is what's disabled, not looking). The run's
 * own status lives in the persistent CurrentRunBar under the header instead of
 * taking over the screen, so browsing and reaching the profile stay available.
 */
export function Home({ game, openTakeover }: Props) {
  const { state } = game
  const [pendingPick, setPendingPick] = useState<Challenge | null>(null)
  const [viewingChallenge, setViewingChallenge] = useState<Challenge | null>(null)

  const run = state.currentRun
  const allChallenges = [...challenges, ...state.customChallenges]
  const runChallenge = run ? allChallenges.find((c) => c.id === run.challengeId) : undefined
  const locked = !!run

  // Tapping the deck only opens a confirmation — nothing commits on a bare tap, so a stray
  // tap while scrolling or an ambiguous drag can never pick something by accident.
  const handlePick = (challengeId: string) => {
    const challenge = allChallenges.find((c) => c.id === challengeId)
    if (challenge) setPendingPick(challenge)
  }

  const handleViewDetail = (challengeId: string) => {
    const challenge = allChallenges.find((c) => c.id === challengeId)
    if (challenge) setViewingChallenge(challenge)
  }

  const commitPick = () => {
    if (!pendingPick) return
    if (state.role === 'lucas') game.lucasPickChallenge(pendingPick.id)
    else game.teamSendChallenge(pendingPick.id)
    setPendingPick(null)
  }

  return (
    <>
      <AppHeader
        points={state.totalPoints}
        role={state.role}
        onRoleChange={game.setRole}
        wordmark={!run}
        currentRun={run && runChallenge ? { run, challenge: runChallenge, onOpen: openTakeover } : undefined}
      />

      <motion.div
        className="mx-auto max-w-lg px-5 pt-2 pb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="font-display mb-10 mt-2 text-[2.1rem] leading-[1.05] text-black dark:text-cream">
          {locked
            ? 'Parcours les défis'
            : state.role === 'lucas'
              ? 'Choisis ton prochain défi'
              : 'Choisis un défi pour Lucas'}
        </h1>

        <ChallengePicker
          validatedChallengeIds={state.validatedChallengeIds}
          customChallenges={state.customChallenges}
          onPick={handlePick}
          onViewDetail={handleViewDetail}
          locked={locked}
        />
      </motion.div>

      <AnimatePresence>
        {pendingPick && (
          <ConfirmPickSheet
            challenge={pendingPick}
            role={state.role}
            onConfirm={commitPick}
            onCancel={() => setPendingPick(null)}
          />
        )}
        {viewingChallenge && (
          <ChallengeDetailSheet
            challenge={viewingChallenge}
            done
            canRequeue={state.role === 'team'}
            onRequeue={() => {
              game.requeueChallenge(viewingChallenge.id)
              setViewingChallenge(null)
            }}
            onClose={() => setViewingChallenge(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
