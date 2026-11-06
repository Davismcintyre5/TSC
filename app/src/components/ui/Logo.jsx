import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext.jsx";

export default function Logo({ size = "md", to = "/" }) {
  const { settings } = useSettings();
  const brand = settings?.brand || {};
  const src = brand.logoUrl || "/logo.svg";

  const heights = { sm: "h-7", md: "h-9", lg: "h-12" };

  const img = (
    <img
      src={src}
      alt={brand.name || "Talanta Sports City"}
      className={`${heights[size]} w-auto`}
    />
  );

  if (!to) return img;
  return <Link to={to} className="inline-flex items-center shrink-0">{img}</Link>;
}