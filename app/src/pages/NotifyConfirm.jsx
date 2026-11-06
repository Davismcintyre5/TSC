import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { confirmNotify } from "../api/notify.js";
import { Spinner } from "../components/ui/index.js";

export default function NotifyConfirm() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    confirmNotify(token)
      .then(() => setState("ok"))
      .catch(() => setState("invalid"));
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {state === "loading" && <Spinner size={32} />}
      {state === "ok" && (
        <>
          <h1 className="text-2xl font-extrabold mb-2">Confirmed</h1>
          <p className="text-ink-muted mb-6">
            You're on the list. We'll email you when tickets go on sale.
          </p>
          <Link to="/" className="text-kenya-gold hover:underline">Back to match</Link>
        </>
      )}
      {state === "invalid" && (
        <>
          <h1 className="text-2xl font-extrabold mb-2">Invalid link</h1>
          <p className="text-ink-muted mb-6">This confirmation link is invalid or has been used.</p>
          <Link to="/" className="text-kenya-gold hover:underline">Back to match</Link>
        </>
      )}
    </div>
  );
}