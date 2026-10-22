"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Github } from "lucide-react";
import { navItems, links } from "@/lib/content";
import { cn } from "@/lib/utils";

export default function Nav() {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-40 px-4">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500",
          scrolled ? "glass-strong" : "border border-transparent",
        )}
      >
        <a href="#top" className="flex items-center gap-2 rounded-full px-3 py-1.5 font-display text-lg font-semibold tracking-tight">
          <Droplet />
          HydroScan
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => (
            <li key={n.id} className="relative">
              <a
                href={`#${n.id}`}
                className={cn(
                  "relative z-10 block rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active === n.id ? "text-foam" : "text-mist hover:text-foam",
                )}
              >
                {n.label}
              </a>
              {active === n.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-foam px-4 py-1.5 text-sm font-semibold text-abyss transition hover:bg-white sm:flex"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <button
            type="button"
            className="rounded-full p-2 text-foam md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass-strong mx-auto mt-2 max-w-6xl rounded-3xl p-3 md:hidden"
          >
            <ul className="grid gap-1">
              {navItems.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-foam hover:bg-white/10"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-foam hover:bg-white/10"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Droplet() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9f7ff" />
          <stop offset="1" stopColor="#3aa7d6" />
        </linearGradient>
      </defs>
      <path d="M12 2.5c3.6 4.6 6.5 8.2 6.5 11.6A6.5 6.5 0 0 1 5.5 14.1C5.5 10.7 8.4 7.1 12 2.5Z" fill="url(#dg)" />
      <circle cx="10" cy="14" r="1.2" fill="#031420" opacity=".55" />
      <circle cx="13.6" cy="16.2" r=".8" fill="#031420" opacity=".55" />
      <circle cx="13" cy="12" r=".6" fill="#031420" opacity=".55" />
    </svg>
  );
}
