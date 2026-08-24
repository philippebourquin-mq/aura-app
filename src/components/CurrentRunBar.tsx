import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { categoryById } from '../data/categories'
import { categoryIcons } from '../lib/categoryIcons'
import { useCountdown } from '../lib/countdown'
import type { Challenge, ChallengeRun, Role } from '../types'

interface Props {
  run: ChallengeRun
  challenge: Challenge
  role: Role
  onOpen: () => void
}

/**
 * The one current run, always visible — under the header on every page, not just
 * Home — so browsing the deck or the profile never loses track of it. Tapping
 * reopens the full ChallengeTakeover.
 */
export function CurrentRunBar({ run, challenge, role, onOpen }: Props) {
  const category = categoryById(run.categoryId)
  const Icon = category ? categoryIcons[category.id] : undefined
  const { label, expired } = useCountdown(run.expiresAt)

  const statusText = (() => {
    if (run.status === 'received') {
      return role === 'lucas' ? 'À toi de décider' : 'En attente de Lucas'
    }
    if (run.submittedForValidation) {
      return role === 'lucas' ? 'En attente de validation' : 'À valider'
    }
    return expired ? 'Temps écoulé' : `Expire dans ${label}`
  })()

  return (
    <motion.button
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="font-rounded mt-3 flex w-full items-center gap-2.5 rounded-full border border-black/10 bg-white/70 px-3.5 py-2 text-left dark:border-white/10 dark:bg-white/5"
    >
      {category && Icon && (
        <span
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: category.hex }}
        >
          <Icon size={13} className="text-black/70" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold text-black dark:text-cream">{challenge.title}</span>
        <span className="block truncate text-[10px] text-black/50 dark:text-cream/50">{statusText}</span>
      </span>
      <ChevronRight size={14} className="flex-shrink-0 text-black/30 dark:text-cream/30" />
    </motion.button>
  )
}
