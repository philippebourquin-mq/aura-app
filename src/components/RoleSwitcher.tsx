import type { Role } from '../types'

interface Props {
  role: Role
  onChange: (role: Role) => void
}

export function RoleSwitcher({ role, onChange }: Props) {
  return (
    <div className="sticky top-0 z-10 flex justify-center bg-cream/90 py-2 backdrop-blur dark:bg-neutral-950/90">
      <div className="flex rounded-full border border-black/10 bg-white/70 p-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
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
    </div>
  )
}
