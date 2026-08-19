import { useEffect, useRef, useState } from 'react'
import { bindRuptureCursor, toggleRupture, useRupture } from './rupture'

export const RUPTURE_FILL = '#ffb800'
export const RUPTURE_INK = '#111'

function Eyes() {
  return (
    <>
      <ellipse cx="40" cy="64" rx="4.4" ry="11.5" fill={RUPTURE_INK} />
      <ellipse cx="60" cy="63" rx="4.4" ry="11.5" fill={RUPTURE_INK} />
    </>
  )
}

/** Doodle faces — solid fill + ink stroke. Variant cycles per cube. */
export function RuptureFace({ variant = 0, className = '', ...rest }) {
  const v = Math.abs(variant) % 4
  return (
    <svg
      viewBox="0 0 100 110"
      fill="none"
      aria-hidden="true"
      overflow="visible"
      className={className}
      {...rest}
    >
      {v === 0 ? (
        <>
          <path
            d="M28 38c-14-22 0-30 16-16 7 6 8 14 1 12 12-22 42-24 48 0 3 12-4 16-10 9"
            stroke={RUPTURE_INK}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 54c2-18 18-28 37-26 21 2 35 16 33 36-2 22-18 38-38 36-21-2-34-18-32-46Z"
            fill={RUPTURE_FILL}
            stroke={RUPTURE_INK}
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <Eyes />
        </>
      ) : null}
      {v === 1 ? (
        <>
          <path
            d="M18 62c-2-18 8-30 22-34-4-16 8-24 22-22 14-4 28 6 26 22 14 2 26 16 24 34-2 26-20 42-46 42s-46-16-48-42Z"
            fill={RUPTURE_FILL}
            stroke={RUPTURE_INK}
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <Eyes />
        </>
      ) : null}
      {v === 2 ? (
        <>
          <path
            d="M14 30c3-10 16-16 32-14l34 4c12 2 20 12 18 26l-5 38c-2 14-16 20-30 18L22 98c-12-2-14-14-12-28Z"
            fill={RUPTURE_FILL}
            stroke={RUPTURE_INK}
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <ellipse cx="40" cy="60" rx="4.4" ry="11.5" fill={RUPTURE_INK} />
          <ellipse cx="60" cy="59" rx="4.4" ry="11.5" fill={RUPTURE_INK} />
        </>
      ) : null}
      {v === 3 ? (
        <>
          <path
            d="M12 58c2-20 22-32 44-30 24 2 38 18 36 36-2 18-20 32-42 30-24-2-40-16-38-36Z"
            fill={RUPTURE_FILL}
            stroke={RUPTURE_INK}
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <ellipse cx="40" cy="62" rx="4.4" ry="11.5" fill={RUPTURE_INK} />
          <ellipse cx="60" cy="61" rx="4.4" ry="11.5" fill={RUPTURE_INK} />
          <path
            d="M46 22c6-10 18-8 20 2"
            stroke={RUPTURE_INK}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        </>
      ) : null}
    </svg>
  )
}

/**
 * Crazy-mode figure. Sibling of the Off cube. `visibility: hidden` until On.
 * SVG so the FourPlates zoom stays sharp (bitmaps pixelate).
 */
export function RuptureOn({ index = 0, className = '' }) {
  return (
    <RuptureFace
      variant={index}
      data-rupture-on
      className={`pointer-events-none absolute inset-0 size-full overflow-visible ${className}`}
    />
  )
}

/** Bordó chip. Pulses, then snaps into a doodle and back. Hover holds the face. */
export function RuptureHit({ className = '', index = 0, label = 'Rupture' }) {
  useEffect(() => bindRuptureCursor(), [])
  return (
    <button
      type="button"
      data-rupture-hit
      data-hit-face={Math.abs(index) % 4}
      aria-label={label}
      onClick={toggleRupture}
      className={`ratio-hit relative pointer-events-auto size-10 shrink-0 ${className}`}
    >
      <span className="ratio-hit-slab" aria-hidden="true" />
      <RuptureFace variant={index} className="ratio-hit-char" />
    </button>
  )
}

function matchesCall(typed, target) {
  return typed.trim() === target
}

function isCallPrefix(typed, target) {
  return target.startsWith(typed)
}

/** Last line of the closer IDE — type the call, Enter runs rupture. */
export function RupturePlay({
  className = '',
  play = 'play',
  name = 'elFrontIdeal',
  flag = 'ON',
  playLabel = 'Play',
  pauseLabel = 'Pause',
}) {
  const on = useRupture()
  const target = `${play}(${name})`
  const [typed, setTyped] = useState('')
  const [ready, setReady] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const typedRef = useRef(typed)
  typedRef.current = typed

  useEffect(() => {
    const wrap = wrapRef.current
    const input = inputRef.current
    if (!wrap) return undefined

    const isReady = () => wrap.classList.contains('is-ready')
    const lidInPlay = () => {
      const lid = wrap.closest('[data-fit-lid]')
      if (!lid) return false
      const r = lid.getBoundingClientRect()
      return r.top < window.innerHeight && r.bottom > 0
    }
    const syncReady = () => {
      const next = isReady()
      setReady(next)
      if (!next) setTyped('')
      else queueMicrotask(() => input?.focus({ preventScroll: true }))
    }

    const tryRun = () => {
      if (!isReady()) return
      if (matchesCall(typedRef.current, target)) toggleRupture()
    }

    const onEnter = (e) => {
      if (e.key !== 'Enter') return
      if (!isReady() && !lidInPlay()) return
      const tag = e.target?.tagName
      if (e.target !== input && (tag === 'TEXTAREA' || e.target?.isContentEditable)) return
      e.preventDefault()
      e.stopPropagation()
      tryRun()
    }

    const onType = (e) => {
      if (!isReady() || on) return
      if (e.target === input) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') return

      if (e.key === 'Backspace') {
        e.preventDefault()
        input?.focus({ preventScroll: true })
        setTyped((t) => t.slice(0, -1))
        return
      }
      if (e.key.length !== 1) return
      e.preventDefault()
      input?.focus({ preventScroll: true })
      setTyped((t) => t + e.key)
    }

    syncReady()
    const obs = new MutationObserver(syncReady)
    obs.observe(wrap, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('keydown', onEnter, true)
    window.addEventListener('keydown', onType)
    return () => {
      obs.disconnect()
      window.removeEventListener('keydown', onEnter, true)
      window.removeEventListener('keydown', onType)
    }
  }, [on, target])

  const prefix = !on && isCallPrefix(typed, target)
  const shown = on ? target : typed
  const ghost = on || !prefix ? '' : target.slice(typed.length)
  const fnLen = prefix || on ? Math.min(shown.length, play.length) : 0

  return (
    <div
      ref={wrapRef}
      data-code-play
      className={`ratio-ide-call ${on ? 'is-on' : ''} ${className}`}
    >
      <span className="ratio-ide-prompt" aria-hidden="true">
        ❯
      </span>
      <span className="ratio-ide-field">
        <span className={fnLen ? 'ratio-ide-fn' : 'ratio-ide-typed'} aria-hidden="true">
          {shown.slice(0, fnLen || shown.length)}
        </span>
        {fnLen ? (
          <span className="ratio-ide-punct" aria-hidden="true">
            {shown.slice(fnLen)}
          </span>
        ) : null}
        {ghost ? (
          <span className="ratio-ide-ghost" aria-hidden="true">
            {ghost}
          </span>
        ) : null}
        {on ? <span className="ratio-ide-cmt">{`  // ${flag}`}</span> : null}
        <input
          ref={inputRef}
          className="ratio-ide-input"
          value={on ? target : typed}
          readOnly={on || !ready}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={on ? pauseLabel : playLabel}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            e.stopPropagation()
            if (ready && matchesCall(typed, target)) toggleRupture()
          }}
        />
      </span>
    </div>
  )
}

/**
 * Obys-style inline figures that appear only in rupture ON.
 * Arrows, strike-words, brackets, asterisks scattered in sections.
 */
const INLINE_FIGS = {
  arrow: (
    <svg viewBox="0 0 160 40" fill="none">
      <line x1="6" y1="20" x2="132" y2="20" stroke={RUPTURE_INK} strokeWidth="4.5" strokeLinecap="round" />
      <polyline points="122,8 140,20 122,32" stroke={RUPTURE_INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  'arrow-down': (
    <svg viewBox="0 0 40 120" fill="none">
      <line x1="20" y1="6" x2="20" y2="96" stroke={RUPTURE_INK} strokeWidth="4.5" strokeLinecap="round" />
      <polyline points="8,84 20,102 32,84" stroke={RUPTURE_INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  strike: (word) => (
    <svg viewBox="0 0 200 48" fill="none">
      <text x="100" y="35" textAnchor="middle" fontFamily="var(--font-syne)" fontWeight="700" fontSize="30" fill={RUPTURE_INK} letterSpacing="0.06em">
        {word}
      </text>
      <line x1="10" y1="24" x2="190" y2="24" stroke={RUPTURE_INK} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  ),
  bracket: (
    <svg viewBox="0 0 32 72" fill="none">
      <path d="M26 6 C 14 6, 8 18, 8 36 C 8 54, 14 66, 26 66" stroke={RUPTURE_INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  asterisk: (
    <svg viewBox="0 0 48 48" fill="none">
      <line x1="24" y1="4" x2="24" y2="44" stroke={RUPTURE_INK} strokeWidth="4" strokeLinecap="round" />
      <line x1="4" y1="24" x2="44" y2="24" stroke={RUPTURE_INK} strokeWidth="4" strokeLinecap="round" />
      <line x1="10" y1="10" x2="38" y2="38" stroke={RUPTURE_INK} strokeWidth="4" strokeLinecap="round" />
      <line x1="38" y1="10" x2="10" y2="38" stroke={RUPTURE_INK} strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  pill: (
    <svg viewBox="0 0 160 44" fill="none">
      <rect x="3" y="3" width="154" height="38" rx="19" stroke={RUPTURE_INK} strokeWidth="4.5" fill="none" />
    </svg>
  ),
  cross: (
    <svg viewBox="0 0 56 56" fill="none">
      <rect x="20" y="4" width="16" height="48" rx="1.5" fill={RUPTURE_INK} />
      <rect x="4" y="20" width="48" height="16" rx="1.5" fill={RUPTURE_INK} />
    </svg>
  ),
}

export function RuptureInline({ fig = 'arrow', word, className = '', style }) {
  const svg = fig === 'strike' ? INLINE_FIGS.strike(word || 'TEXT') : INLINE_FIGS[fig]
  if (!svg) return null
  return (
    <span data-rupture-on className={`pointer-events-none absolute ${className}`} style={style} aria-hidden="true">
      {svg}
    </span>
  )
}

/** Mr Bedfort overlay — fill matches the wash so it knocks out the grotesk. */
export function RuptureScript({ children, className = '' }) {
  return (
    <span data-rupture-script className={`ratio-script ${className}`} aria-hidden="true">
      {children}
    </span>
  )
}
