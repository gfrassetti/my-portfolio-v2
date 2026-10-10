import { useEffect, useRef } from 'react'
import { gsap } from '../../../lib/gsap'
import { useRupture } from './rupture'
import { RuptureFace, RUPTURE_FILL, RUPTURE_INK } from './RuptureOn'
import { reduceDecorativeMotion } from '../../../lib/motion'

/** Small ink shapes for the burst + drifters. Same stroke language as the faces. */
function Bit({ kind }) {
  if (kind === 'square') {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect x="4" y="4" width="32" height="32" fill={RUPTURE_FILL} stroke={RUPTURE_INK} strokeWidth="4" />
      </svg>
    )
  }
  if (kind === 'star') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        {[0, 45, 90, 135].map((a) => (
          <line
            key={a}
            x1="24"
            y1="4"
            x2="24"
            y2="44"
            stroke={RUPTURE_INK}
            strokeWidth="4.5"
            strokeLinecap="round"
            transform={`rotate(${a} 24 24)`}
          />
        ))}
      </svg>
    )
  }
  if (kind === 'arrow') {
    return (
      <svg viewBox="0 0 80 30" aria-hidden="true">
        <line x1="4" y1="15" x2="66" y2="15" stroke={RUPTURE_INK} strokeWidth="4.5" strokeLinecap="round" />
        <polyline
          points="56,5 70,15 56,25"
          fill="none"
          stroke={RUPTURE_INK}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (kind === 'ring') {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="15" fill="none" stroke={RUPTURE_INK} strokeWidth="4.5" />
      </svg>
    )
  }
  return null
}

const KINDS = ['face', 'square', 'star', 'face', 'arrow', 'ring', 'face', 'star']

/** Drifters: deterministic lanes so the layer reads composed, not noisy. */
const DRIFT = [
  { kind: 'face', v: 0, size: 86, top: 14, dur: 19, delay: 0, dir: 1 },
  { kind: 'star', size: 42, top: 28, dur: 13, delay: -6, dir: -1 },
  { kind: 'face', v: 2, size: 64, top: 52, dur: 23, delay: -11, dir: 1 },
  { kind: 'square', size: 38, top: 70, dur: 16, delay: -3, dir: -1 },
  { kind: 'face', v: 1, size: 104, top: 82, dur: 27, delay: -17, dir: -1 },
  { kind: 'arrow', size: 90, top: 40, dur: 15, delay: -9, dir: 1 },
  { kind: 'ring', size: 34, top: 62, dur: 12, delay: -2, dir: 1 },
  { kind: 'face', v: 3, size: 58, top: 22, dur: 21, delay: -14, dir: -1 },
]

/**
 * RuptureParty — the motion layer for crazy mode: a burst out of the IDE the
 * moment it switches on, then a slow parade of faces and marks crossing the
 * page. Fixed, pointer-transparent, and absent with reduced motion.
 */
export default function RuptureParty() {
  const on = useRupture()
  const burst = useRef(null)
  const was = useRef(on)

  useEffect(() => {
    const turnedOn = on && !was.current
    was.current = on
    if (!turnedOn || !burst.current) return undefined
    if (reduceDecorativeMotion()) return undefined

    const ide = document.querySelector('[data-fit-lid] [data-ide]') || document.querySelector('[data-ide]')
    const r = ide?.getBoundingClientRect()
    const inView = r && r.bottom > 0 && r.top < window.innerHeight
    const ox = inView ? r.left + r.width * 0.5 : window.innerWidth / 2
    const oy = inView ? r.top + r.height * 0.6 : window.innerHeight / 2

    const pieces = [...burst.current.children]
    const tl = gsap.timeline()
    pieces.forEach((el, i) => {
      const angle = (i / pieces.length) * Math.PI * 2 + Math.random() * 0.5
      const power = 260 + Math.random() * 520
      const dx = Math.cos(angle) * power
      const dy = Math.sin(angle) * power * 0.75 - 180
      const spin = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 540)
      gsap.set(el, { x: ox, y: oy, xPercent: -50, yPercent: -50, scale: 0.2, rotation: 0, autoAlpha: 1 })
      tl.to(el, { x: ox + dx, duration: 1.6, ease: 'power2.out' }, 0)
        .to(el, { y: oy + dy, duration: 0.7, ease: 'power2.out' }, 0)
        .to(el, { y: `+=${window.innerHeight * 0.9}`, duration: 1.1, ease: 'power2.in' }, 0.7)
        .to(el, { rotation: spin, scale: 0.7 + Math.random() * 0.7, duration: 1.8, ease: 'power1.out' }, 0)
        .to(el, { autoAlpha: 0, duration: 0.35 }, 1.45 + Math.random() * 0.3)
    })
    return () => tl.kill()
  }, [on])

  return (
    <div className="ratio-party" aria-hidden="true" data-on={on ? 'true' : 'false'}>
      <div className="ratio-party-drift">
        {DRIFT.map((d, i) => (
          <span
            key={i}
            className="ratio-party-lane"
            style={{
              top: `${d.top}%`,
              '--size': `${d.size}px`,
              '--dur': `${d.dur}s`,
              '--delay': `${d.delay}s`,
              '--dir': d.dir,
            }}
          >
            <span className="ratio-party-bob">
              {d.kind === 'face' ? <RuptureFace variant={d.v} className="size-full" /> : <Bit kind={d.kind} />}
            </span>
          </span>
        ))}
      </div>
      <div ref={burst} className="ratio-party-burst">
        {Array.from({ length: 40 }, (_, i) => {
          const kind = KINDS[i % KINDS.length]
          return (
            <span key={i} className="ratio-party-piece" style={{ '--size': `${kind === 'face' ? 56 : 30}px` }}>
              {kind === 'face' ? <RuptureFace variant={i} className="size-full" /> : <Bit kind={kind} />}
            </span>
          )
        })}
      </div>
    </div>
  )
}
