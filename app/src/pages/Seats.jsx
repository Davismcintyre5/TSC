import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategories, getLevels } from "../api/match.js";
import { holdTickets } from "../api/payments.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usePayment } from "../context/PaymentContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { Button, Spinner } from "../components/ui/index.js";
import { money } from "../utils/format.js";

const LEVEL_ORDER = ["L1", "L2", "L3", "gold", "platinum", "skybox", "accessible"];

const SECTIONS_BY_LEVEL = {
  L1: ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128"],
  L2: ["201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220"],
  L3: ["401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415"],
};

const ROWS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
const SEATS = Array.from({ length: 30 }, (_, i) => String(i + 1));

export default function Seats() {
  const { slug } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { isAuthed } = useAuth();
  const { setHold } = usePayment();

  const [levels, setLevels] = useState([]);
  const [activeLevel, setActiveLevel] = useState("L1");
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pickSection, setPickSection] = useState("101");
  const [pickRow, setPickRow] = useState("1");
  const [pickSeat, setPickSeat] = useState("1");

  useEffect(() => {
    getLevels()
      .then((r) => {
        const list = r?.data ?? r ?? [];
        setLevels(Array.isArray(list) ? list : []);
        const firstActive = (list || []).find((l) => l.status === "available");
        if (firstActive) setActiveLevel(firstActive.level);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeLevel) return;
    setCatsLoading(true);
    getCategories(activeLevel)
      .then((r) => {
        const list = r?.data ?? r ?? [];
        const rows = Array.isArray(list) ? list : [];
        setCategories(rows);
        const first = rows.find((c) => c.seatsLeft !== 0);
        setSelected(first?._id || null);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setCatsLoading(false));
  }, [activeLevel]);

  const cat = categories.find((c) => c._id === selected);
  const total = cat ? cat.price * quantity : 0;

  const sectionsForLevel = useMemo(
    () => SECTIONS_BY_LEVEL[activeLevel] || [],
    [activeLevel]
  );

  useEffect(() => {
    if (sectionsForLevel.length && !sectionsForLevel.includes(pickSection)) {
      setPickSection(sectionsForLevel[0]);
    }
  }, [sectionsForLevel, pickSection]);

  const startNumber = Number(pickSeat);
  const endNumber = startNumber + quantity - 1;
  const seatRangeLabel =
    quantity === 1 ? `Seat ${startNumber}` : `Seats ${startNumber}–${endNumber}`;

  const doHold = async () => {
    const seatOverride =
      pickSection && pickRow && pickSeat
        ? {
            section: `${activeLevel} · Section ${pickSection}`,
            row: pickRow,
            number: pickSeat,
          }
        : null;

    const payload = {
      items: [
        {
          categoryId: cat._id,
          quantity,
          ...(seatOverride ? { seat: seatOverride } : {}),
        },
      ],
    };

    const r = await holdTickets(payload);
    setHold(r.data);
    return r.data;
  };

  const submitContinue = async () => {
    if (!cat) return toast.error("Select a ticket first");
    if (!pickSection || !pickRow || !pickSeat) {
      return toast.error("Choose section, row and seat");
    }
    if (endNumber > 30) {
      return toast.error(`Not enough seats in row from seat ${startNumber}`);
    }
    setSubmitting(true);
    try {
      await doHold();
      nav("/checkout");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const findMyTickets = () => {
    if (isAuthed) nav("/tickets");
    else nav("/login", { state: { from: "/tickets" } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  const tabs = LEVEL_ORDER.filter((k) => levels.find((l) => l.level === k));

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold">
          Bayern Munich <span className="text-ink-muted">vs</span> Ajax
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Tue 5 Jan 2027 · 11:00 · Raila Odinga International Stadium, Nairobi
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="bg-surface border border-surface-line rounded-2xl overflow-hidden">
          <div className="flex gap-2 p-4 border-b border-surface-line overflow-x-auto">
            {tabs.map((key) => {
              const l = levels.find((x) => x.level === key);
              const soon = l.status === "soon";
              return (
                <button
                  key={key}
                  onClick={() => setActiveLevel(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ${
                    activeLevel === key
                      ? "bg-kenya-green text-white"
                      : soon
                      ? "bg-surface-alt text-ink-muted/60"
                      : "bg-surface-alt text-ink-muted hover:text-ink"
                  }`}
                >
                  {l.title}
                </button>
              );
            })}
          </div>

          <div className="relative bg-surface-alt aspect-[4/3] overflow-hidden">
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform"
              style={{ transform: `scale(${zoom})` }}
            >
              <StadiumMap level={activeLevel} />
            </div>

            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
                className="w-8 h-8 bg-surface border border-surface-line rounded-lg text-ink"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                className="w-8 h-8 bg-surface border border-surface-line rounded-lg text-ink"
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                onClick={() => setZoom(1)}
                className="w-8 h-8 bg-surface border border-surface-line rounded-lg text-ink"
                aria-label="Reset zoom"
              >
                ⟲
              </button>
            </div>

            <div className="absolute top-3 left-3 w-8 h-8 rounded-full border border-surface-line bg-surface text-ink flex items-center justify-center text-xs font-bold">
              N
            </div>

            <div className="absolute bottom-3 left-3 bg-surface/90 border border-surface-line rounded-lg px-3 py-2 text-xs">
              <div className="font-semibold text-ink mb-1">
                {levels.find((l) => l.level === activeLevel)?.title || ""}
              </div>
              <div className="text-ink-muted">
                {levels.find((l) => l.level === activeLevel)?.range || ""}
              </div>
            </div>

            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 text-[10px]">
              {[
                ["Available", "bg-kenya-green/60"],
                ["Selected", "bg-kenya-gold"],
                ["Taken", "bg-surface-line"],
                ["Your seats", "bg-kenya-red/70"],
                ["Sold out", "bg-surface-line/40"],
              ].map(([label, cls]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm ${cls}`} />
                  <span className="text-ink-muted">{label}</span>
                </div>
              ))}
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-ink-muted">
              Scroll to zoom · drag to pan · tap a section
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-surface border border-surface-line rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold">Tickets</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 bg-surface-alt border border-surface-line rounded-lg text-sm disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(6, q + 1))}
                  disabled={quantity >= 6}
                  className="w-7 h-7 bg-surface-alt border border-surface-line rounded-lg text-sm disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-xs text-ink-muted mb-4">
              {levels.find((l) => l.level === activeLevel)?.title || ""} ·{" "}
              {levels.find((l) => l.level === activeLevel)?.range || ""}
            </p>

            {catsLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-ink-muted">
                <Spinner size={16} /> Loading…
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-ink-muted py-4">
                No ticket categories on sale for this level yet.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((c) => {
                  const soldOut = c.seatsLeft === 0;
                  return (
                    <button
                      key={c._id}
                      onClick={() => !soldOut && setSelected(c._id)}
                      disabled={soldOut}
                      className={`w-full text-left bg-surface-alt border rounded-lg px-3 py-3 transition ${
                        selected === c._id
                          ? "border-kenya-gold ring-1 ring-kenya-gold"
                          : "border-surface-line hover:border-ink-muted"
                      } ${soldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex justify-between items-baseline gap-3">
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-right">
                          {soldOut ? (
                            <div className="text-xs text-kenya-red font-semibold">Sold out</div>
                          ) : (
                            <>
                              <div className="font-extrabold text-kenya-gold text-sm">
                                {money(c.price, c.currency)}
                              </div>
                              <div className="text-[10px] text-ink-muted">
                                {c.seatsLeft == null
                                  ? "Available"
                                  : `${c.seatsLeft.toLocaleString()} seats left`}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {cat && (
              <div className="mt-4 pt-4 border-t border-surface-line flex justify-between font-bold">
                <span>Total</span>
                <span className="text-kenya-gold">{money(total)}</span>
              </div>
            )}
          </div>

          <div className="bg-surface border border-surface-line rounded-xl p-5">
            <h3 className="font-bold text-sm mb-3">Choose a specific seat</h3>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Section"
                value={pickSection}
                onChange={setPickSection}
                options={sectionsForLevel.map((s) => ({ value: s, label: `Section ${s}` }))}
              />
              <Select
                label="Row"
                value={pickRow}
                onChange={setPickRow}
                options={ROWS.map((r) => ({ value: r, label: `Row ${r}` }))}
              />
              <Select
                label="Seat"
                value={pickSeat}
                onChange={setPickSeat}
                options={SEATS.map((s) => ({ value: s, label: `Seat ${s}` }))}
              />
            </div>

            <div className="mt-3 text-xs text-ink-muted">
              {activeLevel} · Section {pickSection} · Row {pickRow} · {seatRangeLabel}
              {quantity > 1 ? ` (${quantity} consecutive)` : ""}
            </div>

            <Button
              onClick={submitContinue}
              loading={submitting}
              disabled={!cat}
              className="w-full mt-4"
              size="lg"
            >
              Continue
            </Button>

            <Button
              onClick={findMyTickets}
              variant="ghost"
              className="w-full mt-2"
            >
              Find my tickets
            </Button>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-bold text-sm">Or choose a section</h3>
          <span className="text-xs text-ink-muted">
            {levels.length} levels available
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {levels.map((l) => {
            const soon = l.status === "soon";
            const isActive = l.level === activeLevel;
            return (
              <button
                key={l.level}
                onClick={() => !soon && setActiveLevel(l.level)}
                disabled={soon}
                className={`text-left bg-surface border rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "border-kenya-gold ring-1 ring-kenya-gold"
                    : "border-surface-line hover:border-ink-muted"
                } ${soon ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-ink">{l.title}</div>
                    {l.range && (
                      <div className="text-[11px] text-ink-muted mt-0.5">{l.range}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {soon ? (
                      <div className="text-[11px] text-ink-muted">Not yet on sale</div>
                    ) : (
                      <>
                        <div className="text-[11px] text-ink-muted">
                          {l.seatsLeft.toLocaleString()} seats left
                        </div>
                        {l.from ? (
                          <div className="text-xs font-bold text-kenya-gold">
                            From {money(l.from)}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-surface-line rounded-lg px-2.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-kenya-gold"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StadiumMap({ level }) {
  // Per-level ring geometry: radius, section count, seat count per section
  const RINGS = {
    L1: { rx: 170, ry: 122, sections: 28, seatsPerSection: 5, active: true },
    L2: { rx: 145, ry: 100, sections: 20, seatsPerSection: 4, active: true },
    L3: { rx: 120, ry: 80, sections: 36, seatsPerSection: 3, active: true },
    gold: { rx: 120, ry: 80, sections: 5, seatsPerSection: 6, active: true },
    platinum: { rx: 120, ry: 80, sections: 5, seatsPerSection: 6, active: true },
    skybox: { rx: 120, ry: 80, sections: 58, seatsPerSection: 2, active: true },
    accessible: { rx: 120, ry: 80, sections: 28, seatsPerSection: 4, active: true },
  };

  const ring = RINGS[level] || RINGS.L1;
  const cx = 240;
  const cy = 180;

  // Kenya flag colors
  const black = "#0e1116";
  const red = "#bb0000";
  const green = "#006600";
  const gold = "#f5a623";

  // Determine fill style per level
  const sectionFill =
    level === "gold" || level === "platinum" || level === "skybox"
      ? gold
      : level === "accessible"
      ? "#3b82f6"
      : green;

  // Section positions
  const sectionDots = Array.from({ length: ring.sections }).map((_, i) => {
    const angle = (i / ring.sections) * Math.PI * 2 - Math.PI / 2;
    return {
      i,
      angle,
      x: cx + Math.cos(angle) * ring.rx,
      y: cy + Math.sin(angle) * ring.ry,
    };
  });

  // Seat dots: orbit around each section
  const seatDots = [];
  sectionDots.forEach((sec, si) => {
    for (let s = 0; s < ring.seatsPerSection; s++) {
      const offset = (s - (ring.seatsPerSection - 1) / 2) * 4;
      const seatAngle =
        (si / ring.sections) * Math.PI * 2 +
        (s - (ring.seatsPerSection - 1) / 2) * 0.012 -
        Math.PI / 2;
      seatDots.push({
        x: cx + Math.cos(seatAngle) * (ring.rx + offset + 8),
        y: cy + Math.sin(seatAngle) * (ring.ry + offset + 8),
        sectionIndex: si,
      });
    }
  });

  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full h-full max-w-[720px]"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="pitchGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={green} stopOpacity="0.25" />
          <stop offset="100%" stopColor={green} stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id="stadiumGrad" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={black} stopOpacity="0" />
          <stop offset="100%" stopColor={black} stopOpacity="0.6" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Kenya flag outer ring */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={ring.rx + 28}
        ry={ring.ry + 22}
        fill="none"
        stroke={black}
        strokeWidth="2"
        opacity="0.4"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={ring.rx + 22}
        ry={ring.ry + 18}
        fill="none"
        stroke={red}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={ring.rx + 16}
        ry={ring.ry + 14}
        fill="none"
        stroke={green}
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* Stadium shadow gradient */}
      <ellipse cx={cx} cy={cy} rx={ring.rx + 40} ry={ring.ry + 30} fill="url(#stadiumGrad)" />

      {/* Outer ring (structure) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={ring.rx + 10}
        ry={ring.ry + 8}
        fill="none"
        stroke="rgba(148,163,184,0.3)"
        strokeWidth="1"
      />

      {/* Main section ring */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={ring.rx}
        ry={ring.ry}
        fill="none"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="2"
        strokeDasharray="3 3"
      />

      {/* Inner service ring */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={ring.rx - 25}
        ry={ring.ry - 18}
        fill="none"
        stroke="rgba(148,163,184,0.2)"
        strokeWidth="1"
      />

      {/* Pitch (center) */}
      <ellipse cx={cx} cy={cy} rx="90" ry="55" fill="url(#pitchGrad)" />
      <rect
        x={cx - 75}
        y={cy - 40}
        width="150"
        height="80"
        fill="none"
        stroke={green}
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      {/* Center line */}
      <line
        x1={cx}
        y1={cy - 40}
        x2={cx}
        y2={cy + 40}
        stroke={green}
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      {/* Center circle */}
      <circle
        cx={cx}
        cy={cy}
        r="14"
        fill="none"
        stroke={green}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <circle cx={cx} cy={cy} r="2" fill={green} opacity="0.6" />

      {/* Goal areas */}
      <rect
        x={cx - 100}
        y={cy - 20}
        width="25"
        height="40"
        fill="none"
        stroke={green}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <rect
        x={cx + 75}
        y={cy - 20}
        width="25"
        height="40"
        fill="none"
        stroke={green}
        strokeOpacity="0.35"
        strokeWidth="1"
      />

      {/* Section markers — small arcs/capsules around the ring */}
      {sectionDots.map((sec) => {
        const isActive = sec.i % 3 !== 0; // simulate some sold-out sections
        return (
          <g key={`sec-${sec.i}`}>
            {/* Section block */}
            <rect
              x={sec.x - 5}
              y={sec.y - 3}
              width="10"
              height="6"
              rx="1"
              fill={isActive ? sectionFill : "#2a3240"}
              opacity={isActive ? 0.55 : 0.35}
              transform={`rotate(${(sec.angle * 180) / Math.PI} ${sec.x} ${sec.y})`}
            />
            {/* Section number label on hover highlight */}
            <circle
              cx={sec.x}
              cy={sec.y}
              r="8"
              fill="transparent"
              className="cursor-pointer"
            >
              <title>Section {sec.i + 1}</title>
            </circle>
          </g>
        );
      })}

      {/* Seat dots (small, dense) */}
      {seatDots.map((seat, idx) => (
        <circle
          key={`seat-${idx}`}
          cx={seat.x}
          cy={seat.y}
          r="1.2"
          fill={sectionFill}
          opacity="0.7"
        />
      ))}

      {/* Cardinal markers */}
      <text
        x={cx}
        y={cy - ring.ry - 18}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={gold}
      >
        N
      </text>
      <text
        x={cx}
        y={cy + ring.ry + 28}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={gold}
        opacity="0.5"
      >
        S
      </text>
      <text
        x={cx - ring.rx - 30}
        y={cy + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={gold}
        opacity="0.5"
      >
        W
      </text>
      <text
        x={cx + ring.rx + 30}
        y={cy + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={gold}
        opacity="0.5"
      >
        E
      </text>

      {/* Level badge */}
      <g filter="url(#glow)">
        <rect
          x={cx - 28}
          y={cy + ring.ry + 34}
          width="56"
          height="18"
          rx="9"
          fill={black}
          stroke={gold}
          strokeWidth="1"
        />
        <text
          x={cx}
          y={cy + ring.ry + 47}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={gold}
        >
          {level}
        </text>
      </g>
    </svg>
  );
}