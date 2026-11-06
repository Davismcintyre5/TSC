import { useState } from "react";
import { createNotify } from "../../api/notify.js";
import { useToast } from "../ui/Toast.jsx";
import { Button, Input } from "../ui/index.js";

export default function NotifyForm() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNotify(email);
      setDone(true);
      toast.success("Check your inbox to confirm.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="notify" className="border-b border-surface-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-surface border border-surface-line rounded-2xl p-8 sm:p-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-kenya-gold mb-3">
            Stay in the loop
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 uppercase">
            Get notified when tickets go on sale
          </h2>
          <p className="text-ink-muted text-sm max-w-xl mx-auto mb-6">
            Sale opens Thu 5 Nov 2026 at 18:00. We'll email you when it's live.
            No spam, no resale — just the official link.
          </p>

          {done ? (
            <p className="text-kenya-green font-semibold">
              You're on the list. Check your inbox to confirm.
            </p>
          ) : (
            <form
              onSubmit={submit}
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-2"
            >
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" variant="primary" loading={loading}>
                Notify me
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}