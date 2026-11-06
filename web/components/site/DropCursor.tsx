"use client";

import { useEffect, useRef } from "react";

/**
 * The pointer is clear water.
 * - Normally it's a round drop that works as a lens: whatever is under it is magnified
 *   in the middle and bent around the rim (an SVG displacement map in backdrop-filter).
 * - Over anything clickable the drop pulls into the shape of a normal arrow pointer,
 *   still made of clear water, still bending what's under its edges.
 * It wobbles with movement and ripples on click. Chromium gets the refraction; other
 * browsers get the same clear shapes without bending. Mouse and trackpad only.
 */

// only things that do something when clicked: links, enabled buttons and controls
const ACTIONABLE = [
  "a[href]", "button:not(:disabled)", "[role='button']:not([aria-disabled='true'])", "summary", "select:not(:disabled)",
  "input:is([type='checkbox'], [type='radio'], [type='range'], [type='submit'], [type='button']):not(:disabled)",
  "label:has(input:is([type='checkbox'], [type='radio']):not(:disabled))",
].join(", ");
const D = 22;                                     // drop diameter: about the size of a normal pointer
const AW = 32, AH = 44;                           // arrow box (drawn at 0.6×, a normal pointer size)
const AS = 0.6;
const TIP = 2;                                    // arrow tip sits at (2, 2) in its box
const ARROW = "M2 2L2 34L9.5 27L15 39.5L20.5 37L15 25L25 25Z";

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

/** Any shape as thick glass: blur its mask, and bend inwards along the slope of the blur. */
function shapeMap(w: number, h: number, path: string, bezel: number) {
  const s = 4;                                    // work at 4× for a smooth rim
  const W = w * s, H = h * s;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.filter = `blur(${bezel * s}px)`;
  g.scale(s, s);
  g.fillStyle = "#fff";
  g.fill(new Path2D(path));
  const a = g.getImageData(0, 0, W, H).data;
  const hard = document.createElement("canvas");
  hard.width = W; hard.height = H;
  const hg = hard.getContext("2d")!;
  hg.scale(s, s); hg.fill(new Path2D(path));
  const inside = hg.getImageData(0, 0, W, H).data;
  const out = g.createImageData(W, H);
  const at = (x: number, y: number) => a[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4 + 3] / 255;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = (y * W + x) * 4;
      let ox = 0, oy = 0;
      if (inside[k + 3] > 0) {
        const gx = at(x + 2, y) - at(x - 2, y), gy = at(x, y + 2) - at(x, y - 2);
        ox = gx * 2.2; oy = gy * 2.2;               // slope points inwards: sample from inside
      }
      out.data[k] = 128 + 127 * Math.max(-1, Math.min(1, ox));
      out.data[k + 1] = 128 + 127 * Math.max(-1, Math.min(1, oy));
      out.data[k + 2] = 128;
      out.data[k + 3] = 255;
    }
  }
  const o = document.createElement("canvas");
  o.width = W; o.height = H;
  o.getContext("2d")!.putImageData(out, 0, 0);
  return o.toDataURL();
}

function filterMarkup(id: string, w: number, h: number, href: string, scale: number) {
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB">` +
    `<feImage href="${href}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale.toFixed(1)}" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter>`;
}

export default function DropCursor() {
  const dropRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || !dropRef.current || !arrowRef.current) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drop = dropRef.current, arrow = arrowRef.current;
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
        filterMarkup("drop-lens", D, D, lensMap(D, D * 1.1), D * 1.1) +
        filterMarkup("arrow-lens", AW, AH, shapeMap(AW, AH, ARROW, 2.4), 22);
      document.body.appendChild(svg);
      drop.classList.add("is-lens"); arrow.classList.add("is-lens");
    }

    let x = -200, y = -200, vx = 0, vy = 0, lastT = performance.now();
    let sx = 1, sy = 1, ang = 0, squash = 0;
    let m = 0, mv = 0, target = 0;                 // 0 = round drop, 1 = water arrow (spring)
    let shown = false, raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now(), dt = Math.min(50, now - lastT) || 16;
      lastT = now;
      vx *= Math.pow(0.85, dt / 16); vy *= Math.pow(0.85, dt / 16);
      const speed = Math.hypot(vx, vy);
      squash *= 0.84;
      const st = reduce ? 0 : Math.min(0.16, speed * 0.08);
      if (speed > 0.02) ang = (Math.atan2(vy, vx) * 180) / Math.PI;
      sx += (1 + st - sx) * 0.3; sy += (1 - st * 0.6 - sy) * 0.3;

      // springy morph, so the water overshoots a little as it changes shape
      if (reduce) m = target;
      else { mv += (target - m) * 0.22; mv *= 0.68; m += mv; }
      const mc = Math.min(1, Math.max(0, m));

      // the drop shrinks into the tip as the arrow grows out of it
      const ds = (1 - squash * 0.18) * (1 - 0.75 * mc);
      drop.style.opacity = String(1 - mc);
      drop.style.transform =
        `translate3d(${x - D / 2}px, ${y - D / 2}px, 0) rotate(${ang}deg) scale(${(sx * ds).toFixed(3)}, ${(sy * ds).toFixed(3)}) rotate(${-ang}deg)`;
      const as = AS * (0.45 + 0.55 * m) * (1 - squash * 0.12);
      arrow.style.opacity = String(mc);
      arrow.style.transform = `translate3d(${x - TIP}px, ${y - TIP}px, 0) scale(${as.toFixed(3)})`;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const now = performance.now(), dt = Math.max(1, now - lastT);
      if (shown) { vx = vx * 0.6 + ((e.clientX - x) / dt) * 0.4; vy = vy * 0.6 + ((e.clientY - y) / dt) * 0.4; }
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; root.classList.add("drop-on"); }
      target = (e.target as Element | null)?.closest?.(ACTIONABLE) ? 1 : 0;
    };
    const leave = (e: MouseEvent) => { if (!e.relatedTarget) { shown = false; root.classList.remove("drop-on"); } };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      squash = 1;
      if (reduce) return;
      const r = document.createElement("span");
      r.className = "drop-ripple";
      r.style.left = `${e.clientX}px`; r.style.top = `${e.clientY}px`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 700);
    };

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("mouseout", leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      document.removeEventListener("mouseout", leave);
      svg?.remove();
      root.classList.remove("has-drop", "drop-on");
    };
  }, []);

  return (
    <>
      <div className="drop" ref={dropRef} aria-hidden />
      <div className="water-arrow" ref={arrowRef} aria-hidden>
        <svg viewBox={`0 0 ${AW} ${AH}`} width={AW} height={AH}>
          <defs>
            <linearGradient id="wa-sheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".55" />
              <stop offset=".45" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#bfeaff" stopOpacity=".25" />
            </linearGradient>
          </defs>
          <path d={ARROW} fill="url(#wa-sheen)" />
          <path d={ARROW} fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.6" strokeLinejoin="round" />
          <path d={ARROW} fill="none" stroke="#08131f" strokeOpacity=".55" strokeWidth=".8" strokeLinejoin="round" transform="translate(-.15 -.1)" />
          <ellipse cx="5.6" cy="13" rx="1.4" ry="5.5" fill="#fff" fillOpacity=".85" />
        </svg>
      </div>
    </>
  );
}
