"use client";

import { useEffect, useState } from "react";

type Frame = { l1: string; l2: string; ms: number; level?: "low" | "medium" | "high" };

const readings: { l1: string; l2: string; level: Frame["level"] }[] = [
  { l1: "HIGH  74%  n=74", l2: "Investigate", level: "high" },
  { l1: "LOW   12%  n=12", l2: "Water looks OK", level: "low" },
  { l1: "MEDIUM 41% n=41", l2: "Test again soon", level: "medium" },
];

const frames: Frame[] = readings.flatMap((r) => [
  { l1: "HydroScan Ready", l2: "Press to scan", ms: 1700 },
  ...Array.from({ length: 9 }, (_, i) => ({ l1: "Scanning...", l2: "█".repeat(i * 2).padEnd(16, "·"), ms: 170 })),
  { l1: "Analysing", l2: "frames 3/3 OK", ms: 900 },
  { l1: r.l1, l2: r.l2, ms: 3200, level: r.level },
]);

const led: Record<string, string> = { low: "#39e17a", medium: "#ffc93c", high: "#ff5a4e" };

/** The device's 16×2 blue LCD, cycling through a scan. */
export default function LcdReadout({ className }: { className?: string }) {
  const [i, setI] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    queueMicrotask(on);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setI((n) => (n + 1) % frames.length), frames[i].ms);
    return () => clearTimeout(t);
  }, [i, reduce]);

  const f = reduce ? frames[frames.length - 1] : frames[i];
  return (
    <div className={`lcd-bezel ${className ?? ""}`}>
      <div className="lcd-screen" role="img" aria-label={`Device display: ${f.l1}. ${f.l2}`} style={{ fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)" }}>
        <div style={{ whiteSpace: "pre" }}>{f.l1.padEnd(16, " ")}</div>
        <div style={{ whiteSpace: "pre" }}>
          {f.l2.padEnd(16, " ")}
          {!f.level && f.l1 === "HydroScan Ready" && <span className="blink">_</span>}
        </div>
      </div>
      <div className="lcd-meta">
        <span><span className="led" style={f.level ? { background: led[f.level], boxShadow: `0 0 10px ${led[f.level]}` } : undefined} />{f.level ? "Result" : "Live preview"}</span>
        <span>16×2 I2C LCD</span>
      </div>
    </div>
  );
}
