"use client";

import { useRef, useState, type PointerEvent } from "react";

/** A photo you can inspect with a magnifying loupe (mouse and pen only). */
export default function LoupePhoto({
  src, alt, width, height, caption, zoom = 2.6,
}: { src: string; alt: string; width: number; height: number; caption: string; zoom?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState<{ x: number; y: number; on: boolean; bw: number; bh: number }>({ x: 0, y: 0, on: false, bw: 0, bh: 0 });

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setSt({ x: e.clientX - r.left, y: e.clientY - r.top, on: true, bw: r.width, bh: r.height });
  };

  return (
    <figure className="photo" data-rise>
      <div ref={ref} style={{ position: "relative" }} onPointerMove={move} onPointerLeave={() => setSt((s) => ({ ...s, on: false }))}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={width} height={height} loading="lazy" />
        <span className="photo__hint" aria-hidden>Hover to inspect</span>
        <span
          className={`loupe${st.on ? " on" : ""}`}
          aria-hidden
          style={{
            left: st.x, top: st.y,
            backgroundImage: `url(${src})`,
            backgroundSize: `${st.bw * zoom}px ${st.bh * zoom}px`,
            backgroundPosition: `${-(st.x * zoom - 85)}px ${-(st.y * zoom - 85)}px`,
          }}
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
