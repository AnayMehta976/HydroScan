"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Part = { x: number; y: number; r: number; plastic: boolean; seen: boolean; score: number };

// Same rules as the device's fallback classifier (config.py).
const LOW_MAX = 20;
const MEDIUM_MAX = 60;
const FULL_SCALE = 100;

const presets = [
  { id: "tap", label: "Tap water", plastic: 6, debris: 2, glare: false },
  { id: "river", label: "River", plastic: 38, debris: 9, glare: true },
  { id: "drain", label: "Storm drain", plastic: 92, debris: 14, glare: true },
];

function rand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function classify(n: number) {
  const level = n < LOW_MAX ? "LOW" : n < MEDIUM_MAX ? "MEDIUM" : "HIGH";
  const pct = Math.round(Math.min((n / FULL_SCALE) * 100, 100));
  const msg = level === "LOW" ? "Water looks OK" : level === "MEDIUM" ? "Test again soon" : "Investigate";
  return { level, pct, msg };
}

export default function ScanSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const partsRef = useRef<Part[]>([]);
  const beamRef = useRef(-1);
  const rafRef = useRef(0);
  const [plastic, setPlastic] = useState(38);
  const [debris, setDebris] = useState(9);
  const [glare, setGlare] = useState(true);
  const [preset, setPreset] = useState("river");
  const [phase, setPhase] = useState<"ready" | "scanning" | "done">("ready");
  const [live, setLive] = useState({ plastic: 0, debris: 0, glare: false, progress: 0 });

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, R = W / 2, dpr = W / c.clientWidth;
    ctx.clearRect(0, 0, W, H);
    const beam = beamRef.current;
    if (beam >= 0) {
      const bx = beam * W;
      const g = ctx.createLinearGradient(bx - 90 * dpr, 0, bx + 10 * dpr, 0);
      g.addColorStop(0, "rgba(207,246,255,0)");
      g.addColorStop(0.85, "rgba(207,246,255,.14)");
      g.addColorStop(1, "rgba(207,246,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(bx - 90 * dpr, 0, 100 * dpr, H);
    }
    // glare spot (an LED reflection)
    if (glare) {
      const gx = W * 0.36, gy = H * 0.58, gr = R * 0.09;
      const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 1.6);
      rg.addColorStop(0, "rgba(255,255,250,.95)");
      rg.addColorStop(0.5, "rgba(255,255,250,.5)");
      rg.addColorStop(1, "rgba(255,255,250,0)");
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(gx, gy, gr * 1.6, 0, Math.PI * 2); ctx.fill();
      if (beam >= 0.36 || phase === "done") {
        ctx.strokeStyle = "rgba(250,91,20,.95)";
        ctx.setLineDash([5 * dpr, 4 * dpr]);
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath(); ctx.arc(gx, gy, gr * 1.9, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(250,91,20,.95)";
        ctx.font = `${15 * dpr}px VT323, monospace`;
        ctx.fillText("glare masked", gx + gr * 2.1, gy - gr * 1.2);
      }
    }
    for (const p of partsRef.current) {
      const x = p.x * W, y = p.y * H, r = p.r * dpr;
      const col = p.plastic ? "214,248,255" : "190,130,70";
      ctx.fillStyle = `rgba(${col},${p.seen ? 1 : 0.55})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      if (p.seen) {
        const s = r * 2.2 + 5 * dpr, l = s * 0.5;
        ctx.strokeStyle = p.plastic ? "rgba(57,225,122,.95)" : "rgba(255,154,46,.95)";
        ctx.lineWidth = 1.4 * dpr;
        ctx.beginPath();
        ctx.moveTo(x - s, y - s + l); ctx.lineTo(x - s, y - s); ctx.lineTo(x - s + l, y - s);
        ctx.moveTo(x + s - l, y - s); ctx.lineTo(x + s, y - s); ctx.lineTo(x + s, y - s + l);
        ctx.moveTo(x + s, y + s - l); ctx.lineTo(x + s, y + s); ctx.lineTo(x + s - l, y + s);
        ctx.moveTo(x - s + l, y + s); ctx.lineTo(x - s, y + s); ctx.lineTo(x - s, y + s - l);
        ctx.stroke();
      }
    }
  }, [glare, phase]);

  // Build a new sample whenever the inputs change.
  useEffect(() => {
    const rnd = rand(plastic * 131 + debris * 977 + (glare ? 7 : 3));
    const ps: Part[] = [];
    const place = (isPlastic: boolean) => {
      for (let k = 0; k < 40; k++) {
        const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 0.42;
        const x = 0.5 + Math.cos(a) * d, y = 0.5 + Math.sin(a) * d;
        if (glare && Math.hypot(x - 0.36, y - 0.58) < 0.08) continue; // keep particles out of the glare
        ps.push({ x, y, r: isPlastic ? 1.4 + rnd() * 2.4 : 3.2 + rnd() * 3, plastic: isPlastic, seen: false, score: isPlastic ? 0.6 + rnd() * 0.38 : 0.1 + rnd() * 0.25 });
        return;
      }
    };
    for (let i = 0; i < plastic; i++) place(true);
    for (let i = 0; i < debris; i++) place(false);
    partsRef.current = ps;
    beamRef.current = -1;
    cancelAnimationFrame(rafRef.current);
    queueMicrotask(() => {
      setPhase("ready");
      setLive({ plastic: 0, debris: 0, glare: false, progress: 0 });
    });
  }, [plastic, debris, glare]);

  // Size the canvas to its box.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [draw, phase]);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const scan = () => {
    cancelAnimationFrame(rafRef.current);
    partsRef.current.forEach((p) => (p.seen = false));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduce ? 1 : 1900;
    const t0 = performance.now();
    setPhase("scanning");
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const bx = -0.05 + t * 1.1;
      beamRef.current = bx;
      let pc = 0, dc = 0;
      for (const p of partsRef.current) {
        if (!p.seen && p.x <= bx) p.seen = true;
        if (p.seen) { if (p.plastic) pc++; else dc++; }
      }
      setLive({ plastic: pc, debris: dc, glare: glare && bx >= 0.36, progress: t });
      draw();
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else { beamRef.current = -1; setPhase("done"); }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const applyPreset = (id: string) => {
    const p = presets.find((x) => x.id === id)!;
    setPreset(id); setPlastic(p.plastic); setDebris(p.debris); setGlare(p.glare);
  };

  const res = classify(live.plastic);
  const l1 = phase === "ready" ? "HydroScan Ready" : phase === "scanning" ? "Scanning..." : `${res.level} ${res.pct}% n=${live.plastic}`;
  const l2 = phase === "ready" ? "Press to scan" : phase === "scanning" ? "█".repeat(Math.round(live.progress * 16)).padEnd(16, "·") : res.msg;

  return (
    <div className="sim">
      <div className="sim__dish">
        <canvas ref={canvasRef} role="img" aria-label={`Simulated water sample with ${plastic} plastic particles and ${debris} pieces of sediment${glare ? ", plus an LED reflection" : ""}.`} />
      </div>

      <div className="sim__panel">
        <div className="sim__presets" role="group" aria-label="Sample presets">
          {presets.map((p) => (
            <button key={p.id} type="button" aria-pressed={preset === p.id} onClick={() => applyPreset(p.id)}>{p.label}</button>
          ))}
        </div>
        <div className="slider">
          <label htmlFor="sim-plastic">Plastic particles <output htmlFor="sim-plastic">{plastic}</output></label>
          <input id="sim-plastic" type="range" min={0} max={120} value={plastic} onChange={(e) => { setPreset(""); setPlastic(+e.target.value); }} />
        </div>
        <div className="slider slider--debris">
          <label htmlFor="sim-debris">Sand and plant matter <output htmlFor="sim-debris">{debris}</output></label>
          <input id="sim-debris" type="range" min={0} max={24} value={debris} onChange={(e) => { setPreset(""); setDebris(+e.target.value); }} />
        </div>
        <label className="sim__toggle"><input type="checkbox" checked={glare} onChange={(e) => { setPreset(""); setGlare(e.target.checked); }} /> LED reflection on the water</label>

        <button className="btn" type="button" onClick={scan} disabled={phase === "scanning"}>
          {phase === "done" ? "Scan again" : "Scan sample"}
        </button>

        <div className="sim__result">
          <div className="lcd-bezel">
            <div className="lcd-screen" aria-live="polite" aria-label={`${l1}. ${l2}`}>
              <div style={{ whiteSpace: "pre" }}>{l1.padEnd(16, " ")}</div>
              <div style={{ whiteSpace: "pre" }}>{l2.padEnd(16, " ")}</div>
            </div>
            <div className="lcd-meta">
              <span>Counted {live.plastic}, excluded {live.debris}</span>
              <span>{live.glare ? "Glare masked" : "No glare"}</span>
            </div>
          </div>
          <p className="sim__fine">A browser simulation of the decision step. It uses the device’s fallback rules: fewer than 20 plastic particles is Low, fewer than 60 is Medium, anything above is High. Debris and glare are never counted.</p>
        </div>
      </div>
    </div>
  );
}
