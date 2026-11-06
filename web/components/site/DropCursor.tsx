"use client";

import { useEffect, useRef } from "react";

/**
 * The pointer is an adaptive lens of clear water.
 * - A small dot marks the exact click point; the lens follows it with a little lag.
 * - The lens magnifies whatever is under it and bends it around the rim (an SVG
 *   displacement map in backdrop-filter, Chromium); other browsers get clear glass.
 * - It adapts to what it's over: it grows with the size of the text under it, its rim
 *   switches between light and dark backgrounds, and over anything that does something
 *   when clicked it drains away and the normal hand pointer takes over.
 * - It stretches with movement, jiggles back to round, sheds droplets on fast flicks,
 *   and squashes on click. Mouse and trackpad only.
 */

// only things that do something when clicked: links, enabled buttons and controls
const ACTIONABLE = [
  "a[href]", "button:not(:disabled)", "[role='button']:not([aria-disabled='true'])", "summary", "select:not(:disabled)",
  "input:is([type='checkbox'], [type='radio'], [type='range'], [type='submit'], [type='button']):not(:disabled)",
  "label:has(input:is([type='checkbox'], [type='radio']):not(:disabled))",
].join(", ");
const D = 72;                                     // the lens is drawn at its largest and scaled down
const REST = 24;                                  // resting size: a little bigger than a normal pointer
const TEXTY = "p, h1, h2, h3, h4, li, dd, dt, figcaption, blockquote, span, b, strong, em, small, td, th, label";
const DARK = ".dark, .field, .demo, .monitor, .lens, .sim__dish, .code, .lcd-bezel";

/** Round lens: sample towards the centre, gently in the middle and strongly at the rim. */
function lensMap(size: number, scale: number) {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  const R = size / 2;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const dx = i + 0.5 - R, dy = j + 0.5 - R;
      const r = Math.hypot(dx, dy) / R;
      let ox = 0, oy = 0;
      if (r < 1) {
        const f = 0.2 + 0.5 * Math.pow(r, 2.4);
        ox = -dx * f; oy = -dy * f;
      }
      const k = (j * size + i) * 4;
      img.data[k] = 128 + (255 * ox) / scale;
      img.data[k + 1] = 128 + (255 * oy) / scale;
      img.data[k + 2] = 128;
      img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}

function filterMarkup(id: string, w: number, h: number, href: string, scale: number) {
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB">` +
    `<feImage href="${href}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale.toFixed(1)}" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter>`;
}

export default function DropCursor() {
  const dropRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || !dropRef.current || !dotRef.current) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drop = dropRef.current, dot = dotRef.current;
    const root = document.documentElement;
    root.classList.add("has-drop");

    const ua = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData;
    const chromium = !!ua?.brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
    let svg: SVGSVGElement | null = null;
    let dispMap: Element | null = null;
    if (chromium) {
      const NS = "http://www.w3.org/2000/svg";
      svg = document.createElementNS(NS, "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      svg.innerHTML =
        filterMarkup("drop-lens", D, D, lensMap(D, D * 1.1), D * 1.1);
      dispMap = svg.querySelector("feDisplacementMap");
      document.body.appendChild(svg);
      drop.classList.add("is-lens");
    }

    let x = -200, y = -200, vx = 0, vy = 0, lastT = performance.now();
    let lx = -200, ly = -200;                      // where the lens is (it trails the dot)
    let size = REST, sizeV = 0, sizeT = REST;      // lens size, as a spring
    let dx = 0, dy = 0, dvx = 0, dvy = 0;          // stretch and its velocity
    let z = 1, zv = 0;                             // click squash
    let hover = false, shown = false, raf = 0, lastBit = 0, bits = 0, lastScale = 0;

    const spawnBit = (bx: number, by: number, sz: number) => {
      if (bits > 14) return;
      bits++;
      const b = document.createElement("span");
      b.className = "drop-bit";
      b.style.cssText = `left:${bx}px;top:${by}px;width:${sz}px;height:${sz}px;margin:${-sz / 2}px 0 0 ${-sz / 2}px`;
      document.body.appendChild(b);
      setTimeout(() => { b.remove(); bits--; }, 520);
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now(), dt = Math.min(50, now - lastT) || 16;
      const f = dt / 16;
      lastT = now;
      vx *= Math.pow(0.82, f); vy *= Math.pow(0.82, f);
      const speed = Math.hypot(vx, vy);            // px per ms

      if (reduce) { lx = x; ly = y; size = sizeT; }
      else {
        // the lens follows the dot with a soft lag
        const k = 1 - Math.pow(1 - 0.32, f);
        lx += (x - lx) * k; ly += (y - ly) * k;
        // size is a spring, so it swells and settles like liquid
        sizeV += (sizeT - size) * 0.16 * f; sizeV *= Math.pow(0.74, f); size += sizeV * f;
        // stretch follows the velocity, capped, and jiggles back
        let tx = vx * 0.14, ty = vy * 0.14;
        const tm = Math.hypot(tx, ty);
        if (tm > 0.5) { tx *= 0.5 / tm; ty *= 0.5 / tm; }
        dvx += (tx - dx) * 0.2 * f; dvy += (ty - dy) * 0.2 * f;
        dvx *= Math.pow(0.8, f); dvy *= Math.pow(0.8, f);
        dx += dvx * f; dy += dvy * f;
        zv += (1 - z) * 0.24 * f; zv *= Math.pow(0.76, f); z += zv * f;
        if (speed > 0.9 && now - lastBit > 38 && !hover) {
          lastBit = now;
          const n = speed || 1, back = size / 2 + 4 + Math.random() * 6;
          spawnBit(x - (vx / n) * back + (Math.random() - 0.5) * 6, y - (vy / n) * back + (Math.random() - 0.5) * 6, 3 + Math.random() * 4);
        }
      }

      // bigger lens, stronger lens
      if (dispMap && size > 2 && Math.abs(size - lastScale) > 1.5) {
        lastScale = size;
        const strength = 0.7 + 0.3 * Math.min(1, Math.max(0, (size - REST) / (D - REST)));
        dispMap.setAttribute("scale", (D * 1.1 * strength).toFixed(1));
      }

      const mag = Math.hypot(dx, dy);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const along = 1 + mag, across = 1 / Math.sqrt(1 + mag * 1.6);
      const breathe = reduce ? 0 : Math.sin(now / 420) * 0.02;
      const s = Math.max(0.001, size / D);
      drop.style.opacity = String(Math.min(1, Math.max(0, size / REST)));
      dot.style.opacity = hover ? "0" : "1";
      drop.style.transform =
        `translate3d(${lx - D / 2}px, ${ly - D / 2}px, 0) rotate(${ang}deg) ` +
        `scale(${(s * along * (2 - z) * (1 + breathe)).toFixed(4)}, ${(s * across * z * (1 - breathe)).toFixed(4)}) rotate(${-ang}deg)`;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${(hover ? 1.25 : 1) * (0.6 + 0.4 * z)})`;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const now = performance.now(), dt = Math.max(1, now - lastT);
      if (shown) { vx = vx * 0.6 + ((e.clientX - x) / dt) * 0.4; vy = vy * 0.6 + ((e.clientY - y) / dt) * 0.4; }
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; lx = x; ly = y; root.classList.add("drop-on"); }
      const el = e.target as Element | null;
      // adapt to what's underneath
      const act = el?.closest?.(ACTIONABLE) as HTMLElement | null;
      let t = REST;
      if (act) {
        t = 0;                                     // over anything clickable the lens drains away for the normal hand pointer
      } else if (el && el.matches?.(TEXTY) && el.textContent?.trim()) {
        const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
        t = Math.max(REST, Math.min(56, fs * 1.15));
      }
      if (!!act !== hover && !reduce) zv -= 0.14;  // a little wobble whenever it changes
      hover = !!act;
      sizeT = t;
      drop.classList.toggle("is-hover", hover);
      root.classList.toggle("drop-dark", !!el?.closest?.(DARK));
    };
    const leave = (e: MouseEvent) => { if (!e.relatedTarget) { shown = false; root.classList.remove("drop-on"); } };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch" || reduce) return;
      zv -= 0.32;
      const r = document.createElement("span");
      r.className = "drop-ripple";
      r.style.left = `${e.clientX}px`; r.style.top = `${e.clientY}px`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 700);
    };
    const up = () => { if (!reduce) zv += 0.12; };

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    document.addEventListener("mouseout", leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      document.removeEventListener("mouseout", leave);
      svg?.remove();
      root.classList.remove("has-drop", "drop-on", "drop-dark");
    };
  }, []);

  return (
    <>
      <div className="drop" ref={dropRef} aria-hidden />
      <div className="drop-dot" ref={dotRef} aria-hidden />
    </>
  );
}
