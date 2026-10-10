import { useEffect, useRef } from 'react'
import { reduceDecorativeMotion } from '../lib/motion'

const INTERACTIVE = 'a, button, [role="button"], input, label[for], select, summary, [data-cursor]'

/**
 * BrutalCursor — square dot that tracks 1:1 plus a hairline square that
 * trails it. Over links the frame opens up and squares off the target;
 * over text fields it collapses to an I-beam. Fine pointers only.
 */
export default function BrutalCursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches) return undefined
    const reduced = reduceDecorativeMotion()
    const html = document.documentElement
    const d = dot.current
    const r = ring.current
    if (!d || !r) return undefined

    html.classList.add('has-brutal-cursor')

    let x = -100
    let y = -100
    let rx = x
    let ry = y
    let raf = 0
    let shown = false

    const tick = () => {
      const k = reduced ? 1 : 0.2
      rx += (x - rx) * k
      ry += (y - ry) * k
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0
    }

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      d.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      if (!shown) {
        shown = true
        rx = x
        ry = y
        d.parentElement.dataset.on = 'true'
      }
      if (!raf) raf = requestAnimationFrame(tick)

      const t = e.target instanceof Element ? e.target : null
      const field = t?.closest('input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]')
      const hit = t?.closest(INTERACTIVE)
      d.parentElement.dataset.mode = field ? 'text' : hit ? 'link' : ''
    }

    const onLeave = () => {
      d.parentElement.dataset.on = 'false'
      shown = false
    }
    const onDown = () => {
      d.parentElement.dataset.press = 'true'
    }
    const onUp = () => {
      d.parentElement.dataset.press = 'false'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      html.classList.remove('has-brutal-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [])

  return (
    <div className="ratio-cursor" aria-hidden="true" data-on="false" data-mode="" data-press="false">
      <span ref={ring} className="ratio-cursor-ring" />
      <span ref={dot} className="ratio-cursor-dot" />
    </div>
  )
}
