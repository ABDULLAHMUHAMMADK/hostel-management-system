import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/client.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [hostelId, setHostelId] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name,
      email,
      password,
      role,
      ...(role === "student" && { hostelId, roomId }),
    };

    try {
     

      const response = await API.post("/users", payload);

      console.log(
        "✨ MongoDB Account Creation Confirmed! Data:",
        response.data,
      );
      alert("Registration Successful! Your account has been saved.");

      setHostelId("");
      setRoomId("");
    } catch (error) {
      console.error(
        "❌ Registration Pipeline Blocked:",
        error.response?.data || error.message,
      );
      alert(error.response?.data?.message || "Registration Failed. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl bg-white p-8 border border-slate-100/80"
        style={{
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        }}
      >
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Join the Hostel Management System
          </p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Select User Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm cursor-pointer"
            >
              <option value="none">none</option>
              <option value="student">Student</option>
              <option value="warden">Hostel Warden   </option>
            </select>
          </div>

          <AnimatePresence>
            {role === "student" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-5 overflow-hidden"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Hostel ID / Name
                  </label>
                  <input
                    type="text"
                    value={hostelId}
                    onChange={(e) => setHostelId(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
                    placeholder="e.g., Hostel-A"
                    required={role === "student"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Room Number / ID
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
                    placeholder="e.g., 204"
                    required={role === "student"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full mt-2 rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-500 active:scale-[0.99] shadow-md shadow-teal-600/10"
          >
            Register Account
          </button>
        </form>
      </motion.div>
    </div>
  );
}
