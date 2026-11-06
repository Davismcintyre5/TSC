const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;

export const isEmail = (v = "") => EMAIL_RE.test(v);
export const isPhone = (v = "") => PHONE_RE.test(v.replace(/\s+/g, ""));

export const normalizePhone = (v = "") => {
  let s = String(v).replace(/[\s\-()]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (s.startsWith("0")) s = "254" + s.slice(1);
  return s;
};

export const normalizeEmail = (v = "") => String(v).trim().toLowerCase();

export const detectChannel = (v = "") => {
  if (isEmail(v)) return "email";
  if (isPhone(v)) return "sms";
  return null;
};

export const normalizeIdentifier = (v = "") => {
  if (isEmail(v)) return { channel: "email", value: normalizeEmail(v) };
  if (isPhone(v)) return { channel: "sms", value: normalizePhone(v) };
  return null;
};