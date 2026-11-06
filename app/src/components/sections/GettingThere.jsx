import { useSettings } from "../../context/SettingsContext.jsx";

const MAP_QUERY = "Raila Odinga International Stadium, Ngong Rd, Nairobi";

export default function GettingThere() {
  const { settings } = useSettings();
  const contact = settings?.contact || {};

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_QUERY)}`;

  return (
    <section id="getting-there" className="border-b border-surface-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-kenya-gold mb-3">
            Plan your visit
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase mb-2">
            Getting There
          </h2>
          <p className="text-ink-muted text-sm">
            Everything you need to reach the stadium on matchday.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-surface border border-surface-line rounded-xl p-6">
            <h3 className="text-sm font-bold mb-2">Address</h3>
            <p className="text-ink-muted text-sm leading-relaxed">
              Raila Odinga International Stadium
              <br />
              {contact.address || "Jamhuri Grounds, Ngong Rd, Nairobi"}
            </p>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-kenya-gold hover:underline"
            >
              Get directions →
            </a>
          </div>

          <div className="bg-surface border border-surface-line rounded-xl p-6">
            <h3 className="text-sm font-bold mb-2">Your gate</h3>
            <p className="text-ink-muted text-sm leading-relaxed">
              Your gate and entrance are printed on your ticket. Check your
              ticket before you travel.
            </p>
          </div>

          <div className="bg-surface border border-surface-line rounded-xl p-6">
            <h3 className="text-sm font-bold mb-2">Flying in</h3>
            <p className="text-ink-muted text-sm leading-relaxed">
              Fly to Jomo Kenyatta International Airport (NBO), then drive about
              25 km to the stadium.
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-kenya-gold hover:underline"
            >
              Open in Maps →
            </a>
          </div>
        </div>

        <div className="mt-6 bg-surface border border-surface-line rounded-xl p-6">
          <h3 className="text-sm font-bold mb-2">On the day</h3>
          <ul className="text-ink-muted text-sm space-y-1.5">
            <li>Gates open at 11:00. Kick-off at 20:15.</li>
            <li>No parking at the stadium. Use public transport or drop-off.</li>
            <li>No re-entry once you enter. Bring everything you need.</li>
            <li>Expect security screening and ticket checks at all entrances.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}