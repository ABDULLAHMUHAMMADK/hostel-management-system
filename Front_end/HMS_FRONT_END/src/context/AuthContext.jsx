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

    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    // Inject our state clearing logic right into Axios
    injectLogoutTrigger(logout);

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("🔍 Auth Check - Token:", storedToken ? "Present" : "Missing");
    console.log("🔍 Auth Check - User:", storedUser ? "Present" : "Missing");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("✅ User loaded:", parsedUser.role);
      } catch (error) {
        console.error("❌ Failed to parse user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      console.log("❌ No stored auth data found");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log("🔐 Attempting login...");
    const response = await API.post("/users/login", { email, password });
    const { token, user: userData } = response.data;

    console.log("✅ Login successful - Token:", token ? "Received" : "Missing");
    console.log("✅ Login successful - User role:", userData?.role);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}