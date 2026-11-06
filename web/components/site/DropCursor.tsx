"use client";

import { useEffect, useRef } from "react";

/**
 * The pointer is clear water.
 * - Normally it's a round drop that works as a lens: whatever is under it is magnified
 *   in the middle and bent around the rim (an SVG displacement map in backdrop-filter).
 * - Over anything clickable it shrinks away and the normal pointer takes over.
 * It wobbles with movement and ripples on click. Chromium gets the refraction; other
 * browsers get the same clear shapes without bending. Mouse and trackpad only.
 */

// only things that do something when clicked: links, enabled buttons and controls
const ACTIONABLE = [
  "a[href]", "button:not(:disabled)", "[role='button']:not([aria-disabled='true'])", "summary", "select:not(:disabled)",
  "input:is([type='checkbox'], [type='radio'], [type='range'], [type='submit'], [type='button']):not(:disabled)",
  "label:has(input:is([type='checkbox'], [type='radio']):not(:disabled))",
].join(", ");
const D = 24;                                     // drop diameter: a little bigger than a normal pointer

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
        const f = 0.3 + 0.55 * Math.pow(r, 2.2);
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

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || !dropRef.current) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drop = dropRef.current;
    const root = document.documentElement;
    root.classList.add("has-drop");

    const ua = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData;
    const chromium = !!ua?.brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
    let svg: SVGSVGElement | null = null;
    if (chromium) {
      const NS = "http://www.w3.org/2000/svg";
      svg = document.createElementNS(NS, "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      svg.innerHTML =
        filterMarkup("drop-lens", D, D, lensMap(D, D * 1.1), D * 1.1);
      document.body.appendChild(svg);
      drop.classList.add("is-lens");
    }

    let x = -200, y = -200, vx = 0, vy = 0, lastT = performance.now();
    // the drop's shape is a little spring: it stretches along the movement, overshoots,
    // and jiggles back to round when you stop; a click squashes it like jelly
    let dx = 0, dy = 0, dvx = 0, dvy = 0;          // deformation and its velocity
    let z = 1, zv = 0;                             // click squash
    let m = 0, mv = 0, target = 0;                 // 0 = drop showing, 1 = hidden over a clickable thing (spring)
    let shown = false, raf = 0, lastBit = 0, bits = 0;

    const spawnBit = (bx: number, by: number, size: number) => {
      if (bits > 14) return;
      bits++;
      const b = document.createElement("span");
      b.className = "drop-bit";
      b.style.cssText = `left:${bx}px;top:${by}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px`;
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

      if (!reduce) {
        // stretch target follows the velocity, capped
        let tx = vx * 0.16, ty = vy * 0.16;
        const tm = Math.hypot(tx, ty);
        if (tm > 0.55) { tx *= 0.55 / tm; ty *= 0.55 / tm; }
        dvx += (tx - dx) * 0.2 * f; dvy += (ty - dy) * 0.2 * f;
        dvx *= Math.pow(0.8, f); dvy *= Math.pow(0.8, f);
        dx += dvx * f; dy += dvy * f;
        zv += (1 - z) * 0.24 * f; zv *= Math.pow(0.76, f); z += zv * f;

        // fast flicks shed a few tiny droplets behind it
        if (speed > 0.9 && now - lastBit > 38 && target === 0 && m < 0.2) {
          lastBit = now;
          const back = 8 + Math.random() * 6;
          const n = Math.hypot(vx, vy) || 1;
          spawnBit(x - (vx / n) * back + (Math.random() - 0.5) * 6, y - (vy / n) * back + (Math.random() - 0.5) * 6, 3 + Math.random() * 4);
        }
      }

      // springy morph, so the water overshoots a little as it changes shape
      if (reduce) m = target;
      else { mv += (target - m) * 0.22; mv *= 0.68; m += mv; }
      const mc = Math.min(1, Math.max(0, m));

      // shape: long along the deformation, thinner across it, squashed flat by a click
      const mag = Math.hypot(dx, dy);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const along = 1 + mag, across = 1 / Math.sqrt(1 + mag * 1.6);
      const breathe = reduce ? 0 : Math.sin(now / 420) * 0.025;
      const ds = 1 - mc;                           // over clickable things the drop shrinks away for the normal pointer
      const lagX = -dx * 5, lagY = -dy * 5;        // the body trails a touch behind the tip of the move
      drop.style.opacity = String(1 - mc);
      drop.style.transform =
        `translate3d(${x - D / 2 + lagX}px, ${y - D / 2 + lagY}px, 0) rotate(${ang}deg) ` +
        `scale(${(along * ds * (2 - z) * (1 + breathe)).toFixed(3)}, ${(across * ds * z * (1 - breathe)).toFixed(3)}) rotate(${-ang}deg)`;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const now = performance.now(), dt = Math.max(1, now - lastT);
      if (shown) { vx = vx * 0.6 + ((e.clientX - x) / dt) * 0.4; vy = vy * 0.6 + ((e.clientY - y) / dt) * 0.4; }
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; root.classList.add("drop-on"); }
      const t = (e.target as Element | null)?.closest?.(ACTIONABLE) ? 1 : 0;
      if (t !== target && !reduce && t === 0) zv -= 0.12;   // a little wobble as it comes back
      target = t;
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
      root.classList.remove("has-drop", "drop-on");
    };
  }, []);

  return <div className="drop" ref={dropRef} aria-hidden />;
}
