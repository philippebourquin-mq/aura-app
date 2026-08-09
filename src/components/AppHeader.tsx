import { Link } from 'react-router-dom'
import { Trophy, UserRound, Users } from 'lucide-react'
import type { Role } from '../types'

interface Props {
  points: number
  role: Role
  onRoleChange: (role: Role) => void
  /** Only the true home screen repeats the wordmark, per the wireframe. */
  wordmark?: boolean
}

/** trophy+points top-left, role switcher centered, avatar top-right — the header on every screen. */
export function AppHeader({ points, role, onRoleChange, wordmark = false }: Props) {
  const AvatarIcon = role === 'team' ? Users : UserRound

  return (
    <header className="sticky top-0 z-10 bg-cream/90 px-5 pt-4 pb-3 backdrop-blur dark:bg-neutral-950/90">
      <div className="flex items-center justify-between">
        <div className="font-rounded flex items-center gap-1.5 text-sm font-bold text-black dark:text-cream">
          <Trophy size={16} className="text-black/70 dark:text-cream/70" />
          {points}
        </div>

        <div className="flex rounded-full border border-black/10 bg-white/70 p-0.5 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
          <button
            onClick={() => onRoleChange('lucas')}
            className={`font-rounded rounded-full px-2.5 py-1 transition ${
              role === 'lucas'
                ? 'bg-black text-cream'
                : 'text-black/40 hover:text-black dark:text-cream/40 dark:hover:text-cream'
            }`}
          >
            Lucas
          </button>
          <button
            onClick={() => onRoleChange('team')}
            className={`font-rounded rounded-full px-2.5 py-1 transition ${
              role === 'team'
                ? 'bg-black text-cream'
                : 'text-black/40 hover:text-black dark:text-cream/40 dark:hover:text-cream'
            }`}
          >
            Team
          </button>
        </div>

        <Link
          to="/progression"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-cream transition hover:bg-black/80 dark:bg-white/10"
          aria-label="Profil"
        >
          <AvatarIcon size={16} />
        </Link>
      </div>

      {wordmark && (
        <p className="font-display mt-3 text-2xl tracking-[0.15em] text-black dark:text-cream">AURA</p>
      )}
    </header>
  )
}
