import { useEffect, useState } from 'react'

/** True below Tailwind `md` (768px). SSR-safe default: true (mobile-first). */
export function useIsMobile(breakpointPx = 768) {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(`(max-width: ${breakpointPx - 1}px)`).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`)
    const sync = () => setMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [breakpointPx])

  return mobile
}
