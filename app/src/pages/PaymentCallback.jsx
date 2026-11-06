import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPaystack } from "../api/payments.js";
import { Spinner } from "../components/ui/index.js";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10;

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [state, setState] = useState("verifying");
  const [message, setMessage] = useState("");
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setState("error");
      setMessage("Missing payment reference.");
      return;
    }

    let pollCount = 0;
    let timer = null;

    const verify = async () => {
      if (cancelledRef.current) return;
      try {
        const r = await verifyPaystack(reference);
        if (cancelledRef.current) return;

        const data = r?.data?.data ?? r?.data ?? r;
        const paystackStatus = data?.paystackStatus;
        const paymentId = data?.paymentId;

        if (paystackStatus === "success") {
          setState("success");
          setTimeout(() => {
            if (!cancelledRef.current) {
              nav(paymentId ? `/payment/${paymentId}` : "/tickets", { replace: true });
            }
          }, 1200);
          return;
        }

        if (paystackStatus === "failed" || paystackStatus === "abandoned") {
          setState("failed");
          setMessage("Payment was not completed. You can try again.");
          return;
        }

        // "ongoing" | "pending" | "queued" — poll
        pollCount += 1;
        if (pollCount >= MAX_POLLS) {
          setState("pending");
          setMessage("Payment is still processing. Check your tickets in a moment.");
          return;
        }
        setState("verifying");
        timer = setTimeout(verify, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelledRef.current) return;
        setState("error");
        setMessage(err?.message || "Could not confirm payment.");
      }
    };

    verify();

    return () => {
      cancelledRef.current = true;
      if (timer) clearTimeout(timer);
    };
  }, [params, nav]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      {state === "verifying" && (
        <>
          <Spinner size={32} />
          <p className="text-ink-muted">Confirming your payment…</p>
          <p className="text-xs text-ink-muted/70">Do not close this page.</p>
        </>
      )}

      {state === "success" && (
        <>
          <div className="w-12 h-12 rounded-full bg-kenya-green/15 text-kenya-green flex items-center justify-center text-2xl">
            ✓
          </div>
          <p className="text-kenya-green font-bold text-lg">Payment confirmed</p>
          <p className="text-sm text-ink-muted">Redirecting to your tickets…</p>
        </>
      )}

      {state === "failed" && (
        <>
          <div className="w-12 h-12 rounded-full bg-kenya-red/15 text-kenya-red flex items-center justify-center text-2xl">
            ✕
          </div>
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