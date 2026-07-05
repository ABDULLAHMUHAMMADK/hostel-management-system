import axios from "axios";

// ─── ENVIRONMENT-AWARE BASE URL ──────────────────────────────────────────────
// Use environment variable in production, fallback to localhost in development
const getBaseURL = () => {
  // For production (Vercel), use the environment variable
  if (import.meta.env?.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  
  // For development (local)
  return "http://localhost:5000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/sessions
});

let logoutHandlerInstance = null;

export const injectLogoutTrigger = (handlerFunction) => {
  logoutHandlerInstance = handlerFunction;
};

// 🔍 Helper to check if token is expired locally before sending the request
const isTokenExpiredLocal = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const { exp } = JSON.parse(jsonPayload);
    return Date.now() >= exp * 1000;
  } catch (error) {
    return true; 
  }
};

// ─── REQUEST INTERCEPTOR ────────────────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    // Skip checking if we are on the login endpoint
    if (config.url.includes("/users/login")) {
      return config;
    }

    if (token) {
      if (isTokenExpiredLocal(token)) {
        console.warn("Token expired locally! Blocking request and executing eviction...");
        
        // Wipe local storage instantly
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Force React to wipe user state and drop to login page
        if (logoutHandlerInstance) {
          logoutHandlerInstance();
        } else {
          window.location.href = "/login";
        }
        
        // Cancel the request completely
        return Promise.reject(new axios.Cancel("Token expired prior to request dispatch."));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!error.config?.url.includes("/users/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (logoutHandlerInstance) logoutHandlerInstance();
      }
    }
    return Promise.reject(error);
  }
);

export default API;