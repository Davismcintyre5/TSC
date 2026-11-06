import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMatch, getCategories } from "../api/match.js";
import { getFaqs } from "../api/faqs.js";
import { createNotify } from "../api/notify.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { Button, Input, Spinner } from "../components/ui/index.js";
import { money, dateTime, timeOnly } from "../utils/format.js";

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = target ? Math.max(0, new Date(target).getTime() - now) : 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

export default function MatchInfo() {
  const { settings } = useSettings();
  const toast = useToast();

  const [match, setMatch] = useState(null);
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    let alive = true;

    Promise.allSettled([getMatch(), getCategories(), getFaqs()])
      .then(([m, c, f]) => {
        if (!alive) return;

        console.log("[MatchInfo] getMatch:", m);
        console.log("[MatchInfo] getCategories:", c);
        console.log("[MatchInfo] getFaqs:", f);

        if (m.status === "fulfilled") {
          const val = m.value;
          const doc = val?.data ?? val;
          setMatch(doc || null);
        } else {
          setError(m.reason?.message || "Failed to load match");
        }

        if (c.status === "fulfilled") {
          const val = c.value;
          const list = val?.data ?? val ?? [];
          setCategories(Array.isArray(list) ? list : []);
        }

        if (f.status === "fulfilled") {
          const val = f.value;
          const obj = val?.data ?? val ?? {};
          setFaqs(obj && typeof obj === "object" ? obj : {});
        }
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const cd = useCountdown(match?.saleOpensAt);

  const onNotify = async (e) => {
    e.preventDefault();
    try {
      await createNotify(email);
      setNotified(true);
      toast.success("Check your inbox to confirm.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-kenya-red mb-2">Couldn't load match.</p>
        <p className="text-sm text-ink-muted">{error}</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-ink-muted">
        Match not available. Run <code className="text-kenya-gold">npm run seed</code> on the server.
      </div>
    );
  }

  const cheapest = [...categories].sort((a, b) => a.price - b.price)[0];
  const share = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${match.homeTeam} vs ${match.awayTeam}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-b from-surface-alt to-kenya-black border-b border-surface-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-sm text-ink-muted mb-2">
            <Link to="/" className="hover:text-ink">Home</Link> › Match info
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            {match.homeTeam}{" "}
            <span className="text-ink-muted text-2xl sm:text-3xl">vs</span>{" "}
            {match.awayTeam}
          </h1>
          <p className="mt-3 text-ink-muted">
            <span className="text-ink font-semibold">{dateTime(match.kickoff)}</span>{" "}
            · Gates open at {timeOnly(match.gatesOpen)}
            <br />
            {match.venue?.name}, {match.venue?.address}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/buy">
              <Button variant="primary">
                Buy tickets{cheapest ? ` from ${money(cheapest.price)}` : ""}
              </Button>
            </Link>
            <Button variant="ghost" onClick={share}>Share</Button>
          </div>

          <div className="mt-8 bg-surface border border-surface-line rounded-xl p-5">
            <p className="text-sm text-ink-muted mb-3">
              <span className="text-ink font-semibold">
                Tickets go on sale {dateTime(match.saleOpensAt)}
              </span>
            </p>

            {cd.done ? (
              <p className="text-kenya-gold font-bold text-lg">Sale is open</p>
            ) : (
              <div className="flex gap-3">
                {[
                  ["Days", cd.d],
                  ["Hours", cd.h],
                  ["Mins", cd.m],
                  ["Secs", cd.s],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="bg-surface-alt border border-surface-line rounded-lg min-w-[72px] px-3 py-2.5 text-center"
                  >
                    <div className="text-2xl font-extrabold tabular-nums">
                      {String(val).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!notified ? (
              <form onSubmit={onNotify} className="mt-4 flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="ghost">Get notified</Button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-kenya-green font-semibold">
                You're on the list.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-kenya-green pl-3">
              What's included
            </h2>
            <ul className="space-y-2.5">
              {(match.included || []).map((item) => (
                <li
                  key={item}
                  className="bg-surface border border-surface-line rounded-lg px-4 py-3 text-sm flex gap-3"
                >
                  <span className="text-kenya-green font-black">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-kenya-green pl-3">
              Stadium rules
            </h2>
            <div className="space-y-3">
              {(match.rules || []).map((r) => (
                <div
                  key={r.title}
                  className="bg-surface border border-surface-line border-l-4 border-l-kenya-gold rounded-lg px-4 py-3"
                >
                  <h3 className="text-sm font-bold mb-1">{r.title}</h3>
                  <p className="text-sm text-ink-muted">{r.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-kenya-green pl-3">
              Getting there
            </h2>
            <div className="space-y-3">
              <div className="bg-surface border border-surface-line rounded-lg p-4 text-sm">
                <strong className="block mb-1">Address</strong>
                {match.venue?.name}, {match.venue?.address}
                {match.venue?.lat && match.venue?.lng && (
                  <div className="mt-2">
                    <a
                      href={`https://maps.google.com/?q=${match.venue.lat},${match.venue.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-kenya-gold hover:underline"
                    >
                      Get directions
                    </a>
                  </div>
                )}
              </div>
              <div className="bg-surface border border-surface-line rounded-lg p-4 text-sm">
                <strong className="block mb-1">Your gate</strong>
                Your gate and entrance are printed on your ticket.
              </div>
              <div className="bg-surface border border-surface-line rounded-lg p-4 text-sm">
                <strong className="block mb-1">Flying in</strong>
                Fly to Jomo Kenyatta International Airport (NBO), then drive about 25 km to the stadium.
              </div>
              <Link to="/about" className="inline-block text-sm text-kenya-gold hover:underline">
                Learn more about the stadium →
              </Link>
            </div>
          </div>

          {Object.keys(faqs).length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 border-l-4 border-kenya-green pl-3">
                Frequently asked
              </h2>
              <div className="space-y-6">
                {Object.entries(faqs).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm uppercase tracking-wider text-ink-muted mb-2">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {items.map((f) => (
                        <details
                          key={f._id}
                          className="bg-surface border border-surface-line rounded-lg px-4 py-3 group"
                        >
                          <summary className="cursor-pointer font-semibold text-sm list-none flex justify-between">
                            {f.question}
                            <span className="text-ink-muted group-open:rotate-180 transition">
                              ▾
                            </span>
                          </summary>
                          <p className="mt-2 text-sm text-ink-muted">{f.answer}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-surface border border-surface-line rounded-xl p-5">
            <h3 className="font-bold mb-3 text-sm">Questions</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#faq" className="text-ink-muted hover:text-ink">How many tickets can I buy?</a></li>
              <li><a href="#faq" className="text-ink-muted hover:text-ink">How long are my seats held?</a></li>
            </ul>
          </div>
          <div className="bg-surface border border-surface-line rounded-xl p-5 text-sm">
            <h3 className="font-bold mb-2">Official ticket seller</h3>
            <p className="text-ink-muted">
              Secure mobile money and card. Tickets by SMS and e-mail, and under My tickets.
            </p>
          </div>
          <div className="bg-surface border border-surface-line rounded-xl p-5 text-sm">
            <h3 className="font-bold mb-2">Support</h3>
            {settings?.contact?.email && (
              <p className="text-ink-muted mb-1">
                <a href={`mailto:${settings.contact.email}`} className="hover:text-ink">
                  {settings.contact.email}
                </a>
              </p>
            )}
            {settings?.contact?.supportPhone && (
              <p className="text-ink-muted">
                <a href={`tel:${settings.contact.supportPhone}`} className="hover:text-ink">
                  {settings.contact.supportPhone}
                </a>
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}