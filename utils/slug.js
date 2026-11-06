export const toSlug = (input = "") =>
  String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const matchSlug = (homeTeam, awayTeam, date) => {
  const d = new Date(date);
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return toSlug(`${homeTeam} vs ${awayTeam} ${ymd}`);
};