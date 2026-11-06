import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSettings } from "../api/settings.js";

const SettingsContext = createContext(null);

const FALLBACK = {
  brand: { name: "Talanta Sports City", logoUrl: null, faviconUrl: "/favicon.svg" },
  contact: {
    supportPhone: "",
    email: "info@talantasportscity.com",
    hospitalityEmail: "hospitality@talantasportscity.com",
    pressEmail: "press@talantasportscity.com",
    address: "Jamhuri Grounds, Ngong Rd, Nairobi",
  },
  social: {
    twitter: null,
    instagram: null,
    facebook: null,
    tiktok: null,
    youtube: null,
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    getSettings()
      .then((r) => setSettings({ ...FALLBACK, ...r.data }))
      .catch(() => setSettings(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);