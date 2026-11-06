export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

export const isPhone = (v) =>
  /^\+?\d{7,15}$/.test((v || "").replace(/[\s-]/g, ""));

export const detectIdentifierType = (v) =>
  isEmail(v) ? "email" : isPhone(v) ? "sms" : null;

export const normalizePhone = (v = "") => {
  let s = String(v).replace(/[\s\-()]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (s.startsWith("0")) s = "254" + s.slice(1);
  return s;
};