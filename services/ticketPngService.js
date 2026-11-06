import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import axios from "axios";
import { CARD, buildTicketViewModel } from "./ticketCard.js";

export const generateTicketPng = async (payload) => {
  const v = buildTicketViewModel(payload);
  const canvas = createCanvas(CARD.width, CARD.height);
  const ctx = canvas.getContext("2d");
  const { colors: C } = CARD;

  // background
  ctx.fillStyle = C.black;
  ctx.fillRect(0, 0, CARD.width, CARD.height);

  // accent
  ctx.fillStyle = C.green;
  ctx.fillRect(0, 0, 6, CARD.height);

  // kenya stripes
  ctx.fillStyle = C.black;
  ctx.fillRect(0, 0, CARD.width / 3, 6);
  ctx.fillStyle = C.red;
  ctx.fillRect(CARD.width / 3, 0, CARD.width / 3, 6);
  ctx.fillStyle = C.green;
  ctx.fillRect((CARD.width / 3) * 2, 0, CARD.width / 3, 6);

  // logo
  if (v.logoUrl) {
    try {
      const res = await axios.get(v.logoUrl, { responseType: "arraybuffer" });
      const buf = Buffer.from(res.data);
      // @napi-rs/canvas supports loadImage from Buffer
      const { loadImage } = await import("@napi-rs/canvas");
      const img = await loadImage(buf);
      const ratio = 40 / img.height;
      ctx.drawImage(img, 32, 32, img.width * ratio, 40);
    } catch {}
  }

  // match title
  ctx.fillStyle = C.ink;
  ctx.font = `bold 20px sans-serif`;
  ctx.fillText(v.matchTitle.toUpperCase(), 32, 115);

  // meta
  ctx.fillStyle = C.muted;
  ctx.font = `11px sans-serif`;
  ctx.fillText(`${v.kickoff} · ${v.venue}`, 32, 138);

  // divider
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  ctx.moveTo(32, 158);
  ctx.lineTo(CARD.width - 32, 158);
  ctx.stroke();

  // columns
  const col = CARD.width / 3;
  ctx.fillStyle = C.muted; ctx.font = `9px sans-serif`;
  ctx.fillText("GATE", 32, 180);
  ctx.fillText("SEAT", 32 + col, 180);
  ctx.fillText("SECTION", 32 + col * 2, 180);

  ctx.fillStyle = C.ink; ctx.font = `bold 18px sans-serif`;
  ctx.fillText(v.gate, 32, 205);
  ctx.fillText(`${v.seat} · Row ${v.row}`, 32 + col, 205);
  ctx.fillText(v.section, 32 + col * 2, 205);

  // QR
  if (v.qrDataUrl) {
    const { loadImage } = await import("@napi-rs/canvas");
    const qrImg = await loadImage(Buffer.from(v.qrDataUrl.split(",")[1], "base64"));
    ctx.drawImage(qrImg, 32, 240, 120, 120);
  }

  // serial + price
  ctx.fillStyle = C.muted; ctx.font = `9px sans-serif`;
  ctx.fillText("TICKET NO.", 180, 250);
  ctx.fillText("PRICE", 180, 300);

  ctx.fillStyle = C.ink; ctx.font = `bold 12px sans-serif`;
  ctx.fillText(v.serial, 180, 268);

  ctx.fillStyle = C.gold; ctx.font = `bold 12px sans-serif`;
  ctx.fillText(v.price, 180, 318);

  // footer
  ctx.fillStyle = C.muted; ctx.font = `9px sans-serif`;
  ctx.fillText(`${v.buyerName} · Scan at gate · One entry only`, 32, 378);

  return canvas.toBuffer("image/png");
};