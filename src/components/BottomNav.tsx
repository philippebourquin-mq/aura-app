import { Link, useLocation } from 'react-router-dom'
import { Home, Sparkle } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Accueil', icon: Home, match: (p: string) => p === '/' || p.startsWith('/categorie') },
  { to: '/progression', label: 'Profil', icon: Sparkle, match: (p: string) => p === '/progression' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-cream/90 backdrop-blur dark:border-white/10 dark:bg-neutral-900/90">
      <div className="mx-auto flex max-w-lg justify-around">
        {tabs.map((tab) => {
          const active = tab.match(location.pathname)
          const Icon = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="font-rounded flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold"
            >
              <Icon
                size={22}
                className={active ? 'text-black dark:text-cream' : 'text-black/30 dark:text-cream/30'}
                fill={active ? 'currentColor' : 'none'}
              />
              <span className={active ? 'text-black dark:text-cream' : 'text-black/30 dark:text-cream/30'}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
