import SmoothScrollProvider from './components/SmoothScrollProvider.jsx'
import ScrollRail from './components/ScrollRail.jsx'
import BrutalCursor from './components/BrutalCursor.jsx'
import Loader from './components/Loader.jsx'
import NavRatio from './components/sections/ratio/NavRatio.jsx'
import HeroTools from './components/sections/ratio/HeroTools.jsx'
import HeroCube from './components/sections/chapters/HeroCube.jsx'
import WorkChapters from './components/sections/chapters/WorkChapters.jsx'
import NotesChapters from './components/sections/chapters/NotesChapters.jsx'
import FourPlates from './components/sections/ratio/FourPlates.jsx'
import SplitStudy from './components/sections/ratio/SplitStudy.jsx'
import FitStack from './components/sections/ratio/FitStack.jsx'
import FooterLedger from './components/sections/ratio/FooterLedger.jsx'
import laserawayShot from './assets/works/laseraway.png'
import clashvaultShot from './assets/works/clashvault.png'
import mkmusicShot from './assets/works/mkmusic.jpg'
import encuentroShot from './assets/works/encuentro.png'
import scrolllabShot from './assets/works/scrolllab.jpg'
import laserawayLogo from './assets/works/logos/laseraway.png'
import clashvaultLogo from './assets/works/logos/clashvault.png'
import mkmusicLogo from './assets/works/logos/mkmusic.png'
import encuentroLogo from './assets/works/logos/encuentro.png'
import scrolllabLogo from './assets/works/logos/scrolllab.svg'
import platesThrough from './components/sections/ratio/assets/plates-through.svg'
import { useI18n } from './i18n/I18n.jsx'
import { useIsMobile } from './lib/useIsMobile.js'

export default function App() {
  const { locale, setLocale, t } = useI18n()
  const isMobile = useIsMobile()
  const cases = [
    {
      kicker: t.laseraway.kicker,
      meta: t.laseraway.meta,
      index: '01',
      specLabel: t.laseraway.specLabel,
      specValue: t.laseraway.specValue,
      spec2Label: t.laseraway.spec2Label,
      spec2Value: t.laseraway.spec2Value,
      spec3Label: t.laseraway.spec3Label,
      spec3Value: t.laseraway.spec3Value,
      spec4Label: t.laseraway.spec4Label,
      spec4Value: t.laseraway.spec4Value,
      quote: t.laseraway.quote,
      quoteBy: 'Guido Frassetti',
      quoteRole: t.laseraway.role,
      img: laserawayShot,
      url: 'https://www.laseraway.com',
      listLabel: t.work.label,
      linkLabel: t.work.link,
      logo: laserawayLogo,
    },
    {
      kicker: t.clashvault.kicker,
      meta: t.clashvault.meta,
      index: '02',
      specLabel: t.clashvault.specLabel,
      specValue: t.clashvault.specValue,
      spec2Label: t.clashvault.spec2Label,
      spec2Value: t.clashvault.spec2Value,
      spec3Label: t.clashvault.spec3Label,
      spec3Value: t.clashvault.spec3Value,
      spec4Label: t.clashvault.spec4Label,
      spec4Value: t.clashvault.spec4Value,
      quote: t.clashvault.quote,
      quoteBy: 'Guido Frassetti',
      quoteRole: t.clashvault.role,
      img: clashvaultShot,
      url: 'https://www.clashvault.gg',
      listLabel: t.work.label,
      linkLabel: t.work.link,
      logo: clashvaultLogo,
    },
    {
      kicker: t.mkmusic.kicker,
      meta: t.mkmusic.meta,
      index: '03',
      specLabel: t.mkmusic.specLabel,
      specValue: t.mkmusic.specValue,
      spec2Label: t.mkmusic.spec2Label,
      spec2Value: t.mkmusic.spec2Value,
      spec3Label: t.mkmusic.spec3Label,
      spec3Value: t.mkmusic.spec3Value,
      spec4Label: t.mkmusic.spec4Label,
      spec4Value: t.mkmusic.spec4Value,
      quote: t.mkmusic.quote,
      quoteBy: 'Guido Frassetti',
      quoteRole: t.mkmusic.role,
      img: mkmusicShot,
      url: 'https://mkmusicandevents.com',
      listLabel: t.work.label,
      linkLabel: t.work.link,
      logo: mkmusicLogo,
    },
    {
      kicker: t.encuentro.kicker,
      meta: t.encuentro.meta,
      index: '04',
      specLabel: t.encuentro.specLabel,
      specValue: t.encuentro.specValue,
      spec2Label: t.encuentro.spec2Label,
      spec2Value: t.encuentro.spec2Value,
      spec3Label: t.encuentro.spec3Label,
      spec3Value: t.encuentro.spec3Value,
      spec4Label: t.encuentro.spec4Label,
      spec4Value: t.encuentro.spec4Value,
      quote: t.encuentro.quote,
      quoteBy: 'Guido Frassetti',
      quoteRole: t.encuentro.role,
      img: encuentroShot,
      listLabel: t.work.label,
      linkLabel: t.work.link,
      logo: encuentroLogo,
      logoFill: true,
    },
    {
      kicker: t.scrolllab.kicker,
      meta: t.scrolllab.meta,
      index: '05',
      specLabel: t.scrolllab.specLabel,
      specValue: t.scrolllab.specValue,
      spec2Label: t.scrolllab.spec2Label,
      spec2Value: t.scrolllab.spec2Value,
      spec3Label: t.scrolllab.spec3Label,
      spec3Value: t.scrolllab.spec3Value,
      spec4Label: t.scrolllab.spec4Label,
      spec4Value: t.scrolllab.spec4Value,
      quote: t.scrolllab.quote,
      quoteBy: 'Guido Frassetti',
      quoteRole: t.scrolllab.role,
      img: scrolllabShot,
      url: 'https://www.scrolllab.com.ar',
      listLabel: t.work.label,
      linkLabel: t.work.link,
      logo: scrolllabLogo,
      focus: '8% 30%',
    },
  ]
  const noteChapters = [
    {
      kicker: 'motion',
      title: t.notes.phrase,
      blurb: t.notes.frontBlurb,
      tools: t.notes.cubes[0],
    },
    {
      kicker: 'server',
      title: t.notes.breakLine,
      blurb: t.notes.backBlurb,
      tools: t.notes.cubes[1],
    },
    {
      kicker: 'growth',
      title: t.notes.worthLine,
      blurb: t.notes.growthBlurb,
      tools: t.notes.cubes[2],
    },
  ]

  return (
    <SmoothScrollProvider>
      <ScrollRail />
      <BrutalCursor />
      <Loader label={t.loader.label} tag={t.loader.tag} />
      <div id="top" className="bg-ratio-paper text-ratio-ink">
        <NavRatio
          brand="Guido Frassetti"
          role={t.nav.role}
          links={t.nav.links}
          credit={t.nav.credit}
          ruptureLabel={t.nav.rupture}
          onLabel={t.nav.on}
          offLabel={t.nav.off}
          menuLabel={t.nav.menu}
          indexLabel={t.nav.index}
          locale={locale}
          onLocale={setLocale}
          langLabel={t.nav.lang}
        />

        <main>
          <div id="intro" className={isMobile ? 'h-svh overflow-hidden' : undefined}>
            {isMobile ? (
              <HeroCube
                key={`cube-${locale}`}
                line1={t.hero.kineticLine1}
                line2={t.hero.kineticLine2}
                role={t.hero.roleLine}
                kicker={t.hero.pitch}
                meta={t.hero.kineticMeta}
              />
            ) : (
              <HeroTools
                key={locale}
                word1={t.hero.word1}
                word2={t.hero.word2}
                word3={t.hero.word3}
                word4={t.hero.word4}
                word5={t.hero.word5}
                note={t.hero.note}
                aside={t.hero.aside}
              />
            )}
          </div>
          <FourPlates
            eyebrow={t.plates.eyebrow}
            plate1Title={t.plates.one}
            plate2Title={t.plates.two}
            plate3Title={t.plates.three}
            plate4Title={t.plates.four}
            nextImg={platesThrough}
            overlap={!isMobile}
          />
          {isMobile ? (
            <WorkChapters key={`work-${locale}`} cases={cases} anchor="study" />
          ) : (
            <SplitStudy key={`study-${locale}`} anchor="study" cases={cases} />
          )}
          {isMobile ? (
            <NotesChapters
              key={`notes-${locale}`}
              note1={t.notes.one}
              chapters={noteChapters}
            />
          ) : (
            <FitStack
              key={`notes-${locale}`}
              noteLabel={t.notes.label}
              note1={t.notes.one}
              note2={t.notes.two}
              note2Mark={t.notes.twoMark}
              note3={t.notes.three}
              note3Mark={t.notes.threeMark}
              phrase={t.notes.phrase}
              breakLine={t.notes.breakLine}
              rulesLine={t.notes.rulesLine}
              worthLine={t.notes.worthLine}
              frontBlurb={t.notes.frontBlurb}
              backBlurb={t.notes.backBlurb}
              growthBlurb={t.notes.growthBlurb}
              closer={t.notes.closer}
              closerPlay={t.notes.closerPlay}
              closerArg={t.notes.closerArg}
              closerProp={t.notes.closerProp}
              closerComment={t.notes.closerComment}
              closerHint={t.notes.closerHint}
              playLabel={t.notes.playLabel}
              pauseLabel={t.notes.pauseLabel}
              cubes={t.notes.cubes}
              brand="GUIDO"
              studio="FRASSETTI — 2026"
            />
          )}
        </main>

        <FooterLedger
          title={t.footer.title}
          ghost={t.footer.ghost}
          hint={t.footer.hint}
          row1Label={t.footer.row1Label}
          row1Value={t.footer.row1Value}
          row2Label={t.footer.row2Label}
          row2Value="guidofrassetti@gmail.com"
          row3Label={t.footer.row3Label}
          row3Value={t.footer.row3Value}
          row4Label={t.footer.row4Label}
          row4Value={t.footer.row4Value}
          spine1Title={t.plates.one}
          spine1Author={t.footer.stack1}
          spine2Title={t.plates.two}
          spine2Author={t.footer.stack2}
          spine3Title={t.plates.three}
          spine3Author={t.footer.stack3}
          spine4Title={t.plates.four}
          spine4Author={t.footer.stack4}
        />
      </div>
    </SmoothScrollProvider>
  )
}
