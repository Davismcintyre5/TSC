export const money = (n, currency = "KES") =>
  `${currency} ${Number(n).toLocaleString("en-KE")}`;

export const dateTime = (iso) =>
  new Date(iso).toLocaleString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const dateOnly = (iso) =>
  new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const timeOnly = (iso) =>
  new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const maskIdentifier = (v) => {
  if (!v) return "";
  if (v.includes("@")) {
    const [u, d] = v.split("@");
    return `${u.slice(0, 1)}***@${d}`;
  }
  return `${v.slice(0, 4)}•••${v.slice(-3)}`;
};