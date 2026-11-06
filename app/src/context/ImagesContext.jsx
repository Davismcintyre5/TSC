import { createContext, useContext, useEffect, useState } from "react";
import { getImages } from "../api/images.js";

const ImagesContext = createContext(null);
const FALLBACK = { hero: [], stadium: [], hospitality: [], logo: [] };

export function ImagesProvider({ children }) {
  const [images, setImages] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImages()
      .then((r) => setImages({ ...FALLBACK, ...(r?.data ?? r ?? {}) }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ImagesContext.Provider value={{ images, loading }}>
      {children}
    </ImagesContext.Provider>
  );
}

export const useImages = () => {
  const ctx = useContext(ImagesContext);
  return ctx ?? { images: FALLBACK, loading: false };
};