import { createContext, useContext, useState, useEffect } from "react";
import API, { injectLogoutTrigger } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    // Use window.location for reliable redirect
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    // Inject our state clearing logic right into Axios
    injectLogoutTrigger(logout);

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await API.post("/users/login", { email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    return userData;
  };

  // ✅ NEW: Login with redirect (for production reliability)
  const loginAndRedirect = async (email, password) => {
    try {
      const userData = await login(email, password);
      
      // Use window.location for reliable redirect in production
      const role = userData.role;
      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "warden") {
        window.location.href = "/warden";
      } else if (role === "student") {
        window.location.href = "/student";
      } else {
        window.location.href = "/";
      }
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAndRedirect, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}