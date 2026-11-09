export default function StadiumMap({ level }) {
  const VB_W = 720;
  const VB_H = 480;
  const cx = VB_W / 2;
  const cy = VB_H / 2;

  const KENYA = {
    black: "#0e1116",
    red: "#bb0000",
    green: "#006600",
    gold: "#f5a623",
    muted: "#9aa4b2",
  };

  // Level-specific config
  const CONFIG = {
    L1: {
      outerRx: 300,
      outerRy: 190,
      innerRx: 210,
      innerRy: 130,
      sectionCount: 28,
      color: KENYA.green,
      opacity: 0.45,
      labelPrefix: "1",
      labelStart: 1,
    },
    L2: {
      outerRx: 270,
      outerRy: 170,
      innerRx: 190,
      innerRy: 118,
      sectionCount: 20,
      color: KENYA.green,
      opacity: 0.4,
      labelPrefix: "2",
      labelStart: 1,
    },
    L3: {
      outerRx: 240,
      outerRy: 150,
      innerRx: 170,
      innerRy: 105,
      sectionCount: 36,
      color: KENYA.muted,
      opacity: 0.3,
      labelPrefix: "4",
      labelStart: 1,
    },
    gold: {
      outerRx: 220,
      outerRy: 138,
      innerRx: 155,
      innerRy: 95,
      sectionCount: 5,
      color: KENYA.gold,
      opacity: 0.55,
      labelPrefix: "G",
      labelStart: 1,
    },
    platinum: {
      outerRx: 220,
      outerRy: 138,
      innerRx: 155,
      innerRy: 95,
      sectionCount: 5,
      color: KENYA.gold,
      opacity: 0.7,
      labelPrefix: "P",
      labelStart: 1,
    },
    skybox: {
      outerRx: 210,
      outerRy: 130,
      innerRx: 148,
      innerRy: 90,
      sectionCount: 20,
      color: KENYA.gold,
      opacity: 0.45,
      labelPrefix: "B",
      labelStart: 301,
    },
    accessible: {
      outerRx: 200,
      outerRy: 124,
      innerRx: 140,
      innerRy: 86,
      sectionCount: 28,
      color: "#3b82f6",
      opacity: 0.35,
      labelPrefix: "A",
      labelStart: 1,
    },
  };

  const cfg = CONFIG[level] || CONFIG.L1;

  // Generate section wedges
  const sections = Array.from({ length: cfg.sectionCount }).map((_, i) => {
    const a0 = (i / cfg.sectionCount) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / cfg.sectionCount) * Math.PI * 2 - Math.PI / 2;
    const midAngle = (a0 + a1) / 2;

    // Build a wedge path between outer and inner ellipse arcs
    const midRx = (cfg.outerRx + cfg.innerRx) / 2;
    const midRy = (cfg.outerRy + cfg.innerRy) / 2;
    const labelX = cx + Math.cos(midAngle) * midRx;
    const labelY = cy + Math.sin(midAngle) * midRy;

    const points = [];
    const steps = 4;

    // Outer arc
    for (let s = 0; s <= steps; s++) {
      const a = a0 + (a1 - a0) * (s / steps);
      points.push([
        cx + Math.cos(a) * cfg.outerRx,
        cy + Math.sin(a) * cfg.outerRy,
      ]);
    }
    // Inner arc (reverse)
    for (let s = steps; s >= 0; s--) {
      const a = a0 + (a1 - a0) * (s / steps);
      points.push([
        cx + Math.cos(a) * cfg.innerRx,
        cy + Math.sin(a) * cfg.innerRy,
      ]);
    }

    const path =
      `M ${points[0][0]} ${points[0][1]} ` +
      points.slice(1).map((p) => `L ${p[0]} ${p[1]}`).join(" ") +
      " Z";

    return {
      i,
      path,
      labelX,
      labelY,
      label: `${cfg.labelPrefix}${cfg.labelStart + i}`,
      angle: midAngle,
    };
  });

  // Pick a few highlighted "sold" sections for realism
  const soldIndices = new Set(
    Array.from({ length: Math.floor(cfg.sectionCount * 0.2) }).map(() =>
      Math.floor(Math.random() * cfg.sectionCount)
    )
  );

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full h-full max-w-[720px]"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="pitchGrad" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={KENYA.green} stopOpacity="0.35" />
          <stop offset="100%" stopColor={KENYA.green} stopOpacity="0.08" />
        </radialGradient>
        <linearGradient id="crowdGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={KENYA.black} stopOpacity="0.7" />
          <stop offset="100%" stopColor={KENYA.black} stopOpacity="0.95" />
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="innerShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
          <feOffset dx="0" dy="3" result="offset" />
          <feComposite in="SourceGraphic" in2="offset" operator="over" />
        </filter>
      </defs>

      {/* Kenya-flag outer ring (3 stripes) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={cfg.outerRx + 34}
        ry={cfg.outerRy + 26}
        fill="none"
        stroke={KENYA.black}
        strokeWidth="3"
        opacity="0.35"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={cfg.outerRx + 28}
        ry={cfg.outerRy + 21}
        fill="none"
        stroke={KENYA.red}
        strokeWidth="2.5"
        opacity="0.55"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={cfg.outerRx + 22}
        ry={cfg.outerRy + 17}
        fill="none"
        stroke={KENYA.green}
        strokeWidth="2.5"
        opacity="0.55"
      />

      {/* Outer structure shadow */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={cfg.outerRx + 12}
        ry={cfg.outerRy + 10}
        fill="none"
        stroke="rgba(148,163,184,0.18)"
        strokeWidth="1.5"
      />

      {/* Section wedges */}
      <g>
        {sections.map((s) => {
          const isSold = soldIndices.has(s.i);
          return (
            <g key={s.i}>
              <path
                d={s.path}
                fill={isSold ? "rgba(42,50,64,0.75)" : cfg.color}
                fillOpacity={isSold ? 0.7 : cfg.opacity}
                stroke={isSold ? "rgba(148,163,184,0.3)" : cfg.color}
                strokeOpacity={isSold ? 0.4 : 0.9}
                strokeWidth="1"
                style={{ cursor: "pointer" }}
              >
                <title>Section {s.label}</title>
              </path>
              <text
                x={s.labelX}
                y={s.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fontWeight="700"
                fill={isSold ? "rgba(148,163,184,0.5)" : KENYA.black}
                pointerEvents="none"
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* Inner tier boundary */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={cfg.innerRx - 4}
        ry={cfg.innerRy - 4}
        fill="none"
        stroke="rgba(148,163,184,0.35)"
        strokeWidth="1"
        strokeDasharray="2 3"
      />

      {/* Pitch */}
      <g>
        <rect
          x={cx - 150}
          y={cy - 82}
          width="300"
          height="164"
          rx="4"
          fill="url(#pitchGrad)"
        />

        {/* Grass stripes (vertical bands) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x={cx - 150 + i * 37.5}
            y={cy - 82}
            width="37.5"
            height="164"
            fill={i % 2 === 0 ? KENYA.green : "transparent"}
            fillOpacity={i % 2 === 0 ? 0.06 : 0}
            pointerEvents="none"
          />
        ))}

        {/* Pitch outline */}
        <rect
          x={cx - 150}
          y={cy - 82}
          width="300"
          height="164"
          fill="none"
          stroke={KENYA.green}
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />

        {/* Center line */}
        <line
          x1={cx}
          y1={cy - 82}
          x2={cx}
          y2={cy + 82}
          stroke={KENYA.green}
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />

        {/* Center circle */}
        <circle
          cx={cx}
          cy={cy}
          r="20"
          fill="none"
          stroke={KENYA.green}
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2" fill={KENYA.green} fillOpacity="0.7" />

        {/* Left penalty box */}
        <rect
          x={cx - 150}
          y={cy - 40}
          width="36"
          height="80"
          fill="none"
          stroke={KENYA.green}
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <rect
          x={cx - 150}
          y={cy - 22}
          width="14"
          height="44"
          fill="none"
          stroke={KENYA.green}
          strokeOpacity="0.4"
          strokeWidth="1"
        />

        {/* Right penalty box */}
        <rect
          x={cx + 114}
          y={cy - 40}
          width="36"
          height="80"
          fill="none"
          stroke={KENYA.green}
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <rect
          x={cx + 136}
          y={cy - 22}
          width="14"
          height="44"
          fill="none"
          stroke={KENYA.green}
          strokeOpacity="0.4"
          strokeWidth="1"
        />

        {/* Goals */}
        <rect
          x={cx - 158}
          y={cy - 16}
          width="8"
          height="32"
          fill={KENYA.green}
          fillOpacity="0.15"
          stroke={KENYA.green}
          strokeOpacity="0.4"
          strokeWidth="0.8"
        />
        <rect
          x={cx + 150}
          y={cy - 16}
          width="8"
          height="32"
          fill={KENYA.green}
          fillOpacity="0.15"
          stroke={KENYA.green}
          strokeOpacity="0.4"
          strokeWidth="0.8"
        />
      </g>

      {/* Corner floodlights */}
      {[
        [80, 60],
        [VB_W - 80, 60],
        [80, VB_H - 60],
        [VB_W - 80, VB_H - 60],
      ].map(([x, y], i) => (
        <g key={i} opacity="0.35">
          <line x1={x} y1={y} x2={cx} y2={cy} stroke={KENYA.gold} strokeWidth="0.5" />
          <circle cx={x} cy={y} r="4" fill={KENYA.gold} />
          <circle cx={x} cy={y} r="8" fill={KENYA.gold} fillOpacity="0.15" />
        </g>
      ))}

      {/* Cardinal markers */}
      <text
        x={cx}
        y={28}
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fill={KENYA.gold}
      >
        N
      </text>
      <text
        x={cx}
        y={VB_H - 12}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={KENYA.muted}
        opacity="0.5"
      >
        S
      </text>
      <text
        x={18}
        y={cy + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={KENYA.muted}
        opacity="0.5"
      >
        W
      </text>
      <text
        x={VB_W - 18}
        y={cy + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={KENYA.muted}
        opacity="0.5"
      >
        E
      </text>

      {/* Level badge */}
      <g filter="url(#softGlow)">
        <rect
          x={cx - 32}
          y={VB_H - 42}
          width="64"
          height="22"
          rx="11"
          fill={KENYA.black}
          stroke={KENYA.gold}
          strokeWidth="1"
        />
        <text
          x={cx}
          y={VB_H - 27}
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill={KENYA.gold}
          letterSpacing="1"
        >
          {level.toUpperCase()}
        </text>
      </g>
    </svg>
  );
}