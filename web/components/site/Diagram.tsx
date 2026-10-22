/** Cross-section of the HydroScan device. Steps light up via classes s1–s6 on the <svg>. */
const plastic: [number, number, number][] = [
  [180, 452, 2.6], [205, 440, 2], [232, 462, 3], [258, 446, 2.2], [286, 458, 2.6], [312, 441, 2], [336, 463, 2.4], [360, 449, 2.2],
];
const debris: [number, number, number] = [302, 468, 3.8];
const lens: [number, number] = [270, 190];

export default function Diagram() {
  return (
    <svg className="diagram s1" viewBox="0 0 640 520" role="img" aria-labelledby="dg-title dg-desc" data-diagram>
      <title id="dg-title">Cross-section of the HydroScan device</title>
      <desc id="dg-desc">A sealed box. The lid holds a Raspberry Pi 4, a downward-facing camera and a 16 by 2 LCD. Below, white LED strips on both walls light a glass dish of water from the side, and particles in the water scatter light up into the camera.</desc>

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
      <text className="lcd-txt" x="330" y="108">HIGH 74% n=74</text>
      <text className="lcd-txt" x="330" y="127">Investigate</text>

      {/* LED strips */}
      <rect className="ink" x="44" y="250" width="10" height="170" rx="4" />
      <rect className="ink" x="446" y="250" width="10" height="170" rx="4" />
      <g className="glow g-led">
        <rect x="44" y="250" width="10" height="170" rx="4" fill="#ffc93c" />
        <rect x="446" y="250" width="10" height="170" rx="4" fill="#ffc93c" />
      </g>

      {/* Camera field of view */}
      <polygon className="g-fov" points={`${lens[0]},${lens[1]} 157,428 383,428`} fill="rgba(22,99,214,.07)" stroke="#1663d6" strokeWidth="1.2" strokeDasharray="5 5" />

      {/* LED light into the water */}
      <g className="g-rays" stroke="#e08a1e" strokeWidth="1.6" fill="none">
        <line className="ray" x1="54" y1="300" x2="180" y2="452" />
        <line className="ray" x1="54" y1="340" x2="232" y2="462" />
        <line className="ray" x1="54" y1="380" x2="205" y2="440" />
        <line className="ray" x1="446" y1="310" x2="360" y2="449" />
        <line className="ray" x1="446" y1="360" x2="336" y2="463" />
        <line className="ray" x1="446" y1="400" x2="312" y2="441" />
      </g>

      {/* Light scattered up into the camera */}
      <g className="g-scatter" stroke="#1f46e0" strokeWidth="1.4" fill="none">
        {[[205, 440], [258, 446], [312, 441], [360, 449], [180, 452]].map(([x, y]) => (
          <line key={`${x}`} className="ray" x1={x} y1={y} x2={lens[0]} y2={lens[1] + 2} />
        ))}
      </g>

      {/* Dish and water */}
      <rect x="157" y="428" width="226" height="47" fill="rgba(31,70,224,.12)" />
      <path className="ink draw" d="M150 410 V468 Q150 482 164 482 H376 Q390 482 390 468 V410" pathLength={1} />
      <path className="thin" d="M157 414 V466 Q157 475 166 475 H374 Q383 475 383 466 V414" />
      {plastic.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#0d2230" />)}
      <circle cx={debris[0]} cy={debris[1]} r={debris[2]} fill="#8a5a24" />

      {/* Detector boxes */}
      <g className="g-boxes" fill="none" strokeWidth="1.6">
        {plastic.map(([x, y, r]) => <rect key={`b${x}`} x={x - r - 4} y={y - r - 4} width={2 * r + 8} height={2 * r + 8} stroke="#0b7a43" />)}
        <rect x={debris[0] - 8} y={debris[1] - 8} width="16" height="16" stroke="#c76a00" />
      </g>

      {/* Step highlights */}
      <rect className="hl hl-1" x="140" y="400" width="260" height="92" rx="12" />
      <g className="hl hl-2"><rect x="36" y="242" width="26" height="186" rx="8" /><rect x="438" y="242" width="26" height="186" rx="8" /></g>
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
        <line className="thin" x1="456" y1="320" x2="482" y2="320" />
        <text className="label" x="486" y="318">White LED strips</text>
        <text className="label-sm" x="486" y="333">light from the sides</text>
        <line className="thin" x1="390" y1="452" x2="482" y2="452" />
        <text className="label" x="486" y="450">Glass dish</text>
        <text className="label-sm" x="486" y="465">with the water sample</text>
      </g>
    </svg>
  );
}
