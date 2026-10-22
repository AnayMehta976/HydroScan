"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/** All scroll choreography for the page (GSAP + ScrollTrigger + Lenis). */
export default function Choreo() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    const q = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as T | null;
    const qa = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll(s)) as T[];

    /* ---------- Smooth scroll + anchors ---------- */
    let lenis: Lenis | null = null;
    if (!reduce) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(() => { gsap.ticker.remove(tick); lenis!.destroy(); });
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      const target = id === "#top" ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = id === "#top" ? 0 : (target as HTMLElement).getBoundingClientRect().top + window.scrollY - 80;
      if (lenis) lenis.scrollTo(top);
      else window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);
    cleanups.push(() => document.removeEventListener("click", onClick));

    /* ---------- Hero lens geometry (runs even with reduced motion) ---------- */
    const paper = q("[data-hero-paper]");
    const lensEl = q("[data-lens]");
    const geo = { x: 0, y: 0, r: 0, max: 0 };
    const lens = { open: reduce ? 1 : 0, t: 0 };
    const measure = () => {
      if (!paper || !lensEl) return;
      const hr = paper.getBoundingClientRect();
      const lr = lensEl.getBoundingClientRect();
      geo.x = lr.left - hr.left + lr.width / 2;
      geo.y = lr.top - hr.top + lr.height / 2;
      geo.r = lr.width / 2;
      geo.max = Math.hypot(Math.max(geo.x, hr.width - geo.x), Math.max(geo.y, hr.height - geo.y)) + 24;
    };
    const apply = () => {
      if (!paper) return;
      const r = geo.r * lens.open + (geo.max - geo.r) * lens.t;
      paper.style.setProperty("--lx", `${geo.x}px`);
      paper.style.setProperty("--ly", `${geo.y}px`);
      paper.style.setProperty("--lr", `${Math.max(0, r)}px`);
    };
    const remeasure = () => { measure(); apply(); };
    remeasure();
    window.addEventListener("resize", remeasure);
    ScrollTrigger.addEventListener("refresh", remeasure);
    cleanups.push(() => { window.removeEventListener("resize", remeasure); ScrollTrigger.removeEventListener("refresh", remeasure); });

    const ctx = gsap.context(() => {
      /* ---------- Hero load: the iris opens ---------- */
      if (!reduce) {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .to(lens, { open: 1, duration: 1.4, ease: "expo.inOut", onUpdate: apply }, 0.1)
          .from(".lens__ring", { rotation: -120, scale: 0.85, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.1)
          .from("[data-hero-copy] > *", { y: 34, opacity: 0, stagger: 0.09, duration: 0.9 }, 0.35)
          .from("[data-hero-lcd]", { y: 24, opacity: 0, duration: 0.8 }, 0.9);
      }

      const mm = gsap.matchMedia();
      cleanups.push(() => mm.revert());
      mm.add({ desktop: "(min-width: 900px)", mobile: "(max-width: 899px)", motion: "(prefers-reduced-motion: no-preference)" }, (c) => {
        const { desktop, motion } = c.conditions as { desktop: boolean; mobile: boolean; motion: boolean };

        /* Pipeline monitor (also used without motion: show the final stage) */
        const imgs = qa<HTMLImageElement>("[data-pipe-img]");
        const pSteps = qa(".pipe-step");
        const scanLine = q(".monitor__scan");
        const hudStage = q("[data-pipe-stage]");
        const hudCount = q("[data-pipe-count]");
        const finalCount = q("[data-pipe-final]")?.getAttribute("data-pipe-final") ?? "";
        const N = imgs.length;
        const renderPipe = (x: number) => {
          let active = 0;
          let scanY = -1;
          for (let k = 1; k < N; k++) {
            const p = gsap.utils.clamp(0, 1, (x - (k - 1) - 0.2) / 0.6);
            imgs[k].style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
            if (p > 0 && p < 1) scanY = p;
            if (p >= 0.5) active = k;
          }
          if (scanLine) { scanLine.style.opacity = scanY >= 0 ? "1" : "0"; scanLine.style.top = `${Math.max(0, scanY) * 100}%`; }
          pSteps.forEach((s, k) => s.classList.toggle("on", k === active));
          if (hudStage) hudStage.textContent = `stage ${active + 1}/${N}`;
          if (hudCount) hudCount.textContent = active === N - 1 ? finalCount : "";
        };

        if (!motion) { renderPipe(N - 1); return; }
        let stopCycle: (() => void) | null = null;

        /* ---------- Hero scroll: fall into the lens ---------- */
        const heroTl = gsap.timeline({
          scrollTrigger: { trigger: "[data-hero]", start: "top top", end: desktop ? "+=130%" : "bottom top", scrub: 0.6, pin: desktop, anticipatePin: 1 },
        });
        heroTl
          .to(lens, { t: 1, ease: "power2.in", duration: 1, onUpdate: apply }, 0)
          .to("[data-hero-copy]", { opacity: 0, x: desktop ? -80 : 0, y: desktop ? 0 : -40, duration: 0.45 }, 0)
          .to(".lens__ring", { scale: 2.6, opacity: 0, duration: 0.6, ease: "power1.in" }, 0)
          .to(".lens__label", { opacity: 0, duration: 0.2 }, 0)
          .to("[data-hero-lcd]", { opacity: 0, y: 40, duration: 0.35 }, 0)
          .to(".hero__hint", { opacity: 0, duration: 0.15 }, 0)
          .to("[data-hero-dive]", { opacity: 1, duration: 0.25 }, 0.72)
          .from("[data-hero-dive] p", { scale: 0.86, duration: 0.28 }, 0.72);

        /* ---------- Problem: the detector finds microplastics everywhere ---------- */
        const words = qa(".found__word");
        const box = q(".found__box");
        const tag = q(".found__tag");
        if (desktop && words.length && box && tag) {
          let cur = 0;
          words.forEach((w, i) => gsap.set(w, { opacity: i ? 0 : 1, yPercent: 0 }));
          gsap.set(box, { width: words[0].offsetWidth + 32 });
          tag.textContent = `detected 1/${words.length}`;
          const swap = (i: number) => {
            const dir = i > cur ? 1 : -1;
            gsap.to(words[cur], { opacity: 0, yPercent: -35 * dir, duration: 0.45, ease: "power2.in", overwrite: true });
            gsap.fromTo(words[i], { opacity: 0, yPercent: 35 * dir }, { opacity: 1, yPercent: 0, duration: 0.7, delay: 0.2, ease: "power3.out", overwrite: true });
            gsap.to(box, { width: words[i].offsetWidth + 32, duration: 0.7, delay: 0.1, ease: "power3.inOut", overwrite: true });
            gsap.fromTo(box, { scale: 1.06 }, { scale: 1, duration: 0.4, ease: "power2.out" });
            tag.textContent = `detected ${i + 1}/${words.length}`;
            cur = i;
          };
          ScrollTrigger.create({
            trigger: "[data-found-pin]", start: "top top", end: `+=${words.length * 85}%`, pin: true, anticipatePin: 1,
            onUpdate: (self) => {
              const i = Math.min(words.length - 1, Math.floor(self.progress * words.length));
              if (i !== cur) swap(i);
            },
          });
        } else {
          gsap.from(".found__list li", { y: 30, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: ".found__list", start: "top 85%" } });
        }

        qa("[data-reveal-words]").forEach((p) => {
          const text = p.textContent?.trim() ?? "";
          p.setAttribute("aria-label", text);
          p.innerHTML = text.split(/\s+/).map((w) => `<span class="w" aria-hidden="true" style="opacity:.15">${w}</span>`).join(" ");
          gsap.to(p.querySelectorAll(".w"), { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 50%", scrub: true } });
        });

        gsap.from(".table-card tbody tr", { x: 40, opacity: 0, stagger: 0.07, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: ".table-card", start: "top 80%" } });

        /* ---------- How it works: the device diagram ---------- */
        const dg = q<SVGSVGElement>("[data-diagram]");
        const steps = qa(".step");
        const setStep = (i: number) => {
          dg?.setAttribute("class", `diagram s${i + 1}`);
          steps.forEach((s, k) => s.classList.toggle("on", k === i));
        };
        setStep(0);
        gsap.fromTo(".diagram .draw", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.2, ease: "power2.inOut", scrollTrigger: { trigger: "[data-diagram]", start: "top 85%" } });
        if (desktop) {
          let cur = 0;
          ScrollTrigger.create({
            trigger: "[data-how-pin]", start: "center center+=30", end: `+=${steps.length * 42}%`, pin: true, anticipatePin: 1,
            onUpdate: (self) => {
              const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
              if (i !== cur) { cur = i; setStep(i); }
            },
          });
        } else {
          // Phones: no pinning; the diagram steps through on its own while it's on screen.
          let i = 0, timer = 0;
          const io = new IntersectionObserver(([e]) => {
            window.clearInterval(timer);
            if (e.isIntersecting) timer = window.setInterval(() => { i = (i + 1) % steps.length; setStep(i); }, 2300);
          }, { threshold: 0.3 });
          if (dg) io.observe(dg);
          stopCycle = () => { io.disconnect(); window.clearInterval(timer); };
        }

        /* ---------- Pipeline: scan through every stage ---------- */
        renderPipe(0);
        ScrollTrigger.create({
          trigger: desktop ? "[data-pipe-pin]" : ".monitor",
          start: desktop ? "center center+=30" : "top 65%",
          end: desktop ? `+=${N * 45}%` : `+=${N * 140}`,
          pin: desktop ? "[data-pipe-pin]" : false,
          anticipatePin: 1,
          scrub: true,
          onUpdate: (self) => renderPipe(self.progress * (N - 1)),
        });

        /* ---------- Vials fill ---------- */
        qa(".vial-card").forEach((card) => {
          const st = { trigger: card, start: "top 88%", end: "top 40%", scrub: 0.6 };
          gsap.fromTo(card.querySelector(".vial-water"), { scaleY: 0 }, { scaleY: 1, transformOrigin: "50% 100%", ease: "power2.out", scrollTrigger: st });
          gsap.fromTo(card.querySelectorAll(".vial-dot"), { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, stagger: { each: 0.02, from: "random" }, ease: "back.out(2)", scrollTrigger: st });
        });

        /* ---------- The build: scroll explodes the 3D model ---------- */
        if (desktop && q("[data-build-pin]")) {
          ScrollTrigger.create({
            trigger: "[data-build-pin]", start: "center center+=30", end: "+=230%", pin: true, anticipatePin: 1, scrub: true,
            onUpdate: (self) => window.dispatchEvent(new CustomEvent("build:progress", { detail: self.progress })),
          });
        }

        /* ---------- Field tray: horizontal glass slides ---------- */
        const track = q("[data-tray-track]");
        if (desktop && track) {
          const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
          const trayTween = gsap.to(track, {
            x: () => -dist(), ease: "none",
            scrollTrigger: { trigger: "[data-tray]", start: "center center+=30", end: () => `+=${dist()}`, pin: "[data-tray-section]", scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
          });
          gsap.to("[data-tray-progress]", { scaleX: 1, ease: "none", scrollTrigger: { trigger: "[data-tray]", start: "center center+=30", end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true } });
          qa(".slide").forEach((s, i) => {
            gsap.from(s, { y: 60, rotation: i % 2 ? 3 : -3, ease: "none", scrollTrigger: { trigger: s, containerAnimation: trayTween, start: "left right", end: "left 60%", scrub: true } });
          });
        } else {
          qa(".slide").forEach((s, i) => gsap.from(s, { y: 50, rotation: i % 2 ? 2 : -2, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: s, start: "top 90%" } }));
        }

        /* ---------- Small reveals ---------- */
        gsap.fromTo(".checks path", { strokeDasharray: 30, strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: ".checks", start: "top 80%" } });
        qa(".bom li .bar i").forEach((b, i) => gsap.from(b, { scaleX: 0, duration: 1, delay: i * 0.05, ease: "power3.out", scrollTrigger: { trigger: b, start: "top 92%" } }));
        gsap.from(".margin__bar i", { scaleX: 0, transformOrigin: "left center", duration: 1, stagger: 0.4, ease: "power3.out", scrollTrigger: { trigger: ".margin__bar", start: "top 85%" } });
        qa("[data-rise]").forEach((el, i) => gsap.from(el, { y: 60, opacity: 0, rotation: i % 2 ? 1.2 : -1.2, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
        qa(".h2").forEach((h) => gsap.from(h, { yPercent: 35, opacity: 0, duration: 0.8, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 88%" } }));
        gsap.to(".footer__lens svg", { rotation: 180, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });
        gsap.from(".footer__lens", { scale: 0.4, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: ".footer", start: "top 85%", end: "top 40%", scrub: true } });

        return () => stopCycle?.();
      });

      /* ---------- Counters ---------- */
      qa("[data-count]").forEach((el) => {
        const end = parseFloat(el.getAttribute("data-count") || "0");
        const dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
        const fmt = el.hasAttribute("data-format");
        const pre = el.getAttribute("data-prefix") || "";
        const suf = el.getAttribute("data-suffix") || "";
        const write = (v: number) => { el.textContent = pre + (fmt ? Math.round(v).toLocaleString("en-IN") : dec ? v.toFixed(dec) : String(Math.round(v))) + suf; };
        if (reduce) { write(end); return; }
        const o = { v: 0 };
        write(0);
        gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: () => write(o.v), scrollTrigger: { trigger: el, start: "top 92%", once: true } });
      });

      /* ---------- Nav: progress + active section (after pins exist) ---------- */
      gsap.to("[data-nav-progress]", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      const links = qa<HTMLAnchorElement>("[data-nav-link]");
      links.forEach((a) => {
        const sec = document.querySelector(a.getAttribute("href")!);
        if (!sec) return;
        ScrollTrigger.create({
          trigger: sec, start: "top 45%", end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) links.forEach((l) => l.classList.toggle("is-active", l === a));
            else a.classList.remove("is-active");
          },
        });
      });
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    cleanups.push(() => window.removeEventListener("load", onLoad));
    // Fonts change text widths (and the problem box), so refresh once they're in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
      cleanups.forEach((f) => f());
    };
  }, []);

  return null;
}
