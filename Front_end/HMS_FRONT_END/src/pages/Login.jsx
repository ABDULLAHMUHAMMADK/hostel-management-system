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
    e.preventDefault();
    e.stopPropagation();

    setError("");
    setIsSubmitting(true);

    try {
      console.log("🔐 Login attempt for:", email);
      const user = await login(email, password);
      console.log("✅ Login successful - User:", user.role);

      // ✅ Wait a moment to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ Use window.location for reliable redirect
      const role = user.role;
      console.log("🔄 Redirecting to:", `/${role}`);
      
      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "warden") {
        window.location.href = "/warden";
      } else if (role === "student") {
        window.location.href = "/student";
      } else {
        setError("Unauthorized system entry access portal role.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid authentication account credentials.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen relative flex items-center justify-center bg-transparent overflow-hidden">
      <DotGridBg />

      <div
        className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 relative z-10 transition-all m-4 shadow-2xl"
        style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
      >
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900 font-semibold shadow-sm placeholder-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-500 transition-all disabled:opacity-50 disabled:scale-100 active:scale-[0.99] mt-2 cursor-pointer"
          >
            {isSubmitting ? "Verifying Credentials..." : "Sign In to System"}
          </button>
        </form>

        <div className="text-center mt-6 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-teal-600 font-bold hover:text-teal-500 hover:underline cursor-pointer transition-all"
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}