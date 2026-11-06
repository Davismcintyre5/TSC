import { Link } from "react-router-dom";
import { useImages } from "../../context/ImagesContext.jsx";
import { Button } from "../ui/index.js";

const SEATS_PATH = "/events/fc-bayern-munchen-vs-afc-ajax/seats";

export default function Hero() {
  const { images } = useImages();

  const heroImages = images?.hero || [];

  const background =
    heroImages.find((i) => i.order === 0) || heroImages[0];

  const bayernLogo =
    heroImages.find((i) => i.label === "bayern") ||
    heroImages.find((i) => i.order === 1);

  const ajaxLogo =
    heroImages.find((i) => i.label === "ajax") ||
    heroImages.find((i) => i.order === 2);

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-surface-line min-h-[560px] sm:min-h-[640px] flex items-center"
    >
      {background?.url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background.url})` }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-b from-kenya-black/80 via-kenya-black/65 to-kenya-black/95"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {(bayernLogo?.url || ajaxLogo?.url) && (
          <div className="flex items-center gap-3 sm:gap-4 mb-10">
            {bayernLogo?.url && (
              <img
                src={bayernLogo.url}
                alt={bayernLogo.alt || "Bayern Munich"}
                className="h-12 sm:h-16 w-auto drop-shadow-lg"
              />
            )}
            {bayernLogo?.url && ajaxLogo?.url && (
              <span className="text-xl sm:text-2xl text-white/50 font-light">|</span>
            )}
            {ajaxLogo?.url && (
              <img
                src={ajaxLogo.url}
                alt={ajaxLogo.alt || "Ajax"}
                className="h-12 sm:h-16 w-auto drop-shadow-lg"
              />
            )}
          </div>
        )}

        <h1 className="font-extrabold text-white leading-[1.02] tracking-tight text-5xl sm:text-7xl lg:text-8xl">
          <span className="block uppercase">Bayern Munich</span>
          <span className="block text-xl sm:text-2xl lg:text-3xl font-semibold text-white/60 my-3 sm:my-4 normal-case">
            vs
          </span>
          <span className="block uppercase">Ajax</span>
        </h1>

        <p className="mt-8 text-white/70 text-sm sm:text-base leading-relaxed">
          <span className="text-white font-semibold">Tue 5 Jan 2027</span>
          {" · "}
          Gates open at 11:00
          <br />
          Raila Odinga International Stadium, Nairobi
        </p>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <Link to={SEATS_PATH}>
            <Button variant="primary" size="lg">Buy tickets</Button>
          </Link>
          <Link
            to={SEATS_PATH}
            className="text-sm text-white/70 hover:text-white underline underline-offset-4"
          >
            From KSh 2,500 per seat · All prices
          </Link>
        </div>
      </div>
    </section>
  );
}