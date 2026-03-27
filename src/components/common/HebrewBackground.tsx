export function HebrewBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hb-conn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#89AAA3" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#777D45" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="hb-conn2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BE4A01" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#89AAA3" stopOpacity="0.06" />
        </linearGradient>
        <filter id="hb-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Manuscript ruled lines */}
      <g opacity="0.06" stroke="#D4C9A0">
        {[100, 175, 250, 325, 400, 475, 550, 625, 700].map((y) => (
          <line key={`r-${y}`} x1="40" y1={y} x2="960" y2={y} strokeWidth="0.4" />
        ))}
        <line x1="80" y1="60" x2="80" y2="740" strokeWidth="0.6" />
        <line x1="920" y1="60" x2="920" y2="740" strokeWidth="0.6" />
      </g>

      {/* Large decorative Hebrew — focal background text */}
      <g fontFamily="'Times New Roman', 'Noto Serif Hebrew', serif" fill="#C5C29F" opacity="0.07">
        <text x="500" y="380" fontSize="280" textAnchor="middle" dominantBaseline="middle">שמע</text>
      </g>

      {/* Smaller scattered Hebrew letters */}
      <g fontFamily="serif" fill="#D4C9A0">
        <text x="120" y="140" fontSize="52" opacity="0.12">א</text>
        <text x="780" y="160" fontSize="40" opacity="0.09">ב</text>
        <text x="380" y="120" fontSize="36" opacity="0.08">ג</text>
        <text x="660" y="650" fontSize="44" opacity="0.10">ד</text>
        <text x="200" y="580" fontSize="48" opacity="0.08">ה</text>
        <text x="850" y="400" fontSize="38" opacity="0.09">ו</text>
        <text x="90" y="700" fontSize="42" opacity="0.07">ח</text>
        <text x="520" y="700" fontSize="34" opacity="0.10">ט</text>
        <text x="700" y="120" fontSize="30" opacity="0.08">כ</text>
        <text x="300" y="680" fontSize="36" opacity="0.06">ל</text>
      </g>

      {/* Semantic word-relationship network — central cluster */}
      <g>
        {/* Central nodes — word concepts */}
        {[
          { x: 300, y: 280, r: 6, c: "#89AAA3", d: "4s" },
          { x: 420, y: 220, r: 5, c: "#89AAA3", d: "5.5s" },
          { x: 500, y: 320, r: 5.5, c: "#89AAA3", d: "3.8s" },
          { x: 360, y: 400, r: 4.5, c: "#89AAA3", d: "6s" },
          { x: 240, y: 360, r: 4, c: "#89AAA3", d: "4.5s" },
          { x: 460, y: 440, r: 5, c: "#89AAA3", d: "5s" },
        ].map((n, i) => (
          <g key={`cn-${i}`}>
            <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke={n.c} strokeWidth="0.8" opacity="0.25" />
            <circle cx={n.x} cy={n.y} r={n.r * 0.45} fill={n.c} opacity="0.2">
              <animate attributeName="opacity" values="0.1;0.3;0.1" dur={n.d} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {/* Connections between central nodes */}
        {[
          [300, 280, 420, 220], [420, 220, 500, 320], [500, 320, 360, 400],
          [360, 400, 240, 360], [240, 360, 300, 280], [300, 280, 500, 320],
          [420, 220, 460, 440], [360, 400, 460, 440],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={`cc-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#hb-conn)" strokeWidth="0.6" />
        ))}
      </g>

      {/* Right cluster — secondary concepts */}
      <g>
        {[
          { x: 700, y: 320, r: 5, c: "#BE4A01", d: "4.2s" },
          { x: 780, y: 260, r: 4, c: "#BE4A01", d: "5.8s" },
          { x: 820, y: 360, r: 4.5, c: "#BE4A01", d: "3.5s" },
          { x: 740, y: 430, r: 3.5, c: "#BE4A01", d: "6.2s" },
          { x: 660, y: 410, r: 4, c: "#BE4A01", d: "4.8s" },
        ].map((n, i) => (
          <g key={`rn-${i}`}>
            <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke={n.c} strokeWidth="0.7" opacity="0.2" />
            <circle cx={n.x} cy={n.y} r={n.r * 0.4} fill={n.c} opacity="0.15">
              <animate attributeName="opacity" values="0.08;0.25;0.08" dur={n.d} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {[
          [700, 320, 780, 260], [780, 260, 820, 360], [820, 360, 740, 430],
          [740, 430, 660, 410], [660, 410, 700, 320], [700, 320, 820, 360],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={`rc-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#hb-conn2)" strokeWidth="0.5" />
        ))}
      </g>

      {/* Cross-cluster bridges — dashed semantic links */}
      <g strokeDasharray="6 8" opacity="0.15">
        <line x1="500" y1="320" x2="700" y2="320" stroke="#777D45" strokeWidth="0.5" />
        <line x1="460" y1="440" x2="660" y2="410" stroke="#777D45" strokeWidth="0.5" />
      </g>

      {/* Small word labels near nodes */}
      <g fontFamily="monospace" fontSize="8" fill="#89AAA3" opacity="0.15">
        <text x="310" y="270">דָּבָר</text>
        <text x="430" y="212">חֶסֶד</text>
        <text x="510" y="312">אֱמֶת</text>
        <text x="245" y="352">תּוֹרָה</text>
      </g>
      <g fontFamily="monospace" fontSize="8" fill="#BE4A01" opacity="0.12">
        <text x="710" y="312">בְּרִית</text>
        <text x="790" y="252">שָׁלוֹם</text>
        <text x="670" y="402">גָּאַל</text>
      </g>

      {/* Decorative scroll curves — top-left and bottom-right */}
      <g fill="none" stroke="#C5C29F" strokeWidth="1" opacity="0.08">
        <path d="M 30 30 C 30 60, 50 80, 30 120 C 10 160, 50 180, 30 220 C 10 260, 50 270, 40 290" />
        <path d="M 50 30 C 50 55, 65 75, 50 110 C 35 145, 65 170, 50 200" />
        <path d="M 970 510 C 970 545, 950 565, 970 600 C 990 635, 950 660, 970 700 C 990 740, 950 760, 960 780" />
        <path d="M 950 530 C 950 560, 935 580, 950 610 C 965 640, 935 660, 950 690" />
      </g>

      {/* Verse reference notations — scattered */}
      <g fontFamily="monospace" fontSize="7" fill="#A3A17A" opacity="0.12">
        <text x="140" y="470">Gen 1:1</text>
        <text x="580" y="140">Deut 6:4</text>
        <text x="750" y="570">Ruth 1:16</text>
        <text x="350" y="560">Ps 23:1</text>
        <text x="820" y="160">Isa 55:11</text>
      </g>

      {/* Animated pulse points — at key intersections */}
      {[
        { x: 400, y: 310, d: "0s" },
        { x: 750, y: 340, d: "1.5s" },
        { x: 350, y: 350, d: "3s" },
      ].map((p, i) => (
        <circle key={`pulse-${i}`} cx={p.x} cy={p.y} r="1" fill="#89AAA3" opacity="0" filter="url(#hb-glow)">
          <animate attributeName="opacity" values="0;0.4;0" dur="4s" begin={p.d} repeatCount="indefinite" />
          <animate attributeName="r" values="1;8;1" dur="4s" begin={p.d} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Chiastic structure diagram — bottom area */}
      <g transform="translate(160, 560)" opacity="0.10">
        <text fontFamily="monospace" fontSize="9" fill="#C5C29F" x="0" y="0">A</text>
        <text fontFamily="monospace" fontSize="9" fill="#C5C29F" x="40" y="20">B</text>
        <text fontFamily="monospace" fontSize="9" fill="#C5C29F" x="80" y="40">C</text>
        <text fontFamily="monospace" fontSize="9" fill="#89AAA3" x="120" y="50">X</text>
        <text fontFamily="monospace" fontSize="9" fill="#C5C29F" x="160" y="40">C'</text>
        <text fontFamily="monospace" fontSize="9" fill="#C5C29F" x="200" y="20">B'</text>
        <text fontFamily="monospace" fontSize="9" fill="#C5C29F" x="240" y="0">A'</text>
        <polyline points="5,5 45,25 85,45 125,50 165,45 205,25 245,5" fill="none" stroke="#89AAA3" strokeWidth="0.6" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}
