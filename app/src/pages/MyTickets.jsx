import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  myTickets,
  downloadTicketPdf,
  downloadTicketPng,
} from "../api/tickets.js";
import { useToast } from "../components/ui/Toast.jsx";
import { Badge, Button, Spinner } from "../components/ui/index.js";
import { money } from "../utils/format.js";
import { TICKET_STATUS_LABELS } from "../utils/constants.js";

const SEATS_PATH = "/events/fc-bayern-munchen-vs-afc-ajax/seats";

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function MyTickets() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    myTickets()
      .then((r) => setTickets(r.data || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const download = async (t, format) => {
    const key = `${t._id}-${format}`;
    setDownloading((p) => ({ ...p, [key]: true }));
    try {
      const blob =
        format === "pdf"
          ? await downloadTicketPdf(t._id)
          : await downloadTicketPng(t._id);
      saveBlob(blob, `TSC-${t.serial}.${format}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading((p) => ({ ...p, [key]: false }));
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
      <h1 className="text-2xl font-extrabold mb-6">My tickets</h1>

      {tickets.length === 0 ? (
        <div className="bg-surface border border-surface-line rounded-xl p-10 text-center">
          <p className="text-ink-muted mb-5">You have no tickets yet.</p>
          <Link to={SEATS_PATH}>
            <Button variant="primary" size="lg">
              Buy tickets
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => {
            const pdfKey = `${t._id}-pdf`;
            const pngKey = `${t._id}-png`;
            const canDownload = t.status === "paid" || t.status === "used";

            return (
              <div
                key={t._id}
                className="bg-surface border border-surface-line rounded-xl overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 p-4">
                  <div className="bg-white rounded-lg p-2 flex items-center justify-center h-[140px]">
                    {t.qrCode ? (
                      <img
                        src={t.qrCode}
                        alt="QR"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-kenya-black/60">No QR yet</span>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">
                          {t.categoryId?.name || "Ticket"}
                        </div>
                        <div className="text-sm text-ink-muted">
                          {t.seat?.section} · Seat {t.seat?.number} · Row {t.seat?.row}
                        </div>
                        <div className="text-sm text-ink-muted">Gate {t.gate}</div>
                      </div>
                      <Badge tone={t.status}>
                        {TICKET_STATUS_LABELS[t.status] || t.status}
                      </Badge>
                    </div>

                    <div className="mt-3 pt-3 border-t border-surface-line flex justify-between text-sm">
                      <span className="text-ink-muted">#{t.serial}</span>
                      <span className="font-bold text-kenya-gold">
                        {money(t.price, t.currency)}
                      </span>
                    </div>

                    {canDownload && (
                      <div className="mt-3 pt-3 border-t border-surface-line flex gap-3 text-xs">
                        <button
                          onClick={() => download(t, "pdf")}
                          disabled={downloading[pdfKey]}
                          className="text-kenya-gold hover:underline disabled:opacity-50"
                        >
                          {downloading[pdfKey] ? "Downloading…" : "Download PDF"}
                        </button>
                        <button
                          onClick={() => download(t, "png")}
                          disabled={downloading[pngKey]}
                          className="text-kenya-gold hover:underline disabled:opacity-50"
                        >
                          {downloading[pngKey] ? "Downloading…" : "Download PNG"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}