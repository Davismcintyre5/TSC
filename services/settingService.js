import Setting from "../models/Setting.js";

export const getPublicSettings = async () => {
  const rows = await Setting.find({
    key: { $in: ["brand.name", "contact.supportPhone", "contact.email"] },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    brandName: map["brand.name"] || "Talanta Sports City",
    supportPhone: map["contact.supportPhone"] || "",
    supportEmail: map["contact.email"] || "info@talantasportscity.com",
  };
};