import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DotGridBg from "../components/DotGridBg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop standard browser page reload behavior
    setError("");
    setIsSubmitting(true);

    try {
      // Execute the global context auth handler routine
      const user = await login(email, password);
      console.log(user);
      // Routing logic: Read the role coming directly from your database user schema
      if (user.role === "warden") {
        navigate("/warden"); // Route the warden directly to their custom metrics shell
      } else if (user.role === "student") {
        navigate("/student"); // Route the student to their resident portal layout
      } else {
        setError("Unauthorized system entry access portal role.");
      }
    } catch (err) {
      // Temporarily log the absolute truth of the incoming error packet:
      console.error("Full Intercepted Axios Error Object:", err);
      console.log("Status Code Returned from Server:", err.response?.status);
      console.log("Error Payload Body from Server:", err.response?.data);

      setError(
        err.response?.data?.message ||
          "Invalid authentication account credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen relative flex items-center justify-center bg-transparent overflow-hidden">
      {/* Background Animated Grid Elements */}
      <DotGridBg />

      {/* Login Card Core Frame Box */}
      <div
        className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 
      rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 relative z-10 transition-all m-4"
      >
        {/* Branding Title */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-md shadow-teal-600/20">
            H
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Access your system accommodation dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Action Form Element */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800 font-medium"
              placeholder="name@hostel.com"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
              Password System Code
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800 font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-500 transition-all disabled:opacity-50 disabled:scale-100 active:scale-[0.99] mt-2"
          >
            {isSubmitting ? "Verifying Credentials..." : "Sign In to System"}
          </button>
        </form>
      </div>
    </div>
  );
}
