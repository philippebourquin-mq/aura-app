import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Category } from '../types'

interface Props {
  category: Category
  onCreate: (input: { title: string; description: string; points: number }) => void
  onClose: () => void
}

const POINT_PRESETS = [200, 400, 600, 800, 1000]

/** "new" — the team writes a custom card for a given category, pre-set by where they tapped "+". */
export function NewChallengeForm({ category, onCreate, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(600)

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
          <h2 className="font-display text-xl text-black dark:text-cream">Nouveau défi</h2>
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
            className="font-rounded w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:bg-white/5 dark:text-cream"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris le défi..."
            rows={3}
            className="font-rounded w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:bg-white/5 dark:text-cream"
          />
          <div
            className="font-rounded flex w-full items-center rounded-full px-4 py-3 text-sm font-bold text-black"
            style={{ backgroundColor: category.hex }}
          >
            {category.name}
          </div>

          <div className="flex justify-between gap-1.5 pt-1">
            {POINT_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPoints(p)}
                className={`font-rounded flex-1 rounded-full py-2 text-xs font-bold transition ${
                  points === p
                    ? 'bg-black text-cream'
                    : 'bg-black/5 text-black/50 hover:bg-black/10 dark:bg-white/10 dark:text-cream/50'
                }`}
              >
                {p}
              </button>
            ))}
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
