/** A sample vial whose particle density matches a contamination level. */
function lcg(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export default function Vial({ count, seed, label }: { count: number; seed: number; label: string }) {
  const rnd = lcg(seed);
  const dots = Array.from({ length: count }, () => ({
    x: 16 + rnd() * 44,
    y: 70 + rnd() * 140,
    r: 0.9 + rnd() * 1.8,
    debris: rnd() < 0.08,
  }));
  const id = `vial-${seed}`;
  return (
    <svg className="vial" viewBox="0 0 76 236" role="img" aria-label={label}>
      <defs>
        <clipPath id={id}><path d="M12 8 V188 A26 26 0 0 0 64 188 V8 Z" /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect className="vial-water" x="0" y="56" width="76" height="180" fill="rgba(31,70,224,.14)" />
        {dots.map((d, i) => (
          <circle key={i} className="vial-dot" cx={d.x} cy={d.y} r={d.r} fill={d.debris ? "#8a5a24" : "#0d2230"} />
        ))}
      </g>
      <path d="M12 8 V188 A26 26 0 0 0 64 188 V8" fill="none" stroke="#0d2230" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 8 H70" stroke="#0d2230" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 26 V170" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
