import { useImages } from "../../context/ImagesContext.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import { money } from "../../utils/format.js";

const PACKAGES = [
  {
    key: "Skybox",
    title: "Skybox",
    price: null,
    blurb:
      "Private skybox for the match. Booked by email — availability, inclusions and pricing on request.",
    cta: "email",
  },
  {
    key: "Platinum",
    title: "Platinum Hospitality",
    price: 20000,
    blurb:
      "Premium seating, elevated views and an exclusive hospitality lounge.",
    cta: "buy",
  },
  {
    key: "Gold",
    title: "Gold Hospitality",
    price: 12000,
    blurb:
      "Comfortable hospitality seating with access to curated food and drink.",
    cta: "buy",
  },
];

export default function Hospitality() {
  const { images } = useImages();
  const { settings } = useSettings();
  const hospitalityEmail = settings?.contact?.hospitalityEmail || "hospitality@talantasportscity.com";

  const items = images?.hospitality || [];
  const byLabel = (label) =>
    items.find((i) => (i.label || "").toLowerCase() === label.toLowerCase());

  return (
    <section id="hospitality" className="border-b border-surface-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-kenya-gold mb-3">
            Premium experiences
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase mb-2">
            Hospitality
          </h2>
          <p className="text-ink-muted text-sm max-w-2xl">
            Skyboxes, Platinum and Gold packages for the inaugural match. Group and
            corporate enquiries welcome.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PACKAGES.map((p) => {
            const img = byLabel(p.key);
            return (
              <div
                key={p.key}
                className="bg-surface border border-surface-line rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-surface-alt">
                  {img?.url ? (
                    <img
                      src={img.url}
                      alt={img.alt || p.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ink-muted text-xs">
                      Image coming soon
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-1">{p.title}</h3>

                  {p.price ? (
                    <p className="text-kenya-gold font-extrabold mb-2">
                      From {money(p.price)}
                    </p>
                  ) : (
                    <p className="text-ink-muted text-xs mb-2">Enquire for pricing</p>
                  )}

                  <p className="text-sm text-ink-muted leading-relaxed flex-1">
                    {p.blurb}
                  </p>

                  <div className="mt-4">
                    {p.cta === "email" ? (
                      <a
                        href={`mailto:${hospitalityEmail}?subject=Skybox%20enquiry`}
                        className="inline-flex items-center gap-2 bg-kenya-green text-white rounded-lg px-4 py-2 text-sm font-semibold hover:brightness-110"
                      >
                        Enquire by email
                      </a>
                    ) : (
                      <a
                        href="/events/fc-bayern-munchen-vs-afc-ajax/seats"
                        className="inline-flex items-center gap-2 bg-kenya-green text-white rounded-lg px-4 py-2 text-sm font-semibold hover:brightness-110"
                      >
                        Book {p.title.split(" ")[0]}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-ink-muted">
          Group or corporate hospitality?{" "}
          <a
            href={`mailto:${hospitalityEmail}`}
            className="text-kenya-gold hover:underline"
          >
            {hospitalityEmail}
          </a>
        </p>
      </div>
    </section>
  );
}