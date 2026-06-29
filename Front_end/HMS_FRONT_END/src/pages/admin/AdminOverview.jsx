import React, { useState, useEffect } from "react";
import { Users, Building2, ShieldAlert, Receipt, RefreshCw, Layers, CheckCircle2, DollarSign } from "lucide-react";
import API from "../../api/client";

export default function AdminOverview() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchWardenMatrix = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setErrorMessage("");
      
      const res = await API.get("/admin/dashboard-matrix");
      if (res.data?.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error("❌ Matrix loading pipeline breakdown:", err.message);
      setErrorMessage("Could not load administrative workspace counters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardenMatrix(true);
  }, []);

  // Structural custom shadow variable wrapper
  const heavySystemShadow = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-white rounded-xl shadow-md" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-2xl shadow-md" />
          <div className="h-64 bg-white rounded-2xl shadow-md" />
        </div>
      </div>
    );
  }

  const { counters, corporateBilling } = metrics || {};

  return (
    <div className="p-6 space-y-6 select-none max-w-[1600px] mx-auto">
      
      {/* SECTION HEADER BLOCK */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
            Operations Matrix
          </h1>
          <p className="text-xs font-bold text-slate-400 -mt-0.5 tracking-wide">
            Real-time aggregate oversight overview for multi-tenant assets and licensing revenue
          </p>
        </div>

        <button 
          onClick={() => fetchWardenMatrix(false)}
          className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors shadow-sm cursor-pointer"
          style={heavySystemShadow}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ERROR FIELD INJECTION WINDOW */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-sm border border-rose-100">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 4-COLUMN TOP STATS METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Registered Students */}
        <div 
          className="group relative bg-white p-5 pl-6 rounded-xl flex items-center justify-between overflow-hidden" 
          style={heavySystemShadow}
        >
          {/* Transitionary Left Border Indicator */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-indigo-600 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Users size={12} className="text-indigo-500" /> Occupant Matrix
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              {counters?.totalStudents || 0} <span className="text-xs text-slate-400 font-bold">Students</span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Users size={18} />
          </div>
        </div>

        {/* Card 2: Managed Hostels Block Infrastructure */}
        <div 
          className="group relative bg-white p-5 pl-6 rounded-xl flex items-center justify-between overflow-hidden" 
          style={heavySystemShadow}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-violet-600 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Building2 size={12} className="text-violet-500" /> Infrastructure
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              {counters?.totalHostels || 0} <span className="text-xs text-slate-400 font-bold">Hostels</span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
            <Building2 size={18} />
          </div>
        </div>

        {/* Card 3: Total Corporate Revenue Collected */}
        <div 
          className="group relative bg-white p-5 pl-6 rounded-xl flex items-center justify-between overflow-hidden" 
          style={heavySystemShadow}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-emerald-500 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" /> Rent Collected
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              ${corporateBilling?.revenueCollected?.toLocaleString() || 0}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Card 4: Tenant Outstanding Balance */}
        <div 
          className="group relative bg-white p-5 pl-6 rounded-xl flex items-center justify-between overflow-hidden" 
          style={heavySystemShadow}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-amber-500 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Receipt size={12} className="text-amber-500" /> Arrears Balance
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              ${corporateBilling?.outstandingBalance?.toLocaleString() || 0}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Receipt size={18} />
          </div>
        </div>

      </div>

      {/* LOWER CONTENT ROW BLOCKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Billing Distribution Status Container */}
        <div className="group relative bg-white rounded-2xl p-5 pl-7 flex flex-col overflow-hidden" style={heavySystemShadow}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 bg-indigo-500 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Invoice Log Distribution Ratio
          </h3>
          <div className="space-y-3 my-auto">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" /> SETTLED TENANT INVOICES
              </span>
              <span className="text-sm font-black text-slate-800">{corporateBilling?.paidInvoices || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Receipt size={14} className="text-amber-500" /> PENDING LEASE INVOICES
              </span>
              <span className="text-sm font-black text-slate-800">{corporateBilling?.pendingInvoices || 0}</span>
            </div>
          </div>
        </div>

        {/* Global Financial Track Record Ledger */}
        <div className="group relative bg-white rounded-2xl p-5 pl-7 flex flex-col overflow-hidden" style={heavySystemShadow}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 bg-emerald-500 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Corporate Statement Summary
          </h3>
          <div className="space-y-3 my-auto">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-500" /> TOTAL TENANT STATEMENTS PROCESSED
              </span>
              <span className="text-sm font-black text-slate-800">{corporateBilling?.totalInvoicesIssued || 0}</span>
            </div>
            
            {/* Visual ratio layout bar */}
            <div className="bg-slate-50 p-3 rounded-xl space-y-2">
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ 
                    width: `${corporateBilling?.totalInvoicesIssued > 0 
                      ? (corporateBilling.paidInvoices / corporateBilling.totalInvoicesIssued) * 100 
                      : 0}%` 
                  }} 
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                <span>Collection Progress Bar Rate</span>
                <span className="text-emerald-600">
                  {corporateBilling?.totalInvoicesIssued > 0 
                    ? Math.round((corporateBilling.paidInvoices / corporateBilling.totalInvoicesIssued) * 100) 
                    : 0}% Settled
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}