import { createContext, useContext, useState } from "react";
import { apiFetch } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("stasho_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const persist = (token, u) => {
    localStorage.setItem("stasho_token", token);
    localStorage.setItem("stasho_user", JSON.stringify(u));
    setUser(u);
  };

  const login = async (email, password) => {
    try {
      const data = await apiFetch("/auth/login", { method: "POST", body: { email, password }, auth: false });
      persist(data.token, data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const data = await apiFetch("/auth/signup", { method: "POST", body: { name, email, password }, auth: false });
      persist(data.token, data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("stasho_token");
    localStorage.removeItem("stasho_user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
