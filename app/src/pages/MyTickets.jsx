import { useEffect, useState } from "react";
import { myTickets } from "../api/tickets.js";
import { useToast } from "../components/ui/Toast.jsx";
import { Badge, Spinner } from "../components/ui/index.js";
import { money, dateTime } from "../utils/format.js";
import { TICKET_STATUS_LABELS } from "../utils/constants.js";

export default function MyTickets() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    myTickets()
      .then((r) => setTickets(r.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-6">My tickets</h1>

      {tickets.length === 0 && (
        <div className="bg-surface border border-surface-line rounded-xl p-10 text-center text-ink-muted">
          You have no tickets yet.
        </div>
      )}

      <div className="space-y-4">
        {tickets.map((t) => (
          <div key={t._id} className="bg-surface border border-surface-line rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 p-4">
              <div className="bg-white rounded-lg p-2 flex items-center justify-center h-[140px]">
                {t.qrCode ? (
                  <img src={t.qrCode} alt="QR" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-kenya-black/60">No QR yet</span>
                )}
              </div>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold">{t.categoryId?.name || "Ticket"}</div>
                    <div className="text-sm text-ink-muted">
                      {t.seat?.section} · Seat {t.seat?.number} · Row {t.seat?.row}
                    </div>
                    <div className="text-sm text-ink-muted">Gate {t.gate}</div>
                  </div>
                  <Badge tone={t.status}>{TICKET_STATUS_LABELS[t.status]}</Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-surface-line flex justify-between text-sm">
                  <span className="text-ink-muted">#{t.serial}</span>
                  <span className="font-bold text-kenya-gold">{money(t.price, t.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}