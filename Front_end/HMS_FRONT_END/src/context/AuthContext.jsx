import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/client";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log(storedToken, storedUser);

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await API.post("/users/login", { email, password });

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
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
