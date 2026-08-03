import { Link } from 'react-router-dom'
import type { Category } from '../types'

interface Props {
  category: Category
  done: number
  total: number
}

export function CategoryTile({ category, done, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <Link
      to={`/categorie/${category.id}`}
      className="group flex flex-col justify-between rounded-card border border-black/10 bg-cream p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: category.hex }}
        />
        <h3 className="font-display mt-2 text-lg text-black">{category.name}</h3>
        <p className="font-rounded mt-1 text-sm text-black/60">{category.tagline}</p>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: category.hex }}
          />
        </div>
        <p className="font-rounded mt-1 text-xs text-black/50">
          {done}/{total} défis validés
        </p>
      </div>
    </Link>
  )
}
