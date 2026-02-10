// 📁 src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // מצב טעינה בזמן בדיקה ראשונית

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("⚠️ Failed to parse user from localStorage:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false); // תמיד מסיים טעינה
    }
  }, []);

  const login = (userData, token) => {
    try {
      if (token) localStorage.setItem("token", token);
      if (userData) localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("⚠️ Failed to save user to localStorage:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook מותאם אישית לשימוש פשוט ב-AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
