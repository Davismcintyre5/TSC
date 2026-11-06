import PDFDocument from "pdfkit";
import axios from "axios";
import { CARD, buildTicketViewModel } from "./ticketCard.js";

export const generateTicketPdf = async (payload) => {
  const v = buildTicketViewModel(payload);
  const doc = new PDFDocument({ size: [CARD.width, CARD.height], margin: 0 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));

  const { colors: C } = CARD;

  // background
  doc.rect(0, 0, CARD.width, CARD.height).fill(C.black);

  // accent bar
  doc.rect(0, 0, 6, CARD.height).fill(C.green);

  // kenya stripes top
  doc.rect(0, 0, CARD.width / 3, 6).fill(C.black);
  doc.rect(CARD.width / 3, 0, CARD.width / 3, 6).fill(C.red);
  doc.rect((CARD.width / 3) * 2, 0, CARD.width / 3, 6).fill(C.green);

  // logo
  if (v.logoUrl) {
    try {
      const res = await axios.get(v.logoUrl, { responseType: "arraybuffer" });
      doc.image(Buffer.from(res.data), 32, 32, { height: 40 });
    } catch {}
  }

  // match title
  doc.fillColor(C.ink).font(CARD.fonts.bold).fontSize(20)
     .text(v.matchTitle.toUpperCase(), 32, 90);

  // meta
  doc.fillColor(C.muted).font(CARD.fonts.regular).fontSize(11)
     .text(`${v.kickoff} · ${v.venue}`, 32, 118);

  // divider
  doc.moveTo(32, 148).lineTo(CARD.width - 32, 148).strokeColor(C.line).stroke();

  // gate / seat / section
  const col = CARD.width / 3;
  doc.fillColor(C.muted).fontSize(9).text("GATE", 32, 170);
  doc.fillColor(C.ink).font(CARD.fonts.bold).fontSize(18).text(v.gate, 32, 188);

  doc.fillColor(C.muted).font(CARD.fonts.regular).fontSize(9).text("SEAT", 32 + col, 170);
  doc.fillColor(C.ink).font(CARD.fonts.bold).fontSize(18).text(`${v.seat} · Row ${v.row}`, 32 + col, 188);

  doc.fillColor(C.muted).font(CARD.fonts.regular).fontSize(9).text("SECTION", 32 + col * 2, 170);
  doc.fillColor(C.ink).font(CARD.fonts.bold).fontSize(18).text(v.section, 32 + col * 2, 188);

  // QR
  if (v.qrDataUrl) {
    const qrBuf = Buffer.from(v.qrDataUrl.split(",")[1], "base64");
    doc.image(qrBuf, 32, 240, { width: 120, height: 120 });
  }

  // serial + price
  doc.fillColor(C.muted).font(CARD.fonts.regular).fontSize(9).text("TICKET NO.", 180, 250);
  doc.fillColor(C.ink).font(CARD.fonts.bold).fontSize(12).text(v.serial, 180, 268);

  doc.fillColor(C.muted).font(CARD.fonts.regular).fontSize(9).text("PRICE", 180, 300);
  doc.fillColor(C.gold).font(CARD.fonts.bold).fontSize(12).text(v.price, 180, 318);

  // footer
  doc.fillColor(C.muted).font(CARD.fonts.regular).fontSize(9)
     .text(`${v.buyerName} · Scan at gate · One entry only`, 32, 370, { width: CARD.width - 64 });

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};