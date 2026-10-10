import { reduceScrollMotion } from '../../../lib/motion'
import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../../../lib/gsap'
import { tilt } from './rupture'
import { RuptureOn, RUPTURE_FILL } from './RuptureOn'
import {
  MAG_SCROLL,
  magScale,
  placeMag,
  nestInner,
  attachScroll,
  playLoadPath,
} from '../../../lib/beat'

/** Column rules + sparse blocks. Wave 1 = first hop. Wave 2 = hop after RATIO. */
const FURNITURE = [
  { wave: 1, fx: 0.2, fy: 0, fw: 0, fh: 1, guide: true, ink: '#16110e' },
  { wave: 1, fx: 0.36, fy: 0, fw: 0, fh: 1, guide: true, ink: '#16110e' },
  { wave: 2, fx: 0.56, fy: 0, fw: 0, fh: 1, guide: true, ink: '#16110e' },
  { wave: 2, fx: 0.76, fy: 0, fw: 0, fh: 1, guide: true, ink: '#16110e' },
  { wave: 1, fx: 0.08, fy: 0.12, fw: 0.18, fh: 0.4, cube: false, ink: '#ebe6dc' },
  { wave: 1, fx: 0.3, fy: 0.08, fw: 0.12, fh: 0.12, cube: true, ink: '#cfc8bc' },
  { wave: 1, fx: 0.14, fy: 0.58, fw: 0.14, fh: 0.14, cube: true, ink: '#16110e' },
  { wave: 2, fx: 0.56, fy: 0.46, fw: 0.2, fh: 0.4, cube: false, ink: '#6a6560' },
  { wave: 2, fx: 0.8, fy: 0.4, fw: 0.12, fh: 0.12, cube: true, ink: '#ebe6dc' },
  { wave: 2, fx: 0.62, fy: 0.08, fw: 0.2, fh: 0.24, cube: false, ink: '#16110e' },
]

const HOP_1 = 1174
const HOP_2 = 1730

/**
 * Beat canvas 1024. Letter cells and cube sizes are the rail origin —
 * do not shrink the widget boxes or hops miss the floor.
 */
const BOX = { w: 797, h: 433 }
const FONT = 264
const TRACK = -10
/** Gap between ink boxes. Advance + 32 looked like the old 198px cells. */
const INK_GAP = 0
const TYPE_Z = 420
const TYPE_FAMILY = '"Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif'
const TYPE_WEIGHT = 500
const CUBE_Z = 200

/** Word 1 letter cells. Mag x is kept only for hop delays. */
const FORM_STEP = 198
const FORM_SLOTS = [
  { x: 132, y: -325, z: TYPE_Z, delay_px: 330, loadDelay: 0 },
  { x: 132 + FORM_STEP, y: -325, z: TYPE_Z + 1, delay_px: 250, loadDelay: 0.1 },
  { x: 132 + FORM_STEP * 2, y: -325, z: TYPE_Z + 2, delay_px: 170, loadDelay: 0.2 },
  { x: 132 + FORM_STEP * 3, y: -325, z: TYPE_Z + 3, delay_px: 90, loadDelay: 0.3 },
  { x: 132 + FORM_STEP * 4, y: -325, z: TYPE_Z + 4, delay_px: 10, loadDelay: 0.4 },
]

/** Word 3 letter slots (FOLD / GUIDO). Fifth cell is extrapolated for a 5-letter name. */
const JUST_SLOTS = [
  { x: 2250, y: -101, inDx: -2148, inDy: 1, dx2: -1336, dy2: -380, speed2: 0.4, z: TYPE_Z + 10 },
  { x: 2375, y: -101, inDx: -2286, inDy: 0, dx2: -1336, dy2: -379, speed2: 0.5, z: TYPE_Z + 11 },
  { x: 2551, y: -102, inDx: -2374, inDy: 0, dx2: -1336, dy2: -379, speed2: 0.4, z: TYPE_Z + 12 },
  { x: 2711, y: -101, inDx: -2451, inDy: 0, dx2: -1336, dy2: -379, speed2: 0.26, z: TYPE_Z + 13 },
  { x: 2875, y: -101, inDx: -2528, inDy: 0, dx2: -1336, dy2: -379, speed2: 0.26, z: TYPE_Z + 14 },
]

/**
 * Word 5 (BASELINE): slide in, then tumble off as the slab grows.
 * Even indices shoot up; odd shoot down. Downward dy is longer than the
 * dump — letters rest on the floor, and a 180° spin around the 433 box
 * would otherwise park them on the fold.
 */
const POWER_SLOTS = [
  { x: 5031, dx1: -5183, dx2: -5391, dy2: -1400, rot: -180, z: TYPE_Z + 20 },
  { x: 5187, dx1: -5331, dx2: -5418, dy2: 1180, rot: 180, z: TYPE_Z + 21 },
  { x: 5382, dx1: -5494, dx2: -5631, dy2: -1400, rot: -180, z: TYPE_Z + 22 },
  { x: 5609, dx1: -5641, dx2: -5708, dy2: 1240, rot: 180, z: TYPE_Z + 23 },
  { x: 5768, dx1: -5710, dx2: -5811, dy2: -1400, rot: -180, z: TYPE_Z + 24 },
  { x: 5934, dx1: -5806, dx2: -5818, dy2: 1260, rot: 180, z: TYPE_Z + 25 },
  { x: 6077, dx1: -5856, dx2: -5979, dy2: -1400, rot: -180, z: TYPE_Z + 26 },
  { x: 6255, dx1: -5948, dx2: -5996, dy2: 1260, rot: 180, z: TYPE_Z + 27 },
]

function powerSlot(i) {
  if (POWER_SLOTS[i]) return POWER_SLOTS[i]
  const last = POWER_SLOTS[POWER_SLOTS.length - 1]
  const extra = i - (POWER_SLOTS.length - 1)
  const up = extra % 2 === 1
  return {
    x: last.x + extra * 178,
    dx1: last.dx1 - extra * 92,
    dx2: last.dx2 - extra * 80,
    dy2: up ? -1400 : 1260,
    rot: up ? -180 : 180,
    z: TYPE_Z + 20 + i,
  }
}

const CUBE = { x: -385, y: 20, w: 197, h: 197, z: CUBE_Z }

/** Landscape hop height the rail timing was authored against (mag units). */
const HOP_REF = 260

function cubeSteps(hop) {
  // Portrait frames sit much higher, so the hop is several times longer. Speed
  // it up in proportion so the cube lands on the same beat as on desktop —
  // otherwise it is still mid-air when BASELINE rolls in.
  const speed = Math.max(1, Math.abs(hop) / HOP_REF)
  return [
    { delay_px: HOP_1, dx: 70, dy: hop, rot: 90, from: 0, acc: 'ease-out', speed },
    { dx: 202, dy: hop, rot: 90, speed },
    { dx: 255, dy: 0, rot: 180, acc: 'ease-in', speed },
    { dx: 0, dy: 0, rot: 360, speed },
    { delay_px: HOP_2, dx: 50, dy: hop, rot: 270, acc: 'ease-out', speed },
    { dx: 332, dy: hop, rot: 270, speed },
    { dx: 502, dy: 0, rot: 360, acc: 'ease-in', speed },
    { dx: 0, dy: 0, rot: 360, speed },
  ]
}

function slugSteps(item) {
  const side = item.fx < 0.5 ? -1 : 1
  return [
    {
      dx: 90 * side,
      dy: 80,
      rot: 24 * side,
      from: 0,
      acc: 'ease-out',
      speed: 1,
    },
    {
      dx: 1280 * side,
      dy: 980,
      rot: 160 * side,
      acc: 'ease-in',
      speed: 1,
    },
  ]
}

function insetRect(r, t) {
  const p = Math.min(r.width, r.height) * t
  return {
    left: r.left + p,
    right: r.right - p,
    top: r.top + p,
    bottom: r.bottom - p,
    width: r.width - p * 2,
    height: r.height - p * 2,
  }
}

function overlapArea(a, b) {
  const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return x * y
}

function clientBox(el) {
  if (!el) return null
  if (el.getClientRects) {
    const list = el.getClientRects()
    if (list.length) {
      let left = Infinity
      let top = Infinity
      let right = -Infinity
      let bottom = -Infinity
      for (const r of list) {
        if (r.width < 1 || r.height < 1) continue
        left = Math.min(left, r.left)
        top = Math.min(top, r.top)
        right = Math.max(right, r.right)
        bottom = Math.max(bottom, r.bottom)
      }
      if (Number.isFinite(left)) {
        return { left, top, right, bottom, width: right - left, height: bottom - top }
      }
    }
  }
  const r = el.getBoundingClientRect()
  if (r.width < 1 || r.height < 1) return null
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }
}

function glyphsOf(word) {
  return Array.from(word || '').filter((ch) => ch !== ' ')
}

function slotAt(list, i) {
  if (list[i]) return list[i]
  const last = list[list.length - 1]
  const prev = list[list.length - 2] || last
  const extra = i - (list.length - 1)
  const step = last.x - prev.x || 160
  return {
    ...last,
    x: last.x + extra * step,
    inDx: (last.inDx ?? last.x) - extra * 80,
    z: (last.z ?? 0) + extra,
  }
}

function inkWidth(el, ch, px) {
  const ctx = document.createElement('canvas').getContext('2d')
  const family = el ? getComputedStyle(el).fontFamily : TYPE_FAMILY
  ctx.font = `${TYPE_WEIGHT} ${px}px ${family}`
  const m = ctx.measureText((ch || 'M').toUpperCase())
  const ink = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || 0)
  return Math.max(ink, m.width * 0.58)
}

/** Caps sit on the hero floor. Do not hang below the fold. */
function paintGlyph(el, s) {
  if (!el) return
  const px = FONT * s
  Object.assign(el.style, {
    position: 'absolute',
    left: '0px',
    top: 'auto',
    bottom: '0px',
    display: 'block',
    width: 'max-content',
    height: `${0.72 * px}px`,
    fontFamily: TYPE_FAMILY,
    fontSize: `${px}px`,
    fontWeight: String(TYPE_WEIGHT),
    fontStyle: 'normal',
    lineHeight: '0.72',
    letterSpacing: '0px',
    color: '#ebe6dc',
    textTransform: 'uppercase',
    overflow: 'visible',
  })
}

/** Obys On overlay: always smaller than the sibling glyph. */
function paintScript(el, s) {
  if (!el) return
  const px = FONT * 0.72 * s
  Object.assign(el.style, {
    position: 'absolute',
    left: '0px',
    top: 'auto',
    bottom: `${Math.round(-0.06 * px)}px`,
    display: 'block',
    width: 'max-content',
    height: `${0.9 * px}px`,
    fontFamily: '"Mr Bedfort", cursive',
    fontSize: `${px}px`,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: '0.9',
    letterSpacing: `${TRACK * s}px`,
    color: RUPTURE_FILL,
    WebkitTextStroke: '0.055em #111',
    paintOrder: 'stroke fill',
    textTransform: 'uppercase',
    overflow: 'visible',
    zIndex: '2',
    pointerEvents: 'none',
  })
}

function Actor({ kind, i, text, fill, tone, guide, onActivate, children }) {
  return (
    <div
      data-scroll-ac
      data-kind={kind}
      data-i={i}
      data-guide={guide ? '' : undefined}
      className={onActivate ? 'ratio-ac pointer-events-auto cursor-pointer' : 'ratio-ac'}
      onClick={onActivate}
      onKeyDown={
        onActivate
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onActivate()
              }
            }
          : undefined
      }
      role={onActivate ? 'button' : undefined}
      tabIndex={onActivate ? 0 : undefined}
      aria-label={onActivate ? 'Rupture' : undefined}
    >
      <div
        data-load-ac
        className="ratio-ac"
        data-ratio-block={fill && !guide ? '' : undefined}
        style={fill && !guide ? tilt(kind === 'cube' ? 3 : i + 4, 1) : undefined}
      >
        {fill ? (
          <>
            <span
              data-rupture-off={kind === 'cube' ? '' : undefined}
              className={
                kind === 'cube'
                  ? 'ratio-cube-face absolute inset-0'
                  : guide
                    ? 'ratio-guide-face absolute inset-0'
                    : 'ratio-slug-face absolute inset-0'
              }
              style={kind === 'cube' || guide ? undefined : { backgroundColor: tone }}
            />
            {kind === 'cube' ? <RuptureOn index={0} /> : null}
          </>
        ) : (
          children ?? (
            <>
              <span className="ratio-glyph font-brico select-none">
                {kind === 'are' && text ? (
                  <>
                    <span data-hit-letter>{text.slice(0, 1)}</span>
                    <span>{text.slice(1)}</span>
                  </>
                ) : (
                  text
                )}
              </span>
              {kind === 'are' && text ? (
                <span data-rupture-script className="ratio-script select-none" aria-hidden="true">
                  {text}
                </span>
              ) : null}
            </>
          )
        )}
      </div>
    </div>
  )
}

export default function HeroTools({
  word1 = 'TYPE',
  word2 = 'THE',
  word3 = 'FOLD',
  word4 = 'RATIO',
  word5 = 'BASELINE',
  note = 'Type on the floor. A cube holds the fold and the ratio between them.',
  aside = '... type\nfold\nratio.',
}) {
  const root = useRef(null)
  // Letter cells are measured from ink widths — measuring the fallback face
  // and then swapping fonts made the type jump on first paint.
  const [fontsReady, setFontsReady] = useState(
    () => typeof document !== 'undefined' && document.fonts?.check?.(`${TYPE_WEIGHT} 100px "Inter Tight"`),
  )
  useEffect(() => {
    if (fontsReady || !document.fonts?.load) return undefined
    let live = true
    const done = () => live && setFontsReady(true)
    document.fonts.load(`${TYPE_WEIGHT} 100px "Inter Tight"`).then(done, done)
    const bail = setTimeout(done, 3000)
    return () => {
      live = false
      clearTimeout(bail)
    }
  }, [fontsReady])
  const form = glyphsOf(word1)
  const just = glyphsOf(word3)
  const power = glyphsOf(word5)

  useGSAP(
    () => {
      if (!fontsReady) return undefined
      const pin = root.current.querySelector('[data-hero-pin]')
      const stage = pin.querySelector('[data-stage]')
      const topBand = pin.querySelector('[data-top-band]')
      const asideEl = pin.querySelector('[data-aside]')
      const noteEl = pin.querySelector('[data-note]')
      const reduced = reduceScrollMotion()

      const s = magScale(pin.offsetWidth)
      // Phones run the same choreography; only spacing (dock clearance, block
      // minimums) and the hold after the beat are tuned for the small screen.
      const phone = pin.offsetWidth < 480
      const bottomEl = pin.querySelector('[data-bottom]')
      const frame = pin.querySelector('[data-top-frame]')
      // Phone: clear the index dock so type/cube never sit under INTRO/WORKS/NOTES
      const floorGap = Math.max(
        phone ? 64 : 28,
        Math.round(bottomEl.offsetHeight * 0.08),
      )
      const topGap = Math.max(phone ? 12 : 20, Math.round(bottomEl.offsetHeight * (phone ? 0.05 : 0.08)))
      const cubeSide = Math.min(
        CUBE.w * s,
        Math.max(phone ? 48 : 72, bottomEl.offsetHeight - floorGap - topGap),
      )
      const cubeMag = cubeSide / s

      const placeActor = (el, mag) => {
        placeMag(el, mag, s)
        el.style.top = 'auto'
        el.style.bottom = `${floorGap}px`
        el.style.marginTop = '0px'
        nestInner(el.querySelector('[data-load-ac]'))
      }

      const cube = stage.querySelector('[data-kind="cube"]')
      placeActor(cube, { ...CUBE, w: cubeMag, h: cubeMag })

      let hopDy = -241
      let galleyBottomPx = floorGap + 240 * s
      if (frame) {
        const stageR = stage.getBoundingClientRect()
        const frameR = frame.getBoundingClientRect()
        const border = parseFloat(getComputedStyle(frame).borderBottomWidth) || 1
        hopDy = -Math.round((stageR.bottom - floorGap - (frameR.bottom - border)) / s)
        galleyBottomPx = Math.round(stageR.bottom - (frameR.bottom - border))
        const frameW = frame.offsetWidth
        const frameH = frame.offsetHeight
        const originX = frameR.left - stageR.left
        FURNITURE.forEach((item, i) => {
          const el = stage.querySelector(`[data-kind="slug"][data-i="${i}"]`)
          if (!el) return
          const w = item.guide
            ? 1
            : item.cube
              ? Math.max(phone ? 28 : 44, item.fw * frameH)
              : Math.max(phone ? 32 : 48, item.fw * frameW)
          const h = item.guide ? frameH : item.cube ? w : Math.max(phone ? 32 : 48, item.fh * frameH)
          el.style.position = 'absolute'
          el.style.left = `${originX + item.fx * frameW}px`
          el.style.top = 'auto'
          el.style.bottom = `${galleyBottomPx + item.fy * frameH}px`
          el.style.width = `${w}px`
          el.style.height = `${h}px`
          el.style.marginLeft = '0px'
          el.style.marginTop = '0px'
          el.style.zIndex = item.guide ? '11' : '13'
          nestInner(el.querySelector('[data-load-ac]'))
        })
      }

      {
        const px = FONT * s
        let run = 0
        form.forEach((ch, i) => {
          const slot = slotAt(FORM_SLOTS, i)
          const el = stage.querySelector(`[data-kind="form"][data-i="${i}"]`)
          const glyph = el.querySelector('.ratio-glyph')
          paintGlyph(glyph, s)
          placeActor(el, { ...BOX, ...slot, x: 132 + run / s })
          run += inkWidth(glyph, ch, px) + INK_GAP
        })
      }

      {
        const el = stage.querySelector('[data-kind="are"]')
        placeActor(el, { ...BOX, x: 1328, y: -101, z: TYPE_Z })
        const glyph = el.querySelector('.ratio-glyph')
        paintGlyph(glyph, s)
        if (glyph) glyph.style.letterSpacing = `${TRACK * s}px`
        paintScript(el.querySelector('[data-rupture-script]'), s)
      }

      {
        const px = FONT * s
        let run = 0
        just.forEach((ch, i) => {
          const slot = slotAt(JUST_SLOTS, i)
          const el = stage.querySelector(`[data-kind="just"][data-i="${i}"]`)
          const glyph = el.querySelector('.ratio-glyph')
          paintGlyph(glyph, s)
          placeActor(el, { ...BOX, x: JUST_SLOTS[0].x + run / s, y: slot.y, z: slot.z })
          run += inkWidth(glyph, ch, px) + INK_GAP
        })
      }

      {
        const el = stage.querySelector('[data-kind="tools"]')
        const glyph = el.querySelector('.ratio-glyph')
        paintGlyph(glyph, s)
        if (glyph) glyph.style.letterSpacing = `${TRACK * s}px`
        const px = FONT * s
        const inkPx = Array.from(word4 || '')
          .filter((ch) => ch !== ' ')
          .reduce((n, ch) => n + inkWidth(glyph, ch, px) + TRACK * s, 0)
        const magW = Math.max(941, inkPx / s + 48)
        placeActor(el, {
          w: magW,
          h: 433,
          x: 4067,
          y: -100,
          z: TYPE_Z + 16,
        })
        el.dataset.toolsExtra = String(magW - 941)
      }

      const toolsExtra = Number(stage.querySelector('[data-kind="tools"]')?.dataset.toolsExtra || 0)

      // BASELINE cells follow real ink widths so wide caps (O, D) never overlap.
      const powerX = []
      {
        const px = FONT * s
        let run = 0
        power.forEach((ch, i) => {
          const slot = powerSlot(i)
          const el = stage.querySelector(`[data-kind="power"][data-i="${i}"]`)
          const glyph = el.querySelector('.ratio-glyph')
          paintGlyph(glyph, s)
          const x = POWER_SLOTS[0].x + toolsExtra + run / s
          powerX[i] = x
          placeActor(el, { w: 216, h: 433, x, y: -101, z: slot.z })
          run += inkWidth(glyph, ch, px) + 18 * s
        })
      }

      gsap.set(asideEl, { autoAlpha: 0 })
      gsap.set(topBand, { xPercent: 0 })

      if (reduced) {
        stage.style.opacity = '1'
        return undefined
      }

      stage.style.opacity = '1'

      // Word 1 lands when the loader lifts — playing it underneath wasted the
      // entrance and the pin refresh at reveal replayed it as a flicker.
      const formInners = form.map((_, i) =>
        stage.querySelector(`[data-kind="form"][data-i="${i}"] [data-load-ac]`),
      )
      const enter = () => {
        formInners.forEach((inner, i) => {
          if (!inner) return
          inner.style.visibility = ''
          playLoadPath(
            inner,
            {
              dx: 0,
              dy: -224,
              from: -7,
              rot: 0,
              acc: 'ease-out',
              delay: slotAt(FORM_SLOTS, i).loadDelay,
              dur: 0.6,
            },
            s,
          )
        })
      }
      const ready = document.documentElement.dataset.ready === 'true'
      if (ready) enter()
      else {
        formInners.forEach((inner) => {
          if (inner) inner.style.visibility = 'hidden'
        })
        window.addEventListener('ratio:ready', enter, { once: true })
      }

      const players = []
      const add = (el, steps) => {
        if (!el) return null
        const player = attachScroll(el, steps, s)
        players.push(player)
        return player
      }

      // Word 1 drops out through the floor. In mag units the default drop is
      // too short on phones (small scale) — make sure it clears the viewport.
      const formDrop = Math.max(300, Math.ceil((floorGap + 0.72 * FONT * s + 48) / s))
      form.forEach((_, i) => {
        const slot = slotAt(FORM_SLOTS, i)
        add(stage.querySelector(`[data-kind="form"][data-i="${i}"]`), [
          {
            delay_px: slot.delay_px,
            dx: -40,
            dy: formDrop,
            rot: -7,
            from: 0,
            acc: 'ease-in',
            speed: 1,
          },
        ])
      })
      add(stage.querySelector('[data-kind="are"]'), [{ dx: -2000, dy: 0, speed: 1 }])
      const justPlayers = just.map((_, i) => {
        const slot = slotAt(JUST_SLOTS, i)
        return add(stage.querySelector(`[data-kind="just"][data-i="${i}"]`), [
          { dx: slot.inDx, dy: slot.inDy, speed: 1 },
          {
            dx: slot.dx2,
            dy: slot.dy2,
            rot: 360,
            acc: 'ease-out',
            speed: slot.speed2,
          },
        ])
      })
      const guidoLandAt = justPlayers.map((p) => {
        if (!p?.frames || p.frames.length < 3) return p?.duration ?? 0
        return Math.max(0, p.frames[2].ind - 1)
      })
      const guidoPulse = (scrollPx) => {
        const n = guidoLandAt.length
        if (!n) return false
        const start = Math.min(...guidoLandAt) * 0.7
        const end = Math.max(...guidoLandAt) + Math.max(48, cubeSide * 0.25)
        if (scrollPx < start || scrollPx > end) return false
        const u = (scrollPx - start) / Math.max(1, end - start)
        const slot = Math.min(n - 1, Math.floor(u * n))
        const local = u * n - slot
        return local < 0.48
      }
      const cubePlayer = add(cube, cubeSteps(hopDy))
      const slugEls = FURNITURE.map((_, i) => stage.querySelector(`[data-kind="slug"][data-i="${i}"]`))
      const slugPlayers = slugEls.map((el, i) =>
        el ? attachScroll(el, slugSteps(FURNITURE[i]), s) : null,
      )
      const slugArmed = new Map()
      add(stage.querySelector('[data-kind="tools"]'), [{ dx: -5000, dy: 0, speed: 1 }])
      if (noteEl) {
        const exit = Math.ceil((noteEl.offsetWidth + 48) / s) + 40
        add(noteEl, [{ delay_px: 2100, dx: -exit, dy: 0, speed: 1 }])
      }
      // Rail only slides BASELINE in. The tumble is contact-driven below:
      // a scheduled tumble never lined up with the slab edge past the 2nd letter.
      const powerActs = power.map((_, i) => {
        const el = stage.querySelector(`[data-kind="power"][data-i="${i}"]`)
        // Conveyor: one speed, never parks — parked letters piled into each
        // other. The word keeps its spacing until the slab pops each letter.
        add(el, [{ dx: -powerX[i] - 2400, dy: 0, speed: 1 }])
        const glyph = el?.querySelector('.ratio-glyph')
        const inner = el?.querySelector('[data-load-ac]')
        const ctx = document.createElement('canvas').getContext('2d')
        ctx.font = `${TYPE_WEIGHT} ${FONT * s}px ${glyph ? getComputedStyle(glyph).fontFamily : TYPE_FAMILY}`
        const m = ctx.measureText((power[i] || 'M').toUpperCase())
        const bearing = -(m.actualBoundingBoxLeft || 0)
        const inkW = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || 0) || m.width
        if (inner) gsap.set(inner, { transformOrigin: '50% 60%', x: 0, y: 0, rotation: 0, autoAlpha: 1 })
        return { el, glyph, inner, bearing, inkW, up: i % 2 === 0 }
      })

      const cubeFill = cube.querySelector('[data-load-ac]')
      const cubeFace = cube.querySelector('.ratio-cube-face')
      const theT = stage.querySelector('[data-kind="are"] [data-hit-letter]')
      const foldGlyphs = stage.querySelectorAll('[data-kind="just"] .ratio-glyph')
      const plateGlyphs = stage.querySelectorAll('[data-kind="tools"] .ratio-glyph')
      const letterHit = (cubeBox, el) => {
        if (!el) return false
        const actor = el.closest('[data-scroll-ac]')
        if (actor && Number(getComputedStyle(actor).opacity) < 0.15) return false
        const ink = clientBox(el)
        if (ink && overlapArea(cubeBox, ink) > 24) return true
        if (!actor) return false
        const a = actor.getBoundingClientRect()
        if (a.width < 8 || a.height < 8) return false
        const zone = {
          left: a.left,
          right: a.left + Math.min(a.width, Math.max(ink?.width || 72, a.width * 0.32)),
          top: a.bottom - Math.min(a.height, Math.max(ink?.height || 72, a.height * 0.62)),
          bottom: a.bottom,
        }
        zone.width = zone.right - zone.left
        zone.height = zone.bottom - zone.top
        return overlapArea(cubeBox, zone) > 24
      }
      const furnitureBox = (el, item) => {
        const face = el?.querySelector('.ratio-slug-face, .ratio-guide-face')
        const r = face?.getBoundingClientRect()
        if (!r || r.height < 8) return null
        if (!item.guide) return r
        return {
          left: r.left - 16,
          right: r.right + 16,
          top: r.top,
          bottom: r.bottom,
          width: r.width + 32,
          height: r.height,
        }
      }
      const cubeHitsFurniture = (cubeBox, item, el) => {
        const box = furnitureBox(el, item)
        if (!box) return false
        const need = item.guide ? cubeBox.width * 6 : 16
        return overlapArea(cubeBox, box) > need
      }
      const hitHollow = (cubeBox) => {
        if (letterHit(cubeBox, theT)) return true
        for (const g of foldGlyphs) if (letterHit(cubeBox, g)) return true
        for (const g of plateGlyphs) if (letterHit(cubeBox, g)) return true
        for (let i = 0; i < slugEls.length; i += 1) {
          const item = FURNITURE[i]
          if (item.guide) continue
          if (cubeHitsFurniture(cubeBox, item, slugEls[i])) return true
        }
        return false
      }
      const plateGap = 28
      const slabMax = Math.max(cubeSide, pin.offsetWidth - Math.max(64, pin.offsetWidth * 0.08))
      gsap.set(cubeFill, {
        width: cubeSide,
        height: cubeSide,
        maxHeight: cubeSide,
        scaleX: 1,
        scaleY: 1,
        transformOrigin: 'left center',
      })

      const capCubeBeforeWord = (glyphs) => {
        if (!cubeFill || !glyphs.length) return
        const fillLeft = cubeFill.getBoundingClientRect().left
        let nearest = Infinity
        glyphs.forEach((g) => {
          const r = g.getBoundingClientRect()
          if (r.width < 1 || r.right < fillLeft - 4) return
          nearest = Math.min(nearest, r.left)
        })
        if (!Number.isFinite(nearest)) return
        const cap = nearest - plateGap - fillLeft
        const current = Number(gsap.getProperty(cubeFill, 'width'))
        if (!Number.isFinite(cap) || !Number.isFinite(current)) return
        if (cap < current) gsap.set(cubeFill, { width: Math.max(cubeSide, cap), height: cubeSide })
      }

      const beatRange = MAG_SCROLL * s
      const holdPx = pin.offsetHeight * (phone ? 0.15 : 0.4)
      const range = beatRange + holdPx
      const T = MAG_SCROLL / 1000
      const holdT = holdPx / s / 1000
      const growIndex = Math.min(2, Math.max(0, power.length - 1))
      const growAt = Math.abs(powerSlot(growIndex).dx1) / 1000
      const growDur = Math.max(0.85, T + holdT - growAt - 0.04)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: `+=${range}px`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Created after the font gate, i.e. after the sections below it —
          // refresh it first so their starts include this pin's spacer.
          refreshPriority: 10,
          onUpdate(self) {
            const px = self.progress * range
            const t = self.progress * (T + holdT)
            players.forEach((p) => p.seek(px))
            if (t < growAt) {
              capCubeBeforeWord([...foldGlyphs, ...plateGlyphs])
            }
            const rawCube = cube.getBoundingClientRect()
            const cubeOk = rawCube.width > 8 && rawCube.height > 8
            const cubeR = cubeOk ? insetRect(rawCube, 0.04) : null
            const nearWeb = plateGlyphs.length
              ? [...plateGlyphs].some((g) => letterHit(cubeR || rawCube, g))
              : false
            const nearGuido = [...foldGlyphs].some((g) => letterHit(cubeR || rawCube, g))
            const chasing = Boolean(
              guidoPulse(px) ||
                nearGuido ||
                nearWeb ||
                (cubeR && cubeR.width > 4 && hitHollow(cubeR)),
            )
            cubeFace?.classList.toggle('is-chase', chasing)
            cube.style.zIndex = String(chasing ? TYPE_Z + 80 : CUBE_Z)

            slugEls.forEach((el, i) => {
              const player = slugPlayers[i]
              const item = FURNITURE[i]
              if (!el || !player) return
              if (slugArmed.has(i) && px < slugArmed.get(i)) {
                slugArmed.delete(i)
                player.seek(0)
                return
              }
              if (!slugArmed.has(i) && cubeR && cubeHitsFurniture(cubeR, item, el)) {
                slugArmed.set(i, px)
              }
              if (slugArmed.has(i)) player.seek(px - slugArmed.get(i))
              else player.seek(0)
            })
          },
        },
      })

      /**
       * Contact push: each letter's free ink edge vs the slab's right edge.
       * Stateless (pure function of the current frame) so scrubbing back
       * restores letters exactly. Contact phase keeps the letter glued to the
       * slab; past `release` it is flung off the floor band.
       */
      const pushLetters = () => {
        if (!cubeFill) return
        const slab = cubeFill.getBoundingClientRect()
        const slabRight = slab.right
        powerActs.forEach((a) => {
          if (!a.el || !a.inner || !a.glyph) return
          const box = a.el.getBoundingClientRect()
          const inkLeft = box.left + a.glyph.offsetLeft + a.bearing
          // Contact needs the slab on the letter's band — not a cube mid-hop.
          const onBand = slab.bottom > box.bottom - box.height * 0.5 && slab.top < box.bottom
          const d = onBand ? slabRight - inkLeft : 0
          if (d <= 0) {
            gsap.set(a.inner, { x: 0, y: 0, rotation: 0, autoAlpha: 1 })
            return
          }
          // Hit at the exact contact frame, then pop off the floor band fast
          // enough that the letter clears its neighbour before overlapping it.
          const W = Math.max(24, a.inkW)
          const dir = a.up ? -1 : 1
          gsap.set(a.inner, {
            x: d,
            y: dir * (d * 2.1 + Math.pow(d, 1.25) * 0.35),
            rotation: (d / W) * 125 * (a.up ? 1 : -1),
            autoAlpha: 1 - Math.min(1, Math.max(0, (d - W * 2.2) / W)),
          })
        })
      }

      tl.to({}, { duration: T + holdT }, 0)
      tl.eventCallback('onUpdate', pushLetters)
      tl.to(asideEl, { autoAlpha: 1, duration: 0.08 }, 1.65)
      tl.to(cubeFill, { width: pin.offsetWidth, height: cubeSide, duration: 1.2, ease: 'none' }, 2.15)
      tl.to(cubeFill, { width: cubeSide, height: cubeSide, duration: 0.5, ease: 'none' }, 3.35)
      const typeEls = stage.querySelectorAll(
        '[data-kind]:not([data-kind="cube"]):not([data-kind="slug"]):not([data-kind="power"])',
      )
      const fadeAt = Math.max(growAt + 0.35, T - 0.4)
      tl.to(typeEls, { autoAlpha: 0, duration: 0.22 }, fadeAt)
      if (asideEl) tl.to(asideEl, { autoAlpha: 0, duration: 0.12 }, fadeAt)
      tl.to(
        cubeFill,
        {
          width: slabMax,
          height: cubeSide,
          duration: growDur,
          ease: 'none',
        },
        growAt,
      )
      // Pointer parallax: blocks and the first word drift on one plane, each
      // at its own depth. Transforms go on inner nodes the rails never touch
      // (slug inners, form glyphs) so scroll motion and hit tests stay exact.
      let stopParallax = () => {}
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const movers = []
        const addMover = (el, depth) => {
          if (!el) return
          movers.push({
            depth,
            x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }),
          })
        }
        slugEls.forEach((el, i) => {
          if (FURNITURE[i].guide) return
          addMover(el?.querySelector('[data-load-ac]'), 10 + (i % 4) * 7)
        })
        stage.querySelectorAll('[data-kind="form"] .ratio-glyph').forEach((g, i) => addMover(g, 14 + i * 4))
        const drift = (nx, ny) => movers.forEach((m) => {
          m.x(nx * m.depth * 2)
          m.y(ny * m.depth * 1.2)
        })
        const onMove = (e) => {
          const r = pin.getBoundingClientRect()
          if (e.clientY < r.top || e.clientY > r.bottom) return
          drift(-(e.clientX / window.innerWidth - 0.5), -((e.clientY - r.top) / r.height - 0.5))
        }
        const onLeave = () => drift(0, 0)
        window.addEventListener('pointermove', onMove, { passive: true })
        document.addEventListener('pointerleave', onLeave)
        stopParallax = () => {
          window.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerleave', onLeave)
        }
      }

      ScrollTrigger.sort()
      ScrollTrigger.refresh()
      return () => {
        window.removeEventListener('ratio:ready', enter)
        stopParallax()
      }
    },
    { scope: root, dependencies: [word1, word2, word3, word4, word5, note, fontsReady] },
  )

  return (
    <section
      id="intro"
      ref={root}
      className="relative bg-ratio-paper text-ratio-ink"
    >
      <div data-hero-pin className="relative h-svh overflow-hidden">
        <div className="flex h-full flex-col pt-[max(2.75rem,env(safe-area-inset-top))] md:pt-12">
          <div data-top-slot className="relative z-10 min-h-0 flex-1 overflow-hidden bg-ratio-paper min-[480px]:flex-[0.72] md:flex-1">
            <div
              data-top-band
              data-ratio-block
              className="absolute inset-x-2 top-2 bottom-2 will-change-transform min-[480px]:inset-x-auto min-[480px]:left-3 min-[480px]:right-0 min-[480px]:top-1.5 min-[480px]:bottom-0 md:left-4 md:top-2"
              style={tilt(0, 1)}
            >
              <div data-top-frame className="relative h-full overflow-hidden border border-ratio-ink bg-ratio-paper">
                <p
                  data-note
                  className="absolute top-3 left-3 z-20 max-w-[min(34ch,calc(100%-1.5rem))] text-[10px] leading-[1.4] tracking-[0.04em] uppercase will-change-transform min-[480px]:top-4 min-[480px]:left-4 min-[480px]:text-[11px] md:top-5 md:left-5"
                >
                  {note}
                </p>
              </div>
            </div>
          </div>

          <div data-bottom className="relative z-30 min-h-0 flex-1 overflow-visible border-t border-ratio-ink min-[480px]:flex-[1.35] md:flex-[1.15]">
            <p
              data-aside
              className="pointer-events-none absolute top-2 right-3 z-20 whitespace-pre text-left text-[10px] leading-[1.35] tracking-[0.04em] min-[480px]:top-3 min-[480px]:right-6 min-[480px]:text-[11px]"
            >
              {aside}
            </p>
            <div data-stage className="pointer-events-none absolute inset-0 z-10 overflow-visible opacity-0">
              <Actor kind="cube" fill />
              {FURNITURE.map((item, i) => (
                <Actor
                  key={`s-${i}`}
                  kind="slug"
                  i={i}
                  fill
                  tone={item.ink}
                  guide={item.guide}
                />
              ))}
              {form.map((ch, i) => (
                <Actor key={`f-${i}-${ch}`} kind="form" i={i} text={ch} />
              ))}
              <Actor kind="are" text={word2} />
              {just.map((ch, i) => (
                <Actor key={`j-${i}-${ch}`} kind="just" i={i} text={ch} />
              ))}
              <Actor kind="tools" text={word4} />
              {power.map((ch, i) => (
                <Actor key={`p-${i}-${ch}`} kind="power" i={i} text={ch} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
