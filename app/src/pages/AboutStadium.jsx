import { Link } from "react-router-dom";

export default function AboutStadium() {
  return (
    <div>
      <section className="bg-gradient-to-b from-surface-alt to-kenya-black border-b border-surface-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-sm text-ink-muted mb-2">
            <Link to="/" className="hover:text-ink">Home</Link> › About the Stadium
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            About the Stadium
          </h1>
          <p className="mt-4 text-ink-muted">
            Raila Odinga International Stadium at Talanta Sports City
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <article className="space-y-4 text-ink-muted leading-relaxed">
          <p>
            The Raila Odinga International Stadium at Talanta Sports City is a{" "}
            <span className="text-ink font-semibold">60,000-seat venue</span> designed to welcome
            the world's best athletes, leading international competitions, live entertainment and
            the fans who make every occasion extraordinary.
          </p>
          <p>
            It represents Kenya's ambition to build a lasting home for major events. From
            international football fixtures and continental tournaments to concerts and major
            cultural celebrations, the stadium is intended to provide a stage for events that
            capture the imagination of audiences in Kenya and beyond.
          </p>
          <p>
            It bears the name of the late Rt. Hon. Raila Amolo Odinga, former Prime Minister of
            the Republic of Kenya, in recognition of his contribution to Kenya's democratic
            journey and national development. Its name connects a new national landmark to a
            legacy of public service, resilience and belief in Kenya's potential.
          </p>
          <p>
            As future generations of athletes and supporters make their own memories here, the
            stadium will stand as a reminder of the power of shared ambition and national purpose.
          </p>
        </article>

        <article>
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-kenya-green pl-3">
            A home for generations
          </h2>
          <div className="space-y-4 text-ink-muted leading-relaxed">
            <p>
              Great stadiums are remembered for the events they host and for the memories they
              create. They are places where children discover their heroes, families celebrate
              together, athletes achieve lifelong dreams and communities share moments that endure.
            </p>
            <p>
              The ambition for the Raila Odinga International Stadium is to become such a place:
              a home for sporting excellence, live entertainment and experiences that connect
              Kenya to the world.
            </p>
          </div>
        </article>

        <article>
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-kenya-green pl-3">
            The road to AFCON 2027
          </h2>
          <div className="space-y-4 text-ink-muted leading-relaxed">
            <p>
              The Raila Odinga International Stadium is a significant part of Kenya's preparations
              to co-host the 2027 Africa Cup of Nations alongside Uganda and Tanzania under the
              PAMOJA partnership.
            </p>
            <p>
              The stadium's inauguration, scheduled for{" "}
              <span className="text-ink font-semibold">5th January 2027</span> with an international
              friendly between FC Bayern Munich and AFC Ajax Amsterdam, will also provide an
              opportunity to test key event operations ahead of the tournament.
            </p>
            <p>
              These preparations will complement the formal inspections, standards and approvals
              required for AFCON 2027.
            </p>
          </div>
        </article>

        <div className="bg-surface border border-surface-line rounded-xl p-6 text-center">
          <p className="text-lg font-bold text-kenya-gold mb-3">
            Welcome to the Raila Odinga International Stadium.
          </p>
          <Link
            to="/"
            className="inline-block bg-kenya-green text-white px-5 py-2.5 rounded-lg font-semibold hover:brightness-110"
          >
            Back to match info
          </Link>
        </div>
      </section>
    </div>
  );
}