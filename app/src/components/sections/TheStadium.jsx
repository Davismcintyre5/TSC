import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useImages } from "../../context/ImagesContext.jsx";

export default function TheStadium() {
  const { images } = useImages();
  const stadiumImages = images?.stadium || [];

  const [index, setIndex] = useState(0);
  const total = stadiumImages.length;

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 5000);
    return () => clearInterval(t);
  }, [total]);

  return (
    <section id="stadium" className="border-b border-surface-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-kenya-gold mb-3">
            The Stadium
          </p>

          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4 uppercase">
            Raila Odinga International Stadium
          </h2>

          <p className="text-ink-muted leading-relaxed mb-8">
            Welcome to the Raila Odinga International Stadium, a 60,000-seat venue
            built for the passion of sports and the energy of live entertainment.
            This is where Kenya's sporting ambition meets the world.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-surface border border-surface-line rounded-xl p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-ink">60,000</div>
              <div className="text-xs text-ink-muted mt-1">seats</div>
            </div>
            <div className="bg-surface border border-surface-line rounded-xl p-4">
              <div className="text-lg sm:text-xl font-extrabold text-ink">Ngong Rd</div>
              <div className="text-xs text-ink-muted mt-1">Nairobi</div>
            </div>
            <div className="bg-surface border border-surface-line rounded-xl p-4">
              <div className="text-lg sm:text-xl font-extrabold text-ink">AFCON</div>
              <div className="text-xs text-ink-muted mt-1">2027 co-host</div>
            </div>
          </div>

          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-kenya-green text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:brightness-110"
          >
            About the Stadium
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative w-full aspect-[4/3] bg-surface border border-surface-line rounded-2xl overflow-hidden">
          {total === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-ink-muted text-sm">
              No stadium images yet
            </div>
          ) : (
            <>
              {stadiumImages.map((img, i) => (
                <img
                  key={img._id}
                  src={img.url}
                  alt={img.alt || `Stadium ${i + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ))}

              {total > 1 && (
                <>
                  <button
                    onClick={() => setIndex((i) => (i - 1 + total) % total)}
                    aria-label="Previous"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-kenya-black/70 text-ink flex items-center justify-center hover:bg-kenya-black"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setIndex((i) => (i + 1) % total)}
                    aria-label="Next"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-kenya-black/70 text-ink flex items-center justify-center hover:bg-kenya-black"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {stadiumImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`w-2 h-2 rounded-full transition ${
                          i === index ? "bg-kenya-gold" : "bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}