import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { paymentStatus } from "../api/payments.js";
import { usePayment } from "../context/PaymentContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { Button, Badge, Spinner } from "../components/ui/index.js";
import { money } from "../utils/format.js";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "../utils/constants.js";

export default function PaymentStatus() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { reference, reset } = usePayment();

  const [pay, setPay] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  const poll = async () => {
    try {
      const r = await paymentStatus(id);
      setPay(r.data);
      if (["paid", "failed", "refunded"].includes(r.data.status)) {
        clearInterval(timer.current);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    poll();
    timer.current = setInterval(poll, 3000);
    return () => clearInterval(timer.current);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!pay) return <div className="py-16 text-center text-ink-muted">Payment not found.</div>;

  const isPending = pay.status === "pending";
  const isAwaiting = pay.status === "awaiting_confirmation";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-2">Payment</h1>
      <p className="text-sm text-ink-muted mb-6">
        {PAYMENT_METHODS[pay.method]} · {money(pay.amount, pay.currency)}
      </p>

      <div className="bg-surface border border-surface-line rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-muted">Status</span>
          <Badge tone={pay.status}>{PAYMENT_STATUSES[pay.status]}</Badge>
        </div>

        {isPending && (
          <p className="text-sm text-ink-muted">
            Waiting for confirmation. This page updates automatically.
          </p>
        )}

        {isAwaiting && reference && (
          <div className="bg-surface-alt border border-surface-line rounded-lg p-4 text-sm space-y-2">
            <p className="font-semibold">Bank transfer</p>
            <p><span className="text-ink-muted">Bank:</span> {reference.instructions?.bankName}</p>
            <p><span className="text-ink-muted">Account:</span> {reference.instructions?.accountName}</p>
            <p><span className="text-ink-muted">Number:</span> {reference.instructions?.accountNumber}</p>
            <p><span className="text-ink-muted">Reference:</span> <span className="text-kenya-gold font-bold">{reference.reference}</span></p>
            <p className="text-ink-muted text-xs">
              Your tickets will be issued once payment is confirmed.
            </p>
          </div>
        )}

        {pay.status === "paid" && (
          <div className="space-y-3">
            <p className="text-kenya-green font-bold">Payment received. Your tickets are ready.</p>
            <Button onClick={() => { reset(); nav("/tickets"); }}>View my tickets</Button>
          </div>
        )}

        {pay.status === "failed" && (
          <div className="space-y-3">
            <p className="text-kenya-red font-bold">Payment failed.</p>
            <Button onClick={() => { reset(); nav("/buy"); }}>Try again</Button>
          </div>
        )}
      </div>
    </div>
  );
}