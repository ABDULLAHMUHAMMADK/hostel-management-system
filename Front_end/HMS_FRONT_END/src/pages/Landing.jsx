import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DotGridBg from "../components/DotGridBg.jsx";

export default function Landing() {
  return (
    // 1. Force the container to lock strictly at 100vh and hide overflow spilling
    <div className="h-screen w-screen bg-transparent  text-slate-800 flex flex-col justify-between selection:bg-teal-500 selection:text-white relative overflow-hidden">
      <DotGridBg />

      {/* --- Transparent Navigation Bar --- */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between relative z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-teal-600/20">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            HMS Pro
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-500 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* --- Main Interactive Hero Content (Tightened & Centered) --- */}
      {/* 2. Removed heavy py-20, added dynamic flex positioning to stay perfectly centered without pushing the footer */}
      <main
        className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center relative z-10 my-auto"
        style={{ flexGrow: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center rounded-full bg-teal-50/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-teal-700 mb-4 sm:mb-6 border border-teal-100"
        >
          ✨ Simplistic Smart Accommodation Software
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-3xl leading-[1.15]"
        >
          Manage Your Hostel Living Experience{" "}
          <span className="text-teal-600">Effortlessly</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-500 max-w-2xl leading-relaxed"
        >
          An attractive, calm platform designed for both students and wardens.
          Track available rooms, process registrations instantly, and keep your
          hostel operations cleanly organized.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto text-center rounded-xl bg-teal-600 px-8 py-4 font-semibold text-white shadow-xl shadow-teal-600/20 hover:bg-teal-500 transition-all hover:shadow-teal-500/30 active:scale-[0.98]"
          >
            Register as New User
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto text-center rounded-xl bg-white px-8 py-4 font-semibold text-slate-700 border border-slate-200 shadow-lg shadow-slate-200/50 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Access Dashboard Account
          </Link>
        </motion.div>
      </main>

      {/* --- Minimalist Clean Footer --- */}
      {/* 3. Added pb-6 and shrink-0 to prevent it from getting squished by fluid viewport sizing */}
      <footer className="w-full max-w-7xl mx-auto px-6 pb-6 pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 relative z-10 shrink-0">
        <p>&copy; 2026 HMS Pro Systems. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <span className="hover:text-slate-600 cursor-pointer">Terms</span>
          <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
        </div>
      </footer>
    </div>
  );
}
