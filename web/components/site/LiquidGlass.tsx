"use client";

import { useEffect } from "react";

/**
 * Liquid glass: every glass surface gets its own SVG displacement map, sized to
 * the element, so the background bends at the rounded edges like a thick lens.
 * Chromium is the only engine that renders SVG filters in backdrop-filter, so other
 * browsers (and phones, for performance) keep the frosted-glass fallback in CSS.
 */

const SURFACES = [
  ".nav__bar", ".nav__menu", ".btn", ".chip", ".panel", ".table-card", ".vial-card", ".stats",
  ".user", ".diagram-card", ".step", ".impact__stat", ".impact__point", ".pipe-step", ".slide",
  ".photo__hint", ".demo__play", ".build__block",
].join(",");

type MapKey = string;

function radiusOf(el: HTMLElement, w: number, h: number) {
  const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  return Math.min(r, w / 2, h / 2);
}

/** Displacement map for a rounded rectangle: neutral grey inside, bending towards the rim. */
function makeMap(w: number, h: number, r: number, bezel: number) {
  const s = 0.5;                                     // half-resolution map, stretched back up
  const W = Math.max(2, Math.round(w * s)), H = Math.max(2, Math.round(h * s));
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const img = g.createImageData(W, H);
  const hx = w / 2, hy = h / 2, rr = Math.max(0.001, r);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const px = (i + 0.5) / s - hx, py = (j + 0.5) / s - hy;
      const ax = Math.abs(px), ay = Math.abs(py);
      const qx = ax - (hx - rr), qy = ay - (hy - rr);
      let dist: number, nx: number, ny: number;     // distance inside the edge, outward normal
      if (qx > 0 && qy > 0) {
        const L = Math.hypot(qx, qy) || 1;
        dist = rr - L; nx = qx / L; ny = qy / L;
      } else if (qx > qy) {
        dist = hx - ax; nx = 1; ny = 0;
      } else {
        dist = hy - ay; nx = 0; ny = 1;
      }
      nx *= Math.sign(px) || 1; ny *= Math.sign(py) || 1;
      const t = Math.min(1, Math.max(0, dist / bezel));
      const m = dist < 0 ? 0 : Math.pow(1 - t, 2.4);
      const k = (j * W + i) * 4;
      // sample from further inside near the rim: the edge magnifies and bends like a lens
      img.data[k] = 128 - 127 * m * nx;
      img.data[k + 1] = 128 - 127 * m * ny;
      img.data[k + 2] = 128;
      img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}

export default function LiquidGlass() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("lg");

    const ua = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData;
    const chromium = !!ua?.brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
    const fine = matchMedia("(pointer: fine) and (min-width: 900px)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!chromium || !fine || reduce) return;

    root.classList.add("lg-refract");
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    document.body.appendChild(svg);

    const filters = new Map<MapKey, string>();
    let n = 0;
    const filterFor = (w: number, h: number, r: number, strong = false) => {
      const W = Math.round(w / 4) * 4, H = Math.round(h / 4) * 4, R = Math.round(r);
      const key = `${W}x${H}r${R}${strong ? "s" : ""}`;
      const hit = filters.get(key);
      if (hit) return hit;
      const short = Math.min(W, H);
      // the nav is the showpiece: a thick, clear lens; cards bend more gently at their rims
      const bezel = strong ? short * 0.5 : Math.max(10, Math.min(54, short * 0.36, R * 1.4 + 14));
      const scale = strong ? short * 1.15 : Math.max(18, Math.min(72, short * 0.6));
      const id = `lg-${n++}`;
      const f = document.createElementNS(NS, "filter");
      f.setAttribute("id", id);
      f.setAttribute("filterUnits", "userSpaceOnUse");
      f.setAttribute("x", "0"); f.setAttribute("y", "0");
      f.setAttribute("width", String(W)); f.setAttribute("height", String(H));
      f.setAttribute("color-interpolation-filters", "sRGB");
      f.innerHTML =
        `<feImage href="${makeMap(W, H, R, bezel)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" result="map"/>` +
        `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale.toFixed(0)}" xChannelSelector="R" yChannelSelector="G"/>`;
      svg.appendChild(f);
      filters.set(key, id);
      return id;
    };

    const apply = (el: HTMLElement) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (w < 8 || h < 8) return;
      el.style.setProperty("--lg-url", `url(#${filterFor(w, h, radiusOf(el, w, h), el.matches(".nav__bar, .nav__menu"))})`);
    };

    const ro = new ResizeObserver((entries) => entries.forEach((e) => apply(e.target as HTMLElement)));
    const watch = () => document.querySelectorAll<HTMLElement>(SURFACES).forEach((el) => {
      if (el.dataset.lg) return;
      el.dataset.lg = "1";
      ro.observe(el);
    });
    watch();
    // some surfaces change shape when they switch on (steps), so re-measure on class changes
    const mo = new MutationObserver((ms) => {
      ms.forEach((m) => { if (m.type === "attributes" && m.target instanceof HTMLElement && m.target.dataset.lg) apply(m.target); });
      watch();
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });

    // the clear nav shows the page through it, so its text follows the section underneath
    const nav = document.querySelector<HTMLElement>(".nav__bar");
    let navRaf = 0;
    const navTone = () => {
      navRaf = 0;
      if (!nav) return;
      const r = nav.getBoundingClientRect();
      const under = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        .find((e) => !e.closest(".nav") && !e.closest(".drop, .water-arrow"));
      root.classList.toggle("nav-dark", !!under?.closest(".dark, .hero__dive, .field"));
    };
    const onScroll = () => { if (!navRaf) navRaf = requestAnimationFrame(navTone); };
    addEventListener("scroll", onScroll, { passive: true });
    navTone();

    // fonts, images and pinned sections settle after first paint: measure everything again then
    const all = () => document.querySelectorAll<HTMLElement>("[data-lg]").forEach(apply);
    let t = 0;
    const later = () => { clearTimeout(t); t = window.setTimeout(all, 150); };
    addEventListener("load", later);
    addEventListener("resize", later);
    document.fonts?.ready.then(later);
    const timers = [800, 2500].map((ms) => window.setTimeout(all, ms));

    return () => {
      root.classList.remove("lg");
      ro.disconnect(); mo.disconnect(); svg.remove(); root.classList.remove("lg-refract");
      removeEventListener("load", later); removeEventListener("resize", later);
      removeEventListener("scroll", onScroll); root.classList.remove("nav-dark");
      clearTimeout(t); timers.forEach(clearTimeout);
    };
  }, []);
  return null;
}
