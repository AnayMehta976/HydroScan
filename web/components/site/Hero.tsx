"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import LcdReadout from "./LcdReadout";
import { Glass } from "./motion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -60]);
  const fade = useTransform(scrollY, [0, 500], [1, reduce ? 1 : 0.35]);

  const lines = ["Making microplastic", "pollution visible"];

  const rise = (d: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay: d } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay: d, ease },
        };

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center px-4 pt-28 pb-16 sm:px-6">
      <motion.div style={{ y, opacity: fade }} className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <motion.p {...rise(0.05)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-sm text-mist backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-scatter shadow-[0_0_10px_var(--color-scatter)]" />
            Conrad Challenge 2025–26
          </motion.p>

          <h1 className="font-display text-[clamp(2.8rem,8vw,6.2rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
            {lines.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={reduce ? { opacity: 0 } : { y: "105%" }}
                  animate={reduce ? { opacity: 1 } : { y: "0%" }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.12, ease }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p {...rise(0.5)} className="mt-7 max-w-[46ch] text-lg leading-relaxed text-mist sm:text-xl">
            HydroScan is a portable, low-cost device that screens water for microplastics right where it is collected.
            No lab, no chemicals, no internet.
          </motion.p>

          <motion.div {...rise(0.65)} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#how"
              className="rounded-full bg-foam px-6 py-3 font-semibold text-abyss shadow-[0_10px_40px_-10px_rgba(159,240,255,0.7)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              See how it works
            </a>
            <a
              href="#demo"
              className="glass flex items-center gap-2 rounded-full px-5 py-3 font-medium text-foam transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <Play className="h-4 w-4 fill-current" />
              Watch the demo
            </a>
          </motion.div>

          <motion.dl {...rise(0.8)} className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6">
            {[
              ["≈ ₹8,000", "to build"],
              ["₹0", "per test"],
              ["100%", "offline"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{v}</dd>
                <dd className="text-sm text-mist">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotateX: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.45, ease }}
          style={{ perspective: 1000 }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Glass strong className="rounded-[32px] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-lg font-semibold">On the device</span>
                <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-mist ring-1 ring-white/10">Raspberry Pi 4</span>
              </div>
              <LcdReadout />
              <p className="mt-5 text-sm leading-relaxed text-mist">
                One press of the button: the LEDs light the sample, the camera captures it, and the result appears on the
                screen in plain language.
              </p>
            </Glass>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#problem"
        aria-label="Scroll to the problem"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <span className="flex h-10 w-6 justify-center rounded-full border border-white/25 pt-2">
          <motion.span
            className="h-2 w-1 rounded-full bg-foam"
            animate={reduce ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </span>
      </motion.a>
    </section>
  );
}
