import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, AlertCircle, Building2 } from "lucide-react";

export default function WardenPaymentCancel() {
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
          Payment Declined
        </h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
          Transaction Cancelled
        </p>

        <p className="text-slate-500 text-sm font-medium mt-4 leading-relaxed max-w-xs">
          The hostel rent payment was cancelled or declined. No charges have been applied to your account.
        </p>

        {/* Informative Help Alert */}
        <div className="mt-6 flex items-start gap-2 text-left p-3 bg-amber-50/50 text-amber-700 rounded-xl border border-amber-100 text-[11px] font-medium leading-normal">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
          <span>If you believe this was an error, please try again or contact your bank for assistance.</span>
        </div>

        {/* Navigation Action */}
        <button
          onClick={() => navigate("/warden/fees")}
          className="mt-8 w-full flex items-center justify-center gap-2 py-3 bg-[#00a896] hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#00a896]/20 transition-all hover:scale-[1.01] active:scale-95"
        >
          <RefreshCw size={12} />
          Return to Fee Dashboard
        </button>
      </div>
    </div>
  );
}