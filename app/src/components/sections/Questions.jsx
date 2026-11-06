import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFaqs } from "../../api/faqs.js";
import { Spinner } from "../ui/index.js";

export default function Questions() {
  const [faqs, setFaqs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaqs()
      .then((r) => {
        const payload = r?.data ?? r ?? {};
        setFaqs(payload && typeof payload === "object" ? payload : {});
      })
      .catch(() => setFaqs({}))
      .finally(() => setLoading(false));
  }, []);

  const allQuestions = Object.values(faqs).flat();
  const preview = allQuestions.slice(0, 5);

  return (
    <section id="faq" className="border-b border-surface-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Questions</h2>
            <p className="text-ink-muted text-sm">
              Answers for ticketing, travel and matchday.
            </p>
          </div>
          <Link
            to="/faq"
            className="text-sm text-kenya-gold hover:underline whitespace-nowrap"
          >
            All questions →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-3">
            <Spinner size={20} />
            <span className="text-ink-muted text-sm">Loading questions…</span>
          </div>
        ) : preview.length === 0 ? (
          <p className="text-ink-muted text-sm">No questions yet.</p>
        ) : (
          <div className="space-y-2">
            {preview.map((f) => (
              <details
                key={f._id}
                className="bg-surface border border-surface-line rounded-xl px-5 py-4 group"
              >
                <summary className="cursor-pointer font-semibold text-sm list-none flex justify-between items-start gap-4">
                  <span>{f.question}</span>
                  <span className="text-ink-muted transition group-open:rotate-180 shrink-0">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}