import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPaystack } from "../api/payments.js";
import { Spinner } from "../components/ui/index.js";

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [state, setState] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setState("error");
      setMessage("Missing payment reference.");
      return;
    }

    let cancelled = false;

    verifyPaystack(reference)
      .then((r) => {
        if (cancelled) return;
        const data = r?.data ?? r ?? {};
        const paystackStatus = data.paystackStatus;

        if (paystackStatus === "success") {
          setState("success");
          setTimeout(() => {
            if (!cancelled) {
              nav(`/payment/${data.paymentId}`, { replace: true });
            }
          }, 1200);
        } else if (paystackStatus === "failed" || paystackStatus === "abandoned") {
          setState("failed");
          setMessage("Payment was not completed. You can try again.");
        } else {
          // "ongoing" | "pending" | "queued" — ask user to wait or check tickets
          setState("pending");
          setMessage("Payment is still processing. Check your tickets in a moment.");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setState("error");
        setMessage(err?.message || "Could not confirm payment.");
      });

    return () => {
      cancelled = true;
    };
  }, [params, nav]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      {state === "verifying" && (
        <>
          <Spinner size={32} />
          <p className="text-ink-muted">Confirming your payment…</p>
        </>
      )}

      {state === "success" && (
        <p className="text-kenya-green font-bold text-lg">
          Payment confirmed! Redirecting to your tickets…
        </p>
      )}

      {state === "failed" && (
        <>
          <p className="text-kenya-red font-bold text-lg">{message}</p>
          <button
            onClick={() => nav(-1)}
            className="text-sm text-ink-muted hover:text-ink underline"
          >
            Go back
          </button>
        </>
      )}

      {state === "pending" && (
        <>
          <p className="text-kenya-gold font-bold text-lg">{message}</p>
          <button
            onClick={() => nav("/tickets")}
            className="text-sm text-ink-muted hover:text-ink underline"
          >
            View my tickets
          </button>
        </>
      )}

      {state === "error" && (
        <>
          <p className="text-kenya-red font-bold text-lg">{message}</p>
          <button
            onClick={() => nav("/tickets")}
            className="text-sm text-ink-muted hover:text-ink underline"
          >
            Check my tickets
          </button>
        </>
      )}
    </div>
  );
}