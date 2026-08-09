import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Category } from '../types'

interface Props {
  category: Category
  onCreate: (input: { title: string; description: string; points: number }) => void
  onClose: () => void
}

/** "new" — the team writes a custom card for a given category, pre-set by where they tapped "+". */
export function NewChallengeForm({ category, onCreate, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(500)

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && points > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-card bg-cream p-6 dark:bg-neutral-900 sm:rounded-card"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p
              className="font-rounded inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-black"
              style={{ backgroundColor: category.hex }}
            >
              {category.name}
            </p>
            <h2 className="font-display mt-1 text-xl text-black dark:text-cream">Nouveau défi</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-black/40 hover:bg-black/5 dark:text-cream/40 dark:hover:bg-white/10"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du défi"
            className="font-rounded w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:bg-white/5 dark:text-cream"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris le défi..."
            rows={3}
            className="font-rounded w-full resize-none rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:bg-white/5 dark:text-cream"
          />
          <div className="flex items-center gap-3">
            <label className="font-rounded text-sm font-semibold text-black/60 dark:text-cream/60">
              Points
            </label>
            <input
              type="number"
              min={100}
              step={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="font-rounded w-24 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:bg-white/5 dark:text-cream"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!canSubmit}
          onClick={() => canSubmit && onCreate({ title: title.trim(), description: description.trim(), points })}
          className="font-rounded mt-5 w-full rounded-full bg-black py-3 text-sm font-bold text-cream disabled:opacity-30"
        >
          Ajouter au catalogue
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
