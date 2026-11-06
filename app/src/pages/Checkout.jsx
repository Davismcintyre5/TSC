import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mpesaInitiate, cardIntent, bankInstructions } from "../api/payments.js";
import { usePayment } from "../context/PaymentContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { Button, Input } from "../components/ui/index.js";
import { money } from "../utils/format.js";
import {
  COMMON_COUNTRIES,
  REST_COUNTRIES,
  findCountry,
  DEFAULT_COUNTRY,
} from "../utils/countries.js";

const METHODS = [
  { key: "mpesa", label: "M-PESA", hint: "Prompt on your phone", icon: "M" },
  { key: "airtel", label: "Airtel Money", hint: "Prompt on your phone", icon: "A", disabled: true },
  { key: "card", label: "Card", hint: "Visa, Mastercard or Amex", icon: "C" },
];

export default function Checkout() {
  const nav = useNavigate();
  const toast = useToast();
  const { hold, setMethod, setReference } = usePayment();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY.code);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethodState] = useState("mpesa");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hold) nav("/events/fc-bayern-munchen-vs-afc-ajax/seats", { replace: true });
  }, [hold, nav]);

  const country = findCountry(countryCode);
  const seats = useMemo(() => hold?.seats || [], [hold]);
  const qty = seats.length || hold?.ticketIds?.length || 0;

  if (!hold) return null;

  const buildFullPhone = () => {
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
    const dial = country.dial.replace(/^\+/, "");
    return `${dial}${digits}`;
  };

  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Enter your first and last name");
      return false;
    }
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return false;
    }
    if (method === "mpesa") {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 7) {
        toast.error("Enter a valid M-Pesa phone");
        return false;
      }
    }
    if (!agree) {
      toast.error("Agree to the Terms of Sale to continue");
      return false;
    }
    return true;
  };

  const pay = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (method === "mpesa") {
        const r = await mpesaInitiate(
          hold.paymentId,
          buildFullPhone(),
          email,
          firstName,
          lastName
        );

        const accessCode =
          r?.data?.data?.accessCode ||
          r?.data?.accessCode ||
          r?.accessCode;

        const redirectUrl =
          r?.data?.data?.authorizationUrl ||
          r?.data?.authorizationUrl ||
          r?.authorizationUrl;

        if (!accessCode && !redirectUrl) {
          toast.error("Could not start payment. Please try again.");
          return;
        }

        setMethod("mpesa");

        // Small-screen fallback: use full-page checkout instead of the popup,
        // because the Paystack modal can be cramped on very narrow viewports.
        const isSmall = window.matchMedia("(max-width: 480px)").matches;
        if (isSmall && redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }

        if (typeof window.PaystackPop === "undefined") {
          if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
          }
          toast.error("Payment library not loaded. Refresh the page.");
          return;
        }

        const popup = new window.PaystackPop();
        popup.resumeTransaction(accessCode, {
          onSuccess: (transaction) => {
            nav(`/payment/callback?reference=${transaction.reference}`);
          },
          onCancel: () => {
            toast.error("Payment cancelled.");
          },
          onError: (err) => {
            toast.error(err?.message || "Payment failed. Please try again.");
          },
        });

        return;
      } else if (method === "card") {
        await cardIntent(hold.paymentId, email, firstName, lastName, buildFullPhone());
        setMethod("card");
      } else if (method === "bank") {
        const r = await bankInstructions(hold.paymentId, email, firstName, lastName, buildFullPhone());
        setMethod("bank");
        setReference(r.data);
      }
      nav(`/payment/${hold.paymentId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 lg:pb-10">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-extrabold">Checkout</h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Reserved seating · {qty} seat{qty !== 1 ? "s" : ""} · Tue 5 Jan 2027 · 11:00
        </p>
      </div>

      <form onSubmit={pay} className="grid gap-5 sm:gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 sm:space-y-6">
          <section className="bg-surface border border-surface-line rounded-xl p-4 sm:p-5">
            <h2 className="font-bold mb-3 sm:mb-4">Your details</h2>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="mt-3 sm:mt-4">
              <label className="text-sm text-ink-muted block mb-1.5">
                Phone that will pay
              </label>
              {/* Stack country selector above phone on very small screens */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full sm:w-auto bg-surface-alt border border-surface-line rounded-lg px-2.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-kenya-gold"
                  aria-label="Country code"
                >
                  <optgroup label="Common">
                    {COMMON_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} {c.dial}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="All countries">
                    {REST_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} {c.dial}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <div className="flex-1 flex items-center gap-2 bg-surface border border-surface-line rounded-lg px-3">
                  <span className="text-sm text-ink-muted shrink-0">{country.dial}</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="712 345 678"
                    className="flex-1 min-w-0 bg-transparent py-2.5 text-ink placeholder:text-ink-muted/60 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4">
              <Input
                label="E-mail"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </section>

          <section className="bg-surface border border-surface-line rounded-xl p-4 sm:p-5">
            <h2 className="font-bold mb-3 sm:mb-4">Pay with</h2>
            <div className="space-y-2">
              {METHODS.map((m) => (
                <label
                  key={m.key}
                  className={`flex items-center gap-3 bg-surface-alt border rounded-lg px-3 sm:px-4 py-3 cursor-pointer transition ${
                    method === m.key
                      ? "border-kenya-gold ring-1 ring-kenya-gold"
                      : "border-surface-line hover:border-ink-muted"
                  } ${m.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.key}
                    checked={method === m.key}
                    onChange={() => !m.disabled && setMethodState(m.key)}
                    disabled={m.disabled}
                    className="sr-only"
                  />
                  <span className="w-8 h-8 shrink-0 rounded-lg bg-kenya-green text-white flex items-center justify-center font-bold text-sm">
                    {m.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{m.label}</div>
                    <div className="text-xs text-ink-muted truncate">{m.hint}</div>
                  </div>
                  {m.disabled && (
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted shrink-0">
                      Soon
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>

          <label className="flex items-start gap-3 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 w-4 h-4 shrink-0 accent-kenya-green"
            />
            <span className="text-ink-muted">
              I agree to the{" "}
              <a
                href="/ticketing-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-kenya-gold hover:underline"
              >
                Terms of Sale
              </a>
              .
            </span>
          </label>
        </div>

        {/* Desktop summary — sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-20 h-fit">
          <SummaryCard hold={hold} seats={seats} qty={qty} onSubmit={pay} loading={loading} />
        </aside>
      </form>

      {/* Mobile sticky footer with total + Continue */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-surface-line px-4 py-3 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-ink-muted">
            {qty} seat{qty !== 1 ? "s" : ""}
          </div>
          <div className="text-base font-extrabold text-kenya-gold">
            {money(hold.amount, hold.currency)}
          </div>
        </div>
        <Button
          type="button"
          onClick={pay}
          loading={loading}
          size="lg"
          className="shrink-0"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ hold, seats, qty, onSubmit, loading }) {
  return (
    <div className="bg-surface border border-surface-line rounded-xl p-4 sm:p-5">
      <h2 className="font-bold mb-3">Seats</h2>

      {seats.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {seats.map((s, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-ink-muted truncate">
                {s.section} · Row {s.row} · Seat {s.number}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">
          {qty} seat{qty !== 1 ? "s" : ""} reserved
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-surface-line flex justify-between font-bold text-base">
        <span>Total</span>
        <span className="text-kenya-gold">{money(hold.amount, hold.currency)}</span>
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        loading={loading}
        className="w-full mt-5"
        size="lg"
      >
        Continue
      </Button>

      <p className="text-[11px] text-ink-muted text-center mt-3">
        Seats held for 15 minutes.
      </p>
    </div>
  );
}