import type { ReactNode } from "react";
import { Link } from "react-router";
import { Page, PageHeader } from "@/ui/primitives";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line/60 py-6">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <Page>
      <PageHeader eyebrow="Calwiz" title="Methods & limitations">
        What is computed, what is tradition, and where the edges are.
      </PageHeader>

      <Block title="Three kinds of information">
        <p>
          <strong className="text-sky">Computed</strong> — astronomical facts (Moon phase, illumination, positions, retrogrades, eclipses, rise and set)
          and numerology arithmetic. Deterministic, reproducible, calculated on your device.
        </p>
        <p>
          <strong className="text-gold">Tradition</strong> — what astrology and numerology associate with those facts. Symbolic and cultural, not
          scientific predictions.
        </p>
        <p>
          <strong className="text-rose">AI-generated</strong> — optional text from an AI service, given only the computed values. It can be wrong.
        </p>
      </Block>

      <Block title="Astronomy">
        <p>
          Calculations use <a className="link" href="https://github.com/cosinekitty/astronomy">astronomy-engine</a> (MIT licence): VSOP87 planetary
          theory, a Chapront lunar model and IAU precession–nutation, with a stated accuracy of about one arcminute. Calwiz's test suite checks it
          against published US Naval Observatory phase times and NASA eclipse predictions.
        </p>
        <p>
          Positions are geocentric and apparent (corrected for light-time and aberration), on the true ecliptic and equinox of date. Retrograde means the
          apparent motion in longitude is negative. Rise and set times use the upper limb, standard refraction and sea level.
        </p>
        <p>
          Illuminated fraction and cycle progress are different quantities. A principal phase name (New, First Quarter, Full, Last Quarter) is shown when
          the Moon is within 6° of the exact phase (about ±12 hours), and in the calendar on the date the exact phase occurs. Calendar cells sample the
          Moon at local noon.
        </p>
        <p>The Moon's lit shape and tilt are computed (bright-limb position angle, optionally the parallactic angle for your location). The surface markings are illustrative.</p>
      </Block>

      <Block title="Astrology">
        <p>
          Tropical zodiac by default. The sidereal option uses the Chitrapaksha ayanamsa, defined so that Spica is at 0° Libra, computed from Spica's
          catalogue position precessed to date. It agrees with the Indian "Lahiri" value to well under 0.01°.
        </p>
        <p>
          Aspects are the five Ptolemaic aspects with orbs you can change. "Applying" means the aspect is getting closer to exact. Houses use Whole Sign or
          Equal houses and need both birth time and birthplace. Without a birth time Calwiz shows positions for local noon and flags planets that change
          sign during that day. Quadrant systems such as Placidus aren't supported yet. Sign rulerships follow tradition (Scorpio–Mars, Aquarius–Saturn,
          Pisces–Jupiter).
        </p>
      </Block>

      <Block title="Numerology">
        <p>
          Pythagorean, reducing month, day and year separately and keeping the master numbers 11, 22 and 33. Personal years run from 1 January. Every
          result can show its working. See <Link className="link" to="/numbers">Numbers</Link>.
        </p>
      </Block>

      <Block title="Time">
        <p>
          Dates are calendar days in your chosen time zone, including daylight-saving transitions (23- and 25-hour days). Birth times are converted to UTC
          using the birthplace's historical time-zone rules from your browser's time-zone database. Calculations are reliable from about 1700 to 2200.
        </p>
      </Block>

      <Block title="Privacy & offline">
        <p>
          No account, no analytics, no server. Your profile lives in this browser's local storage. You can export or delete it on the settings page. Once
          loaded, Calwiz works fully offline. The optional AI feature only sends data when you press Ask, and you can preview exactly what is sent.
        </p>
      </Block>

      <Block title="Reminders & notifications">
        <p>
          Web apps can't reliably schedule notifications while closed without a push server, and Calwiz has none by design. Instead, export full moons,
          new moons and eclipses to your calendar app from the Moon page. Your calendar then delivers the alerts on every platform.
        </p>
      </Block>
    </Page>
  );
}
