import { motion } from 'framer-motion'
import { Bell, Check, ChevronDown, X } from 'lucide-react'
import { ChallengeCard } from './ChallengeCard'
import { AppHeader } from './AppHeader'
import { JokerTile } from './JokerTile'
import { categoryById, jokers } from '../data/categories'
import { challenges } from '../data/challenges'
import { jokerIcons } from '../lib/jokerIcons'
import { useCountdown } from '../lib/countdown'
import type { useGameState } from '../state/useGameState'
import type { ChallengeRun, JokerDef, JokerId, Role } from '../types'

type Game = ReturnType<typeof useGameState>

interface Props {
  game: Game
  run: ChallengeRun
  onMinimize: () => void
  onSwitchRole: (role: Role) => void
  onPlayJoker: (joker: JokerDef) => void
}

/**
 * Full-screen focus mode for the one current run, whatever its status — the
 * 'received' decision beat (Accepter/Refuser/Jokers) and the 'active' countdown
 * + validation beat both live here. Opened on demand from the persistent
 * CurrentRunBar rather than occupying the main screen by default, so browsing
 * the deck or the profile never requires resolving it first.
 */
export function ChallengeTakeover({ game, run, onMinimize, onSwitchRole, onPlayJoker }: Props) {
  const { state } = game
  const role = state.role
  const allChallenges = [...challenges, ...state.customChallenges]
  const challenge = allChallenges.find((c) => c.id === run.challengeId)
  const category = categoryById(run.categoryId)
  const { label, expired } = useCountdown(run.expiresAt)

  if (!challenge) return null

  const isReceived = run.status === 'received'
  const submitted = !!run.submittedForValidation
  const availableJokers = jokers.filter((j) => !state.jokersUsed.includes(j.id as JokerId))

  // Who has something to actually do right now, versus just watching.
  const hasFloatingActions = isReceived ? role === 'lucas' : role === 'lucas' ? !submitted : true

  const heading = isReceived
    ? role === 'lucas'
      ? "On t'a lancé un défi"
      : `Défi envoyé — ${category?.name ?? ''}`
    : role === 'lucas'
      ? submitted
        ? 'En attente de validation par ta team'
        : 'Tu as un défi en cours'
      : submitted
        ? 'Lucas a terminé son défi !'
        : 'Lucas a un défi en cours'

  const subheading = isReceived
    ? role === 'lucas'
      ? 'Tu as 24h une fois accepté.'
      : 'En attente de la décision de Lucas...'
    : expired
      ? 'Temps écoulé'
      : `Expire dans ${label}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-cream dark:bg-neutral-950"
    >
      <AppHeader points={state.totalPoints} role={role} onRoleChange={onSwitchRole} />
      <button
        onClick={onMinimize}
        className="font-rounded mx-5 -mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-black/40 hover:text-black/60 dark:text-cream/40 dark:hover:text-cream/60"
      >
        <ChevronDown size={14} /> Réduire
      </button>

      <div
        className={`flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-6 ${
          hasFloatingActions ? 'pb-40' : 'pb-10'
        }`}
      >
        <div className="text-center">
          <p className="font-display text-2xl leading-tight text-black dark:text-cream">{heading}</p>
          <p className="font-rounded mt-2 text-sm font-normal text-black/50 dark:text-cream/50">{subheading}</p>
        </div>

        <motion.div
          key={challenge.id}
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChallengeCard challenge={challenge} size="lg" />
        </motion.div>

        {!isReceived && run.origin === 'lucas' && (
          <span className="font-rounded rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-black/60 dark:bg-white/10 dark:text-cream/60">
            Choisi librement — points x2 si validé
          </span>
        )}

        {!isReceived && role === 'lucas' && submitted && (
          <p className="font-rounded max-w-xs text-center text-sm text-black/50 dark:text-cream/50">
            Ta team a été prévenue — elle valide dès qu'elle regarde. 🎉
          </p>
        )}

        {isReceived && role === 'lucas' && availableJokers.length > 0 && (
          <div className="w-full">
            <p className="font-rounded mb-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-black/30 dark:text-cream/30">
              Tes jokers — gratuits, une fois chacun
            </p>
            <div className="flex justify-center gap-2.5">
              {availableJokers.map((j) => (
                <JokerTile
                  key={j.id}
                  name={j.name}
                  effect={j.effect}
                  Icon={jokerIcons[j.id as JokerId]}
                  onClick={() => onPlayJoker(j)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons stay pinned above the card as a foreground bar, never pushed
          off-screen by scroll — they float over the content instead of living inside it. */}
      {hasFloatingActions && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 bg-gradient-to-t from-cream via-cream/95 to-transparent px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 dark:from-neutral-950 dark:via-neutral-950/95">
          {isReceived && role === 'lucas' && (
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <div className="flex items-center gap-6">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => game.lucasDeclineHard()}
                  aria-label="Refuser le défi"
                  title={`Refuser — perd ${challenge.points} pts`}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/15 text-black/50 dark:border-white/15 dark:text-cream/50"
                >
                  <X size={18} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => game.lucasAcceptReceived()}
                  aria-label="Accepter le défi"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-cream shadow-lg"
                >
                  <span className="font-rounded text-sm font-bold">OK</span>
                </motion.button>
              </div>
              <p className="font-rounded text-[11px] text-black/40 dark:text-cream/40">
                Refuser perd {challenge.points} pts
              </p>
            </div>
          )}

          {!isReceived && role === 'lucas' && (
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => game.lucasSubmitForValidation()}
                className="font-rounded inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-base font-bold text-cream shadow-lg"
              >
                <Bell size={17} /> J'ai terminé, demander la validation
              </motion.button>
              <button
                onClick={() => game.lucasGiveUp()}
                className="font-rounded text-xs font-semibold text-black/40 hover:text-black/60 dark:text-cream/40 dark:hover:text-cream/60"
              >
                Abandonner — perd {challenge.points} pts
              </button>
            </div>
          )}

          {!isReceived && role === 'team' && (
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              {submitted && (
                <span className="font-rounded inline-flex items-center gap-1.5 rounded-full bg-amber-400/25 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                  <Bell size={12} /> Lucas demande une validation
                </span>
              )}
              <div className="flex gap-5">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => game.teamValidate()}
                  aria-label="Valider le défi"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-cream shadow-lg"
                >
                  <Check size={26} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => game.teamDeny()}
                  aria-label="Refuser le défi"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-cream shadow-lg"
                >
                  <X size={26} />
                </motion.button>
              </div>
              <p className="font-rounded text-xs text-black/40 dark:text-cream/40">
                Refuser fait perdre {challenge.points} pts à Lucas
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
