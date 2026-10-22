"use client";

import { useEffect, useRef, useState } from "react";
import type { BuildScene } from "./build-scene";
import { LABELS } from "./build-labels";

const LABEL_W = 262;
const LABEL_H = 50;
const GAP = 10;
const M = 16; // margin inside the frame

/**
 * "The build": an exploded view of the HydroScan prototype.
 * Desktop: scroll drives the explode (progress comes from Choreo's pinned trigger).
 * Phones: it explodes on its own when it comes on screen; tap to put it back together.
 */
export default function Build() {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [exploded, setExploded] = useState(true);
  const [ready, setReady] = useState(false);
  const targetRef = useRef(0);
  const toggleRef = useRef<(v: boolean) => void>(() => {});

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 899px)");
    let scene: BuildScene | null = null;
    let raf = 0;
    let visible = false;
    let disposed = false;
    let e = reduce ? 1 : 0;
    let yaw = 0.62;
    let drag = 0;
    let dragVel = 0;
    let scrollP = 0;
    let autoStart = 0;
    const lines: SVGPolylineElement[] = [];
    const dots: SVGCircleElement[] = [];

    // Desktop: progress from the pinned ScrollTrigger in Choreo.
    const onProgress = (ev: Event) => { scrollP = (ev as CustomEvent<number>).detail; };
    window.addEventListener("build:progress", onProgress);

    toggleRef.current = (v: boolean) => { targetRef.current = v ? 1 : 0; autoStart = 1; };

    // Drag to rotate (horizontal only, so vertical swipes still scroll on phones).
    let down = false, lastX = 0;
    const pd = (ev: PointerEvent) => { if ((ev.target as Element).closest("button")) return; down = true; lastX = ev.clientX; stage.setPointerCapture(ev.pointerId); };
    const pm = (ev: PointerEvent) => { if (!down) return; const dx = ev.clientX - lastX; lastX = ev.clientX; dragVel = dx * 0.008; drag += dragVel; };
    const pu = () => { down = false; };
    stage.addEventListener("pointerdown", pd);
    stage.addEventListener("pointermove", pm);
    stage.addEventListener("pointerup", pu);
    stage.addEventListener("pointercancel", pu);

    const layout = () => {
      if (!scene) return;
      const w = stage.clientWidth, h = stage.clientHeight;
      const anchors = scene.anchors();
      const isSmall = small.matches;
      const svg = svgRef.current!;
      if (!lines.length) {
        LABELS.forEach(() => {
          const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
          const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          c.setAttribute("r", "3.5");
          svg.append(pl, c);
          lines.push(pl);
          dots.push(c);
        });
      }
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      if (isSmall) {
        anchors.forEach((a) => {
          const i = a.n - 1;
          const m = markerRefs.current[i];
          lines[i].style.opacity = "0";
          dots[i].style.opacity = "0";
          if (!m) return;
          const on = a.t > 0.85;
          m.style.transform = `translate(${a.x - 13}px, ${a.y - 13}px) scale(${on ? 1 : 0.4})`;
          m.style.opacity = on ? "1" : "0";
        });
        return;
      }

      // Desktop: two callout columns, sorted by anchor height so leaders don't cross.
      (["left", "right"] as const).forEach((side) => {
        const items = anchors
          .filter((a) => LABELS[a.n - 1].side === side)
          .sort((p, q) => p.y - q.y)
          .map((a) => ({ a, y: Math.min(Math.max(a.y - LABEL_H / 2, M), h - LABEL_H - M) }));
        for (let k = 1; k < items.length; k++) items[k].y = Math.max(items[k].y, items[k - 1].y + LABEL_H + GAP);
        const over = items.length ? items[items.length - 1].y + LABEL_H - (h - M) : 0;
        if (over > 0) for (let k = items.length - 1; k >= 0; k--) {
          items[k].y -= over;
          if (k > 0 && items[k - 1].y > items[k].y - LABEL_H - GAP) items[k - 1].y = items[k].y - LABEL_H - GAP;
        }
        items.forEach(({ a, y }) => {
          const i = a.n - 1;
          const el = labelRefs.current[i];
          const on = a.t > 0.85;
          const x = side === "left" ? M : w - LABEL_W - M;
          if (el) {
            el.style.transform = `translate(${x}px, ${y}px)`;
            el.style.opacity = on ? "1" : "0";
          }
          const ex = side === "left" ? x + LABEL_W + 6 : x - 6;
          const ey = y + LABEL_H / 2;
          const elbow = side === "left" ? ex + 26 : ex - 26;
          lines[i].setAttribute("points", `${ex},${ey} ${elbow},${ey} ${a.x},${a.y}`);
          lines[i].style.opacity = on ? "1" : "0";
          dots[i].setAttribute("cx", String(a.x));
          dots[i].setAttribute("cy", String(a.y));
          dots[i].style.opacity = on ? "1" : "0";
        });
      });
    };

    const size = () => {
      if (!scene) return;
      const dpr = Math.min(window.devicePixelRatio || 1, small.matches ? 1.5 : 2);
      scene.resize(stage.clientWidth, stage.clientHeight, dpr);
    };

    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!scene || !visible) return;
      const dt = Math.min(0.25, (now - last) / 1000); // frame-rate independent, even on slow devices
      last = now;
      const isSmall = small.matches;
      let target: number;
      if (reduce) target = 1;
      else if (isSmall) target = autoStart ? targetRef.current : 0;
      else target = Math.min(1, Math.max(0, (scrollP - 0.04) / 0.62));
      e += (target - e) * (1 - Math.exp(-dt * (isSmall ? 2.4 : 9)));
      if (!down) { dragVel *= Math.exp(-dt * 5); drag += dragVel; }
      const baseYaw = isSmall || reduce ? 0.62 - e * 0.75 + Math.sin(now / 4000) * (reduce ? 0 : 0.08) : 0.62 - scrollP * 0.85;
      yaw += (baseYaw + drag - yaw) * (1 - Math.exp(-dt * 8));
      scene.render(e, yaw, stage.clientWidth, stage.clientHeight);
      layout();
    };

    // Phones: explode automatically the first time it's on screen.
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) last = performance.now();
      if (visible && small.matches && !autoStart && !reduce) {
        window.setTimeout(() => { if (!autoStart) { targetRef.current = 1; autoStart = 1; } }, 500);
      }
    }, { threshold: 0.2 });

    // Load three.js only when the section is getting close.
    const near = new IntersectionObserver(async ([en]) => {
      if (!en.isIntersecting || scene) return;
      near.disconnect();
      const { createBuildScene } = await import("./build-scene");
      if (disposed) return;
      scene = await createBuildScene(Math.min(window.devicePixelRatio || 1, small.matches ? 1.5 : 2));
      if (disposed) { scene.dispose(); return; }
      scene.canvas.className = "build__canvas";
      scene.canvas.setAttribute("aria-hidden", "true");
      stage.prepend(scene.canvas);
      size();
      setReady(true);
      io.observe(stage);
      raf = requestAnimationFrame(loop);
    }, { rootMargin: "800px 0px" });
    near.observe(stage);

    const ro = new ResizeObserver(size);
    ro.observe(stage);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      near.disconnect();
      ro.disconnect();
      window.removeEventListener("build:progress", onProgress);
      stage.removeEventListener("pointerdown", pd);
      stage.removeEventListener("pointermove", pm);
      stage.removeEventListener("pointerup", pu);
      stage.removeEventListener("pointercancel", pu);
      scene?.dispose();
    };
  }, []);

  return (
    <div className="build">
      <div className={`build__stage${ready ? " is-ready" : ""}`} ref={stageRef}
        role="img"
        aria-label={`Exploded 3D view of the HydroScan prototype showing ${LABELS.length} components: ${LABELS.map((l) => l.name).join(", ")}.`}>
        <svg className="build__lines" ref={svgRef} aria-hidden />
        <div className="build__labels" aria-hidden>
          {LABELS.map((l, i) => (
            <div className="bl" key={l.n} ref={(el) => { labelRefs.current[i] = el; }}>
              <b>{String(l.n).padStart(2, "0")}</b>
              <span><strong>{l.name}</strong><small>{l.note}</small></span>
            </div>
          ))}
          {LABELS.map((l, i) => (
            <span className="bm" key={`m${l.n}`} ref={(el) => { markerRefs.current[i] = el; }}>{l.n}</span>
          ))}
        </div>
      </div>
      <button type="button" className="btn build__toggle" onClick={() => { const v = !exploded; setExploded(v); toggleRef.current(v); }}>
        {exploded ? "Put it back together" : "Take it apart"}
      </button>
      <div className="build__foot" aria-hidden>
        <span className="build__hint">Drag the model to rotate it</span>
        <dl className="build__block">
          <div><dt>Drawing</dt><dd>HydroScan prototype</dd></div>
          <div><dt>View</dt><dd>Exploded, not to scale</dd></div>
          <div><dt>Parts</dt><dd>{LABELS.length} main components</dd></div>
        </dl>
      </div>
      <ol className="build__legend">
        {LABELS.map((l) => (
          <li key={l.n}><b>{l.n}</b><span><strong>{l.name}</strong>{l.note}</span></li>
        ))}
      </ol>
    </div>
  );
}
