import { useRef } from 'react'
import { gsap, useGSAP, SplitText } from '../../../lib/gsap'
import { tilt } from './rupture'
import { RuptureOn, RuptureScript, RupturePlay, RuptureInline } from './RuptureOn'

const BANDS = [
  {
    id: 'white',
    titleKey: 'phrase',
    blurbKey: 'frontBlurb',
    color: '#16110e',
    ink: '#ebe6dc',
    gap: 1,
    seed: 2,
    words: ['GSAP', 'LENIS', 'REACT', 'TAILWIND'],
    caps: ['motion', 'scroll', 'ui', 'css'],
  },
  {
    id: 'gray',
    titleKey: 'breakLine',
    blurbKey: 'backBlurb',
    color: '#2e2924',
    ink: '#ebe6dc',
    gap: 3,
    seed: 6,
    words: ['NODE', 'LARAVEL', 'DJANGO', 'EXPRESS'],
    caps: ['runtime', 'php', 'python', 'http'],
  },
  {
    id: 'darkest',
    titleKey: 'worthLine',
    blurbKey: 'growthBlurb',
    color: '#111110',
    ink: '#ebe6dc',
    gap: 2,
    seed: 10,
    words: ['CRO', 'A/B', 'GTM', 'WP'],
    caps: ['convert', 'test', 'track', 'cms'],
  },
]

function Marked({ text, mark }) {
  if (!mark || !text.includes(mark)) return text
  const i = text.indexOf(mark)
  return (
    <>
      {text.slice(0, i)}
      <em>{mark}</em>
      {text.slice(i + mark.length)}
    </>
  )
}

const CODE_COLORS = {
  kw: '#c678dd',
  name: '#61afef',
  op: '#56b6c2',
  punct: '#d4cfc6',
  str: '#98c379',
  comment: '#7d8590',
  num: '#d19a66',
}

function CodeChars({ text, color }) {
  return Array.from(text).map((ch, i) => (
    <span key={`${text}-${i}`} data-code-ch style={{ color, opacity: 0 }}>
      {ch === ' ' ? '\u00A0' : ch}
    </span>
  ))
}

function CodeLine({ tokens }) {
  return (
    <span className="ratio-ide-line">
      {tokens.map((tok, i) => (
        <CodeChars key={`${tok.text}-${i}`} text={tok.text} color={CODE_COLORS[tok.c]} />
      ))}
    </span>
  )
}

function parkCodeCaret(caret, chars, shown, playCall, pane) {
  if (!caret || !pane) return
  const paneBox = pane.getBoundingClientRect()
  let box
  if (shown >= chars.length && playCall) {
    box = (playCall.querySelector('.ratio-ide-cmt') || playCall).getBoundingClientRect()
  } else if (shown <= 0) {
    box = chars[0]?.parentElement?.getBoundingClientRect()
  } else {
    box = chars[shown - 1].getBoundingClientRect()
  }
  if (!box) return
  const x = (shown <= 0 ? box.left : box.right) - paneBox.left
  const y = box.top - paneBox.top
  caret.style.height = `${Math.max(14, Math.round(box.height))}px`
  caret.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
}

function codeRows({ play, name, feel, comment, value, hint }) {
  return [
    [
      { text: 'const ', c: 'kw' },
      { text: play, c: 'name' },
      { text: ' = ', c: 'op' },
      { text: 'function', c: 'kw' },
      { text: ` (${name}) {`, c: 'punct' },
    ],
    [{ text: `  ${comment}`, c: 'comment' }],
    [
      { text: '  ', c: 'punct' },
      { text: 'const ', c: 'kw' },
      { text: 'front', c: 'name' },
      { text: ' = ', c: 'op' },
      { text: name, c: 'name' },
    ],
    [
      { text: '    .filter', c: 'name' },
      { text: '((x) => x.', c: 'punct' },
      { text: feel, c: 'str' },
      { text: ')', c: 'punct' },
    ],
    [
      { text: '    .at(', c: 'name' },
      { text: '-1', c: 'num' },
      { text: ')', c: 'punct' },
    ],
    [
      { text: '  html', c: 'name' },
      { text: '.dataset.', c: 'punct' },
      { text: 'ratioRupture', c: 'name' },
      { text: ' = ', c: 'op' },
      { text: `"${value}"`, c: 'str' },
    ],
    [
      { text: '  ', c: 'punct' },
      { text: 'return ', c: 'kw' },
      { text: 'front', c: 'name' },
    ],
    [{ text: '}', c: 'punct' }],
    ...(hint ? [[{ text: hint, c: 'comment' }]] : []),
  ]
}

function TypeCode({ play, name, feel, comment, value, hint, playLabel, pauseLabel }) {
  const rows = codeRows({ play, name, feel, comment, value, hint })
  const label = `const ${play} = function (${name}) { ${comment} const front = ${name}.filter((x) => x.${feel}).at(-1) html.dataset.ratioRupture = "${value}" return front } ${play}(${name})`
  return (
    <div className="ratio-ide relative z-10" data-ide data-ide-seat>
      <div className="ratio-ide-bar" data-ide-bar>
        <span className="ratio-ide-dots" aria-hidden="true">
          <i data-ide-dot />
          <i data-ide-dot />
          <i data-ide-dot />
        </span>
        <span className="ratio-ide-tab">{play}.js</span>
        <span className="ratio-ide-lang">JavaScript</span>
      </div>
      <div className="ratio-ide-body" data-ide-body>
        <ol className="ratio-ide-gutter" data-ide-gutter aria-hidden="true">
          {rows.map((_, i) => (
            <li key={`ln-${i}`}>{i + 1}</li>
          ))}
          <li data-code-play className="ratio-ide-gutter-run">
            {rows.length + 1}
          </li>
        </ol>
        <div className="ratio-ide-pane" data-ide-pane>
          <pre aria-label={label} className="ratio-ide-code">
            {rows.map((tokens, i) => (
              <CodeLine key={`row-${i}`} tokens={tokens} />
            ))}
          </pre>
          <RupturePlay
            play={play}
            name={name}
            flag={value}
            playLabel={playLabel}
            pauseLabel={pauseLabel}
          />
          <span data-code-caret className="ratio-ide-caret" aria-hidden="true" />
        </div>
      </div>
      <div className="ratio-ide-status" data-ide-status>
        <span>UTF-8</span>
        <span data-ide-ln>Ln 1</span>
        <span>Spaces: 2</span>
      </div>
    </div>
  )
}

/**
 * FitStack — notes, then a TALL tetris well (one row per viewport).
 * A cube falls into the gap of each row on scrub; scroll up rewinds.
 * Tall well: one row per viewport, a cube falls into the gap on scrub.
 */
export default function FitStack({
  noteLabel = '(Notes)',
  note1 = 'Type sits on the floor. Do not hang letters below the fold.',
  note1Mark = 'the fold',
  note2 = 'The cube keeps a square ratio while the slab grows with the last word.',
  note2Mark = 'square ratio',
  note3 = 'On the black field, four plates wait. One of them is the next chapter.',
  note3Mark = 'four plates',
  phrase = 'TYPE',
  breakLine = 'THE FOLD',
  rulesLine = 'THE RATIO',
  worthLine = '(BASELINE)',
  frontBlurb = 'Interfaces that move with intention — scroll, state, and polish.',
  backBlurb = 'APIs and services that ship features, not just schemas.',
  growthBlurb = 'Experiments, tags, and CMS when product has to convert.',
  closer = 'elFrontIdeal',
  closerPlay = 'play',
  closerArg = 'seSiente',
  closerProp = 'ON',
  closerComment = '// el que necesitás',
  closerHint = '// type {call} and press Enter',
  playLabel = 'Run the ideal front',
  pauseLabel = 'Pause rupture',
  cubes,
  brand = 'Brand',
  studio = '',
  anchor = 'notes',
}) {
  const root = useRef(null)
  const titles = { phrase, breakLine, rulesLine, worthLine }
  const blurbs = { frontBlurb, backBlurb, growthBlurb }
  const call = `${closerPlay}(${closer})`
  const hint = closerHint.replaceAll('{call}', call)

  useGSAP(
    () => {
      const copy = root.current?.querySelector('[data-notes-copy]')
      if (!copy) return undefined
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

      const split = new SplitText(copy, { type: 'words' })
      gsap.from(split.words, {
        opacity: 0.12,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: copy,
          start: 'top 78%',
          end: 'bottom 42%',
          scrub: true,
        },
      })
      return () => split.revert()
    },
    { scope: root, dependencies: [note1, note2, note3, note1Mark, note2Mark, note3Mark] },
  )

  useGSAP(
    () => {
      const chars = gsap.utils.toArray('[data-code-ch]', root.current)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('[data-fit-fall]', { y: 0, rotate: 0, force3D: false })
        gsap.set(chars, { opacity: 1 })
        chars.forEach((el) => {
          el.hidden = false
        })
        const playWraps = root.current?.querySelectorAll('[data-code-play]')
        playWraps?.forEach((el) => el.classList.add('is-ready'))
        const playCall = root.current?.querySelector('.ratio-ide-call')
        const pane = root.current?.querySelector('[data-ide-pane]')
        parkCodeCaret(root.current?.querySelector('[data-code-caret]'), chars, chars.length, playCall, pane)
        const lnEl = root.current?.querySelector('[data-ide-ln]')
        const lines = gsap.utils.toArray('.ratio-ide-line', root.current)
        if (lnEl) lnEl.textContent = `Ln ${lines.length + 1}`
        return undefined
      }

      const bands = gsap.utils.toArray('[data-fit-band]', root.current)
      bands.forEach((band) => {
        const fall = band.querySelector('[data-fit-fall]')
        if (!fall) return

        const fromY = () => {
          const bandBox = band.getBoundingClientRect()
          const cellBox = fall.parentElement.getBoundingClientRect()
          return Math.round(bandBox.top - cellBox.bottom)
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none', force3D: false },
          scrollTrigger: {
            trigger: band,
            start: 'top 85%',
            end: 'top top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        tl.fromTo(
          fall,
          { y: fromY },
          {
            y: 0,
            duration: 1,
            modifiers: {
              y: (v) => `${Math.round(parseFloat(v))}px`,
            },
          },
        )
        // Hold seated so a small scroll-up does not unseat the row.
        tl.to({}, { duration: 0.55 })
      })

      if (chars.length) {
        gsap.set(chars, { opacity: 0 })
        chars.forEach((el) => {
          el.hidden = true
        })
        const lid = root.current.querySelector('[data-fit-lid]')
        const ide = lid?.querySelector('[data-ide-seat]')
        const bar = ide?.querySelector('[data-ide-bar]')
        const dots = ide ? gsap.utils.toArray('[data-ide-dot]', ide) : []
        const gutter = ide?.querySelector('[data-ide-gutter]')
        const pane = ide?.querySelector('[data-ide-pane]')
        const status = ide?.querySelector('[data-ide-status]')
        const lnEl = ide?.querySelector('[data-ide-ln]')
        const brandEl = lid?.querySelector('[data-ide-brand]')
        const wash = lid?.querySelector('[data-ide-wash]')
        const playWraps = lid?.querySelectorAll('[data-code-play]')
        const playCall = lid?.querySelector('.ratio-ide-call')
        const caret = lid?.querySelector('[data-code-caret]')
        const lines = ide ? gsap.utils.toArray('.ratio-ide-line', ide) : []
        parkCodeCaret(caret, chars, 0, playCall, pane)

        const fromY = () => Math.round(window.innerHeight * 0.38)

        const proxy = { n: 0 }
        const paintType = () => {
          const shown = Math.round(proxy.n)
          chars.forEach((el, i) => {
            const on = i < shown
            el.style.opacity = on ? '1' : '0'
            el.hidden = !on
          })
          playWraps?.forEach((el) => el.classList.toggle('is-ready', shown >= chars.length))
          parkCodeCaret(caret, chars, shown, playCall, pane)
          if (lnEl) {
            let ln = 1
            lines.forEach((line, i) => {
              const live = line.querySelector('[data-code-ch]:not([hidden])')
              if (live) ln = i + 1
            })
            if (shown >= chars.length) ln = lines.length + 1
            lnEl.textContent = `Ln ${ln}`
          }
        }

        if (!ide || !lid) return undefined

        if (wash) gsap.set(wash, { autoAlpha: 0 })
        gsap.set(ide, { y: fromY(), rotate: 2.4, transformOrigin: '50% 82%', force3D: false })
        gsap.set(bar, { yPercent: -110 })
        gsap.set(dots, { scale: 0, transformOrigin: '50% 50%' })
        gsap.set(gutter, { xPercent: -108 })
        gsap.set(status, { scaleX: 0, transformOrigin: 'left center' })
        gsap.set(pane, { autoAlpha: 0 })
        if (brandEl) gsap.set(brandEl, { autoAlpha: 0 })

        const tl = gsap.timeline({
          defaults: { ease: 'none', force3D: false },
          scrollTrigger: {
            trigger: lid,
            start: 'top top',
            end: '+=340%',
            pin: true,
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        if (wash) tl.to(wash, { autoAlpha: 1, duration: 0.2 }, 0)
        tl.fromTo(
          ide,
          { y: fromY, rotate: 2.4 },
          {
            y: 0,
            rotate: 0,
            duration: 0.24,
            modifiers: {
              y: (v) => `${Math.round(parseFloat(v))}px`,
            },
          },
          0,
        )
        tl.to(bar, { yPercent: 0, duration: 0.08 }, 0.12)
        tl.to(dots, { scale: 1, duration: 0.05, stagger: 0.015 }, 0.16)
        tl.to(gutter, { xPercent: 0, duration: 0.08 }, 0.16)
        tl.to(status, { scaleX: 1, duration: 0.1 }, 0.18)
        tl.to(pane, { autoAlpha: 1, duration: 0.06 }, 0.2)
        if (brandEl) tl.to(brandEl, { autoAlpha: 1, duration: 0.12 }, 0.2)
        tl.to(
          proxy,
          {
            n: chars.length,
            duration: 0.7,
            onUpdate: paintType,
          },
          0.26,
        )
      }
    },
    {
      scope: root,
      dependencies: [
        phrase,
        breakLine,
        rulesLine,
        worthLine,
        frontBlurb,
        backBlurb,
        growthBlurb,
        closer,
        closerPlay,
        closerArg,
        closerProp,
        closerComment,
        closerHint,
        cubes,
      ],
    },
  )

  return (
    <section ref={root} id={anchor} className="relative z-20 bg-ratio-field text-ratio-paper">
      <div className="relative min-h-[88svh] bg-ratio-paper px-4 pt-12 pb-14 text-ratio-ink min-[480px]:min-h-[120svh] min-[480px]:px-5 min-[480px]:pt-16 min-[480px]:pb-24 md:min-h-[140svh] md:px-10 md:pt-20 md:pb-32 lg:px-14">
        <p className="font-brico text-[13px] tracking-[0.02em] text-ratio-ink/45">{noteLabel}</p>
        <p
          data-notes-copy
          className="mt-6 max-w-[18ch] font-brico text-[clamp(1.65rem,8.2vw,6rem)] font-medium leading-[1.05] tracking-[-0.03em] min-[480px]:mt-8 md:mt-12 [&_em]:font-display [&_em]:text-[0.92em] [&_em]:font-normal [&_em]:italic"
        >
          (1) <Marked text={note1} mark={note1Mark} /> (2) <Marked text={note2} mark={note2Mark} /> (3){' '}
          <Marked text={note3} mark={note3Mark} />
        </p>
      </div>

      {BANDS.map((band, bi) => {
        const words = cubes?.[bi] ?? band.words
        const caps = band.caps
        return (
          <article
            key={band.id}
            data-fit-band={band.id}
            className="relative flex min-h-[72svh] flex-col overflow-hidden bg-ratio-field text-ratio-ink min-[480px]:min-h-[78svh] md:min-h-svh"
          >
            <div className="relative z-10 px-4 pt-10 min-[480px]:px-5 min-[480px]:pt-14 md:px-10 md:pt-20">
              <p className="font-brico text-[11px] tracking-[0.2em] uppercase text-ratio-ink/45">
                0{bi + 1} / STACK
              </p>
              <h2 className="mt-3 max-w-[14ch] font-syne text-[clamp(2rem,11vw,6.2rem)] font-semibold leading-[0.84] tracking-[-0.05em] uppercase">
                <span className="relative inline-block">
                  {titles[band.titleKey]}
                  <RuptureScript>{titles[band.titleKey]}</RuptureScript>
                </span>
              </h2>
              <p className="mt-5 max-w-[32ch] font-brico text-[13px] leading-[1.45] tracking-[0.02em] text-ratio-ink/55 md:mt-6 md:text-[15px]">
                {blurbs[band.blurbKey]}
              </p>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="flex items-center justify-between gap-3 border-y border-ratio-ink/15 px-4 py-2 min-[480px]:px-5 md:px-10">
                <span className="font-brico text-[10px] tracking-[0.18em] uppercase text-ratio-ink/40">
                  tools
                </span>
                <span aria-hidden="true" className="size-1.5 bg-[#ffb800]" />
              </div>
              <div data-fit-grid className="grid grid-cols-4 gap-px bg-ratio-ink/15">
                {[0, 1, 2, 3].map((col) => {
                  const isFall = col === band.gap
                  return (
                    <div
                      key={col}
                      className={`relative aspect-square ${isFall ? 'overflow-visible' : 'overflow-hidden'}`}
                    >
                      <span
                        {...(isFall ? { 'data-fit-fall': true } : {})}
                        data-ratio-block
                        className="absolute inset-0 overflow-visible"
                        style={tilt(band.seed + col, 1.1)}
                      >
                        <span
                          data-rupture-off
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 border border-ratio-ink/20 px-1"
                          style={{ backgroundColor: band.color }}
                        >
                          <span
                            className="font-syne text-[clamp(0.85rem,3.6vw,1.15rem)] font-semibold tracking-[0.06em] uppercase"
                            style={{ color: band.ink }}
                          >
                            {words[col]}
                          </span>
                          <span className="font-brico text-[9px] tracking-[0.14em] uppercase text-ratio-ink/40">
                            {caps[col]}
                          </span>
                        </span>
                        <RuptureOn index={band.seed + col} />
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </article>
        )
      })}

      <div
        data-fit-lid
        className="relative z-10 flex min-h-svh flex-col items-center justify-center bg-ratio-field px-5 py-16 text-ratio-ink md:px-10 md:py-20"
      >
        <div data-ide-wash className="pointer-events-none absolute inset-0 bg-ratio-paper" aria-hidden="true" />

        {/* Obys-style rupture figures around the IDE */}
        <RuptureInline fig="arrow" className="top-[8%] right-[6%] w-[140px] md:w-[180px] rotate-[-8deg]" />
        <RuptureInline fig="strike" word="RULES" className="top-[14%] left-[4%] w-[180px] md:w-[220px] rotate-[3deg]" />
        <RuptureInline fig="asterisk" className="top-[6%] left-[28%] w-[40px] md:w-[52px]" />
        <RuptureInline fig="bracket" className="bottom-[18%] left-[5%] h-[60px] md:h-[80px] w-auto" />
        <RuptureInline fig="arrow-down" className="bottom-[12%] right-[8%] h-[80px] md:h-[100px] w-auto" />
        <RuptureInline fig="pill" className="bottom-[28%] right-[4%] w-[140px] md:w-[170px] rotate-[-4deg]" />
        <RuptureInline fig="cross" className="top-[42%] left-[3%] w-[36px] md:w-[44px] rotate-[15deg]" />
        <RuptureInline fig="strike" word="FOLD" className="bottom-[8%] left-[20%] w-[160px] md:w-[200px] rotate-[-2deg]" />
        <RuptureInline fig="arrow" className="top-[50%] right-[3%] w-[120px] rotate-[180deg]" />

        <TypeCode
          play={closerPlay}
          name={closer}
          feel={closerArg}
          comment={closerComment}
          value={closerProp}
          hint={hint}
          playLabel={playLabel}
          pauseLabel={pauseLabel}
        />
        <p
          data-ide-brand
          className="pointer-events-none absolute inset-x-5 bottom-8 z-10 md:inset-x-10 md:bottom-10"
        >
          <span className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase">
            <span aria-hidden="true" className="size-2 bg-ratio-mark" />
            {brand}
          </span>
          {studio ? (
            <span className="mt-1 block text-[11px] tracking-[0.18em] uppercase opacity-50">{studio}</span>
          ) : null}
        </p>
      </div>
    </section>
  )
}
