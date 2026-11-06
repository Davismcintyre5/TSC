import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authApi from "../api/auth.js";
import { getToken, setToken as saveToken, clearToken } from "../utils/storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [identifier, setIdentifier] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    let alive = true;
    if (!token) {
      setIdentifier(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    authApi
      .me()
      .then((r) => alive && setIdentifier(r.data.identifier))
      .catch(() => {
        if (!alive) return;
        clearToken();
        setTokenState(null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token]);

  const login = useCallback((t, id) => {
    saveToken(t);
    setTokenState(t);
    setIdentifier(id);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setIdentifier(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, identifier, isAuthed: !!token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);