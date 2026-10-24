import FieldCanvas from "@/components/site/FieldCanvas";
import Nav from "@/components/site/Nav";
import Choreo from "@/components/site/Choreo";
import LcdReadout from "@/components/site/LcdReadout";
import Diagram from "@/components/site/Diagram";
import DemoVideo from "@/components/site/DemoVideo";
import Vial from "@/components/site/Vial";
import ScanSim from "@/components/site/ScanSim";
import LoupePhoto from "@/components/site/LoupePhoto";
import Build from "@/components/site/Build";
import {
  links, foundIn, comparison, steps, pipeline, levels, modelStats, modelClasses,
  features, bom, validation, users, business, team,
  impact,
} from "@/lib/content";

/** Microscope-style reticle used around the lenses. */
function Reticle({ className }: { className?: string }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden>
      <circle r="97" fill="none" stroke="currentColor" strokeWidth="1.4" />
      {ticks.map((a) => {
        const long = a % 30 === 0;
        const r1 = 97, r2 = long ? 88 : 93;
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={Math.cos(rad) * r1} y1={Math.sin(rad) * r1} x2={Math.cos(rad) * r2} y2={Math.sin(rad) * r2} stroke="currentColor" strokeWidth={long ? 1.4 : 0.8} />;
      })}
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden>
      <path d="M5 13.5l5 5L21 7.5" />
    </svg>
  );
}

const bomTotal = bom.reduce((s, b) => s + b.cost, 0);

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <FieldCanvas />
      <Nav />
      <Choreo />

      <main id="main">
        {/* ================= HERO: the lens ================= */}
        <section className="hero" id="top" data-hero data-field aria-label="HydroScan">
          <div className="hero__paper paper" data-hero-paper />
          <div className="wrap hero__inner">
            <div className="hero__copy" data-hero-copy>
              <span className="chip"><span className="dot" />Conrad Challenge 2025–26</span>
              <h1 className="display h1" style={{ marginTop: 22 }}>Making microplastic pollution visible.</h1>
              <p className="lede muted">HydroScan is a portable, low-cost optical device that screens water for microplastics right where it’s collected. No lab, no chemicals, no internet.</p>
              <div className="hero__actions">
                <a className="btn" href="#how">See how it works</a>
                <a className="btn btn--ghost" href="#try">Try a scan</a>
              </div>
              <dl className="hero__stats">
                <div><dt>to build</dt><dd>≈ ₹8,000</dd></div>
                <div><dt>per test</dt><dd>₹0</dd></div>
                <div><dt>offline</dt><dd>100%</dd></div>
              </dl>
            </div>
            <div className="hero__lens-col">
              <div className="lens" data-lens>
                <Reticle className="lens__ring" />
                <span className="lens__label">live field of view</span>
              </div>
              <div className="hero__lcd" data-hero-lcd><LcdReadout /></div>
            </div>
          </div>
          <div className="hero__hint" aria-hidden><i />Scroll to look closer</div>
          <div className="hero__dive" data-hero-dive aria-hidden><p>Look closer.</p></div>
        </section>

        {/* ================= PROBLEM ================= */}
        <section className="dark section" id="problem" data-field>
          <div className="problem__pin" data-found-pin>
            <div className="wrap">
              <div className="found">
                <p className="found__lead">Microplastics have already been found in</p>
                <div className="found__stage" aria-hidden>
                  <span className="found__box"><span className="found__tag">detected 1/{foundIn.length}</span></span>
                  {foundIn.map((w) => <span className="found__word" key={w}>{w}</span>)}
                </div>
                <ul className="found__list" aria-label="Places microplastics have been found">
                  {foundIn.map((w) => <li key={w}>{w}</li>)}
                </ul>
                <p className="sr-only">{foundIn.join(", ")}.</p>
              </div>
            </div>
          </div>
          <div className="wrap">
            <p className="quote" data-reveal-words>When contamination can’t be measured, it gets ignored.</p>
            <p className="lede muted" style={{ marginTop: 28 }}>Microplastics are plastic particles smaller than 5 mm. Almost nobody monitors them routinely, because the only tests that exist were built for laboratories.</p>
          </div>
        </section>

        {/* ================= LAB vs HYDROSCAN ================= */}
        <section className="paper section" id="lab">
          <div className="wrap compare">
            <div>
              <h2 className="display h2">Why nobody measures it</h2>
              <p className="lede muted">FTIR and Raman spectroscopy are accurate, but they need expensive equipment, trained staff, chemical preparation and per-sample fees. HydroScan is a screening tool that makes frequent testing practical.</p>
            </div>
            <div className="table-card">
              <table>
                <thead>
                  <tr><th scope="col"><span className="sr-only">Aspect</span></th><th scope="col">Lab spectroscopy</th><th scope="col">HydroScan</th></tr>
                </thead>
                <tbody>
                  {comparison.map((c) => (
                    <tr key={c.label}><th scope="row">{c.label}</th><td>{c.lab}</td><td>{c.hydro}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="paper section" id="how">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">How it works</h2>
                <p className="lede muted">Light, a camera and an on-device model. Plastic particles scatter light differently from water, and that pattern is what HydroScan reads.</p>
              </div>
              <span className="head__meta">6 steps, 1 button</span>
            </div>
          </div>
          <div data-how-pin>
            <div className="wrap how__layout">
              <div className="diagram-card"><Diagram /></div>
              <ol className="steps">
                {steps.map((s, i) => (
                  <li className={`step${i === 0 ? " on" : ""}`} key={s.title}>
                    <h3>{s.title}</h3>
                    <small>{s.short}</small>
                    <p>{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ================= DEMO ================= */}
        <section className="dark deep section" id="demo">
          <div className="wrap">
            <div className="head">
              <h2 className="display h2">See it scan</h2>
              <span className="head__meta">prototype, real sample</span>
            </div>
            <DemoVideo />
          </div>
        </section>

        {/* ================= PIPELINE ================= */}
        <section className="dark deep section" id="pipeline">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">Inside the analysis</h2>
                <p className="lede muted">Every scan runs through this computer-vision pipeline on the Raspberry Pi. These images are its real output, one stage at a time.</p>
              </div>
            </div>
          </div>
          <div data-pipe-pin>
            <div className="wrap pipe__layout">
              <div>
                <div className="monitor" data-pipe-final="plastic 46, debris 4">
                  {pipeline.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.img} src={p.img} alt={`Stage ${i + 1}: ${p.title}`} width={1120} height={745} data-pipe-img loading={i === 0 ? "eager" : "lazy"} />
                  ))}
                  <span className="monitor__scan" aria-hidden />
                  <div className="monitor__hud" aria-hidden><span data-pipe-stage>stage 1/{pipeline.length}</span><span data-pipe-count /></div>
                </div>
                <p className="monitor__cap">Output of HydroScan’s detector code, run on a synthetic test frame from our dataset generator and zoomed in on part of the frame. It counted 46 plastic particles and excluded 4 pieces of debris.</p>
                <div className="legend">
                  <span><i style={{ borderColor: "var(--plastic)" }} />Counted as plastic</span>
                  <span><i style={{ borderColor: "var(--debris)" }} />Excluded debris</span>
                </div>
              </div>
              <ol className="pipe-steps">
                {pipeline.map((p, i) => (
                  <li className={`pipe-step${i === 0 ? " on" : ""}`} key={p.title}>
                    <h3>{i + 1}. {p.title}</h3>
                    <p>{p.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="wrap">
            <p className="muted" style={{ marginTop: 48, maxWidth: "62ch" }}>Before any of this, a quality gate rejects blurry, too-dark or over-exposed frames. The final count is the median across every frame that passes, so one stray bubble can’t swing the result.</p>
          </div>
        </section>

        {/* ================= RESULTS + MODEL ================= */}
        <section className="paper section" id="results">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">Three clear results</h2>
                <p className="lede muted">No training needed to read them. The screen gives the level, a relative index and the particle count.</p>
              </div>
            </div>
            <div className="vials">
              {levels.map((l, i) => (
                <article className="vial-card" data-level={l.key} key={l.key}>
                  <Vial count={l.particles} seed={i * 97 + 11} label={`Sample vial with ${l.name.toLowerCase()} contamination`} />
                  <div>
                    <h3>{l.name}</h3>
                    <p className="range">{l.range}</p>
                    <p className="pattern">{l.pattern}</p>
                    <div className="lcd-bezel">
                      <div className="lcd-screen" aria-label={`${l.lcd[0]}. ${l.lcd[1]}`}>
                        <div style={{ whiteSpace: "pre" }}>{l.lcd[0]}</div>
                        <div style={{ whiteSpace: "pre" }}>{l.lcd[1]}</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="note">The percentage is a relative contamination index, not the share of plastic in the water. A count of 100 reads as 100%.</p>

            <div className="model">
              <div>
                <h3 className="display h3">The model behind the call</h3>
                <p className="muted" style={{ marginTop: 12 }}>A Random Forest classifier, small enough to run on the Pi without a GPU and easy to inspect. It also recognises samples that are mostly sand or plant matter. If the model is ever missing, the device falls back to simple count rules, so it always gives an answer.</p>
                <div className="classes">{modelClasses.map((c) => <span key={c}>{c}</span>)}</div>
                <pre className="code" aria-label="Fallback rules">{`count < 20   `}<b>→</b>{` LOW\ncount < 60   `}<b>→</b>{` MEDIUM\notherwise    `}<b>→</b>{` HIGH`}</pre>
              </div>
              <div className="stats">
                {modelStats.map((m) => (
                  <div key={m.label}>
                    <b><span data-count={m.value} data-prefix={m.prefix} data-suffix={m.suffix}>{m.prefix}{m.value}{m.suffix}</span></b>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= SIMULATOR ================= */}
        <section className="dark deep section" id="try">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">Try a scan</h2>
                <p className="lede muted">Pick a sample or set your own, then press scan. Watch the light sheet find every particle, and see what the screen would say.</p>
              </div>
            </div>
            <ScanSim />
          </div>
        </section>

        {/* ================= THE BUILD ================= */}
        <section className="paper section" id="build">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">The build</h2>
                <p className="lede muted">Every main part of the prototype, pulled apart and labelled. Drag the model to turn it around.</p>
              </div>
              <span className="head__meta">exploded view, 10 parts</span>
            </div>
          </div>
          <div data-build-pin>
            <div className="wrap"><Build /></div>
          </div>
        </section>

        {/* ================= PROTOTYPE ================= */}
        <section className="paper section" id="prototype">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">The working prototype</h2>
                <p className="lede muted">A sealed optical chamber with a three-wall LED strip, a Raspberry Pi 4, a Camera Module v3 NOIR and a 16×2 LCD, running on a USB-C power bank.</p>
              </div>
            </div>
            <div className="proto">
              <LoupePhoto src="/prototype-exterior.jpg" width={1184} height={864} alt="HydroScan prototype: a black enclosure with a lit glass sample dish and a blue LCD reading HydroScan Ready" caption="Outside: the lit sample chamber and the LCD showing “HydroScan Ready”." />
              <LoupePhoto src="/prototype-interior.jpg" width={864} height={1184} alt="Inside the HydroScan lid: Raspberry Pi 4, camera module and LCD driver board with wiring" caption="Inside the lid: the Pi, the camera pointing down at the sample, and the LCD driver." />
            </div>
            <div className="bom">
              <div className="panel" data-rise>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "4px 12px" }}>
                  <h3 className="display h3">Bill of materials</h3>
                  <span className="bom__total">≈ ₹<span data-count={bomTotal} data-format>{bomTotal.toLocaleString("en-IN")}</span></span>
                </div>
                <ul style={{ marginTop: 16 }}>
                  {bom.map((b) => (
                    <li key={b.item}>
                      <div className="row"><span>{b.item}</span><span>₹{b.cost.toLocaleString("en-IN")}</span></div>
                      <div className="bar"><i style={{ width: `${(b.cost / bom[0].cost) * 100}%` }} /></div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel" data-rise>
                <h3 className="display h3">Wired to the Pi</h3>
                <div className="parts" style={{ marginTop: 16 }}>
                  <div><b>Camera v3 NOIR</b><span>CSI ribbon port</span></div>
                  <div><b>16×2 LCD</b><span>I2C on GPIO2 and GPIO3, address 0x27</span></div>
                  <div><b>Scan button</b><span>GPIO17 with the internal pull-up</span></div>
                  <div><b>White LEDs</b><span>GPIO27, through a MOSFET for the strip</span></div>
                  <div><b>Power</b><span>USB-C power bank</span></div>
                  <div><b>Software</b><span>Python, OpenCV and scikit-learn, open on GitHub</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FIELD TRAY ================= */}
        <section className="dark deep section tray" id="field" data-tray-section>
          <div className="wrap">
            <div className="head">
              <h2 className="display h2">Built for the field, not the lab</h2>
              <span className="head__meta">slide tray, 6 specimens</span>
            </div>
          </div>
          <div data-tray>
            <div className="tray__track" data-tray-track>
              {features.map((f) => (
                <article className="slide" key={f.title}>
                  <div className="slide__label"><b>{f.title}</b><span>{f.tag}</span></div>
                  <div className="slide__body"><p>{f.body}</p></div>
                  <span className="slide__spec" aria-hidden />
                </article>
              ))}
            </div>
            <div className="wrap"><div className="tray__progress" aria-hidden><i data-tray-progress /></div></div>
          </div>
        </section>

        {/* ================= USERS + VALIDATION ================= */}
        <section className="paper section" id="users">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">Who it’s for</h2>
                <p className="lede muted">Anyone who needs to check water often, without sending samples away.</p>
              </div>
            </div>
            <div className="users">
              {users.map((u) => <div className="user" data-rise key={u.title}><b>{u.title}</b><span>{u.body}</span></div>)}
            </div>
            <div className="two" style={{ marginTop: "clamp(70px, 10vw, 120px)" }}>
              <div>
                <h2 className="display h2">How we tested it</h2>
                <p className="lede muted">From a first prototype to dozens of repeated runs, every claim on this page comes from testing the real device.</p>
              </div>
              <ul className="checks">
                {validation.map((v) => <li key={v}><Check /><span>{v}</span></li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= IMPACT ================= */}
        <section className="dark deep section" id="impact">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">Already in use</h2>
                <p className="lede">HydroScan has left the workbench. It is screening the water supply of residential building complexes that are home to about 900 families.</p>
              </div>
              <span className="head__meta">deployed, on site</span>
            </div>
            <div className="impact">
              <div className="impact__stat" data-rise>
                <span className="impact__num"><span className="impact__tilde">~</span><span data-count={900}>900</span></span>
                <span className="impact__unit">families</span>
                <p>whose building water supply is being screened by HydroScan, on site, with no samples sent away.</p>
              </div>
              <ul className="impact__points">
                {impact.map((m) => (
                  <li className="impact__point" data-rise key={m.title}>
                    <h3>{m.title}</h3>
                    <p>{m.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= BUSINESS ================= */}
        <section className="paper paper--plain section" id="business">
          <div className="wrap">
            <div className="head">
              <div>
                <h2 className="display h2">Business model</h2>
                <p className="lede muted">A one-time purchase with no recurring fees, so communities can test as often as they need. Households and schools first, then institutions.</p>
              </div>
            </div>
            <div className="biz">
              <div className="panel" data-rise>
                <dl className="money">
                  <div><dt>Unit price</dt><dd>{business.price.inr}</dd><dd>{business.price.usd}</dd></div>
                  <div><dt>Unit cost</dt><dd>{business.cost.inr}</dd><dd>{business.cost.usd}</dd></div>
                  <div><dt>Gross margin</dt><dd>~<span data-count={business.margin} data-suffix="%">{business.margin}%</span></dd><dd>on single-unit cost</dd></div>
                </dl>
                <div className="margin">
                  <div className="margin__bar" role="img" aria-label="Of the ₹12,000 price, ₹8,000 is cost and ₹4,000 is margin"><i style={{ flex: 67 }} /><i style={{ flex: 33 }} /></div>
                  <div className="margin__labels"><span>Cost ₹8,000</span><span>Margin ₹4,000</span></div>
                </div>
                <h3 className="display h3" style={{ margin: "28px 0 12px", fontSize: "1.4rem" }}>Future revenue</h3>
                <div className="tags">{business.streams.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
              </div>
              <div className="panel" data-rise>
                <h3 className="display h3">Funding and growth</h3>
                <p className="muted" style={{ margin: "10px 0 16px" }}>HydroScan is self-developed and bootstrapped. Initial funding will go towards:</p>
                <ul className="checks">
                  {business.funding.map((f) => <li key={f}><Check /><span>{f}</span></li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TEAM ================= */}
        <section className="paper section" id="team">
          <div className="wrap team">
            <div>
              <h2 className="display h2">The team</h2>
              <p className="lede muted">HydroScan started with a simple question: if contamination can’t be seen or measured easily, how can communities be expected to act on it?</p>
              <p className="muted" style={{ marginTop: 16, maxWidth: "58ch" }}>We met at school through a shared interest in using engineering and computer science on real environmental problems. Our goal is to make microplastic pollution visible, measurable and impossible to ignore.</p>
            </div>
            <div className="members">
              {team.map((t) => (
                <article className="member panel" data-rise key={t.name}>
                  <span className="member__mono" aria-hidden>{t.initials}</span>
                  <div>
                    <h3>{t.name}</h3>
                    <p className="role">{t.role}</p>
                    <p>{t.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="dark footer" data-field>
        <div className="wrap">
          <div className="footer__lens" aria-hidden><Reticle /></div>
          <h2 className="display h2">Clean water starts with knowing what’s in it.</h2>
          <div className="footer__actions">
            <a className="btn" href={links.github} target="_blank" rel="noreferrer">View the code</a>
            <a className="btn btn--ghost" href="/HydroScan_Technical_Project_File.pdf" target="_blank" rel="noreferrer">Read the project file (PDF)</a>
            <a className="btn btn--ghost" href={links.youtube} target="_blank" rel="noreferrer">Watch the demo</a>
          </div>
          <div className="footer__base">
            <p>© 2025–26 Anay Mehta and Yuvraj Nikum. All rights reserved. Conrad Challenge 2025–26.</p>
            <p>HydroScan is a screening tool, not a laboratory instrument. A High reading means investigate further, not a certified measurement.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
