"use client";

import { useEffect, useRef } from "react";

type P = {
  x: number; y: number; vx: number; vy: number; r: number;
  plastic: boolean; glow: number; phase: number; score: number;
};

const SWEEP_MS = 8000;
const PAUSE_MS = 3500;

/**
 * Fixed dark-field background shared by the hero lens and every dark section.
 * A light sheet sweeps across suspended particles; whatever it lights up gets
 * the same box the HydroScan detector draws: green for plastic, orange for debris.
 */
export default function FieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const frameMs = lowPower ? 33 : 0;
    let w = 0, h = 0, dpr = 1;
    let ps: P[] = [];
    let raf = 0;
    let start = performance.now();
    let last = start;
    let visible = true;

    const seed = () => {
      const n = Math.min(lowPower ? 80 : 190, Math.round((w * h) / (lowPower ? 5000 : 6200)));
      ps = Array.from({ length: n }, () => {
        const plastic = Math.random() > 0.18;
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.03, vy: -0.008 - Math.random() * 0.025,
          r: plastic ? 0.7 + Math.random() * Math.random() * 2.3 : 1.8 + Math.random() * 1.8,
          plastic, glow: 0, phase: Math.random() * Math.PI * 2,
          score: plastic ? 0.62 + Math.random() * 0.35 : 0.12 + Math.random() * 0.24,
        };
      });
    };

    const resize = () => {
      const nw = window.innerWidth, nh = window.innerHeight;
      // Address-bar show/hide on phones only changes height: keep the field steady.
      if (nw === w && nh <= h) return;
      const widthChanged = nw !== w;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = nw;
      h = Math.max(nh, widthChanged ? 0 : h);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (widthChanged || !ps.length) seed();
      if (reduced) draw(0, -1, true);
    };

    const box = (p: P) => {
      const s = p.r * 3 + 6;
      const c = p.plastic ? "92,214,245" : "255,170,90";
      const a = Math.min(0.7, p.glow * 1.1);
      ctx.strokeStyle = `rgba(${c},${a})`;
      ctx.lineWidth = 1.2;
      const l = Math.max(4, s * 0.45);
      const x0 = p.x - s, y0 = p.y - s, x1 = p.x + s, y1 = p.y + s;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + l); ctx.lineTo(x0, y0); ctx.lineTo(x0 + l, y0);
      ctx.moveTo(x1 - l, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + l);
      ctx.moveTo(x1, y1 - l); ctx.lineTo(x1, y1); ctx.lineTo(x1 - l, y1);
      ctx.moveTo(x0 + l, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - l);
      ctx.stroke();
      if (p.r > 2.3 && a > 0.45) {
        ctx.fillStyle = `rgba(${c},${a})`;
        ctx.font = "14px VT323, monospace";
        ctx.fillText(p.score.toFixed(2), x1 + 3, y0 + 4);
      }
    };

    const draw = (dt: number, beamX: number, still = false) => {
      ctx.clearRect(0, 0, w, h);
      if (beamX >= 0) {
        const band = Math.max(110, w * 0.08);
        const lead = band * 0.16;
        const g = ctx.createLinearGradient(beamX - band, 0, beamX + lead, 0);
        g.addColorStop(0, "rgba(207,246,255,0)");
        g.addColorStop(0.72, "rgba(207,246,255,0.05)");
        g.addColorStop(0.88, "rgba(207,246,255,0.12)");
        g.addColorStop(1, "rgba(207,246,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(beamX - band, 0, band + lead, h);
      }
      for (const p of ps) {
        if (!still) {
          p.phase += dt * 0.0008;
          p.x += p.vx * dt * 0.06 + Math.sin(p.phase) * 0.018;
          p.y += p.vy * dt * 0.06;
          if (p.y < -8) p.y = h + 8;
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          if (beamX >= 0 && Math.abs(p.x - beamX) < 12) p.glow = 1;
          p.glow = Math.max(0, p.glow - dt * 0.0004);
        } else {
          p.glow = Math.random() < 0.25 ? 0.8 : 0;
        }
        const col = p.plastic ? "214,244,255" : "255,200,140";
        const base = p.plastic ? 0.18 + p.r * 0.06 : 0.22;
        if (p.glow > 0.04) {
          const gr = p.r * (5 + p.glow * 6);
          const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
          rg.addColorStop(0, `rgba(${col},${0.4 * p.glow})`);
          rg.addColorStop(1, `rgba(${col},0)`);
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.arc(p.x, p.y, gr, 0, Math.PI * 2); ctx.fill();
          if (p.glow > 0.12) box(p);
        }
        ctx.fillStyle = `rgba(${col},${Math.min(1, base + p.glow * 0.8)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + p.glow * 0.35), 0, Math.PI * 2); ctx.fill();
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < frameMs) return;
      const dt = Math.min(50, now - last);
      last = now;
      const t = (now - start) % (SWEEP_MS + PAUSE_MS);
      const beamX = t < SWEEP_MS ? -80 + (t / SWEEP_MS) * (w + 160) : -1;
      draw(dt, beamX);
    };

    // Only animate while some dark area (or the hero lens) is on screen.
    const watched = Array.from(document.querySelectorAll("[data-field]"));
    const onScreen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
      const was = visible;
      visible = onScreen.size > 0;
      if (visible && !was) last = performance.now();
    });
    watched.forEach((el) => io.observe(el));

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) { last = performance.now(); start = last; raf = requestAnimationFrame(loop); }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="field" aria-hidden>
      <canvas ref={ref} />
    </div>
  );
}
