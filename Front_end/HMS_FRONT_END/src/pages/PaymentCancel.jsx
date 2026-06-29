import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, AlertCircle } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 p-4 select-none">
      <div 
        className="bg-white rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center relative overflow-hidden"
        style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px" }}
      >
        {/* Top Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500" />

        {/* Warning Icon Ring */}
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-100">
          <XCircle size={42} strokeWidth={2.5} />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
          Transaction Aborted
        </h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
          Gateway Request Disconnected
        </p>

        <p className="text-slate-500 text-sm font-medium mt-4 leading-relaxed max-w-xs">
          The payment checkout session was cancelled or declined. No charges or financial shifts were applied to your credit framework.
        </p>

        {/* Informative Help Alert */}
        <div className="mt-6 flex items-start gap-2 text-left p-3 bg-amber-50/50 text-amber-700 rounded-xl border border-amber-100 text-[11px] font-medium leading-normal">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
          <span>If your account was drafted in error, funds automatically restore within standard local banking operation parameters.</span>
        </div>

        {/* Navigation Action */}
        <button
          onClick={() => navigate("/student/fees")}
          className="mt-8 w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-95"
        >
          <RefreshCw size={12} />
          Retry Gateway Payment Processing
        </button>
      </div>
    </div>
  );
}