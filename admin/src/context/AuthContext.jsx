import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem("mnc_admin_auth");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Error reading auth from localStorage:", e);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mnc_admin_auth");
      if (stored) {
        setAdmin(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to restore session", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (authData) => {
    setAdmin(authData);
    try {
      localStorage.setItem("mnc_admin_auth", JSON.stringify(authData));
    } catch (e) {
      console.error("Error saving auth to localStorage:", e);
    }
  };

  const logout = () => {
    setAdmin(null);
    try {
      localStorage.removeItem("mnc_admin_auth");
    } catch (e) {
      console.error("Error removing auth from localStorage:", e);
    }
  };

  const value = {
    admin,
    isAuthenticated: !!admin?.token,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
