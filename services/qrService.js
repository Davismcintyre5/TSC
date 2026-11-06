import QRCode from "qrcode";
import crypto from "node:crypto";

const basePayload = (serial) => ({
  v: 1,
  s: serial,
  n: crypto.randomBytes(8).toString("hex"),
});

export const generate = async (serial) => {
  const payload = JSON.stringify(basePayload(serial));
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 400,
    color: { dark: "#0e1116", light: "#ffffff" },
  });
};

export const generateSvg = async (serial) => {
  const payload = JSON.stringify(basePayload(serial));
  return QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#0e1116", light: "#ffffff" },
  });
};