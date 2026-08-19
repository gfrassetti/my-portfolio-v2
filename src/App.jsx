import SmoothScrollProvider from './components/SmoothScrollProvider.jsx'
import NavRatio from './components/sections/ratio/NavRatio.jsx'
import DeskNotice from './components/sections/ratio/DeskNotice.jsx'
import HeroTools from './components/sections/ratio/HeroTools.jsx'
import FourPlates from './components/sections/ratio/FourPlates.jsx'
import SplitStudy from './components/sections/ratio/SplitStudy.jsx'
import FitStack from './components/sections/ratio/FitStack.jsx'
import FooterLedger from './components/sections/ratio/FooterLedger.jsx'
import laserawayShot from './assets/works/laseraway.png'
import laserawayMark from './assets/works/laseraway-mark.png'
import clashvaultShot from './assets/works/clashvault.png'
import mkmusicMark from './assets/works/mkmusicandevents.svg'
import encuentroShot from './assets/works/encuentro.png'
import platesThrough from './components/sections/ratio/assets/plates-through.jpg'
import { useI18n } from './i18n/I18n.jsx'

export default function App() {
  const { locale, setLocale, t } = useI18n()

  return (
    <SmoothScrollProvider>
      <div id="top" className="bg-ratio-paper text-ratio-ink max-lg:h-svh max-lg:overflow-hidden">
        <DeskNotice
          brand="GF"
          line1={t.desk.line1}
          line2={t.desk.line2}
          line3={t.desk.line3}
          ariaLabel={t.desk.aria}
        />
        <NavRatio
          brand="GUIDO FRASSETTI"
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
          <FourPlates
            eyebrow={t.plates.eyebrow}
            plate1Title={t.plates.one}
            plate2Title={t.plates.two}
            plate3Title={t.plates.three}
            plate4Title={t.plates.four}
            nextImg={platesThrough}
          />
          <SplitStudy
            key={`study-${locale}`}
            anchor="study"
            cases={[
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
                portrait: laserawayMark,
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
                img: mkmusicMark,
                contain: true,
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
              },
            ]}
          />
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
