import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../api/match.js";
import { holdTickets } from "../api/payments.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usePayment } from "../context/PaymentContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { Button, Spinner } from "../components/ui/index.js";
import { money } from "../utils/format.js";
import { TIERS } from "../utils/constants.js";

export default function Buy() {
  const nav = useNavigate();
  const toast = useToast();
  const { identifier, isAuthed } = useAuth();
  const { setHold } = usePayment();

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then((r) => {
        setCategories(r.data);
        setSelected(r.data[0]?._id || null);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cat = categories.find((c) => c._id === selected);
  const total = cat ? cat.price * quantity : 0;

  const submit = async () => {
    if (!isAuthed) {
      nav("/login", { state: { from: "/buy" } });
      return;
    }
    if (!cat) return;
    setSubmitting(true);
    try {
      const r = await holdTickets({
        identifier,
        items: [{ categoryId: cat._id, quantity }],
      });
      setHold(r.data);
      nav("/checkout");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-6">Choose your ticket</h1>

      <div className="space-y-3 mb-8">
        {categories.map((c) => (
          <label
            key={c._id}
            className={`block cursor-pointer bg-surface border rounded-xl p-4 transition ${
              selected === c._id ? "border-kenya-gold" : "border-surface-line hover:border-ink-muted"
            }`}
          >
            <input
              type="radio"
              name="category"
              value={c._id}
              checked={selected === c._id}
              onChange={() => setSelected(c._id)}
              className="sr-only"
            />
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-ink-muted">
                  {c.section} · {TIERS[c.tier]}
                </div>
              </div>
              <div className="text-right font-extrabold text-kenya-gold">
                {money(c.price, c.currency)}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="bg-surface border border-surface-line rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">Quantity (max 6)</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 bg-surface-alt border border-surface-line rounded-lg"
            >
              −
            </button>
            <span className="w-8 text-center font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(6, q + 1))}
              className="w-8 h-8 bg-surface-alt border border-surface-line rounded-lg"
            >
              +
            </button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-surface-line flex justify-between font-bold">
          <span>Total</span>
          <span className="text-kenya-gold">{money(total)}</span>
        </div>
      </div>

      <Button onClick={submit} loading={submitting} className="w-full" size="lg">
        Continue
      </Button>
    </div>
  );
}