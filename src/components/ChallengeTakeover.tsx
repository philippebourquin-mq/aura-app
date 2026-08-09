import { motion } from 'framer-motion'
import { Check, ChevronDown, X } from 'lucide-react'
import { ChallengeCard } from './ChallengeCard'
import { AppHeader } from './AppHeader'
import { useCountdown } from '../lib/countdown'
import type { Challenge, Role, RunOrigin } from '../types'

interface Props {
  challenge: Challenge
  origin: RunOrigin
  expiresAt?: string
  role: Role
  points: number
  onValidate: () => void
  onDeny: () => void
  onGiveUp: () => void
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
  role,
  points,
  onValidate,
  onDeny,
  onGiveUp,
  onMinimize,
  onSwitchRole,
}: Props) {
  const { label, expired } = useCountdown(expiresAt)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-cream dark:bg-neutral-950"
    >
      <AppHeader points={points} role={role} onRoleChange={onSwitchRole} />
      <button
        onClick={onMinimize}
        className="font-rounded mx-5 -mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-black/40 hover:text-black/60 dark:text-cream/40 dark:hover:text-cream/60"
      >
        <ChevronDown size={14} /> Réduire
      </button>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-6">
        <div className="text-center">
          <p className="font-rounded text-base font-bold text-black dark:text-cream">
            {role === 'lucas' ? 'Tu as un défi en cours' : 'Lucas a un défi en cours'}
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

        {role === 'lucas' && (
          <button
            onClick={onGiveUp}
            className="font-rounded text-xs font-semibold text-black/40 hover:text-black/60 dark:text-cream/40 dark:hover:text-cream/60"
          >
            Abandonner — perd {challenge.points} pts
          </button>
        )}

        {role === 'team' && (
          <div className="flex flex-col items-center gap-3">
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
    </motion.div>
  )
}
