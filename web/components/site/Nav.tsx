"use client";

import { useEffect, useState } from "react";
import { navItems, links } from "@/lib/content";

export function LensMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="13" fill="#06263a" />
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="11" cy="12" r="1.6" fill="#cff6ff" />
      <circle cx="19.5" cy="19" r="1.2" fill="#cff6ff" />
      <circle cx="20" cy="11" r="1.6" fill="#ff9a2e" />
      <path d="M8.2 16.5v-3.2h3.2M23.8 16.5v3.2h-3.2" stroke="#5cd6f5" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const wide = window.matchMedia("(min-width: 1101px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => { window.removeEventListener("keydown", onKey); wide.removeEventListener("change", onWide); };
  }, []);

  return (
    <header className={`nav${open ? " is-open" : ""}`}>
      <div className="nav__bar">
        <a className="nav__logo" href="#top" aria-label="HydroScan, back to top">
          <LensMark />
          HydroScan
        </a>
        <nav aria-label="Sections">
          <ul className="nav__links">
            {navItems.map((n) => (
              <li key={n.id}><a href={`#${n.id}`} data-nav-link>{n.label}</a></li>
            ))}
          </ul>
        </nav>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a className="btn nav__cta" href={links.github} target="_blank" rel="noreferrer">GitHub</a>
          <button
            className="nav__toggle" type="button" aria-expanded={open} aria-controls="nav-menu"
            aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
        <div className="nav__progress" aria-hidden><i data-nav-progress /></div>
      </div>
      <div className="nav__menu" id="nav-menu">
        {navItems.map((n) => (
          <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>{n.label}</a>
        ))}
      </div>
    </header>
  );
}
