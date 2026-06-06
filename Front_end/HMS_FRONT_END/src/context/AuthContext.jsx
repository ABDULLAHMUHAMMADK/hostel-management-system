import { createContext, useState } from "react";
import API from "../api/client.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const testBackendConnection = async () => {
    try {
      console.log("Frontend is sending a request to the backend server...");
      
      const response = await API.get("/data/user"); 
      
      console.log("SUCCESS! Data received from Backend:", response.data);
    } catch (error) {
      console.error("BACKEND CONNECTION FAILED. Error details:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, testBackendConnection }}>
      {children}
    </AuthContext.Provider>
  );
};