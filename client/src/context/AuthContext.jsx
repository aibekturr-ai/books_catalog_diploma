import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "../api/books.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "bookcatalog_token";
const USER_KEY = "bookcatalog_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
    setReady(true);
  }, []);

  const persist = useCallback((token, nextUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const signIn = useCallback(
    async ({ mode, email, password }) => {
      const fn = mode === "register" ? apiRegister : apiLogin;
      const { token, user: u } = await fn({ email, password });
      persist(token, { id: u.id, email: u.email, role: u.role });
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      signIn,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
    }),
    [user, ready, signIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
