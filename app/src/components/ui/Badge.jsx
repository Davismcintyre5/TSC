const COLORS = {
  held: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  paid: "bg-kenya-green/15 text-green-300 border-kenya-green/30",
  used: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  void: "bg-kenya-red/15 text-red-300 border-kenya-red/30",
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  failed: "bg-kenya-red/15 text-red-300 border-kenya-red/30",
  refunded: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  awaiting_confirmation: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  default: "bg-surface-alt text-ink-muted border-surface-line",
};

export default function Badge({ children, tone = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
        COLORS[tone] || COLORS.default
      } ${className}`}
    >
      {children}
    </span>
  );
}