"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Frame = { l1: string; l2: string; ms: number; level?: "low" | "medium" | "high" };

const readings: { l1: string; l2: string; level: Frame["level"] }[] = [
  { l1: "HIGH  74%  n=74", l2: "Investigate", level: "high" },
  { l1: "LOW   12%  n=12", l2: "Water looks OK", level: "low" },
  { l1: "MEDIUM 41% n=41", l2: "Test again soon", level: "medium" },
];

function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  for (const r of readings) {
    frames.push({ l1: "HydroScan Ready", l2: "Press to scan", ms: 1700 });
    for (let i = 0; i <= 8; i++) {
      frames.push({ l1: "Scanning...", l2: "█".repeat(i * 2).padEnd(16, "·"), ms: 170 });
    }
    frames.push({ l1: "Analysing", l2: "frames 3/3 OK", ms: 900 });
    frames.push({ l1: r.l1, l2: r.l2, ms: 3200, level: r.level });
  }
  return frames;
}

const frames = buildFrames();

const levelDot: Record<string, string> = {
  low: "bg-low shadow-[0_0_12px_var(--color-low)]",
  medium: "bg-medium shadow-[0_0_12px_var(--color-medium)]",
  high: "bg-high shadow-[0_0_12px_var(--color-high)]",
};

/** Recreates the device's 16×2 blue LCD cycling through a scan. */
export default function LcdReadout({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setI((n) => (n + 1) % frames.length), frames[i].ms);
    return () => clearTimeout(t);
  }, [i, reduce]);

  const f = reduce ? frames[frames.length - 1] : frames[i];

  return (
    <div className={cn("rounded-[22px] bg-[#0b0f14] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10", className)}>
      <div
        className="lcd-screen rounded-xl px-4 py-3 font-lcd text-[clamp(1.35rem,3.6vw,1.9rem)] leading-[1.05] text-lcd-ink"
        role="img"
        aria-label={`Device display: ${f.l1}. ${f.l2}`}
      >
        <div className="whitespace-pre">{f.l1.padEnd(16, " ")}</div>
        <div className="whitespace-pre">
          {f.l2.padEnd(16, " ")}
          {!f.level && f.l1 === "HydroScan Ready" && <span className="blink">_</span>}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between px-1 text-xs text-mist">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full transition-colors duration-500",
              f.level ? levelDot[f.level] : "bg-white/25",
            )}
          />
          {f.level ? "Result" : "Live preview"}
        </span>
        <span>16×2 I2C LCD</span>
      </div>
    </div>
  );
}
