import { Check } from 'lucide-react'
import type { Challenge } from '../types'
import { categoryById } from '../data/categories'
import { categoryIcons } from '../lib/categoryIcons'

interface Props {
  challenge: Challenge
  done?: boolean
  locked?: boolean
  onClick?: () => void
}

/**
 * A miniature of the physical card's recto — colored category banner on top,
 * cream body, points pill in the category color — so the mosaic reads as a
 * stack of tiny AURA cards rather than generic app tiles.
 */
export function ChallengeTile({ challenge, done = false, locked = false, onClick }: Props) {
  const category = categoryById(challenge.categoryId)
  if (!category) return null

  const Icon = categoryIcons[challenge.categoryId]

  const className = `relative flex h-28 w-24 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-cream text-left shadow-sm dark:border-white/10 dark:bg-neutral-900 ${
    locked && !done ? 'opacity-40' : ''
  } ${done ? 'grayscale' : onClick ? 'transition hover:-translate-y-0.5' : ''}`

  const content = (
    <>
      {done && (
        <span className="absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-black text-cream">
          <Check size={9} />
        </span>
      )}
      <div className="flex items-center px-1.5 pb-1 pt-1.5" style={{ backgroundColor: category.hex }}>
        <Icon size={11} className="text-black/70" />
      </div>
      <div className="flex flex-1 flex-col justify-between px-1.5 py-1">
        <p className="font-rounded line-clamp-3 text-[9.5px] font-semibold leading-tight text-black/80 dark:text-cream/80">
          {challenge.title}
        </p>
        <span
          className="self-end rounded-full px-1.5 py-0.5 text-[8px] font-bold text-black"
          style={{ backgroundColor: category.hex }}
        >
          +{challenge.points}
        </span>
      </div>
    </>
  )

  if (!onClick) {
    return <div className={className}>{content}</div>
  }

  // Never natively `disabled` — a done or locked challenge still needs to be tappable
  // to view its content, even though it can't be picked. The caller's onClick decides
  // whether that tap opens a read-only view or starts the pick flow.
  return (
    <button onClick={onClick} aria-label={challenge.title} className={className}>
      {content}
    </button>
  )
}
