import Image from "next/image";
import { ArrowUpRight, Check, Github, Youtube } from "lucide-react";
import WaterBackground from "@/components/site/WaterBackground";
import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import HowItWorks from "@/components/site/HowItWorks";
import Pipeline from "@/components/site/Pipeline";
import DemoVideo from "@/components/site/DemoVideo";
import { Reveal, Glass, CountUp, GrowBar, ScrollProgress } from "@/components/site/motion";
import {
  foundIn,
  comparison,
  levels,
  modelStats,
  modelClasses,
  features,
  bom,
  validation,
  users,
  business,
  team,
  links,
} from "@/lib/content";
import { cn } from "@/lib/utils";

const levelStyle = {
  low: { text: "text-low", bar: "bg-low", ring: "ring-low/30", glow: "bg-low/25" },
  medium: { text: "text-medium", bar: "bg-medium", ring: "ring-medium/30", glow: "bg-medium/25" },
  high: { text: "text-high", bar: "bg-high", ring: "ring-high/30", glow: "bg-high/25" },
} as const;

function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("px-4 py-24 sm:px-6 sm:py-32", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function Heading({ title, lede }: { title: string; lede?: string }) {
  return (
    <Reveal className="mb-12 max-w-3xl sm:mb-16">
      <h2 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.03em]">{title}</h2>
      {lede && <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-mist">{lede}</p>}
    </Reveal>
  );
}

const bomTotal = bom.reduce((s, b) => s + b.cost, 0);

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <WaterBackground />
      <Nav />

      <main>
        <Hero />

        {/* ---------------- Problem ---------------- */}
        <Section id="problem">
          <Heading
            title="The invisible crisis"
            lede="Microplastics are plastic particles smaller than 5 mm. They are already everywhere, yet almost nobody measures them, because the tests that exist are built for laboratories."
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <Reveal>
              <Glass className="h-full rounded-[28px] p-8">
                <h3 className="font-display text-2xl font-semibold tracking-tight">Detected in</h3>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {foundIn.map((f) => (
                    <li key={f} className="rounded-full bg-white/[0.07] px-3.5 py-1.5 text-sm text-foam ring-1 ring-white/10">
                      {f}
                    </li>
                  ))}
                </ul>
                <blockquote className="mt-10 border-l-2 border-scatter/60 pl-5 font-display text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
                  When contamination cannot be measured, it is ignored.
                </blockquote>
              </Glass>
            </Reveal>

            <Reveal delay={0.1}>
              <Glass className="overflow-hidden rounded-[28px]">
                <div className="px-5 pt-8 sm:px-8">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">Lab testing vs HydroScan</h3>
                  <p className="mt-2 text-mist">
                    FTIR and Raman spectroscopy are accurate, but they need expensive equipment, trained staff and chemical
                    preparation. HydroScan is a screening tool that makes frequent testing practical.
                  </p>
                </div>
                <div className="mt-6">
                  <table className="w-full table-fixed text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-y border-white/10 text-mist">
                        <th scope="col" className="w-[30%] py-3 pr-2 pl-5 font-medium sm:pl-8"><span className="sr-only">Aspect</span></th>
                        <th scope="col" className="px-2 py-3 font-medium sm:px-4">Lab spectroscopy</th>
                        <th scope="col" className="py-3 pr-5 pl-2 font-medium text-scatter sm:pr-8 sm:pl-4">HydroScan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((c) => (
                        <tr key={c.label} className="border-b border-white/[0.06] last:border-0">
                          <th scope="row" className="py-3.5 pr-2 pl-5 align-top font-medium text-foam sm:pl-8">{c.label}</th>
                          <td className="px-2 py-3.5 align-top text-mist sm:px-4">{c.lab}</td>
                          <td className="py-3.5 pr-5 pl-2 align-top text-foam sm:pr-8 sm:pl-4">{c.hydro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Glass>
            </Reveal>
          </div>
        </Section>

        {/* ---------------- How it works ---------------- */}
        <Section id="how">
          <Heading
            title="How it works"
            lede="HydroScan uses light, a camera and an on-device model. Microplastic particles scatter light differently from water, and that pattern is what the device reads."
          />
          <Reveal>
            <HowItWorks />
          </Reveal>
        </Section>

        {/* ---------------- Demo ---------------- */}
        <Section id="demo" className="pt-0 sm:pt-0">
          <Reveal>
            <DemoVideo />
          </Reveal>
        </Section>

        {/* ---------------- Technology ---------------- */}
        <Section id="technology">
          <Heading
            title="Inside the analysis"
            lede="Every scan runs through a computer-vision pipeline on the Raspberry Pi, then a trained model decides the level. Blurry, dark or over-exposed frames are rejected before anything is counted."
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
            <Pipeline />

            <div className="grid content-start gap-6 lg:sticky lg:top-28">
              <Reveal>
                <Glass className="rounded-[28px] p-8">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">Plastic, not just particles</h3>
                  <p className="mt-3 text-mist">
                    Sand and organic debris also scatter light. HydroScan scores each particle and only counts the ones
                    that look like plastic. The saved image marks both.
                  </p>
                  <div className="relative mt-6 h-40 overflow-hidden rounded-2xl bg-[#04101a] ring-1 ring-white/10" aria-hidden>
                    {[
                      [12, 30, 14, true], [28, 62, 10, true], [44, 22, 18, false], [58, 70, 12, true],
                      [70, 38, 9, true], [84, 60, 16, false], [36, 80, 8, true], [90, 18, 10, true],
                      [20, 12, 7, true], [64, 14, 11, false],
                    ].map(([x, y, s, plastic], i) => (
                      <span
                        key={i}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 rounded-[3px] border",
                          plastic ? "border-low" : "border-debris",
                        )}
                        style={{ left: `${x}%`, top: `${y}%`, width: `${Number(s) + 10}px`, height: `${Number(s) + 10}px` }}
                      >
                        <span
                          className={cn("absolute inset-0 m-auto rounded-full", plastic ? "bg-[#d8fbff]" : "bg-[#ffcc8f]")}
                          style={{ width: `${Number(s) / 2}px`, height: `${Number(s) / 2}px` }}
                        />
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist">
                    <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-[3px] border-2 border-low" /> Counted as plastic</span>
                    <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-[3px] border-2 border-debris" /> Excluded debris</span>
                  </div>
                </Glass>
              </Reveal>

              <Reveal delay={0.05}>
                <Glass className="rounded-[28px] p-8">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">The model</h3>
                  <p className="mt-3 text-mist">
                    A Random Forest classifier, small enough to run on the Pi with no GPU and easy to inspect. If the
                    model is ever missing, the device falls back to simple count thresholds so it always gives a result.
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
                    {modelStats.map((m) => (
                      <div key={m.label}>
                        <dt className="sr-only">{m.label}</dt>
                        <dd className="font-display text-4xl font-semibold tracking-tight">
                          <CountUp to={m.value} prefix={m.prefix} suffix={m.suffix} />
                        </dd>
                        <dd className="mt-1 text-sm text-mist">{m.label}</dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {modelClasses.map((c) => (
                      <li key={c} className="rounded-full bg-white/[0.07] px-3 py-1 font-lcd text-lg leading-none text-foam ring-1 ring-white/10">
                        {c}
                      </li>
                    ))}
                  </ul>
                </Glass>
              </Reveal>
            </div>
          </div>

          {/* Results */}
          <div className="mt-24">
            <Reveal className="mb-10 max-w-3xl">
              <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Three clear results</h3>
              <p className="mt-4 text-lg text-mist">
                No technical training needed to read them. The percentage is a relative contamination index, not the
                share of plastic in the water.
              </p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {levels.map((l, i) => {
                const s = levelStyle[l.key];
                return (
                  <Reveal key={l.key} delay={i * 0.08}>
                    <Glass className={cn("h-full overflow-hidden rounded-[28px] p-6 ring-1", s.ring)}>
                      <div className={cn("pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl", s.glow)} />
                      <div className="lcd-screen rounded-xl px-3 py-2 font-lcd text-2xl leading-[1.05] text-lcd-ink" aria-hidden>
                        <div className="whitespace-pre">{l.lcd[0]}</div>
                        <div className="whitespace-pre">{l.lcd[1]}</div>
                      </div>
                      <h4 className={cn("mt-6 font-display text-3xl font-semibold tracking-tight", s.text)}>{l.name}</h4>
                      <p className="mt-1 font-medium text-foam">{l.range}</p>
                      <p className="mt-2 text-mist">{l.pattern}</p>
                      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <GrowBar pct={[22, 58, 100][i]} className={cn("h-full rounded-full", s.bar)} delay={0.2} />
                      </div>
                    </Glass>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ---------------- Features ---------------- */}
        <Section>
          <Heading title="Built for the field, not the lab" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.06}>
                <Glass className="h-full rounded-3xl p-7">
                  <Check className="h-5 w-5 text-scatter" aria-hidden />
                  <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-mist">{f.body}</p>
                </Glass>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------- Prototype ---------------- */}
        <Section id="prototype">
          <Heading
            title="The working prototype"
            lede="A sealed optical chamber with an LED strip, a Raspberry Pi 4, a Camera Module v3 NOIR and a 16×2 LCD, all running on a USB-C power bank."
          />

          <div className="grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <Reveal>
              <figure className="group glass overflow-hidden rounded-[28px] p-2">
                <div className="overflow-hidden rounded-[22px]">
                  <Image
                    src="/prototype-exterior.jpg"
                    alt="HydroScan prototype: a black enclosure with a lit glass sample dish and a blue LCD reading HydroScan Ready"
                    width={1184}
                    height={864}
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                    priority={false}
                  />
                </div>
                <figcaption className="px-4 pt-4 pb-3 text-sm text-mist">
                  Outside: the lit sample chamber and the LCD showing “HydroScan Ready”.
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={0.1}>
              <figure className="group glass h-full overflow-hidden rounded-[28px] p-2">
                <div className="overflow-hidden rounded-[22px]">
                  <Image
                    src="/prototype-interior.jpg"
                    alt="Inside the HydroScan lid: Raspberry Pi 4, camera module and LCD driver board with wiring"
                    width={864}
                    height={1184}
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="px-4 pt-4 pb-3 text-sm text-mist">
                  Inside the lid: the Pi, the camera pointing down at the sample, and the LCD driver.
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <Glass className="h-full rounded-[28px] p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">Bill of materials</h3>
                  <p className="font-display text-2xl font-semibold">
                    ≈ ₹<CountUp to={bomTotal} format />
                  </p>
                </div>
                <ul className="mt-6 grid gap-3.5">
                  {bom.map((b, i) => (
                    <li key={b.item}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foam">{b.item}</span>
                        <span className="text-mist tabular-nums">₹{b.cost.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <GrowBar
                          pct={(b.cost / bom[0].cost) * 100}
                          delay={i * 0.06}
                          className="h-full rounded-full bg-gradient-to-r from-[#3aa7d6] to-scatter"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </Glass>
            </Reveal>

            <Reveal delay={0.08}>
              <Glass className="h-full rounded-[28px] p-8">
                <h3 className="font-display text-2xl font-semibold tracking-tight">How we validated it</h3>
                <ul className="mt-6 grid gap-4">
                  {validation.map((v) => (
                    <li key={v} className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-scatter" aria-hidden />
                      <span className="text-mist">{v}</span>
                    </li>
                  ))}
                </ul>
              </Glass>
            </Reveal>
          </div>
        </Section>

        {/* ---------------- Who it's for ---------------- */}
        <Section>
          <Heading
            title="Who it’s for"
            lede="Anyone who needs to check water often, without sending samples away."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {users.map((u, i) => (
              <Reveal key={u.title} delay={i * 0.05}>
                <Glass className="h-full rounded-3xl p-6">
                  <h3 className="font-display text-lg font-semibold tracking-tight">{u.title}</h3>
                  <p className="mt-2 text-sm text-mist">{u.body}</p>
                </Glass>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------- Business ---------------- */}
        <Section id="business">
          <Heading
            title="Business model"
            lede="A one-time purchase with no recurring fees, so communities can test as often as they need. We start with households and schools, then expand to institutions."
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <Reveal>
              <Glass strong className="h-full rounded-[28px] p-8 sm:p-10">
                <dl className="grid gap-8 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm text-mist">Unit price</dt>
                    <dd className="mt-1 font-display text-4xl font-semibold tracking-tight">{business.price.inr}</dd>
                    <dd className="text-sm text-mist">{business.price.usd}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-mist">Unit cost</dt>
                    <dd className="mt-1 font-display text-4xl font-semibold tracking-tight">{business.cost.inr}</dd>
                    <dd className="text-sm text-mist">{business.cost.usd}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-mist">Gross margin</dt>
                    <dd className="mt-1 font-display text-4xl font-semibold tracking-tight text-scatter">
                      ~<CountUp to={business.margin} suffix="%" />
                    </dd>
                    <dd className="text-sm text-mist">on single-unit cost</dd>
                  </div>
                </dl>

                <div className="mt-10">
                  <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.07]">
                    <GrowBar pct={67} className="h-full bg-white/30" />
                    <GrowBar pct={33} delay={0.6} className="h-full bg-scatter" />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-mist">
                    <span>Cost ₹8,000</span>
                    <span>Margin ₹4,000</span>
                  </div>
                </div>

                <div className="mt-10 border-t border-white/10 pt-8">
                  <h3 className="font-display text-xl font-semibold tracking-tight">Future revenue</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {business.streams.map((s) => (
                      <li key={s} className="rounded-full bg-white/[0.07] px-3.5 py-1.5 text-sm ring-1 ring-white/10">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </Glass>
            </Reveal>

            <Reveal delay={0.1}>
              <Glass className="h-full rounded-[28px] p-8">
                <h3 className="font-display text-2xl font-semibold tracking-tight">Funding and growth</h3>
                <p className="mt-3 text-mist">
                  HydroScan is self-developed and bootstrapped. Initial funding will go towards:
                </p>
                <ul className="mt-5 grid gap-3">
                  {[
                    "Refining the prototype",
                    "Optimising manufacturing",
                    "Pilot deployments with schools, NGOs and research institutions",
                    "Training the model on real-world captures",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-scatter" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Glass>
            </Reveal>
          </div>
        </Section>

        {/* ---------------- Story + Team ---------------- */}
        <Section id="team">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <Reveal>
              <h2 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
                Our story
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-mist">
                HydroScan began with a simple question: if contamination can’t be seen or measured easily, how can
                communities be expected to act on it?
              </p>
              <p className="mt-4 text-lg leading-relaxed text-mist">
                We met at school through a shared interest in using engineering and computer science on real
                environmental problems. Our goal is to make microplastic pollution visible, measurable and impossible to
                ignore, by giving households, schools and communities a tool they can actually use.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-mist">
                The brand follows the same idea: clear, evidence-driven and accessible. Deep water tones for the
                seriousness of the problem, light for clarity.
              </p>
            </Reveal>

            <div className="grid content-start gap-5">
              {team.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.1}>
                  <Glass className="rounded-[28px] p-7 sm:p-8">
                    <div className="flex items-center gap-5">
                      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-scatter/40 to-[#1f46e0]/40 font-display text-xl font-semibold ring-1 ring-white/20">
                        {t.initials}
                      </span>
                      <div>
                        <h3 className="font-display text-2xl font-semibold tracking-tight">{t.name}</h3>
                        <p className="text-scatter">{t.role}</p>
                      </div>
                    </div>
                    <p className="mt-5 text-mist">{t.body}</p>
                  </Glass>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------------- Closing ---------------- */}
        <Section className="pb-16">
          <Reveal>
            <Glass strong className="overflow-hidden rounded-[36px] px-8 py-14 text-center sm:px-16 sm:py-20">
              <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-2/3 rounded-full bg-scatter/25 blur-3xl" />
              <h2 className="mx-auto max-w-3xl font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
                Clean water starts with knowing what’s in it.
              </h2>
              <p className="mx-auto mt-5 max-w-[52ch] text-lg text-mist">
                Explore the code, watch the prototype at work, or get in touch about a pilot.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-foam px-6 py-3 font-semibold text-abyss transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <Github className="h-4 w-4" /> View the code
                </a>
                <a
                  href={links.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="glass flex items-center gap-2 rounded-full px-6 py-3 font-medium transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <Youtube className="h-4 w-4" /> Watch on YouTube <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </Glass>
          </Reveal>
        </Section>
      </main>

      <footer className="px-4 pb-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-white/10 pt-8 text-sm text-mist sm:flex-row sm:items-start sm:justify-between">
          <p>
            © 2025–26 Anay Mehta and Yuvraj Nikum. All rights reserved.
            <br />
            Conrad Challenge 2025–26.
          </p>
          <p className="max-w-md sm:text-right">
            HydroScan is a screening tool, not a laboratory instrument. A High reading means investigate further, not a
            certified measurement.
          </p>
        </div>
      </footer>
    </>
  );
}
