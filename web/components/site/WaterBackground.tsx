"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  plastic: boolean;
  glow: number;
  phase: number;
};

const SWEEP_MS = 7000;
const PAUSE_MS = 1800;

/**
 * Fixed page background: drifting particles in water, periodically swept by a
 * light sheet that makes them "scatter" — the same principle HydroScan uses.
 * Plastic particles flash cyan-white, organic debris flashes amber.
 */
export default function WaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones and touch devices: draw at ~30fps so the glass panels above stay smooth.
    const lowPower = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const frameMs = lowPower ? 33 : 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let start = performance.now();
    let last = start;

    const seed = () => {
      const count = Math.min(lowPower ? 70 : 240, Math.round((w * h) / (lowPower ? 6000 : 7000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -0.02 - Math.random() * 0.08,
        r: 0.6 + Math.random() * Math.random() * 2.4,
        plastic: Math.random() > 0.28,
        glow: 0,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      // On phones the address bar showing/hiding only changes the height.
      // Keep the existing particles and never shrink, so nothing flickers while scrolling.
      if (nw === w && nh <= h) return;
      const widthChanged = nw !== w;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = nw;
      h = Math.max(nh, widthChanged ? 0 : h);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (widthChanged || particles.length === 0) seed();
      if (reduced) draw(0, -1);
    };

    const draw = (dt: number, beamX: number) => {
      ctx.clearRect(0, 0, w, h);

      if (beamX >= 0) {
        const band = Math.max(120, w * 0.09);
        const lead = band * 0.18;
        const g = ctx.createLinearGradient(beamX - band, 0, beamX + lead, 0);
        g.addColorStop(0, "rgba(159,240,255,0)");
        g.addColorStop(0.7, "rgba(159,240,255,0.06)");
        g.addColorStop(0.86, "rgba(220,250,255,0.13)");
        g.addColorStop(1, "rgba(220,250,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(beamX - band, 0, band + lead, h);
      }

      for (const p of particles) {
        p.phase += dt * 0.0009;
        p.x += p.vx * dt * 0.06 + Math.sin(p.phase) * 0.04;
        p.y += p.vy * dt * 0.06;
        if (p.y < -6) p.y = h + 6;
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;

        if (beamX >= 0 && Math.abs(p.x - beamX) < 14) p.glow = 1;
        p.glow = Math.max(0, p.glow - dt * 0.00055);

        const base = 0.16 + p.r * 0.05;
        const a = Math.min(1, base + p.glow * 0.85);
        const color = p.plastic ? "190,246,255" : "255,190,120";

        if (p.glow > 0.05) {
          const gr = p.r * (5 + p.glow * 7);
          const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
          rg.addColorStop(0, `rgba(${color},${0.45 * p.glow})`);
          rg.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${color},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + p.glow * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < frameMs) return;
      const dt = Math.min(50, now - last);
      last = now;
      const t = (now - start) % (SWEEP_MS + PAUSE_MS);
      const beamX = t < SWEEP_MS ? -80 + (t / SWEEP_MS) * (w + 160) : -1;
      draw(dt, beamX);
    };

    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        start = last;
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#073247_0%,#041b2b_45%,#031420_100%)]" />
      <div className="caustic caustic-a" />
      <div className="caustic caustic-b" />
      <div className="caustic caustic-c" />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_120%,rgba(3,20,32,0.9),transparent)]" />
    </div>
  );
}
