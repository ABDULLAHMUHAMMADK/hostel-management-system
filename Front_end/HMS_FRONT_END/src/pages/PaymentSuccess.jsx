import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 p-4 select-none">
      <div 
        className="bg-white rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center relative overflow-hidden"
        style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px" }}
      >
        {/* Top Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />

        {/* Animated Check Icon Ring */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100 animate-bounce">
          <CheckCircle size={42} strokeWidth={2.5} />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
          Payment Processed
        </h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
          Transaction Reference Validated
        </p>

        <p className="text-slate-500 text-sm font-medium mt-4 leading-relaxed max-w-xs">
          Your hostel housing fee invoice has been cleared successfully. Your account balance updates automatically across the system.
        </p>

        {/* Security Indicator */}
        <div className="mt-6 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-wider">
          <ShieldCheck size={14} className="text-emerald-500" />
          End-to-End Encrypted Secure Core
        </div>

        {/* Navigation Action */}
        <button
          onClick={() => navigate("/student/fees")}
          className="mt-8 w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-95"
        >
          Return to Ledger Dashboard
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}