import { useEffect, useState } from 'react'

export const CHALLENGE_DURATION_MS = 24 * 60 * 60 * 1000

/** Ticks every second while `expiresAt` is set — drives the live "HH:MM" display. */
export function useCountdown(expiresAt?: string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (!expiresAt) return { ms: 0, label: '--:--', expired: false }

  const ms = Math.max(0, new Date(expiresAt).getTime() - now)
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const label = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  return { ms, label, expired: ms <= 0 }
}
