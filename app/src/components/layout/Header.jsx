import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Logo } from "../ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";

const SEATS_PATH = "/events/fc-bayern-munchen-vs-afc-ajax/seats";

const SOCIAL_LABELS = {
  twitter: "X",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export default function Header() {
  const navigate = useNavigate();
  const { isAuthed, identifier, logout } = useAuth();
  const { settings } = useSettings();
  const social = settings?.social || {};

  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("tsc_theme");
    if (stored) return stored === "dark";
    return true;
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tsc_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const goSeats = () => {
    close();
    navigate(SEATS_PATH);
  };

  const goAccount = () => {
    close();
    if (isAuthed) {
      navigate("/tickets");
    } else {
      navigate("/login", { state: { from: "/tickets" } });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-kenya-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-6">
          <Link
            to="/"
            className="flex items-center gap-1 shrink-0 whitespace-nowrap"
            onClick={close}
          >
            <Logo size="md" to={null} />

            <span className="hidden sm:inline text-sm sm:text-base font-extrabold tracking-[0.18em] text-white uppercase">
              Talanta Sports City
            </span>

            <span className="sm:hidden flex flex-col leading-none">
              <span className="text-sm font-extrabold tracking-[0.18em] text-white uppercase">
                Talanta
              </span>
              <span className="text-[10px] font-semibold tracking-[0.14em] text-white/60 uppercase mt-0.5">
                Sports City
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button
              onClick={goSeats}
              className="text-white/70 hover:text-white"
            >
              Match info
            </button>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-kenya-gold font-semibold"
                  : "text-white/70 hover:text-white"
              }
            >
              About
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg border border-white/20 text-white/70 hover:text-white"
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <button
              onClick={goAccount}
              aria-label={isAuthed ? "My tickets" : "Log in"}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40"
            >
              {isAuthed ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="M6.5 19a6 6 0 0 1 11 0" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              )}
            </button>

            <Link
              to={SEATS_PATH}
              onClick={close}
              className="bg-kenya-green text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm hover:brightness-110"
            >
              Tickets
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-white/20 text-white"
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-kenya-black overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 text-sm text-white">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-3">
                Menu
              </h3>
              <div className="space-y-1">
                <Link
                  to={SEATS_PATH}
                  onClick={close}
                  className="block py-2 text-white font-semibold"
                >
                  Buy tickets
                </Link>
                <Link
                  to={SEATS_PATH}
                  onClick={close}
                  className="block py-2 text-white"
                >
                  Match info
                </Link>
                <p className="py-2 text-white/60 text-xs">
                  Tue 5 Jan · 11:00 · rules, gates
                </p>

                {isAuthed ? (
                  <>
                    <div className="py-2 text-white/60 text-xs">
                      Signed in as {identifier}
                    </div>
                    <Link
                      to="/tickets"
                      onClick={close}
                      className="block py-2 text-white font-semibold"
                    >
                      My tickets
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        close();
                      }}
                      className="block py-2 text-kenya-red"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={close}
                      className="block py-2 text-white font-semibold"
                    >
                      Log in
                    </Link>
                    <p className="py-2 text-white/60 text-xs">
                      See your tickets: no password, we send a code
                    </p>
                  </>
                )}

                <div className="flex items-center justify-between py-2 border-t border-white/15 mt-2 pt-3">
                  <span className="text-white">Dark theme</span>
                  <button
                    onClick={() => setDark((d) => !d)}
                    aria-label="Toggle theme"
                    className={`w-11 h-6 rounded-full border transition relative ${
                      dark
                        ? "bg-kenya-green border-kenya-green"
                        : "bg-white/20 border-white/30"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 rounded-full bg-white transition ${
                        dark ? "left-[22px]" : "left-0.5"
                      }`}
                      style={{ width: 18, height: 18 }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-3">
                Help and contact
              </h3>
              <div className="space-y-1">
                <Link to="/faq" onClick={close} className="block py-2 text-white">
                  FAQ
                </Link>
                <Link to="/about" onClick={close} className="block py-2 text-white">
                  About
                </Link>
                <Link
                  to="/ticketing-terms"
                  onClick={close}
                  className="block py-2 text-white"
                >
                  Ticketing terms
                </Link>
                <a href="#" onClick={close} className="block py-2 text-white">
                  Terms
                </a>
                <a href="#" onClick={close} className="block py-2 text-white">
                  Privacy
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-3">
                Follow
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SOCIAL_LABELS).map(([key, label]) =>
                  social[key] ? (
                    <a
                      key={key}
                      href={social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white"
                    >
                      {label}
                    </a>
                  ) : null
                )}
                {!Object.values(social).some(Boolean) && (
                  <span className="text-xs text-white/50">No socials configured</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}