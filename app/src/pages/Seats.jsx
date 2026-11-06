import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategories } from "../api/match.js";
import { holdTickets } from "../api/payments.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usePayment } from "../context/PaymentContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { Button, Spinner } from "../components/ui/index.js";
import { money } from "../utils/format.js";

const LEVELS = [
  { key: "L1", label: "Level 1" },
  { key: "L2", label: "Level 2" },
  { key: "L3", label: "Level 3" },
];

const SECTIONS_BY_LEVEL = {
  L1: ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128"],
  L2: ["201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220"],
  L3: ["401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415"],
};

const ROWS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
const SEATS = Array.from({ length: 30 }, (_, i) => String(i + 1));

const SECTIONS_LIST = [
  { level: "L1", title: "Level 1", range: "Sections 101–128", count: "28 sections", seats: 142, from: 15000, status: "available" },
  { level: "L2", title: "Level 2", range: "Sections 201–220", count: "20 sections", seats: 1692, from: 20000, status: "available" },
  { level: "L3", title: "Level 3", range: "Sections 401–435", count: "36 sections", status: "soon" },
  { level: "gold", title: "Gold", count: "5 sections", status: "soon" },
  { level: "plat", title: "Platinum", count: "5 sections", seats: 89, status: "available" },
  { level: "sky", title: "Skyboxes", range: "Boxes 301–350", count: "58 sections", status: "soon" },
  { level: "acc", title: "Accessible", count: "28 sections", status: "soon" },
];

export default function Seats() {
  const { slug } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { isAuthed } = useAuth();
  const { setHold } = usePayment();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("L1");
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const [pickLevel, setPickLevel] = useState("L1");
  const [pickSection, setPickSection] = useState("101");
  const [pickRow, setPickRow] = useState("1");
  const [pickSeat, setPickSeat] = useState("1");

  useEffect(() => {
    getCategories()
      .then((r) => {
        const list = r?.data ?? r ?? [];
        const rows = Array.isArray(list) ? list : [];
        setCategories(rows);
        const first = rows.find((c) => c.isActive !== false && c.seatsLeft !== 0);
        if (first) setSelected(first._id);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cat = categories.find((c) => c._id === selected);
  const total = cat ? cat.price * quantity : 0;

  const sectionsForLevel = useMemo(
    () => SECTIONS_BY_LEVEL[pickLevel] || [],
    [pickLevel]
  );

  useEffect(() => {
    if (!sectionsForLevel.includes(pickSection)) {
      setPickSection(sectionsForLevel[0] || "");
    }
  }, [pickLevel, sectionsForLevel, pickSection]);

  const startNumber = Number(pickSeat);
  const endNumber = startNumber + quantity - 1;
  const seatRangeLabel =
    quantity === 1 ? `Seat ${startNumber}` : `Seats ${startNumber}–${endNumber}`;

  const doHold = async (seatOverride) => {
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

  const submitContinueGeneric = async () => {
    if (!cat) return toast.error("Select a ticket first");
    setSubmitting(true);
    try {
      await doHold(null);
      nav("/checkout");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitContinueSpecific = async () => {
    if (!cat) return toast.error("Select a ticket first");
    if (!pickSection || !pickRow || !pickSeat) {
      return toast.error("Choose level, section, row and seat");
    }
    if (endNumber > 30) {
      return toast.error(`Not enough seats in row from seat ${startNumber}`);
    }
    setContinuing(true);
    try {
      await doHold({
        section: `${pickLevel} · Section ${pickSection}`,
        row: pickRow,
        number: pickSeat,
      });
      nav("/checkout");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setContinuing(false);
    }
  };

  const findMyTickets = () => {
    if (isAuthed) {
      nav("/tickets");
    } else {
      nav("/login", { state: { from: "/tickets" } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

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
          <div className="flex items-center justify-between gap-3 p-4 border-b border-surface-line">
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLevel(l.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    level === l.key
                      ? "bg-kenya-green text-white"
                      : "bg-surface-alt text-ink-muted hover:text-ink"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative bg-surface-alt aspect-[4/3] overflow-hidden">
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform"
              style={{ transform: `scale(${zoom})` }}
            >
              <StadiumMap level={level} />
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
              <div className="font-semibold text-ink mb-1">Section 405</div>
              <div className="text-ink-muted">Available</div>
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
            <div className="flex items-center justify-between mb-4">
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

            <div className="space-y-2">
              {categories.length === 0 && (
                <p className="text-sm text-ink-muted">No categories available.</p>
              )}
              {categories.map((c) => {
                const soldOut = c.isActive === false || c.seatsLeft === 0;
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
                      <div className="font-semibold text-sm">
                        {c.name}
                        {c.section ? (
                          <span className="text-ink-muted font-normal"> · {c.section}</span>
                        ) : null}
                      </div>
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

            {cat && (
              <div className="mt-4 pt-4 border-t border-surface-line flex justify-between font-bold">
                <span>Total</span>
                <span className="text-kenya-gold">{money(total)}</span>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <Button
                onClick={submitContinueGeneric}
                loading={submitting}
                disabled={!cat}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
              <Button
                onClick={findMyTickets}
                variant="ghost"
                className="w-full"
              >
                Find my tickets
              </Button>
            </div>
          </div>

          <div className="bg-surface border border-surface-line rounded-xl p-5">
            <h3 className="font-bold text-sm mb-3">Choose a specific seat</h3>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Level"
                value={pickLevel}
                onChange={setPickLevel}
                options={LEVELS.map((l) => ({ value: l.key, label: l.label }))}
              />
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
              {pickLevel} · Section {pickSection} · Row {pickRow} · {seatRangeLabel}
              {quantity > 1 ? ` (${quantity} consecutive)` : ""}
            </div>

            <Button
              onClick={submitContinueSpecific}
              loading={continuing}
              disabled={!cat}
              className="w-full mt-4"
              size="lg"
            >
              Continue with these seats
            </Button>
          </div>

          <div className="bg-surface border border-surface-line rounded-xl p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-bold text-sm">Or choose a section</h3>
              <span className="text-xs text-ink-muted">10 sections available</span>
            </div>

            <button className="text-xs text-kenya-gold hover:underline mb-3">
              Cheapest
            </button>

            <div className="space-y-2">
              {SECTIONS_LIST.map((s) => {
                const soon = s.status === "soon";
                return (
                  <div
                    key={s.level}
                    className={`bg-surface-alt border border-surface-line rounded-lg px-3 py-3 ${
                      soon ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">{s.title}</div>
                        {s.range && (
                          <div className="text-[11px] text-ink-muted">
                            {s.range} · {s.count}
                          </div>
                        )}
                        {!s.range && (
                          <div className="text-[11px] text-ink-muted">{s.count}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {soon ? (
                          <div className="text-[11px] text-ink-muted">Not yet on sale</div>
                        ) : (
                          <>
                            <div className="text-[11px] text-ink-muted">
                              {s.seats ?? 0} seats left
                            </div>
                            {s.from ? (
                              <div className="text-xs font-bold text-kenya-gold">
                                From {money(s.from)}
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
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
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[560px]">
      <ellipse cx="200" cy="150" rx="160" ry="110" fill="none" stroke={stroke} strokeWidth="1.5" />
      <ellipse cx="200" cy="150" rx="140" ry="92" fill="none" stroke={stroke} strokeWidth="1" />
      <ellipse cx="200" cy="150" rx="120" ry="74" fill="none" stroke={stroke} strokeWidth="1" />
      <ellipse cx="200" cy="150" rx="100" ry="56" fill="none" stroke={stroke} strokeWidth="1" />

      <ellipse cx="200" cy="150" rx="80" ry="42" fill="#22c55e" opacity="0.08" />
      <rect x="140" y="130" width="120" height="40" fill="#22c55e" opacity="0.12" />

      {level === "L1" && (
        <g fill="rgba(34,197,94,0.5)" stroke="rgba(34,197,94,0.8)" strokeWidth="0.5">
          {Array.from({ length: 28 }).map((_, i) => {
            const a = (i / 28) * Math.PI * 2;
            const x = 200 + Math.cos(a) * 150;
            const y = 150 + Math.sin(a) * 101;
            return <circle key={i} cx={x} cy={y} r="4" />;
          })}
        </g>
      )}
      {level === "L2" && (
        <g fill="rgba(34,197,94,0.5)" stroke="rgba(34,197,94,0.8)" strokeWidth="0.5">
          {Array.from({ length: 20 }).map((_, i) => {
            const a = (i / 20) * Math.PI * 2;
            const x = 200 + Math.cos(a) * 130;
            const y = 150 + Math.sin(a) * 85;
            return <circle key={i} cx={x} cy={y} r="4" />;
          })}
        </g>
      )}
      {level === "L3" && (
        <g fill="rgba(148,163,184,0.4)" stroke="rgba(148,163,184,0.6)" strokeWidth="0.5">
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            const x = 200 + Math.cos(a) * 110;
            const y = 150 + Math.sin(a) * 68;
            return <circle key={i} cx={x} cy={y} r="3" />;
          })}
        </g>
      )}
    </svg>
  );
}