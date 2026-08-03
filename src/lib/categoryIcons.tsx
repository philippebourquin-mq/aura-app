import { Crown, Dumbbell, Gift, Megaphone, Sparkles, Users, type LucideIcon } from 'lucide-react'
import type { CategoryId } from '../types'

export const categoryIcons: Record<CategoryId, LucideIcon> = {
  'stranger-things': Users,
  'mode-machine': Dumbbell,
  'cash-sans-clash': Sparkles,
  'ya-quoi': Megaphone,
  'numero-10': Crown,
  bonus: Gift,
}
