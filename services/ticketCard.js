export const CARD = {
  width: 800,
  height: 400,
  padding: 32,
  colors: {
    black: "#0e1116",
    surface: "#161b23",
    line: "#2a3240",
    ink: "#e8ecf2",
    muted: "#9aa4b2",
    gold: "#f5a623",
    green: "#006600",
    red: "#bb0000",
    white: "#ffffff",
  },
  fonts: {
    bold: "Helvetica-Bold",
    regular: "Helvetica",
  },
};

export const buildTicketViewModel = ({ ticket, match, category, logoUrl, qrDataUrl }) => ({
  matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
  kickoff: new Date(match.kickoff).toLocaleString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
  venue: match.venue?.name || "Raila Odinga International Stadium",
  gate: ticket.gate,
  section: ticket.seat.section,
  row: ticket.seat.row,
  seat: ticket.seat.number,
  serial: ticket.serial,
  categoryName: category?.name || "Ticket",
  price: `${ticket.currency} ${Number(ticket.price).toLocaleString("en-KE")}`,
  buyerName: ticket.buyer.name || "",
  logoUrl,
  qrDataUrl,
});