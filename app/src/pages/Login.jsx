import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as authApi from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { Button, Input } from "../components/ui/index.js";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/tickets";

  const [step, setStep] = useState("identifier");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await authApi.requestCode(identifier);
      setSentTo(r.data?.sentTo || []);
      setStep("code");
      toast.success("Code sent.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await authApi.verifyCode(identifier, code);
      login(r.data.token, r.data.identifier);
      nav(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sentLabel = () => {
    if (sentTo.includes("email") && sentTo.includes("sms")) {
      return "your email and phone";
    }
    if (sentTo.includes("email")) return "your email";
    if (sentTo.includes("sms")) return "your phone";
    return identifier;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-extrabold mb-2">Log in</h1>
      <p className="text-sm text-ink-muted mb-6">
        Use the phone number or e-mail you bought with. We'll send you a code — no password.
      </p>

      {step === "identifier" ? (
        <form onSubmit={sendCode} className="space-y-4">
          <Input
            label="Phone or e-mail"
            placeholder="0712 345 678 or you@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Send code
          </Button>
          <p className="text-xs text-ink-muted text-center">
            By logging in you agree to the Terms and the Privacy Policy.
          </p>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-sm text-ink-muted">
            Code sent to <strong className="text-ink">{sentLabel()}</strong>
          </p>
          <Input
            label="Enter code"
            placeholder="123456"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Verify
          </Button>
          <button
            type="button"
            onClick={() => setStep("identifier")}
            className="w-full text-xs text-ink-muted hover:text-ink"
          >
            Use a different identifier
          </button>
        </form>
      )}
    </div>
  );
}