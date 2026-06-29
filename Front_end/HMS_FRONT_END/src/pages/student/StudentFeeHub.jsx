import React, { useState, useEffect } from "react";
import { CheckCircle, ArrowUpRight, DollarSign, Calendar, RefreshCw, Layers, Clock } from "lucide-react";
import API from "../../api/client";

function FeeHubSkeleton() {
  const cardShadowStyle = { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-4 overflow-hidden pr-2 select-none p-2">
      {/* HEADER */}
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-2">
          <div className="h-6 w-56 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-3 w-72 bg-slate-200/70 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {["bg-indigo-200", "bg-emerald-200", "bg-amber-200"].map((accent, i) => (
          <div
            key={i}
            className="relative bg-white p-4 pl-6 rounded-xl flex items-center justify-between overflow-hidden"
            style={cardShadowStyle}
          >
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 ${accent} h-[46%] rounded-r animate-pulse`} />
            <div className="space-y-2">
              <div className="h-2.5 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-slate-200 rounded-md animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          </div>
        ))}
      </div>

      {/* LEDGER PANEL */}
      <div
        className="relative bg-white rounded-2xl p-5 pl-7 flex flex-col min-h-0 overflow-hidden flex-1"
        style={cardShadowStyle}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 bg-indigo-200 h-[46%] rounded-r animate-pulse" />

        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="space-y-2">
            <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-2.5 w-72 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>

        <div className="space-y-2.5 pr-1 flex-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-50/60 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-2.5 w-40 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="h-4 w-14 bg-slate-200 rounded animate-pulse" />
                <div className="h-9 w-24 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentFeeHub() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchFeesLedger = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setErrorMessage("");
      
      const res = await API.get("/fee/my-fees");
      if (res.data?.success) {
        setFees(res.data.data);
      }
    } catch (err) {
      console.error("❌ Fee ledger retrieval error:", err.message);
      setErrorMessage("Could not load fee records from your account ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesLedger(true);
  }, []);

  const handlePaymentInitiation = async (feeId) => {
    // Prevent double submissions if any invoice is already processing
    if (processingId !== null) return;

    try {
      setProcessingId(feeId);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await API.post("/fee/pay-fee", { feeId });

      if (res.data?.success && res.data.url) {
        setSuccessMessage("Secure gateway ready. Redirecting...");
        window.location.href = res.data.url; 
      } else {
        setErrorMessage("Payment initialization drop error.");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to contact secure checkout servers.");
    } finally {
      setProcessingId(null);
    }
  };

  const safeFees = Array.isArray(fees) ? fees : [];

  const totalInvoices = safeFees.length;
  const paidInvoices = safeFees.filter((f) => f.status === "paid").length;
  const pendingInvoices = totalInvoices - paidInvoices;
  const outstandingBalance = safeFees
    .filter((f) => f.status !== "paid")
    .reduce((sum, current) => sum + (current.amount || 0), 0);

  if (loading) {
    return <FeeHubSkeleton />;
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-4 overflow-hidden pr-2 select-none p-2">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-indigo-600 uppercase">
            Accounts & Fees Hub
          </h1>
          <p className="text-xs font-bold text-slate-400 -mt-0.5 tracking-wide">
            Real-time financial invoicing ledger for <span className="font-extrabold text-slate-800 uppercase">Student Workspace</span>
          </p>
        </div>

        <button 
          onClick={() => fetchFeesLedger(false)}
          className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* SYSTEM FEEDBACK NOTIFICATIONS */}
      {(errorMessage || successMessage) && (
        <div className="shrink-0 space-y-2">
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-sm">
              ⚠️ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl shadow-sm">
              🎉 {successMessage}
            </div>
          )}
        </div>
      )}

      {/* STATS OVERVIEW HEADER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        
        {/* Total Outstanding Card */}
        <div 
          className="group relative bg-white p-4 pl-6 rounded-xl flex items-center justify-between overflow-hidden"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-indigo-600 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Layers size={12} className="text-indigo-500" /> Outstanding Balance
            </p>
            <h2 className="text-2xl font-black text-slate-900">${outstandingBalance.toLocaleString()}</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Paid Invoices Card */}
        <div 
          className="group relative bg-white p-4 pl-6 rounded-xl flex items-center justify-between overflow-hidden"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-emerald-500 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-500" /> Completed Invoices
            </p>
            <h2 className="text-2xl font-black text-slate-900">{paidInvoices} <span className="text-xs text-slate-400 font-bold">Invoices</span></h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle size={18} />
          </div>
        </div>

        {/* Pending Statements Card */}
        <div 
          className="group relative bg-white p-4 pl-6 rounded-xl flex items-center justify-between overflow-hidden"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-amber-500 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Clock size={12} className="text-amber-500" /> Pending Statements
            </p>
            <h2 className="text-2xl font-black text-slate-900">{pendingInvoices} <span className="text-xs text-slate-400 font-bold">Unpaid</span></h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={18} />
          </div>
        </div>

      </div>

      {/* FULL WIDTH LEDGER PANEL */}
      <div
        className="group relative bg-white rounded-2xl p-5 pl-7 flex flex-col min-h-0 overflow-hidden flex-1"
        style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 bg-indigo-600 h-[46%] rounded-r transition-all duration-300 ease-in-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0" />

        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Account Statements Ledger
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Review history sheets and choose actions to process secure gateway clearing windows
            </p>
          </div>
        </div>

        {/* EXPANDED LIST WORKSPACE CONTAINER */}
        <div className="overflow-y-auto min-h-0 space-y-2.5 pr-1 flex-1">
          {safeFees.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <CheckCircle size={32} className="text-emerald-400 mb-2" />
              <p className="text-xs font-bold text-center">Your billing profile does not contain invoice history logs.</p>
            </div>
          ) : (
            safeFees.map((fee) => {
              const isPaid = fee.status === "paid";
              const isThisItemProcessing = processingId === fee._id;
              const isAnyItemProcessing = processingId !== null;

              return (
                <div 
                  key={fee._id} 
                  className="p-4 rounded-xl bg-slate-50/60 flex items-center justify-between gap-4 transition-all hover:bg-slate-50 px-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${isPaid ? "bg-emerald-100/70 text-emerald-700" : "bg-amber-100/70 text-amber-700"}`}>
                      <Calendar size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-black text-slate-800 uppercase">
                          {fee.month || "Current Term"}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                          isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {fee.status || "unpaid"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Statement Verification Token: <span className="font-mono font-bold text-slate-600">{fee._id}</span>
                      </p>
                    </div>
                  </div>

                  {/* ACCOUNT VALUE & ACTION BUTTON ACTIONS */}
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      ${fee.amount?.toLocaleString()}
                    </span>
                    
                    {!isPaid ? (
                      <button
                        onClick={() => handlePaymentInitiation(fee._id)}
                        disabled={isAnyItemProcessing}
                        className={`h-9 px-5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all text-white ${
                          isThisItemProcessing
                            ? "bg-amber-500 cursor-wait opacity-100" 
                            : "bg-indigo-600 hover:bg-indigo-700 hover:translate-x-0.5 disabled:opacity-40"
                        }`}
                      >
                        {isThisItemProcessing ? "Processing..." : "Pay Invoice"}
                        {!isThisItemProcessing && <ArrowUpRight size={12} />}
                      </button>
                    ) : (
                      <div className="h-9 w-28 flex items-center justify-center gap-1.5 text-emerald-600 font-black text-xs uppercase tracking-wider bg-emerald-50 rounded-xl">
                        <CheckCircle size={14} />
                        Paid
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}