/** Cross-section of the HydroScan device. Steps light up via classes s1–s6 on the <svg>. */
const plastic: [number, number, number][] = [
  [172, 402, 2.6], [204, 424, 2], [236, 410, 3], [262, 432, 2.2], [292, 404, 2.6], [320, 428, 2], [346, 412, 2.4], [374, 432, 2.2],
];
const debris: [number, number, number] = [300, 441, 3.8];
const lens: [number, number] = [270, 190];
const STRIP_Y = 398; // the LED strip runs at water level

export default function Diagram() {
  return (
    <svg className="diagram s1" viewBox="0 0 640 520" role="img" aria-labelledby="dg-title dg-desc" data-diagram>
      <title id="dg-title">Cross-section of the HydroScan device</title>
      <desc id="dg-desc">A sealed box. The lid holds a Raspberry Pi 4, a downward-facing camera and a 16 by 2 LCD. Below, a glass dish of water sits on a base at a fixed height. One continuous white LED strip runs along three inside walls at the level of the water and lights it from the sides. Particles in the water scatter light up into the camera.</desc>

      {/* Enclosure */}
      <rect className="ink draw" x="30" y="40" width="440" height="460" rx="18" pathLength={1} />
      <line className="ink draw" x1="30" y1="180" x2="470" y2="180" pathLength={1} />
      <rect className="ink" x="410" y="28" width="30" height="12" rx="5" fill="#0d2230" />

      {/* Raspberry Pi */}
      <g className="part g-pi-base">
        <rect className="ink" x="60" y="84" width="150" height="64" rx="6" />
        <rect className="thin" x="100" y="100" width="36" height="30" rx="3" />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} className="thin" x={148 + i * 7} y="90" width="4" height="6" />)}
        <rect className="thin" x="194" y="100" width="16" height="12" />
        <rect className="thin" x="194" y="120" width="16" height="12" />
      </g>
      <g className="g-pulse">
        <circle cx="118" cy="115" r="24" fill="none" stroke="#1663d6" strokeWidth="1.5" strokeDasharray="4 5" />
        <circle cx="118" cy="115" r="34" fill="none" stroke="#1663d6" strokeWidth="1" strokeDasharray="2 6" opacity=".6" />
      </g>
      <path className="thin" d="M210 120 C238 120 240 150 252 160" />

      {/* Camera */}
      <rect className="ink" x="250" y="150" width="40" height="26" rx="3" fill="#f8fbfa" />
      <circle className="ink" cx={lens[0]} cy="181" r="8" fill="#0d2230" />

      {/* LCD */}
      <rect x="320" y="86" width="128" height="52" rx="6" fill="#1f46e0" stroke="#0d2230" strokeWidth="2.5" />
      <text className="lcd-txt" x="330" y="108">Microplastics</text>
      <text className="lcd-txt" x="330" y="127">HIGH 74% n74</text>

      {/* Base that fixes the dish height */}
      <rect className="ink" x="150" y="458" width="240" height="42" rx="3" fill="none" />
      <path className="thin" d="M150 472 H390 M150 486 H390" opacity=".45" />

      {/* One continuous LED strip on three walls at water level: left wall, back wall (seen through the glass), right wall */}
      <g className="led-strip">
        <rect x="120" y={STRIP_Y} width="300" height="11" fill="#f8fbfa" stroke="#0d2230" strokeWidth="1" opacity=".5" />
        <rect className="ink" x="34" y={STRIP_Y} width="86" height="11" rx="2" fill="#f8fbfa" strokeWidth="1.6" />
        <rect className="ink" x="420" y={STRIP_Y} width="46" height="11" rx="2" fill="#f8fbfa" strokeWidth="1.6" />
        <g>
          <rect x="40.1" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" />
          <rect x="57.3" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" />
          <rect x="74.5" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" />
          <rect x="91.7" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" />
          <rect x="108.9" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" />
          <rect x="130.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="155.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="180.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="205.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="230.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="255.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="280.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="305.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="330.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="355.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="380.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="405.0" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" opacity=".5" />
          <rect x="425.2" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" />
          <rect x="440.5" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" />
          <rect x="455.8" y="401" width="5" height="5" rx="1" fill="#ffc93c" stroke="#0d2230" strokeWidth=".8" />
        </g>
      </g>
      <g className="glow g-led">
        <rect x="34" y={STRIP_Y} width="86" height="11" rx="2" fill="#ffc93c" />
        <rect x="120" y={STRIP_Y} width="300" height="11" fill="#ffc93c" opacity=".3" />
        <rect x="420" y={STRIP_Y} width="46" height="11" rx="2" fill="#ffc93c" />
      </g>

      {/* Camera field of view */}
      <polygon className="g-fov" points={`${lens[0]},${lens[1]} 127,380 413,380`} fill="rgba(22,99,214,.07)" stroke="#1663d6" strokeWidth="1.2" strokeDasharray="5 5" />

      {/* LED light travelling sideways into the water */}
      <g className="g-rays" stroke="#e08a1e" strokeWidth="1.6" fill="none">
        <line className="ray" x1="62" y1="403" x2="172" y2="402" />
        <line className="ray" x1="62" y1="406" x2="236" y2="410" />
        <line className="ray" x1="62" y1="409" x2="204" y2="424" />
        <line className="ray" x1="440" y1="403" x2="346" y2="412" />
        <line className="ray" x1="440" y1="406" x2="374" y2="432" />
        <line className="ray" x1="440" y1="409" x2="320" y2="428" />
      </g>

      {/* Light scattered up into the camera */}
      <g className="g-scatter" stroke="#1f46e0" strokeWidth="1.4" fill="none">
        {[[172, 402], [204, 424], [262, 432], [320, 428], [374, 432]].map(([x, y]) => (
          <line key={`${x}`} className="ray" x1={x} y1={y} x2={lens[0]} y2={lens[1] + 2} />
        ))}
      </g>

      {/* Dish and water */}
      <rect x="127" y="382" width="286" height="66" fill="rgba(31,70,224,.12)" />
      <path className="thin" d="M127 382 H413" opacity=".6" />
      <path className="ink draw" d="M120 360 V442 Q120 458 136 458 H404 Q420 458 420 442 V360" pathLength={1} />
      <path className="thin" d="M127 364 V440 Q127 451 138 451 H402 Q413 451 413 440 V364" />
      {plastic.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#0d2230" />)}
      <circle cx={debris[0]} cy={debris[1]} r={debris[2]} fill="#8a5a24" />

      {/* Detector boxes */}
      <g className="g-boxes" fill="none" strokeWidth="1.6">
        {plastic.map(([x, y, r]) => <rect key={`b${x}`} x={x - r - 4} y={y - r - 4} width={2 * r + 8} height={2 * r + 8} stroke="#0b7a43" />)}
        <rect x={debris[0] - 8} y={debris[1] - 8} width="16" height="16" stroke="#c76a00" />
      </g>

      {/* Step highlights */}
      <rect className="hl hl-1" x="110" y="350" width="320" height="118" rx="12" />
      <rect className="hl hl-2" x="26" y="390" width="448" height="27" rx="8" />
      <rect className="hl hl-3" x="240" y="142" width="60" height="56" rx="10" />
      <rect className="hl hl-4" x="50" y="74" width="170" height="84" rx="10" />
      <rect className="hl hl-6" x="310" y="76" width="148" height="72" rx="10" />

      {/* Labels */}
      <g className="labels">
        <line className="thin" x1="100" y1="34" x2="100" y2="84" />
        <text className="label" x="60" y="26">Raspberry Pi 4</text>
        <text className="label-sm" x="425" y="20" textAnchor="middle">Scan button</text>
        <line className="thin" x1="290" y1="166" x2="482" y2="166" />
        <text className="label" x="486" y="163">Camera v3 NOIR</text>
        <text className="label-sm" x="486" y="178">looks straight down</text>
        <line className="thin" x1="448" y1="112" x2="482" y2="112" />
        <text className="label" x="486" y="116">16×2 LCD</text>
        <line className="thin" x1="470" y1="228" x2="482" y2="228" />
        <text className="label" x="486" y="226">Sealed chamber</text>
        <text className="label-sm" x="486" y="241">blocks ambient light</text>
        <path className="thin" d="M466 403 H472 L482 344" />
        <text className="label" x="486" y="340">White LED strip</text>
        <text className="label-sm" x="486" y="355">one strip on three walls,</text>
        <text className="label-sm" x="486" y="369">level with the water</text>
        <path className="thin" d="M420 430 H482" />
        <text className="label" x="486" y="428">Glass dish</text>
        <text className="label-sm" x="486" y="443">with the water sample</text>
        <path className="thin" d="M390 480 H482" />
        <text className="label" x="486" y="478">Base</text>
        <text className="label-sm" x="486" y="493">fixes the dish height</text>
      </g>
    </svg>
  );
}
