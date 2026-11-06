import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFaqs } from "../api/faqs.js";
import { Spinner } from "../components/ui/index.js";

export default function AllQuestions() {
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

  const total = Object.values(faqs).reduce((n, arr) => n + (arr?.length || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <Link to="/" className="text-sm text-ink-muted hover:text-ink">
          ← Back
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-2">Questions</h1>
        <p className="text-ink-muted text-sm">
          Answers for ticketing, travel and matchday.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner size={20} />
          <span className="text-ink-muted text-sm">Loading questions…</span>
        </div>
      ) : total === 0 ? (
        <p className="text-ink-muted text-sm">No questions yet.</p>
      ) : (
        <div className="space-y-10">
          {Object.entries(faqs).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xs uppercase tracking-wider text-ink-muted mb-3">
                {category}
              </h2>
              <div className="space-y-2">
                {items.map((f) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}