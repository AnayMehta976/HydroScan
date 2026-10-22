"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { pipeline } from "@/lib/content";

/** Detection steps with a light line that fills as you scroll through them. */
export default function Pipeline() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  return (
    <ol ref={ref} className="relative grid gap-7 pl-10">
      <span aria-hidden className="absolute top-2 bottom-2 left-[15px] w-px bg-white/10" />
      <motion.span
        aria-hidden
        style={{ scaleY: reduce ? 1 : scaleY }}
        className="absolute top-2 bottom-2 left-[15px] w-px origin-top bg-gradient-to-b from-scatter via-scatter to-white shadow-[0_0_12px_var(--color-scatter)]"
      />
      {pipeline.map((p, i) => (
        <motion.li
          key={p.title}
          className="relative"
          initial={reduce ? false : { opacity: 0.35 }}
          whileInView={{ opacity: 1 }}
          viewport={{ margin: "-45% 0px -40% 0px" }}
          transition={{ duration: 0.4 }}
        >
          <span className="absolute top-0.5 -left-10 grid h-[31px] w-[31px] place-items-center rounded-full bg-abyss font-display text-sm font-semibold text-scatter ring-1 ring-scatter/40">
            {i + 1}
          </span>
          <h4 className="font-display text-xl font-semibold tracking-tight">{p.title}</h4>
          <p className="mt-1 max-w-[52ch] text-mist">{p.body}</p>
        </motion.li>
      ))}
    </ol>
  );
}
