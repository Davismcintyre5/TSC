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
  const stroke = "rgba(148,163,184,0.25)";

  const ring =
    level === "L1"
      ? { rx: 150, ry: 101, count: 28, color: "rgba(34,197,94,0.5)", stroke: "rgba(34,197,94,0.8)" }
      : level === "L2"
      ? { rx: 130, ry: 85, count: 20, color: "rgba(34,197,94,0.5)", stroke: "rgba(34,197,94,0.8)" }
      : level === "L3"
      ? { rx: 110, ry: 68, count: 36, color: "rgba(148,163,184,0.4)", stroke: "rgba(148,163,184,0.6)" }
      : { rx: 110, ry: 68, count: 16, color: "rgba(245,166,35,0.5)", stroke: "rgba(245,166,35,0.8)" };

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[560px]">
      <ellipse cx="200" cy="150" rx="160" ry="110" fill="none" stroke={stroke} strokeWidth="1.5" />
      <ellipse cx="200" cy="150" rx="140" ry="92" fill="none" stroke={stroke} strokeWidth="1" />
      <ellipse cx="200" cy="150" rx="120" ry="74" fill="none" stroke={stroke} strokeWidth="1" />
      <ellipse cx="200" cy="150" rx="100" ry="56" fill="none" stroke={stroke} strokeWidth="1" />

      <ellipse cx="200" cy="150" rx="80" ry="42" fill="#22c55e" opacity="0.08" />
      <rect x="140" y="130" width="120" height="40" fill="#22c55e" opacity="0.12" />

      <g fill={ring.color} stroke={ring.stroke} strokeWidth="0.5">
        {Array.from({ length: ring.count }).map((_, i) => {
          const a = (i / ring.count) * Math.PI * 2;
          const x = 200 + Math.cos(a) * ring.rx;
          const y = 150 + Math.sin(a) * ring.ry;
          return <circle key={i} cx={x} cy={y} r="4" />;
        })}
      </g>
    </svg>
  );
}