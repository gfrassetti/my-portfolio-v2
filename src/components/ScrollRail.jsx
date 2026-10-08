import { useEffect, useRef } from 'react'
import { getLenis } from '../hooks/useLenis'

const MIN_THUMB = 48

/**
 * ScrollRail — replaces the native scrollbar. Hairline track, ink thumb that
 * thickens on hover/drag. Reads native scroll (Lenis drives it), and drags
 * through Lenis so the page keeps its easing while scrubbing.
 */
export default function ScrollRail() {
  const rail = useRef(null)
  const thumb = useRef(null)

  useEffect(() => {
    const track = rail.current
    const knob = thumb.current
    if (!track || !knob) return undefined

    let thumbH = MIN_THUMB
    let idle

    const max = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

    const paint = () => {
      const trackH = track.clientHeight
      thumbH = Math.max(MIN_THUMB, (window.innerHeight / document.documentElement.scrollHeight) * trackH)
      const y = (window.scrollY / max()) * (trackH - thumbH)
      knob.style.height = `${thumbH}px`
      knob.style.transform = `translate3d(0, ${y}px, 0)`
    }

    const wake = () => {
      track.dataset.active = 'true'
      clearTimeout(idle)
      idle = setTimeout(() => {
        if (track.dataset.drag !== 'true') track.dataset.active = 'false'
      }, 900)
    }

    const onScroll = () => {
      paint()
      wake()
    }

    const scrollToRatio = (ratio, immediate) => {
      const target = Math.min(1, Math.max(0, ratio)) * max()
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(target, { immediate })
      else window.scrollTo(0, target)
    }

    let grab = 0
    const ratioAt = (clientY) => {
      const r = track.getBoundingClientRect()
      return (clientY - r.top - grab) / (r.height - thumbH)
    }

    const onMove = (e) => scrollToRatio(ratioAt(e.clientY), true)
    const onUp = (e) => {
      track.dataset.drag = 'false'
      track.releasePointerCapture?.(e.pointerId)
      track.removeEventListener('pointermove', onMove)
      track.removeEventListener('pointerup', onUp)
      track.removeEventListener('pointercancel', onUp)
      wake()
    }
    const onDown = (e) => {
      if (e.button !== 0) return
      e.preventDefault()
      const k = knob.getBoundingClientRect()
      const onKnob = e.clientY >= k.top && e.clientY <= k.bottom
      grab = onKnob ? e.clientY - k.top : thumbH / 2
      if (!onKnob) scrollToRatio(ratioAt(e.clientY), false)
      track.dataset.drag = 'true'
      track.setPointerCapture?.(e.pointerId)
      track.addEventListener('pointermove', onMove)
      track.addEventListener('pointerup', onUp)
      track.addEventListener('pointercancel', onUp)
    }

    const ro = new ResizeObserver(paint)
    ro.observe(document.documentElement)
    ro.observe(document.body)
    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', paint)
    track.addEventListener('pointerdown', onDown)

    return () => {
      clearTimeout(idle)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', paint)
      track.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <div ref={rail} className="ratio-rail" aria-hidden="true" data-active="false" data-drag="false">
      <span ref={thumb} className="ratio-rail-thumb" />
    </div>
  )
}
