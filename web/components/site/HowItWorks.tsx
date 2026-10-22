"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Droplets, Lightbulb, Camera, Wand2, BrainCircuit, Monitor } from "lucide-react";
import { steps } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Glass } from "./motion";

const icons = [Droplets, Lightbulb, Camera, Wand2, BrainCircuit, Monitor];
const AUTO_MS = 5200;

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20%" });
  const reduce = useReducedMotion();
  const running = auto && inView && !reduce;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [active, running]);

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      choose((active + 1) % steps.length);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      choose((active - 1 + steps.length) % steps.length);
    }
  };

  const Icon = icons[active];

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div role="tablist" aria-label="Steps" aria-orientation="vertical" onKeyDown={onKey} className="grid gap-2">
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.title}
              role="tab"
              id={`step-tab-${i}`}
              aria-selected={on}
              aria-controls="step-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => choose(i)}
              className={cn(
                "group relative flex items-center gap-4 overflow-hidden rounded-2xl px-4 py-3 text-left transition-colors",
                on ? "bg-white/[0.09] ring-1 ring-white/15" : "hover:bg-white/[0.05]",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-semibold transition-colors",
                  on ? "bg-scatter text-abyss" : "bg-white/[0.07] text-mist group-hover:text-foam",
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className={cn("block font-medium", on ? "text-foam" : "text-mist group-hover:text-foam")}>
                  {s.title}
                </span>
                <span className="block text-sm text-mist/80">{s.short}</span>
              </span>
              {on && running && (
                <motion.span
                  key={`p-${active}`}
                  className="absolute bottom-0 left-0 h-[2px] bg-scatter/80"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <Glass strong className="min-h-[340px] overflow-hidden rounded-[28px] p-8 sm:p-10">
        <div id="step-panel" role="tabpanel" aria-labelledby={`step-tab-${active}`} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8 flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-scatter/15 text-scatter ring-1 ring-scatter/30">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="text-sm text-mist">
                  Step {active + 1} of {steps.length}
                </span>
              </div>
              <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{steps[active].title}</h3>
              <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-mist">{steps[active].body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-scatter/20 blur-3xl" />
      </Glass>
    </div>
  );
}
