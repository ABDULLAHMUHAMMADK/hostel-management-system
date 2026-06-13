import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Connects directly to your local Node.js/Express server port
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. The Request Interceptor (Automating the Bruno Header Injection)
API.interceptors.request.use(
  (config) => {
    // Look into local storage to find the token string
    const token = localStorage.getItem("token");
    
    if (token) {
      // Inject the token string directly into the Authorization header property
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Pass along any immediate connection configuration faults
    return Promise.reject(error);
  }
);

export default API;