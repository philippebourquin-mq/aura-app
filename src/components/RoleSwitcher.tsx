import { Link } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import type { Role } from '../types'

interface Props {
  role: Role
  onChange: (role: Role) => void
  showProfileLink?: boolean
}

export function RoleSwitcher({ role, onChange, showProfileLink = false }: Props) {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-cream/90 px-4 py-2 backdrop-blur dark:bg-neutral-950/90">
      <div />

      <div className="flex justify-center rounded-full border border-black/10 bg-white/70 p-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
        <button
          onClick={() => onChange('lucas')}
          className={`font-rounded rounded-full px-3 py-1.5 transition ${
            role === 'lucas'
              ? 'bg-black text-cream'
              : 'text-black/50 hover:text-black dark:text-cream/50 dark:hover:text-cream'
          }`}
        >
          👦 Lucas
        </button>
        <button
          onClick={() => onChange('team')}
          className={`font-rounded rounded-full px-3 py-1.5 transition ${
            role === 'team'
              ? 'bg-black text-cream'
              : 'text-black/50 hover:text-black dark:text-cream/50 dark:hover:text-cream'
          }`}
        >
          🧑‍🤝‍🧑 Team
        </button>
      </div>

      <div className="flex justify-end">
        {showProfileLink && (
          <Link
            to="/progression"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-cream transition hover:bg-black/80 dark:bg-white/10 dark:text-cream"
            aria-label="Profil"
          >
            <UserRound size={18} />
          </Link>
        )}
      </div>
    </div>
  )
}
