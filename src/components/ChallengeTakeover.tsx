import { motion } from 'framer-motion'
import { Bell, Check, ChevronDown, X } from 'lucide-react'
import { ChallengeCard } from './ChallengeCard'
import { AppHeader } from './AppHeader'
import { useCountdown } from '../lib/countdown'
import type { Challenge, Role, RunOrigin } from '../types'

interface Props {
  challenge: Challenge
  origin: RunOrigin
  expiresAt?: string
  submitted?: boolean
  role: Role
  points: number
  onValidate: () => void
  onDeny: () => void
  onGiveUp: () => void
  onSubmitForValidation: () => void
  onMinimize: () => void
  onSwitchRole: (role: Role) => void
}

/**
 * Full-screen focus mode for an accepted, running challenge — "Tu as un défi en
 * cours" / "Lucas a un défi en cours" in the wireframe. Once Lucas commits, this
 * is the only thing on screen. Team's resolution is the two big circular buttons
 * from the "Lucas a terminé son défi" wireframe.
 */
export function ChallengeTakeover({
  challenge,
  origin,
  expiresAt,
  submitted = false,
  role,
  points,
  onValidate,
  onDeny,
  onGiveUp,
  onSubmitForValidation,
  onMinimize,
  onSwitchRole,
}: Props) {
  const { label, expired } = useCountdown(expiresAt)
  // Lucas has an action to take whenever he hasn't submitted yet; the team has one
  // whenever Lucas's run is running at all. Everyone else is just looking.
  const hasFloatingActions = role === 'lucas' ? !submitted : true

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-cream dark:bg-neutral-950"
    >
      <AppHeader points={points} role={role} onRoleChange={onSwitchRole} />
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
          <p className="font-rounded text-base font-bold text-black dark:text-cream">
            {role === 'lucas'
              ? submitted
                ? "En attente de validation par ta team"
                : 'Tu as un défi en cours'
              : submitted
                ? 'Lucas a terminé son défi !'
                : 'Lucas a un défi en cours'}
          </p>
          <p className="font-rounded mt-1 text-sm text-black/50 dark:text-cream/50">
            {expired ? 'Temps écoulé' : `Expire dans ${label}`}
          </p>
        </div>

        <motion.div
          key={challenge.id}
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChallengeCard challenge={challenge} size="lg" />
        </motion.div>

        {origin === 'lucas' && (
          <span className="font-rounded rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-black/60 dark:bg-white/10 dark:text-cream/60">
            Choisi librement — points x2 si validé
          </span>
        )}

        {role === 'lucas' && submitted && (
          <p className="font-rounded max-w-xs text-center text-sm text-black/50 dark:text-cream/50">
            Ta team a été prévenue — elle valide dès qu'elle regarde. 🎉
          </p>
        )}
      </div>

      {/* Action buttons stay pinned above the card as a foreground bar, never pushed
          off-screen by scroll — the whole point of "Refuser"/"Valider" is that they're
          always reachable, so they float over the content instead of living inside it. */}
      {hasFloatingActions && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 bg-gradient-to-t from-cream via-cream/95 to-transparent px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 dark:from-neutral-950 dark:via-neutral-950/95">
          {role === 'lucas' && (
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onSubmitForValidation}
                className="font-rounded inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-base font-bold text-cream shadow-lg"
              >
                <Bell size={17} /> J'ai terminé, demander la validation
              </motion.button>
              <button
                onClick={onGiveUp}
                className="font-rounded text-xs font-semibold text-black/40 hover:text-black/60 dark:text-cream/40 dark:hover:text-cream/60"
              >
                Abandonner — perd {challenge.points} pts
              </button>
            </div>
          )}

          {role === 'team' && (
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              {submitted && (
                <span className="font-rounded inline-flex items-center gap-1.5 rounded-full bg-amber-400/25 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                  <Bell size={12} /> Lucas demande une validation
                </span>
              )}
              <div className="flex gap-5">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={onValidate}
                  aria-label="Valider le défi"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-cream shadow-lg"
                >
                  <Check size={26} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={onDeny}
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
