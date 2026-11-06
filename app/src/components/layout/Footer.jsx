import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext.jsx";

const SOCIAL_LABELS = {
  twitter: "X",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export default function Footer() {
  const { settings } = useSettings();
  const brand = settings?.brand || {};
  const contact = settings?.contact || {};
  const social = settings?.social || {};

  return (
    <footer className="border-t border-surface-line bg-surface mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <img
            src={brand.logoUrl || "/logo.svg"}
            alt={brand.name || "Talanta Sports City"}
            className="h-10 w-auto mb-3"
          />
          <p className="text-sm text-ink-muted leading-relaxed">
            {contact.address || "Ngong Rd, Nairobi"}
          </p>
          <p className="mt-3 text-xs text-ink-muted">
            Official ticket seller for Bayern Munich vs Ajax at Talanta.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-muted mb-3">Tickets</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/events/fc-bayern-munchen-vs-afc-ajax/seats"
                className="text-ink-muted hover:text-ink"
              >
                Buy tickets
              </Link>
            </li>
            <li>
              <Link to="/tickets" className="text-ink-muted hover:text-ink">
                My tickets
              </Link>
            </li>
            <li>
              <Link to="/" className="text-ink-muted hover:text-ink">
                Match info
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-ink-muted hover:text-ink">
                Help and FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-muted mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="text-ink-muted hover:text-ink">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.supportPhone && (
              <li>
                <a href={`tel:${contact.supportPhone}`} className="text-ink-muted hover:text-ink">
                  {contact.supportPhone}
                </a>
              </li>
            )}
            {contact.hospitalityEmail && (
              <li>
                <a
                  href={`mailto:${contact.hospitalityEmail}`}
                  className="text-ink-muted hover:text-ink"
                >
                  Hospitality
                </a>
              </li>
            )}
            {contact.pressEmail && (
              <li>
                <a href={`mailto:${contact.pressEmail}`} className="text-ink-muted hover:text-ink">
                  Press
                </a>
              </li>
            )}
            <li>
              <Link to="/about" className="text-ink-muted hover:text-ink">
                About the Stadium
              </Link>
            </li>
            <li>
              <Link to="/ticketing-terms" className="text-ink-muted hover:text-ink">
                Ticketing Terms
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-muted mb-3">Follow</h4>
          <ul className="space-y-2 text-sm">
            {Object.entries(SOCIAL_LABELS).map(([key, label]) =>
              social[key] ? (
                <li key={key}>
                  <a
                    href={social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted hover:text-ink"
                  >
                    {label}
                  </a>
                </li>
              ) : null
            )}
            {!Object.values(social).some(Boolean) && (
              <li className="text-ink-muted text-xs">No socials configured</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-surface-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-ink-muted">
          <span>
            © {new Date().getFullYear()} {brand.name || "Talanta Sports City"} · {contact.address || "Ngong Rd, Nairobi"}
          </span>
          <span className="flex flex-wrap gap-4">
            <span>Secure mobile money & card</span>
            <span>Card details never touch this site</span>
          </span>
        </div>
      </div>
    </footer>
  );
}